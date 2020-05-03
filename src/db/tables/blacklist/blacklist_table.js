const { poolQuery } = require('../../index.js');

/**
 * upserts the blacklisted command
 * @param id the user's id.
 * @param type the user type.
 * @param blacklistArray the blacklisted array.
 * @returns {Promise<*>}
 */
const upsertBlacklist = async (id, type, blacklistArray) => poolQuery(`
  INSERT INTO "blacklistTable" (blacklist_user_id, type, blacklisted) VALUES ($1, $2, $3)
  ON CONFLICT(blacklist_user_id) DO
  UPDATE
    SET "blacklisted" = $3 WHERE "blacklistTable".blacklist_user_id = $1;
`, [id, type, blacklistArray]);

/**
 * gets the blacklists info
 * @param id the user's id.
 * @returns {Promise<*>}
 */
const getBlacklists = async id => poolQuery(`
  SELECT * FROM
  "blacklistTable"
  WHERE blacklist_user_id = $1;
`, [id]);

/**
 * gets all blacklist commands
 * @param commandName the command name
 * @param guildId the guild's id
 * @param channelId the channel's id
 * @param userId the user's id.
 * @returns {Promise<*>}
 */
const getAllBlacklistsCommand = async (commandName, guildId, channelId, userId) => poolQuery(`
  SELECT $1 = ANY (blacklisted::text[]) AS blacklisted
  FROM "blacklistTable"
  WHERE 
    blacklist_user_id = $2
    OR blacklist_user_id = $3 
    OR blacklist_user_id = $4;
`, [commandName, guildId, channelId, userId]);

/**
 * gets all blacklist commands
 * @param guildId the guild's id
 * @param channelId the channel's id
 * @param userId the user's id.
 * @param roleId the role id (not used).
 * @returns {Promise<*>}
 */
const getAllBlacklists = async (guildId, channelId, userId, roleId) => poolQuery(`
  SELECT "blacklisted"
  FROM "blacklistTable"
  WHERE blacklist_user_id IN ($1, $2, $3, $4);
`, [guildId, channelId, userId, roleId]);

module.exports = {
  upsertBlacklist,
  getBlacklists,
  getAllBlacklistsCommand,
  getAllBlacklists,
};
