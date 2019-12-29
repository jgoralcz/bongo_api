const route = require('express-promise-router')();
const logger = require('log4js').getLogger();

const { getWaifuById, insertWaifu, searchWaifuExactly, upsertWaifu } = require('../../db/waifu_schema/waifu/waifu');
const { getSeries: searchSeriesExactly } = require('../../db/waifu_schema/series/series_table');
const { insertSeries } = require('../../db/waifu_schema/appears_in/appears_in');
const { storeImageBufferToURL } = require('../../util/functions/bufferToURL');

const { getBuffer } = require('../../util/functions/buffer');
const { validateBuffer } = require('../../handlers/validate');

const {
  storeNewImage,
  getHashFromBufferID, mergeWaifuImages,
} = require('../../db/waifu_schema/waifu_images/waifu_table_images');

const { removeDuplicateWaifuClaims } = require('../../db/tables/cg_claim_waifu/cg_claim_waifu');

const {
  updateWaifuImage, deleteWaifuByID,
  mergeWaifus, getWaifuByURL, storeNewWaifuImage,
} = require('../../db/waifu_schema/waifu/waifu');

route.post('/', async (req, res) => {
  const { body } = req;

  if (!body.imageURL || !body.uploader || !body.name || (!body.series && !body.url) || body.husbando == null || body.nsfw == null || !body.description) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: imageURL, name, uploader, series, husbando, nsfw, description.', body });

  const {
    imageURL, name, series,
    husbando, nsfw, description,
    url: uri, seriesList,
    uploader, unknownGender,
  } = body;

  const seriesExistsQuery = await searchSeriesExactly(series);
  if (!seriesExistsQuery || seriesExistsQuery.length <= 0) return res.status(400).send({ error: 'Series does not exist.', message: `The series ${series} does not exist. You must create the series first.`, body });

  const characterExistsQuery = await searchWaifuExactly(name, series);
  if (characterExistsQuery && characterExistsQuery.length > 0 && !uri) return res.status(409).send({ error: 'Character already exists.', message: 'Required body: imageURL, name, series, husbando, nsfw, description.', body });

  const getImageInfo = await getBuffer(imageURL);
  if (!getImageInfo || !getImageInfo.buffer) return res.status(400).send({ error: `No buffer found for url ${imageURL}.` });

  const { buffer: tempBuffer } = getImageInfo;
  const buffer = Buffer.from(tempBuffer);

  const { height, width, error } = await validateBuffer(req, res, buffer, { overrideDefaultHW: true });
  if (!height || !width) return res.status(400).send(error);

  let waifuQuery;
  if (characterExistsQuery && characterExistsQuery.length > 0 && uri) {
    waifuQuery = await upsertWaifu(body);
  } else if (uri) {
    waifuQuery = await insertWaifu(body);
  } else {
    const waifu = {
      name,
      series,
      husbando,
      description,
      nsfw,
      url: '',
      imageURL,
      uploader,
      unknownGender,
    };
    waifuQuery = await insertWaifu(waifu);
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

  const row = await storeImageBufferToURL(id, buffer, storeNewWaifuImage, { isThumbnail: false, height, width, nsfw, type: 'characters', uploader });
  if (!row || row.length <= 0 || !row[0]) return res.status(500).send({ error: `Failed uploading character ${name}.` });

  const [info] = row;
  return res.status(201).send({ url: info.image_url, image_id: info.id, id });
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
  const { uri, nsfw = false, uploader } = body;

  const waifuRow = await getWaifuById(id);
  if (!waifuRow || waifuRow.length <= 0 || !waifuRow[0] || !waifuRow[0].id) return res.status(400).send({ error: `character not found with id ${id}.` });

  const [waifu] = waifuRow;

  const getImageInfo = await getBuffer(uri);
  if (!getImageInfo || !getImageInfo.buffer) return res.status(400).send({ error: `No buffer found for url ${uri}.` });

  const { buffer: tempBuffer } = getImageInfo;
  const buffer = Buffer.from(tempBuffer);

  const { height, width, error } = await validateBuffer(req, res, buffer, { overrideDefaultHW: true });
  if (!height || !width || error) return res.status(400).send(error);

  const checkImageExists = await getHashFromBufferID(waifu.id, buffer);
  if (checkImageExists && checkImageExists[0]) return res.status(400).send({ error: `The hash for ${uri} already exists for ${waifu.id}.` });

  const row = await storeImageBufferToURL(id, buffer, storeNewImage, { isThumbnail: false, height, width, nsfw, type: 'character', uploader });
  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading ${uri}.` });

  const { image_id: imageID, image_url_path_extra: imageURLExtra, file_type: fileType } = row[0];

  if (!waifu.image_url || !waifu.image_url_cdn) {
    await updateWaifuImage(id, imageURLExtra, width,
      height, nsfw, buffer.length, fileType, uploader).catch((e) => logger.error(e));
  }

  return res.status(201).send({ url: imageURLExtra, id: imageID });
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

  const waifuDupeQuery = await getWaifuByURL(mergeDupeURL);
  if (!waifuDupeQuery || !waifuDupeQuery[0] || !waifuDupeQuery[0].id) return res.status(404).send({ error: `No character found for url: ${mergeDupeURL}.` });

  const waifuMergeQuery = await getWaifuByURL(mergeIntoURL);
  if (!waifuMergeQuery || !waifuMergeQuery[0] || !waifuMergeQuery[0].id) return res.status(404).send({ error: `No character found for url: ${mergeIntoURL}.` });

  const [waifuDupe] = waifuDupeQuery;
  const [waifuMerge] = waifuMergeQuery;

  await removeDuplicateWaifuClaims(waifuDupe.id, waifuMerge.id);
  await mergeWaifus(waifuMerge.id, waifuDupe.id);
  await mergeWaifuImages(waifuMerge.id, waifuDupe.id);
  await deleteWaifuByID(waifuDupe.id);

  return res.status(204).send({ character: { dupe: waifuDupe, merge: waifuMerge } });
});

route.get('/:id', async (req, res) => {
  const { id } = req.params;
  const query = await getWaifuById(id);

  if (!query || !query[0]) return res.status(404).send({ error: `${id} is not a valid id.` });

  return res.status(200).send(query[0]);
});

module.exports = route;
