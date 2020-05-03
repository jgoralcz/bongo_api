const request = require('request-promise');
const imageSize = require('image-size');

const { MBLIMIT } = require('../../util/constants/bytes');

const getBuffer = async (uri) => request({ uri, encoding: null });

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
