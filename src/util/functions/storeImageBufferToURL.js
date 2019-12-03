const request = require('request-promise');
const uuid = require('uuid/v4');
const logger = require('log4js').getLogger();

const { imageIdentifier } = require('../../util/constants/magicNumbers');
const { apiKey } = require('../../../config.json');

const storeImageBufferToURL = async (id, buffer, updateDBFunc, isThumbnail, height, width) => {
  const fileExtension = imageIdentifier(buffer);
  if (!fileExtension) return undefined;

  const characterUUID = uuid();

  const uri = (isThumbnail) ? `https://storage.bunnycdn.com/bongo-storage/characters/${id}/${characterUUID}_thumb.${fileExtension}` : `https://storage.bunnycdn.com/bongo-storage/characters/${id}/${characterUUID}.${fileExtension}`;

  const response = await request({
    uri,
    method: 'PUT',
    body: buffer,
    encoding: null,
    headers: {
      AccessKey: apiKey,
    },
  });

  const cdnURL = (isThumbnail) ? `https://cdn.bongo.best/characters/${id}/${characterUUID}_thumb.${fileExtension}` : `https://cdn.bongo.best/characters/${id}/${characterUUID}.${fileExtension}`;

  if (response) {
    const rows = await updateDBFunc(id, cdnURL, buffer, height, width);
    if (rows && rows.length > 0) {
      logger.info(`Finished ${cdnURL}`);
    } else {
      logger.error(`Problem with: ${id}, ${cdnURL}`);
    }
    return rows;
  }
  return undefined;
};

module.exports = {
  storeImageBufferToURL,
};
