const client = require('./index.js');

const setRedisGuildPrefix = async (guildID, guildJSON) => client.hmset(guildID, guildJSON);

const getRedisGuildPrefix = async (guildID) => client.hgetall(guildID);

const setRedisUserPrefix = async (userID, prefix) => client.set(userID, prefix);

const getRedisUserPrefix = async (userID) => client.get(userID);

module.exports = {
  setRedisGuildPrefix,
  getRedisGuildPrefix,
  setRedisUserPrefix,
  getRedisUserPrefix,
};
