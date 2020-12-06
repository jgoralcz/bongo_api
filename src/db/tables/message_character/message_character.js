const { poolQuery } = require('../../index');

const insertMessageIDCharacter = async (messageID, characterID, isCustomWaifu, userID) => poolQuery(`
  INSERT INTO message_character (message_id, waifu_id, is_custom_waifu, user_id)
  VALUES ($1, $2, $3, $4);
`, [messageID, characterID, isCustomWaifu, userID]);

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
