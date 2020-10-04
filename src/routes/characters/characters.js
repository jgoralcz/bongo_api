const route = require('express-promise-router')();
const logger = require('log4js').getLogger();

const { getBufferHeightWidth } = require('../../util/functions/buffer');
const {
  getWaifuById,
  insertWaifu,
  searchCharacterExactly,
  upsertWaifu,
  searchWaifuByName,
  updateWaifu,
  updateWaifuCleanImage,
  getWaifuCount,
  updateCharacterMainImage,
} = require('../../db/waifu_schema/waifu/waifu');

const { getRankClaimedWaifuByID } = require('../../db/tables/cg_claim_waifu_rank/cg_claim_waifu_rank');

const { getSeries: searchSeriesExactly } = require('../../db/waifu_schema/series/series_table');
const { insertSeries } = require('../../db/waifu_schema/appears_in/appears_in');
const { storeImageBufferToURL } = require('../../util/functions/bufferToURL');

const { config } = require('../../util/constants/paths');
const nconfConfig = require('nconf').file('config', config);
const botID = nconfConfig.get('botID');

const { mimsAPI } = require('../../services/axios');

const { getBuffer } = require('../../util/functions/buffer');
const { validateBuffer } = require('../../handlers/validate');

const {
  storeNewImage,
  getHashFromBufferID,
  mergeWaifuImages,
  storeCleanWaifuImage: storeNewClaimWaifuImage,
} = require('../../db/waifu_schema/waifu_images/waifu_table_images');

const { getWaifuImagesAndInfoByID, storeCleanWaifuImage: storeCleanWaifuImageExtra } = require('../../db/waifu_schema/waifu_images/waifu_table_images');
const { removeDuplicateWaifuClaims } = require('../../db/tables/cg_claim_waifu/cg_claim_waifu');
const { DEFAULT_HEIGHT, DEFAULT_WIDTH } = require('../../util/constants/dimensions');

const {
  updateWaifuImage,
  deleteWaifuByID,
  mergeWaifus,
  getWaifuByImageURL,
  storeNewWaifuImage,
  storeCleanWaifuImage,
  getWaifuByNoCleanImageRandom,
  getRandomWaifu,
} = require('../../db/waifu_schema/waifu/waifu');

route.post('/', async (req, res) => {
  const { body } = req;

  if (!body.imageURL || !body.uploader || !body.name || (!body.series && !body.url) || body.husbando == null || body.nsfw == null || !body.description) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: imageURL, name, uploader, series, husbando, nsfw, description.', body });

  const {
    imageURL,
    name,
    series,
    nsfw,
    url: uri,
    seriesList,
    uploader,
    crop,
    desiredWidth,
    desiredHeight,
  } = body;

  const seriesExistsQuery = await searchSeriesExactly(series);
  if (!seriesExistsQuery || seriesExistsQuery.length <= 0) return res.status(400).send({ error: 'Series does not exist.', message: `The series ${series} does not exist. You must create the series first.`, body });
  const seriesID = seriesExistsQuery[0].id;

  const characterExistsQuery = await searchCharacterExactly(name, series, seriesID);
  if (characterExistsQuery && characterExistsQuery.length > 0 && !uri) return res.status(409).send({ error: 'Character already exists.', message: 'Required body: imageURL, name, series, husbando, nsfw, description.', body });

  const buffer = await getBuffer(imageURL);
  if (!buffer) return res.status(400).send({ error: `No buffer found for url ${imageURL}.` });

  const { height, width, error } = await validateBuffer(req, res, buffer, { overrideDefaultHW: true });
  if (!height || !width) return res.status(400).send(error);

  let waifuQuery;
  if (characterExistsQuery && characterExistsQuery.length > 0 && uri) {
    body.series_id = seriesID;
    waifuQuery = await upsertWaifu(body);
  } else if (uri) {
    body.series_id = seriesID;
    waifuQuery = await insertWaifu(body);
  } else {
    body.url = '';
    body.series_id = seriesID;
    waifuQuery = await upsertWaifu(body);
  }

  if (!waifuQuery || !waifuQuery[0] || !waifuQuery[0].id) return res.status(500).send({ error: `Failed uploading character ${name}.` });

  const waifu = waifuQuery[0];
  const { id } = waifu;

  if (seriesList && seriesList.length > 0) {
    for (let i = 0; i < seriesList.length; i += 1) {
      const tempSeries = seriesList[i];
      await insertSeries(id, tempSeries, uploader);
    }
  } else {
    await insertSeries(id, series, uploader);
  }

  // store image into the image table AND the main character.
  const row = await storeImageBufferToURL(id, buffer, storeNewImage, { width, height, nsfw, type: 'characters', uploader });
  if (!row || row.length <= 0 || !row[0]) return res.status(500).send({ error: `Failed uploading character ${name}.` });

  const [info] = row;
  await storeNewWaifuImage(id, info.cdnURL, buffer, info.width, info.height, info.nsfw, info.bufferLength, info.fileType);

  if (crop) {
    const { status, data: mimsBuffer } = await mimsAPI.post('/smartcrop', { image_url: imageURL, width: desiredWidth, height: desiredHeight, options: { animeFace: true } });
    let urlCropped = '';
    if (mimsBuffer && status === 200) {
      const rowClean = await storeImageBufferToURL(id, mimsBuffer, storeCleanWaifuImage, {
        width,
        height,
        nsfw,
        type: 'characters',
        uploader,
      });

      if (rowClean && rowClean.length > 0 && rowClean[0]) {
        const [cropped] = rowClean;
        urlCropped = cropped.image_url_clean;
        await storeNewClaimWaifuImage(info.image_id, cropped.cdnURL, mimsBuffer, cropped.width, cropped.height, cropped.nsfw, cropped.bufferLength, cropped.fileType);
      }
    }
    return res.status(201).send({ url: info.image_url, image_id: info.id, id, urlCropped });
  }

  return res.status(201).send({ url: info.image_url, image_id: info.id, id });
});

route.patch('/clean-images', async (req, res) => {
  const waifuRow = await getWaifuByNoCleanImageRandom();
  if (!waifuRow || waifuRow.length <= 0 || !waifuRow[0] || !waifuRow[0].id) return res.status(400).send({ error: 'No character found.' });

  const { desiredWidth, desiredHeight } = req.body;
  if (!desiredWidth || !desiredHeight) return res.status(400).send({ error: 'desired width and height required', body: req.body });

  const [waifu] = waifuRow;
  const { image_url: imageURL, id, nsfw } = waifu;

  let { uploader } = waifu;
  if (!uploader) uploader = botID;

  if (!imageURL) return res.status(400).send({ error: `No url found for ${imageURL}.` });

  const { status, data: mimsBuffer } = await mimsAPI.post('/smartcrop', { image_url: imageURL, width: desiredWidth, height: desiredHeight, options: { animeFace: true } });
  if (!mimsBuffer || status !== 200) return res.status(400).send({ error: `No buffer found for ${imageURL}.` });

  const { height, width } = getBufferHeightWidth(mimsBuffer);
  if (!width || (width !== desiredWidth && width !== DEFAULT_WIDTH)
    || !height || (height !== desiredHeight && height !== DEFAULT_HEIGHT)) {
    return res.status(500).send({ error: `No width or height found for buffer; height=${height}, width=${width}` });
  }

  const row = await storeImageBufferToURL(id, mimsBuffer, storeCleanWaifuImage, {
    width,
    height,
    nsfw,
    type: 'characters',
    uploader,
  });

  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading buffer for cleaned ${imageURL}.` });

  const {
    id: characterID,
    image_url_clean: imageURLClean,
    name,
    series,
    url,
  } = row[0];

  return res.status(201).send({ imageURLClean, characterID, name, imageURL, series, url, buffer: mimsBuffer, id });
});

route.patch('/:id/images/clean-discord', async (req, res) => {
  const { body, params } = req;

  if (!body || !body.uri || !params || !params.id) {
    return res.status(400).send({
      error: 'Missing info. Required: params.id, body.uri',
      body,
      params,
    });
  }

  const { id } = params;
  const { uri } = body;

  const waifuRow = await getWaifuById(id);
  if (!waifuRow || waifuRow.length <= 0 || !waifuRow[0] || !waifuRow[0].id) return res.status(404).send({ error: `image not found with id ${id}.` });

  await updateWaifuCleanImage(id, uri);
  return res.status(200).send({ uri, id });
});

route.post('/:id/images', async (req, res) => {
  const { body, params, query } = req;

  if (!body || !body.uri || !params || !params.id || !body.uploader) {
    return res.status(400).send({
      error: 'Missing info. Required: params.id, body.uri, body.uploader',
      body,
      params,
      query,
    });
  }

  const { id } = params;
  const {
    uri,
    nsfw = false,
    uploader,
    crop,
    desiredWidth = 300,
    desiredHeight = 467,
  } = body;

  const waifuRow = await getWaifuById(id);
  if (!waifuRow || waifuRow.length <= 0 || !waifuRow[0] || !waifuRow[0].id) return res.status(400).send({ error: `character not found with id ${id}.` });

  const [waifu] = waifuRow;

  const buffer = await getBuffer(uri);
  if (!buffer) return res.status(400).send({ error: `No buffer found for url ${uri}.` });

  const { height, width, error } = await validateBuffer(req, res, buffer, { overrideDefaultHW: true });
  if (!height || !width || error) return res.status(400).send(error);

  const checkImageExists = await getHashFromBufferID(waifu.id, buffer);
  if (checkImageExists && checkImageExists[0]) return res.status(400).send({ error: `The hash for ${uri} already exists for ${waifu.id}.` });

  const row = await storeImageBufferToURL(id, buffer, storeNewImage, { width, height, nsfw, type: 'characters', uploader });
  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading ${uri}.` });

  const { image_id: imageID, image_url_path_extra: imageURLExtra, file_type: fileType } = row[0];

  if (!waifu.image_url) {
    await updateWaifuImage(id, imageURLExtra, width,
      height, nsfw, buffer.length, fileType, uploader).catch((e) => logger.error(e));
  }

  if (!crop) {
    return res.status(201).send({ url: imageURLExtra, id: imageID });
  }

  const { status, data: mimsBuffer } = await mimsAPI.post('/smartcrop', { image_url: uri, width: desiredWidth, height: desiredHeight, options: { animeFace: true } });
  let urlCropped = '';
  if (mimsBuffer && status === 200) {
    const rowClean = await storeImageBufferToURL(imageID, mimsBuffer, storeCleanWaifuImageExtra, {
      width, height, nsfw, type: 'characters', uploader,
    });

    if (rowClean && rowClean.length > 0 && rowClean[0]) {
      const wRow = await getWaifuImagesAndInfoByID(rowClean[0].waifu_id, rowClean[0].image_id);
      if (!wRow || wRow.length <= 0 || !wRow[0]) return res.status(404).send({ error: `Could not find character ${row[0].waifu_id} with image url ${imageURLExtra}.` });
      const { image_url_clean_path_extra: imageClean } = wRow[0];
      urlCropped = imageClean;
    }
  }
  return res.status(201).send({ url: imageURLExtra, id: imageID, urlCropped });
});

route.patch('/merge', async (req, res) => {
  const { body } = req;

  if (!body || !body.mergeDupeURL || !body.mergeIntoURL) {
    return res.status(400).send({
      error: 'Missing info. Required body.mergeDupe and body.mergeInto',
      body,
    });
  }

  const { mergeDupeURL, mergeIntoURL } = body;

  const waifuDupeQuery = await getWaifuByImageURL(mergeDupeURL);
  if (!waifuDupeQuery || !waifuDupeQuery[0] || !waifuDupeQuery[0].id) return res.status(404).send({ error: `No dupe character found for url: ${mergeDupeURL}.` });

  const waifuMergeQuery = await getWaifuByImageURL(mergeIntoURL);
  if (!waifuMergeQuery || !waifuMergeQuery[0] || !waifuMergeQuery[0].id) return res.status(404).send({ error: `No merge character found for url: ${mergeIntoURL}.` });

  const [waifuDupe] = waifuDupeQuery;
  const [waifuMerge] = waifuMergeQuery;

  await removeDuplicateWaifuClaims(waifuDupe.id, waifuMerge.id);
  await mergeWaifus(waifuMerge.id, waifuDupe.id);
  await mergeWaifuImages(waifuMerge.id, waifuDupe.id);
  await deleteWaifuByID(waifuDupe.id);

  return res.status(204).send({ character: { dupe: waifuDupe, merge: waifuMerge } });
});

route.put('/:id', async (req, res) => {
  const updatedWaifu = req.body;

  if (!updatedWaifu || !updatedWaifu.id) return res.status(400).send({ error: 'Missing waifu.', message: 'Missing waifu object to insert.', body: req.body });

  const oldWaifuRow = await getWaifuById(updatedWaifu.id);
  if (!oldWaifuRow || !oldWaifuRow[0] || !oldWaifuRow[0].id) return res.status(404).send({ error: 'Waifu not found.', message: `${updatedWaifu.id} does not exist`, body: req.body });

  const [oldWaifu] = oldWaifuRow;
  const oldWaifuTemp = JSON.parse(JSON.stringify(oldWaifuRow[0]));

  const updatedWaifuObject = Object.assign(oldWaifu, updatedWaifu);
  if (updatedWaifuObject.husbando !== oldWaifuTemp.husbando) {
    updatedWaifuObject.unknown_gender = false;
  }

  await updateWaifu(updatedWaifuObject);

  return res.status(204).send();
});

route.get('/random', async (req, res) => {
  const { id, discordCrop, nsfw = false } = req.query;

  const query = await getRandomWaifu(nsfw, id, discordCrop);
  if (!query || !query[0]) return res.status(404).send({ error: `Could not find a character with query string ${req.query}` });

  return res.status(200).send(query[0]);
});

route.get('/count', async (_, res) => {
  const query = await getWaifuCount();
  if (!query || !query[0]) return res.status(404).send({ error: 'Could not get the count for all characters.' });

  return res.status(200).send(query[0]);
});

route.get('/:id/rank', async (req, res) => {
  const { id } = req.params;

  const query = await getRankClaimedWaifuByID(id);
  if (!query || !query[0]) return res.status(404).send({ error: `${id} is not a valid id.` });

  return res.status(200).send(query[0]);
});

route.get('/:id', async (req, res) => {
  const { id } = req.params;

  const query = await getWaifuById(id);
  if (!query || !query[0]) return res.status(404).send({ error: `${id} is not a valid id.` });

  return res.status(200).send(query[0]);
});

route.get('/', async (req, res) => {
  const { name, limit = 30 } = req.query;
  if (!name) return res.status(400).send({ error: 'Need query parameter name.' });

  const waifuRows = await searchWaifuByName(name, limit);
  return res.status(200).send(waifuRows);
});

route.patch('/:characterID/image', async (req, res) => {
  const { characterID } = req.params;
  const { discordCropURL, cropURL, imageURL } = req.body;

  if (!discordCropURL || !cropURL || !imageURL) return res.status(400).send({ error: `need discordCropURL, cropURL, imageURL. Received: ${JSON.stringify(req.body)}` });

  const updatedRows = await updateCharacterMainImage(characterID, discordCropURL, cropURL, imageURL);
  if (!updatedRows || updatedRows.length <= 0) return res.status(404).send({ error: `could not find a matching character with id ${characterID}` });

  return res.status(201).send();
});

module.exports = route;
