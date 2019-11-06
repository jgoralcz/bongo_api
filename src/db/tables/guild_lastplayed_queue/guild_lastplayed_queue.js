const { poolQuery } = require('../../index');

/**
 * gets all the contents of the guild.
 * @param guildID the guild's ID.
 * @param limit the number to fetch
 * @param offset the requested offset (pagination).
 * @returns {Promise<*>}
 */
const getLastPlayedByDatePage = async (guildID, limit, offset = 0) => poolQuery(`
  SELECT track, date_added
  FROM guild_lastplayed_queue
  WHERE guild_id = $1
  ORDER BY date_added DESC
  LIMIT $2 OFFSET $3;
`, [guildID, limit, offset]);

/**
 * gets the count of the last played.
 * @param guildID the guild's ID.
 * @returns {Promise<*>}
 */
const getLastPlayedLength = async (guildID) => {
  const query = await poolQuery(`
    SELECT count(*) as length
    FROM guild_lastplayed_queue
    WHERE guild_id = $1;
  `, [guildID]);

  if (query && query.rowCount > 0 && query.rows[0] && query.rows[0].length != null) {
    return query.rows[0].length;
  }
  return 0;
};

/**
 * sets up a basic guild.
 * @param guildID the guild's ID.
 * @param JSONTrack the json track to add.
 * @returns {Promise<*>}
 */
const insertLastPlayed = async (guildID, JSONTrack) => poolQuery(`
  INSERT INTO guild_lastplayed_queue(guild_id, track)
  VALUES ($1, $2);
`, [guildID, JSONTrack]);


module.exports = {
  getLastPlayedByDatePage,
  insertLastPlayed,
  getLastPlayedLength,
};
