const { poolQuery } = require('../../index');

/**
 * inserts the command used, so that we can later use it for stats.
 * @param guildID the guild's id.
 * @param userID the user's id.
 * @param channelID the channels id.
 * @param shardID the shard's id.
 * @param commandName the command's name
 * @returns {Promise<Promise<*>|*>}
 */
const insertCommandUsed = async (guildID, userID, channelID, shardID, commandName) => poolQuery(`
  INSERT INTO command_usage (guild_id, user_id, channel_id, shard_id, command_name)
  VALUES ($1, $2, $3, $4, $5);
`, [guildID, userID, channelID, shardID, commandName]);

module.exports = {
  insertCommandUsed,
};
