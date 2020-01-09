const route = require('express-promise-router')();

const { deleteCDNImage } = require('../../../util/functions/bufferToURL');
const {
  deleteImage, selectImage,
  selectImageByURL, selectAllImage, storeCleanWaifuImage,
  updateImage, updateImageNSFW, getWaifuImagesByNoCleanImageRandom,
} = require('../../../db/waifu_schema/waifu_images/waifu_table_images');

const { botID } = require('../../../../config.json');
const { DEFAULT_HEIGHT, DEFAULT_WIDTH } = require('../../../util/constants/dimensions');
const { getBufferHeightWidth } = require('../../../util/functions/buffer');
const { storeImageBufferToURL } = require('../../../util/functions/bufferToURL');

const { mimsAPI } = require('../../../services/axios');


route.patch('/clean-images', async (_, res) => {
  const waifuRow = await getWaifuImagesByNoCleanImageRandom();
  if (!waifuRow || waifuRow.length <= 0 || !waifuRow[0] || !waifuRow[0].image_id) return res.status(400).send({ error: 'No character found.' });

  const [waifu] = waifuRow;
  const { image_url_path_extra: imageURL, image_id: id, nsfw } = waifu;

  let { uploader } = waifu;
  if (!uploader) uploader = botID;

  if (!imageURL) return res.status(400).send({ error: `No url found for ${imageURL}.` });

  const { status, data: mimsBuffer } = await mimsAPI.post('/smartcrop', { image_url: imageURL, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, options: { animeFace: true } });
  if (!mimsBuffer || status !== 200) return res.status(400).send({ error: `No buffer found for ${imageURL}.` });
  const { height, width } = getBufferHeightWidth(mimsBuffer);
  if (!height || !width || height !== DEFAULT_HEIGHT || width !== DEFAULT_WIDTH) return { error: `No width or height found for buffer; height=${height}, width=${width}` };

  const row = await storeImageBufferToURL(id, mimsBuffer, storeCleanWaifuImage, {
    isThumbnail: false, height, width, nsfw, type: 'characters', uploader,
  });

  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading buffer for cleaned ${imageURL}.` });
  const { image_url_clean_path_extra: imageURLClean, image_url_path_extra } = row[0];

  return res.status(201).send({ imageURLClean, imageURL: image_url_path_extra });
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

route.delete('/url', async (req, res) => {
  const { url, override = false, requester } = req.query;

  if (!url) return res.status(400).send({ error: 'valid URLL needed.' });

  const image = await selectImageByURL(url);
  if (!image || !image[0] || image.length <= 0) return res.status(404).send({ error: 'Image not found.' });

  const { image_url_path_extra: imageURL, image_id: imageID, uploader } = image[0];
  if ((!uploader || !requester || uploader !== requester) && !override) return res.status(401).send({ error: 'Not authorized.', message: 'You are not the owner of this image.' });

  await deleteCDNImage(imageID, imageURL, deleteImage);

  return res.status(204).send();
});

route.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { override = false, requester } = req.query;

  if (!id || isNaN(parseInt(id, 10))) return res.status(400).send({ error: 'valid id needed.' });

  const image = await selectImage(id);
  if (!image || !image[0] || image.length <= 0) return res.status(404).send({ error: 'Image not found.' });

  const { image_url_path_extra: imageURL, image_id: imageID, uploader } = image[0];
  if ((uploader && uploader !== requester && !override)) return res.status(401).send({ error: 'Not authorized.', message: 'You are not the owner of this image.' });

  await deleteCDNImage(imageID, imageURL, deleteImage);

  return res.status(204).send();
});

module.exports = route;
