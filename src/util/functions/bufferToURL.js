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
  const { status } = await axios.put(`${cdnURL}/images/${characterUUID}.${fileExtension}`, buffer, {
    headers: { AccessKey: apiKey },
    maxContentLength: 100000000,
    maxBodyLength: 1000000000,
  });

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
  if (!imageURLDelete) {
    logger.error(`url to delete is not defined ${imageURLDelete}`);
    return undefined;
  }

  const updatedURL = imageURLDelete.replace(imageURL, cdnURL);
  if (!updatedURL || updatedURL === cdnURL) return undefined;

  // going to remove bongo.best storage, so ignore those problems
  if (imageURLDelete.startsWith(imageURL) && ['.jpg', '.png', '.gif', '.webp'].some((e) => updatedURL.endsWith(e))) {
    // problem with bunny cdn api
    axios.delete(updatedURL, { headers: { AccessKey: apiKey } }).then(({ status }) => {
      if (status !== 200) {
        logger.error(`Problem deleting with: ${id}, ${imageURLDelete}`);
      }
    }).catch((error) => {
      logger.error(error);
      logger.error(`Problem deleting with: ${id}, ${imageURLDelete}`);
    });
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
