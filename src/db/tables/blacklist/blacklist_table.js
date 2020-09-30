const { poolQuery } = require('../../index.js');

const upsertBlacklist = async (id, type, blacklistArray) => poolQuery(`
  INSERT INTO "blacklistTable" (blacklist_user_id, type, blacklisted) VALUES ($1, $2, $3)
  ON CONFLICT(blacklist_user_id) DO UPDATE
    SET "blacklisted" = $3 WHERE "blacklistTable".blacklist_user_id = $1;
`, [id, type, blacklistArray]);

const getBlacklists = async (id) => poolQuery(`
  SELECT * FROM
  "blacklistTable"
  WHERE blacklist_user_id = $1;
`, [id]);

const getAllBlacklists = async (guildId, channelId, userId, roleId) => poolQuery(`
  SELECT "blacklisted"
  FROM "blacklistTable"
  WHERE blacklist_user_id IN ($1, $2, $3, $4);
`, [guildId, channelId, userId, roleId]);

const getCommandBlacklists = async (userID, guildID, channelID, commandName) => poolQuery(`
  SELECT TRUE
  FROM "blacklistTable"
  WHERE blacklist_user_id IN ($1, $2, $3, null)
    AND $4 = ANY (blacklisted::text[])
    AND NOT EXISTS (
      SELECT 1
      
      FROM whitelist_table
      WHERE whitelist_user_id = $3
      AND $4 = ANY (whitelist::text[])
    );
`, [userID, guildID, channelID, commandName]);

module.exports = {
  upsertBlacklist,
  getBlacklists,
  getAllBlacklists,
  getCommandBlacklists,
};
