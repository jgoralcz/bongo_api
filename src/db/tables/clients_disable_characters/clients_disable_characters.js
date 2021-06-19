const { poolQuery } = require('../../index');

const addBlacklistCharacterUser = async (userID, characterID) => poolQuery(`
  INSERT INTO clients_disable_characters(user_id, character_id)
  VALUES ($1, $2)
  ON CONFLICT(user_id, character_id)
  DO NOTHING;
`, [userID, characterID]);

const removeBlacklistCharacterUser = async (userID, characterID) => poolQuery(`
  DELETE
  FROM clients_disable_characters
  WHERE user_id = $1 AND character_id = $2;
`, [userID, characterID]);

const getBlacklistCharacterUserCount = async (userID) => poolQuery(`
  SELECT count(*)
  FROM clients_disable_characters
  WHERE user_id = $1;
`, [userID]);

const getBlacklistCharactersUserPage = async (userID, offset, limit) => poolQuery(`
  SELECT wswt.name, wswt.id, wswt.url, wsst.name AS series
  FROM clients_disable_characters cdc
  JOIN waifu_schema.waifu_table wswt ON wswt.id = cdc.character_id
  JOIN waifu_schema.series_table wsst on wsst.id = wswt.series_id
  WHERE user_id = $1
  ORDER BY wswt.name ASC
  LIMIT $3 OFFSET $2;
`, [userID, offset, limit]);

module.exports = {
  addBlacklistCharacterUser,
  removeBlacklistCharacterUser,
  getBlacklistCharacterUserCount,
  getBlacklistCharactersUserPage,
};
