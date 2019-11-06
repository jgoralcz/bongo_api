const { poolQuery } = require('../../index.js');

/**
 * upserts the whitelisted command
 * @param id the user's id.
 * @param type the user type.
 * @param whitelistArray the whitelisted array.
 * @returns {Promise<*>}
 */
const upsertWhitelist = async (id, type, whitelistArray) => poolQuery(`
  INSERT INTO whitelist_table (whitelist_user_id, type, whitelist) VALUES ($1, $2, $3)
  ON CONFLICT(whitelist_user_id) DO
  UPDATE
    SET whitelist = $3 WHERE whitelist_table.whitelist_user_id = $1;
`, [id, type, whitelistArray]);

/**
 * gets the whitelists info
 * @param id the user's id.
 * @returns {Promise<*>}
 */
const getWhitelists = async id => poolQuery(`
  SELECT * FROM
  whitelist_table
  WHERE whitelist_user_id = $1;
`, [id]);

/**
 * gets all whitelist commands
 * @param commandName the command name
 * @param guildId the guild's id
 * @param channelId the channel's id
 * @param userId the user's id.
 * @returns {Promise<*>}
 */
const getAllWhitelistsCommand = async (commandName, guildId, channelId, userId) => poolQuery(`
  SELECT $1 = ANY (whitelist::text[]) AS whitelisted
  FROM whitelist_table
  WHERE 
    whitelist_user_id = $2
    OR whitelist_user_id = $3 
    OR whitelist_user_id = $4;
`, [commandName, guildId, channelId, userId]);

// /**
//  * gets all whitelist commands
//  * @param guildId the guild's id
//  * @param channelId the channel's id
//  * @param userId the user's id.
//  * @returns {Promise<*>}
//  */
// const getAllWhitelist = async (guildId, channelId, userId) => poolQuery(`
//   SELECT whitelist
//   FROM whitelist_table
//   WHERE whitelist_user_id IN ($1, $2, $3);
// `, [guildId, channelId, userId]);

module.exports = {
  upsertWhitelist,
  getWhitelists,
  getAllWhitelistsCommand,
  // getAllWhitelist,
};
