const client = require('./index.js');

/**
 * sets the guild prefix and whether it is enabled for all or not
 * @param guildID the guild's id
 * @param guildJSON the guild prefix JSON
 * @returns {Promise<void>}
 */
const setRedisGuildPrefix = async (guildID, guildJSON) => {
  await client.hmset(guildID, guildJSON);
};

/**
 * gets the guild info if found
 * @param guildID the guild's ID
 * @returns {Promise<void>}
 */
const getRedisGuildPrefix = async guildID => client.hgetall(guildID);

/**
 * sets the user's id
 * @param userID the user's ID
 * @param prefix the user's prefix
 * @returns {Promise<void>}
 */
const setRedisUserPrefix = async (userID, prefix) => {
  await client.set(userID, prefix);
};

/**
 * gets the user's id
 * @param userID the user's ID
 * @returns {Promise<void>}
 */
const getRedisUserPrefix = async userID => client.get(userID);

module.exports = {
  setRedisGuildPrefix,
  getRedisGuildPrefix,
  setRedisUserPrefix,
  getRedisUserPrefix,
};
