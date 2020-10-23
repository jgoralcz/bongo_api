const route = require('express-promise-router')();
const logger = require('log4js').getLogger();

const { deleteCDNImage } = require('../../../util/functions/bufferToURL');
const {
  deleteImage,
  deleteCleanImage,
  selectImage,
  selectImageByURL,
  selectAllImage,
  storeCleanWaifuImage,
  updateImage,
  updateImageNSFW,
  getWaifuImagesByNoCleanImageRandom,
  getWaifuImagesAndInfoByID,
  updateWaifuDiscordImageURL,
  getImageInfoByURL,
  markSFWImageByURL,
} = require('../../../db/waifu_schema/waifu_images/waifu_table_images');

const {
  selectMainImage,
} = require('../../../db/waifu_schema/waifu/waifu');

const { config } = require('../../../util/constants/paths');
const nconfConfig = require('nconf').file('config', config);
const botID = nconfConfig.get('botID');

const { getBufferHeightWidth } = require('../../../util/functions/buffer');
const { storeImageBufferToURL } = require('../../../util/functions/bufferToURL');
const { getMimsSettings } = require('../../../handlers/mims');

const { mimsAPI } = require('../../../services/axios');

route.post('/search', async (req, res) => {
  const { uri } = req.body;
  if (!uri) return res.status(400).send({ error: 'Missing uri in body.' });

  const row = await getImageInfoByURL(uri);
  if (!row || row.length <= 0 || !row[0]) return res.status(404).send({ error: `No image found for ${uri}` });

  const [info] = row;
  const { id, image_url_clean_path_extra: imageURLClean, image_url_path_extra: imageURL, image_url_clean_discord_path_extra: imageURLCleanDiscord } = info;

  return res.status(200).send({ id, imageURLClean, imageURL, imageURLCleanDiscord });
});

route.patch('/clean-images', async (req, res) => {
  const waifuRow = await getWaifuImagesByNoCleanImageRandom();
  if (!waifuRow || waifuRow.length <= 0 || !waifuRow[0] || !waifuRow[0].image_id) return res.status(400).send({ error: 'No character found.' });

  const [waifu] = waifuRow;
  const { image_url_path_extra: imageURL, image_id: id, nsfw } = waifu;

  let { uploader } = waifu;
  if (!uploader) uploader = botID;

  if (!imageURL) return res.status(400).send({ error: `No url found for ${imageURL}.` });

  const mimsSettings = await getMimsSettings(imageURL);
  if (!mimsSettings) return res.status(400).send({ error: `no buffer found for ${imageURL}; could not generate MIMS settings` });

  const { status, data: mimsBuffer } = await mimsAPI.post('/smartcrop', mimsSettings);
  if (!mimsBuffer || status !== 200) return res.status(400).send({ error: `No buffer found for ${imageURL}.` });

  const { height, width } = getBufferHeightWidth(mimsBuffer);

  const row = await storeImageBufferToURL(id, mimsBuffer, storeCleanWaifuImage, {
    width,
    height,
    nsfw,
    type: 'characters',
    uploader,
  });

  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading buffer for cleaned ${imageURL}.` });

  const wRow = await getWaifuImagesAndInfoByID(row[0].waifu_id, row[0].image_id);
  if (!wRow || wRow.length <= 0 || !wRow[0]) return res.status(404).send({ error: `Could not find character ${row[0].waifu_id} with image url ${imageURL}.` });
  const { image_url_clean_path_extra: imageURLClean, image_url_path_extra: imageURLPathExtra, name, series, url, waifu_id: waifuID, nsfw: wNSFW } = wRow[0];

  return res.status(201).send({ buffer: mimsBuffer, imageURLClean, imageURLPathExtra, name, series, url, imageID: id, id: waifuID, nsfw: wNSFW });
});


route.patch('/:id/clean-discord', async (req, res) => {
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

  const imageRow = await selectImage(id);
  if (!imageRow || imageRow.length <= 0 || !imageRow[0] || !imageRow[0].image_id) return res.status(404).send({ error: `image not found with id ${id}.` });

  await updateWaifuDiscordImageURL(id, uri);
  return res.status(200).send({ uri, id });
});

route.patch('/:id/nsfw', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'id needed.' });

  const image = await selectAllImage(id);
  if (!image || !image[0] || image.length <= 0) return res.status(404).send({ error: 'Image not found.' });

  const { nsfw = true } = req.body;
  const updatedImage = await updateImageNSFW(id, nsfw);

  return res.status(200).send(updatedImage[0] || {});
});

route.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).send({ error: 'id needed.' });

  const image = await selectAllImage(id);
  if (!image || !image[0] || image.length <= 0) return res.status(404).send({ error: 'Image not found.' });

  const currentImage = image[0];
  const mergedImageInfo = Object.assign(currentImage, req.body);

  const updatedImage = await updateImage(mergedImageInfo);

  return res.status(200).send(updatedImage);
});

route.delete('/clean-url', async (req, res) => {
  const { url, override = false, requester } = req.query;

  if (!url) return res.status(400).send({ error: 'valid URL needed.' });

  const image = await selectImageByURL(url);
  if (!image || !image[0] || image.length <= 0) return res.status(404).send({ error: 'Image not found.' });

  const { image_url_clean_path_extra: imageURLClean, image_id: imageID, uploader } = image[0];
  if ((!uploader || !requester || uploader !== requester) && !override) return res.status(401).send({ error: 'Not authorized.', message: 'You are not the owner of this image.' });

  const success = await deleteCDNImage(imageID, imageURLClean, deleteCleanImage);
  if (!success) return res.status(500).send({ error: `failed to delete image ${url}` });

  return res.status(204).send();
});

route.delete('/url', async (req, res) => {
  const { url, override = false, requester } = req.query;

  if (!url) return res.status(400).send({ error: 'valid URL needed.' });

  const offImage = await selectImageByURL(url);
  let mainImage;
  if (!offImage || !offImage[0] || offImage.length <= 0) {
    mainImage = await selectMainImage(undefined, url);
  }

  const image = offImage || mainImage;

  if (!image) {
    const success = await deleteCDNImage(undefined, url).catch((error) => logger.error(error));
    if (success) {
      return res.status(204).send();
    }
    return res.status(404).send({ error: 'Image not found.' });
  }


  const { image_url_path_extra: imageURL, image_url_clean_path_extra: imageURLClean, image_id: imageID, uploader } = image[0];
  const { image_url_clean: imageURLCleanMain, image_url: imageURLMain } = image[0];
  if ((!uploader || !requester || uploader !== requester) && !override) return res.status(401).send({ error: 'Not authorized.', message: 'You are not the owner of this image.' });

  const successCrop = await deleteCDNImage(imageID, imageURLClean || imageURLCleanMain, deleteCleanImage).catch((error) => logger.error(error));
  const successFull = await deleteCDNImage(imageID, imageURL || imageURLMain, deleteImage);

  if (!successCrop && !successFull) return res.status(404).send({ error: 'Image not found.' });

  return res.status(204).send();
});

route.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { override = false, requester } = req.query;

  if (!id || isNaN(parseInt(id, 10))) return res.status(400).send({ error: 'valid id needed.' });

  const image = await selectImage(id);
  if (!image || !image[0] || image.length <= 0) return res.status(404).send({ error: 'Image not found.' });

  const { image_url_path_extra: imageURL, image_url_clean_path_extra: imageURLClean, image_id: imageID, uploader } = image[0];
  if ((uploader && uploader !== requester && !override)) return res.status(401).send({ error: 'Not authorized.', message: 'You are not the owner of this image.' });

  await deleteCDNImage(imageID, imageURLClean);
  await deleteCDNImage(imageID, imageURL, deleteImage);

  return res.status(204).send();
});

route.delete('/cropped/:id', async (req, res) => {
  const { id } = req.params;
  const { override = false, requester } = req.query;

  if (!id || isNaN(parseInt(id, 10))) return res.status(400).send({ error: 'valid id needed.' });

  const image = await selectImage(id);
  if (!image || !image[0] || image.length <= 0) return res.status(404).send({ error: 'Image not found.' });

  const { image_url_clean_path_extra: imageURLClean, image_id: imageID, uploader } = image[0];
  if ((uploader && uploader !== requester && !override)) return res.status(401).send({ error: 'Not authorized.', message: 'You are not the owner of this image.' });

  await deleteCDNImage(imageID, imageURLClean, deleteCleanImage);

  return res.status(204).send();
});

route.patch('/nsfw', async (req, res) => {
  const { imageURL, nsfw } = req.body;
  if (!imageURL || nsfw == null) return res.status(400).send({ error: 'Expecting imageURL and nsfw' });

  await markSFWImageByURL(imageURL, nsfw);
  return res.status(204).send();
});

module.exports = route;
