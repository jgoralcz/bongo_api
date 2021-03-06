const {
  getBufferLength,
  testBufferLimit,
  getBufferHeightWidth,
  testHeightWidth,
} = require('../util/functions/buffer');
const {
  DEFAULT_HEIGHT_MIN, DEFAULT_WIDTH_MIN,
  DEFAULT_HEIGHT_MAX, DEFAULT_WIDTH_MAX,
} = require('../util/constants/dimensions');
const { MBLIMIT } = require('../util/constants/bytes');

const { getHashFromBufferID } = require('../db/waifu_schema/waifu_images/waifu_table_images');

const validateBuffer = async (req, res, buffer, config) => {
  const { mbLimit = MBLIMIT, overrideDefaultHW = false, waifuID } = config;

  if (!req.body.uri) req.body.uri = req.body.imageURL;
  if (!req.body.uri) return { error: 'uri or imageURL expected in body.' };

  const { imageURL: uri } = req.body;

  if (!getBufferLength(buffer)) return { error: `${uri} is not a supported image type.` };
  if (testBufferLimit(buffer, mbLimit)) return { error: `${uri} exceeds the ${MBLIMIT}mb limit.` };

  const { height, width } = getBufferHeightWidth(buffer);
  if (!height || !width) return { error: `No width or height found for url ${uri}; height=${height}, width=${width}` };
  if (!testHeightWidth(height, width, DEFAULT_HEIGHT_MIN, DEFAULT_WIDTH_MIN) && !testHeightWidth(height, width, DEFAULT_HEIGHT_MAX, DEFAULT_WIDTH_MAX) && !overrideDefaultHW) return { error: 'Image ratio is not between 0.64 or 0.72.' };

  if (waifuID) {
    const checkImageExists = await getHashFromBufferID(waifuID, buffer);
    if (checkImageExists && checkImageExists[0]) return res.status(400).send({ error: `The hash for ${uri} already exists for ${waifuID}.` });
  }

  return { height, width };
};

module.exports = {
  validateBuffer,
};
