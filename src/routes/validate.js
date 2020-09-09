const route = require('express-promise-router')();

const { getBuffer } = require('../util/functions/buffer');
const { validateBuffer } = require('../handlers/validate');

const mbLimit = 1024;

route.post('/image', async (req, res) => {
  const { imageURL, overrideDefaultHW, waifuID } = req.body;
  if (!imageURL) res.status(400).send({ error: 'No image provided.' });

  const buffer = await getBuffer(imageURL);
  if (!buffer) return res.status(400).send({ error: `No buffer found for url ${imageURL}.` });

  const { height, width, error } = await validateBuffer(req, res, buffer, { mbLimit, overrideDefaultHW, waifuID });
  if (!height || !width || error) return res.status(400).send(error);

  return res.status(200).send({ height, width });
});

module.exports = route;
