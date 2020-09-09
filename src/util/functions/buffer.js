const axios = require('axios');
const logger = require('log4js').getLogger();
const imageSize = require('image-size');

const { MBLIMIT } = require('../../util/constants/bytes');

const getBuffer = async (uri) => {
  const { status, data } = await axios.get(uri, { responseType: 'arraybuffer', validateStatus: () => true });
  if (status !== 200 || !data) {
    logger.error(`url ${uri} did not return status code 200 when seeking buffer.`);
    return undefined;
  }
  return Buffer.from(data);
};

const getBufferLength = (buffer) => buffer && buffer.length;

const testBufferLimit = (buffer, mbLimit = MBLIMIT) => (buffer.length / 1024 / 1024) > mbLimit;

const getBufferHeightWidth = (buffer) => imageSize(buffer);

// eslint-disable-next-line max-len
const testHeightWidth = (height, width) => height && width && (width / height) >= 0.64 && (width / height) <= 0.72;

module.exports = {
  getBuffer,
  getBufferLength,
  testBufferLimit,
  getBufferHeightWidth,
  testHeightWidth,
};
