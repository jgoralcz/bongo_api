const request = require('request-promise');

const getBuffer = async (uri) => request({
  uri,
  encoding: null,
});

module.exports = {
  getBuffer,
};
