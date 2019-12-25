const { getBufferLength, testBufferLimit, getBufferHeightWidth, testHeightWidth } = require('../util/functions/buffer');
const { DEFAULT_HEIGHT, DEFAULT_WIDTH } = require('../util/constants/dimensions');
const { MBLIMIT } = require('../util/constants/bytes');

const validateBuffer = (req, res, buffer, config) => {
  const { mbLimit = MBLIMIT } = config;
  const { uri } = req.body;

  if (!getBufferLength(buffer)) return { error: `${uri} is not a supported image type.` };
  if (testBufferLimit(buffer, mbLimit)) return { error: `${uri} exceeds the ${MBLIMIT}mb limit.` };

  const { height, width } = getBufferHeightWidth(buffer);
  if (!uri) {
    if (!height || !width) return { error: `No width or height found for url ${uri}; height=${height}, width=${width}` };
    if (!testHeightWidth(height, width, DEFAULT_HEIGHT, DEFAULT_WIDTH)) return { error: 'Image ratio is not between 0.64 or 0.72.' };
  }

  return { height, width };
};

module.exports = {
  validateBuffer,
};
