const { poolQuery } = require('../../index');

const insertGuildRolled = async (guildID, characterID) => poolQuery(`
  INSERT INTO guild_rolled (guild_id, character_id)
  VALUES ($1, $2);
`, [guildID, characterID]);

const deleteGuildRolledMinute = async () => poolQuery(`
  DELETE
  FROM guild_rolled
  WHERE date_rolled < NOW() - INTERVAL '10 minutes';
`, []);

module.exports = {
  insertGuildRolled,
  deleteGuildRolledMinute,
};
