const route = require('express-promise-router')();

const { mimsAPI } = require('../services/axios');
const { getBufferHeightWidth } = require('../util/functions/buffer');
const { imageIdentifier } = require('../util/constants/magicNumbers');

route.post('/crop', async (req, res) => {
  const { imageURL, width: desiredWidth, height: desiredHeight } = req.body;

  if (!imageURL || !desiredHeight || !desiredWidth) return res.status(400).send({ error: 'Missing imageURL, width, or height in body.' });

  const { status, data: mimsBuffer } = await mimsAPI.post('/smartcrop', { image_url: imageURL, width: desiredWidth, height: desiredHeight, options: { animeFace: true } });
  if (!mimsBuffer || status !== 200) return res.status(400).send({ error: `No buffer found for ${imageURL}.` });

  const { width, height } = getBufferHeightWidth(mimsBuffer);
  if (!width || width !== desiredWidth || !height || height !== desiredHeight) return res.status(500).send({ error: `No width or height found for buffer; height=${height}, width=${width}` });

  const contentType = imageIdentifier(mimsBuffer);
  return res.status(200).contentType(contentType).send(mimsBuffer);
});

module.exports = route;
