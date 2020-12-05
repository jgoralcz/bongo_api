const { poolQuery } = require('../../index');

const getBotGuildsByGuildID = async (guildID) => poolQuery(`
  SELECT bot_id as id
  FROM bot_guilds
  WHERE $1 = ANY (guilds)
  ORDER BY array_length(guilds, 1)
  LIMIT 1;
`, [guildID]);

const updateBotGuilds = async (botID, guilds) => poolQuery(`
  INSERT INTO bot_guilds(bot_id, guilds)
  VALUES ($1, $2) 
  ON CONFLICT (bot_id) DO
    UPDATE
    SET guilds = $2;
`, [botID, guilds]);

module.exports = {
  updateBotGuilds,
  getBotGuildsByGuildID,
};
