const route = require('express-promise-router')();
const { getMimsSettings } = require('../handlers/mims');

const { mimsAPI } = require('../services/axios');
const { getBufferHeightWidth } = require('../util/functions/buffer');
const { imageIdentifier } = require('../util/constants/magicNumbers');

route.post('/crop', async (req, res) => {
  const { imageURL } = req.body;

  if (!imageURL) return res.status(400).send({ error: 'Missing imageURL, width, or height in body.' });

  const mimsSettings = await getMimsSettings(imageURL);
  if (!mimsSettings) return res.status(400).send({ error: `no buffer found for ${imageURL}; could not generate MIMS settings` });

  const { status, data: mimsBuffer } = await mimsAPI.post('/smartcrop', mimsSettings);
  if (!mimsBuffer || status !== 200) return res.status(400).send({ error: `No buffer found for ${imageURL}.` });

  const { width, height } = getBufferHeightWidth(mimsBuffer);
  if (!width || !height) {
    return res.status(500).send({ error: `No width or height found for buffer; height=${height}, width=${width}` });
  }

  const contentType = imageIdentifier(mimsBuffer);
  return res.status(200).contentType(contentType).send(mimsBuffer);
});

module.exports = route;
