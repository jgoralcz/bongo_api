const axios = require('axios');
const uuid = require('uuid/v4');
const logger = require('log4js').getLogger();

const { imageIdentifier } = require('../constants/magicNumbers');

const { basicAuth } = require('../constants/paths');
const nconf = require('nconf').file('auth', basicAuth);

const apiKey = nconf.get('apiKey');

const { cdnURL, imageURL } = require('../constants/cdn');

const storeImageBufferToURL = async (id, buffer, updateDBFunc, config) => {
  const fileExtension = imageIdentifier(buffer);
  const { height, width, nsfw, type = 'characters', uploader } = config;
  if (!fileExtension || !uploader) return undefined;

  const characterUUID = uuid();
  const { status } = await axios.put(`${cdnURL}/${type}/${id}/${characterUUID}.${fileExtension}`, buffer, { headers: { AccessKey: apiKey } });

  const cdnUpdatedURL = `${imageURL}/${type}/${id}/${characterUUID}.${fileExtension}`;
  if (status !== 201) {
    return undefined;
  }

  const rows = await updateDBFunc(id, cdnUpdatedURL, buffer, height, width, nsfw, buffer.length, fileExtension, uploader);
  if (rows && rows.length > 0) {
    logger.info(`Finished uploading ${cdnUpdatedURL}`);
  } else {
    logger.error(`Problem uploading with: ${id}, ${cdnUpdatedURL}`);
  }
  return rows;
};

const deleteCDNImage = async (id, imageURLDelete, deleteDBFunc) => {
  if (!imageURLDelete) throw new Error('url to delete is not defined.');

  const updatedURL = imageURLDelete.replace(imageURL, cdnURL);
  if (!updatedURL || updatedURL === cdnURL || updatedURL.length <= cdnURL.length + 20) return undefined;

  const { status } = await axios.delete(updatedURL, { headers: { AccessKey: apiKey } });

  if (status !== 200 || !deleteDBFunc) {
    logger.error(`Problem deleting with: ${id}, ${imageURLDelete}`);
    return undefined;
  }

  const rows = await deleteDBFunc(id);
  if (rows && rows.length > 0) {
    logger.info(`Deleted ${imageURLDelete}`);
  } else {
    logger.error(`Problem deleting with: ${id}, ${imageURLDelete}`);
  }
  return rows;
};

module.exports = {
  storeImageBufferToURL,
  deleteCDNImage,
};
