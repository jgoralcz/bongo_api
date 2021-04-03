const axios = require('axios');
const { nanoid } = require('nanoid');
const logger = require('log4js').getLogger();

const { imageIdentifier } = require('../constants/magicNumbers');

const { auth } = require('../constants/config');

const { apiKey } = auth;

const { cdnURL, imageURL } = require('../constants/cdn');

const storeImageBufferToURL = async (id, buffer, updateDBFunc, config) => {
  const fileExtension = imageIdentifier(buffer);
  const {
    height,
    width,
    nsfw,
    uploader,
  } = config;

  if (!fileExtension || !uploader) return undefined;

  const characterUUID = nanoid(7);
  const { status } = await axios.put(`${cdnURL}/images/${characterUUID}.${fileExtension}`, buffer, { headers: { AccessKey: apiKey } });

  const cdnUpdatedURL = `${imageURL}/images/${characterUUID}.${fileExtension}`;
  if (status !== 201) {
    return undefined;
  }

  const rows = await updateDBFunc(id, cdnUpdatedURL, buffer, height, width, nsfw, buffer.length, fileExtension, uploader);
  if (rows && rows.length > 0) {
    logger.info(`Finished uploading ${cdnUpdatedURL}`);
  } else {
    logger.error(`Problem uploading with: ${id}, ${cdnUpdatedURL}`);
  }

  Object.assign(rows[0], {
    height,
    width,
    nsfw,
    uploader,
    bufferLength: buffer.length,
    cdnURL: cdnUpdatedURL,
    fileType: fileExtension,
  });

  return rows;
};

const deleteCDNImage = async (id, imageURLDelete, deleteDBFunc) => {
  if (!imageURLDelete) throw new Error('url to delete is not defined.');

  const updatedURL = imageURLDelete.replace(imageURL, cdnURL);
  if (!updatedURL || updatedURL === cdnURL || updatedURL.length <= cdnURL.length + 7) return undefined;

  // going to remove bongo.best storage, so ignore those problems
  if (imageURLDelete.startsWith(imageURL)) {
    const { status } = await axios.delete(updatedURL, { headers: { AccessKey: apiKey } });

    if (status !== 200) {
      logger.error(`Problem deleting with: ${id}, ${imageURLDelete}`);
      return false;
    }
  }

  if (!id) return true;

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
