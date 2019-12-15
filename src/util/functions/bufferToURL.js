const request = require('request-promise');
const uuid = require('uuid/v4');
const logger = require('log4js').getLogger();

const { imageIdentifier } = require('../constants/magicNumbers');
const { apiKey } = require('../../../config.json');

const { cdnURL, imageURL } = require('../constants/cdn');

const storeImageBufferToURL = async (id, buffer, updateDBFunc, isThumbnail, height, width, nsfw, seriesOrCharacter = 'characters', uploader) => {
  const fileExtension = imageIdentifier(buffer);
  if (!fileExtension || !uploader) return undefined;

  const characterUUID = uuid();

  const uri = (isThumbnail) ? `${cdnURL}/${seriesOrCharacter}/${id}/${characterUUID}_thumb.${fileExtension}` : `${cdnURL}/${seriesOrCharacter}/${id}/${characterUUID}.${fileExtension}`;

  const response = await request({
    uri,
    method: 'PUT',
    body: buffer,
    encoding: null,
    headers: {
      AccessKey: apiKey,
    },
  });

  const cdnUpdatedURL = (isThumbnail) ? `${imageURL}/${seriesOrCharacter}/${id}/${characterUUID}_thumb.${fileExtension}` : `${imageURL}/${seriesOrCharacter}/${id}/${characterUUID}.${fileExtension}`;

  if (response) {
    const rows = await updateDBFunc(id, cdnUpdatedURL, buffer, height, width, nsfw, buffer.length, fileExtension, uploader);
    if (rows && rows.length > 0) {
      logger.info(`Finished uploading ${cdnUpdatedURL}`);
    } else {
      logger.error(`Problem uploading with: ${id}, ${cdnUpdatedURL}`);
    }
    return rows;
  }
  return undefined;
};

const deleteCDNImage = async (id, imageURLDelete, deleteDBFunc) => {
  const updatedURL = imageURLDelete.replace(imageURL, cdnURL);
  if (!updatedURL || updatedURL === cdnURL || updatedURL.length <= cdnURL.length + 20) return undefined;

  const response = await request({
    uri: updatedURL,
    method: 'DELETE',
    encoding: null,
    headers: {
      AccessKey: apiKey,
    },
  });

  if (response) {
    const rows = await deleteDBFunc(id);
    if (rows && rows.length > 0) {
      logger.info(`Deleted ${imageURLDelete}`);
    } else {
      logger.error(`Problem deleting with: ${id}, ${imageURLDelete}`);
    }
    return rows;
  }
  return undefined;
};

module.exports = {
  storeImageBufferToURL,
  deleteCDNImage,
};
