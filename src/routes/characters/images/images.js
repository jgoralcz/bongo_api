const route = require('express-promise-router')();

const { deleteCDNImage } = require('../../../util/functions/bufferToURL');
const {
  deleteImage, selectImage,
  selectImageByURL, selectAllImage,
  updateImage, updateImageNSFW,
} = require('../../../db/waifu_schema/waifu_images/waifu_table_images');


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
