const { poolQuery } = require('../../index');

const insertMessageIDCharacter = async (messageID, characterID, isCustomWaifu, userID, unlockEmbedColor) => poolQuery(`
  INSERT INTO message_character (message_id, waifu_id, is_custom_waifu, user_id, unlock_embed_color)
  VALUES ($1, $2, $3, $4, $5);
`, [messageID, characterID, isCustomWaifu, userID, unlockEmbedColor]);

const getMessageIDCharacter = async (messageID) => poolQuery(`
  SELECT *, now()::timestamp
  FROM message_character
  WHERE message_id = $1;
`, [messageID]);

const deleteStaleMessageCharacter = async () => poolQuery(`
  DELETE
  FROM message_character
  WHERE date < NOW() - INTERVAL '7 days';
`, []);

module.exports = {
  insertMessageIDCharacter,
  getMessageIDCharacter,
  deleteStaleMessageCharacter,
};
