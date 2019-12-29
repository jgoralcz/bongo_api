const route = require('express-promise-router')();

const { getBuffer } = require('../util/functions/buffer');
const { validateBuffer } = require('../handlers/validate');

const mbLimit = 1024;

route.post('/image', async (req, res) => {
  if (!req.body.imageURL) req.body.imageURL = req.body.uri;
  const { imageURL, overrideDefaultHW, waifuID } = req.body;
  if (!imageURL) res.status(400).send({ error: 'No image provided.' });

  const getImageInfo = await getBuffer(imageURL);
  if (!getImageInfo || !getImageInfo.buffer) return res.status(400).send({ error: `No buffer found for url ${uri}.` });

  const { buffer: tempBuffer } = getImageInfo;
  const buffer = Buffer.from(tempBuffer);

  const { height, width, error } = await validateBuffer(req, res, buffer, { mbLimit, overrideDefaultHW, waifuID });
  if (!height || !width || error) return res.status(400).send(error);

  return res.status(200).send({ height, width });
});

module.exports = route;
