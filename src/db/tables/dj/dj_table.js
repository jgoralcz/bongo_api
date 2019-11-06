const { poolQuery } = require('../../index');

/**
 * tests if the member is a DJ
 * @param guildID the guild's id
 * @param userID the user's id.
 * @returns {Promise<void>}
 */
const memberIsDJ = async (guildID, userID) => {
  const rows = await poolQuery(`
    SELECT NULL
    FROM dj_table
    WHERE dj_guild_id = $1 
      AND dj_user_id = $2;
  `, [guildID, userID]);
  return rows && rows.rowCount > 0;
};

/**
 * tests if the member is a DJ
 * @param guildID the guild's id
 * @param userID the user's id.
 * @returns {Promise<void>}
 */
const removeMemberAsDJ = async (guildID, userID) => poolQuery(`
  DELETE
  FROM dj_table
  WHERE dj_guild_id = $1 
    AND dj_user_id = $2;
`, [guildID, userID]);

/**
 * tests if the member is a DJ
 * @param giverID the person who gave the dj.
 * @param guildID the guild's id
 * @param userID the user's id.
 * @returns {Promise<void>}
 */
const addMemberAsDJ = async (giverID, guildID, userID) => poolQuery(`
  INSERT INTO dj_table (giver_user_id, giver_guild_id, giver_guild_user_id, dj_user_id, dj_guild_id, dj_guild_user_id)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (dj_user_id, dj_guild_id)
  DO NOTHING;
`, [giverID, guildID, `${guildID}-${giverID}`, userID, guildID, `${guildID}-${userID}`]);

/**
 * tests if any of the users are djs in this array.
 * @param djGuildUserIDs an array of guild user IDs.
 * @returns {Promise<void>}
 */
const checkMembersAreDJ = async (djGuildUserIDs) => {
  const rows = await poolQuery(`
    SELECT NULL
    FROM dj_table
    WHERE dj_guild_user_id IN (
        SELECT UNNEST($1::varchar[]) AS dj_guild_user_id
    );
  `, [djGuildUserIDs]);

  return rows && rows.rowCount > 0;
};

/**
 * tests if any of the users are djs in this array.
 * @param guildID an array of guild user IDs.
 * @param offset the page offset.
 * @param limit the page limit.
 * @returns {Promise<void>}
 */
const getDJMembersPagination = async (guildID, offset, limit) => poolQuery(`
  SELECT dj_user_id
  FROM dj_table
  WHERE dj_guild_id = $1
  OFFSET $2 LIMIT $3;
`, [guildID, offset, limit]);

/**
 * tests if any of the users are djs in this array.
 * @param guildID an array of guild user IDs.
 * @returns {Promise<void>}
 */
const getDJCount = async (guildID) => {
  const query = await poolQuery(`
      SELECT count(*) AS count
      FROM dj_table
      WHERE dj_guild_id = $1;
  `, [guildID]);

  if (query && query.rowCount > 0 && query.rows[0]) {
    return query.rows[0].count;
  }

  return 0;
};

module.exports = {
  memberIsDJ,
  removeMemberAsDJ,
  addMemberAsDJ,
  checkMembersAreDJ,
  getDJMembersPagination,
  getDJCount,
};
