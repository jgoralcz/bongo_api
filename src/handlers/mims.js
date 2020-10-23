const axios = require('axios');
const logger = require('log4js').getLogger();
const { getBufferHeightWidth } = require('../util/functions/buffer');
const {
  DEFAULT_HEIGHT_MAX, DEFAULT_WIDTH_MAX, BORDER_MAX,
  DEFAULT_HEIGHT_MIN, DEFAULT_WIDTH_MIN, BORDER_MIN,
} = require('../util/constants/dimensions');

const getMimsSettings = async (imageURL) => {
  try {
    const { data: buffer } = await axios.get(imageURL, { responseType: 'arraybuffer' });
    const { width, height } = getBufferHeightWidth(buffer);

    let widthDesired = DEFAULT_WIDTH_MIN;
    let heightDesired = DEFAULT_HEIGHT_MIN;
    let borderSize = BORDER_MIN;

    if (width > 280 && height > 440) {
      widthDesired = DEFAULT_WIDTH_MAX;
      heightDesired = DEFAULT_HEIGHT_MAX;
      borderSize = BORDER_MAX;
    }

    return {
      image_url: imageURL,
      width: widthDesired,
      height: heightDesired,
      minBufferSize: 40000,
      options: {
        animeFace: true,
        border: {
          x: borderSize,
          y: borderSize,
          color: 'white',
        },
        sharpen: {
          minX: DEFAULT_WIDTH_MIN,
          minY: DEFAULT_HEIGHT_MIN,
          minBufferSize: 25000,
          maxX: DEFAULT_WIDTH_MAX,
          maxY: DEFAULT_HEIGHT_MAX,
          maxBufferSize: 40000,
        },
      },
    };
  } catch (error) {
    logger.error(`image not found from url: ${imageURL}`, error);
  }
  return undefined;
};

module.exports = {
  getMimsSettings,
};
