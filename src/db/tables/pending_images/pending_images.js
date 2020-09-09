const { poolQuery } = require('../../index');

const insertPendingImage = async (messageID, characterID, uploaderID, body, imageURL, nsfw) => poolQuery(`
  INSERT INTO pending_images (message_id, waifu_id, uploader_id, body, image_url, nsfw)
  VALUES ($1, $2, $3, $4, $5, $6);
`, [messageID, characterID, uploaderID, body, imageURL, nsfw]);

const getMessageIDPendingImage = async (messageID) => poolQuery(`
  SELECT *, now()::timestamp
  FROM pending_images
  WHERE message_id = $1 AND message_id IS NOT NULL;
`, [messageID]);

const deleteMessageIDPendingImage = async (id) => poolQuery(`
  DELETE
  FROM pending_images
  WHERE message_id = $1;
`, [id]);

module.exports = {
  insertPendingImage,
  getMessageIDPendingImage,
  deleteMessageIDPendingImage,
};
