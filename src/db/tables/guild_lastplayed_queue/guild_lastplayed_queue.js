const { poolQuery } = require('../../index');

const getLastPlayedByDatePage = async (guildID, limit, offset = 0) => poolQuery(`
  SELECT track, date_added
  FROM guild_lastplayed_queue
  WHERE guild_id = $1
  ORDER BY date_added DESC
  LIMIT $2 OFFSET $3;
`, [guildID, limit, offset]);

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

const insertLastPlayed = async (guildID, JSONTrack) => poolQuery(`
  INSERT INTO guild_lastplayed_queue(guild_id, track)
  VALUES ($1, $2);
`, [guildID, JSONTrack]);

const clearLastPlayed = async () => poolQuery(`
  DELETE FROM guild_lastplayed_queue
  WHERE date_added < NOW() - INTERVAL '15 days';
`, []);

module.exports = {
  getLastPlayedByDatePage,
  insertLastPlayed,
  getLastPlayedLength,
  clearLastPlayed,
};
