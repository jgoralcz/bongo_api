const { poolQuery } = require('../../index.js');

const getRandomCustomWaifuOwnerNotClaimed = async (userID, guildId, nsfw) => {
  if (nsfw) {
    return poolQuery(`
      SELECT name, series, t2.user_id AS "ownerID", url, image_url, t1.id, date_added AS date
      FROM (
        SELECT *
        FROM guild_custom_waifus
        WHERE guild_id = $1 AND id NOT IN (
          SELECT waifu_id as id
          FROM cg_custom_waifu_table
          WHERE guild_id = $1 AND waifu_id IS NOT NULL
        )
      ORDER BY random()
      LIMIT 1
      ) t1
      LEFT JOIN cg_custom_waifu_table t2 on t2.waifu_id = t1.id AND t2.guild_id = $1;
    `, [guildId]);
  }
  return poolQuery(`
    SELECT name, series, t2.user_id AS "ownerID", url, image_url, t1.id, date_added AS date
    FROM (
      SELECT *
      FROM guild_custom_waifus
      WHERE guild_id = $1 AND is_nsfw = false AND id NOT IN (
        SELECT waifu_id as id
        FROM cg_custom_waifu_table
        WHERE guild_id = $1 AND waifu_id IS NOT NULL
      )
      ORDER BY random()
      LIMIT 1
    ) t1
    LEFT JOIN cg_custom_waifu_table t2 on t2.waifu_id = t1.id AND t2.guild_id = $1;
  `, [guildId]);
};

/**
 * get random, and join the data, even if someone hasn't claimed.
 * @param userID the user's id.
 * @param guildId the guild's id.
 * @param nsfw whether the channel is nsfw or not
 * @returns {Promise<*>}
 */
const getRandomCustomWaifuOwnerClaimed = async (userID, guildId, nsfw) => {
  if (nsfw) {
    return poolQuery(`
      SELECT name, series, t2.user_id AS "ownerID", url, image_url, t1.id, date_added AS date
      FROM (
        SELECT *
        FROM guild_custom_waifus
        WHERE guild_id = $1 AND id IN (
          SELECT waifu_id as id
          FROM cg_custom_waifu_table
          WHERE guild_id = $1 AND waifu_id IS NOT NULL
        )
        ORDER BY random()
        LIMIT 1
      ) t1
      LEFT JOIN cg_custom_waifu_table t2 on t2.waifu_id = t1.id AND t2.guild_id = $1;
    `, [guildId]);
  }

  return poolQuery(`
    SELECT name, series, image_url, t1.id, url, date_added AS date, t2.user_id AS "ownerID"
    FROM (
      SELECT *
      FROM guild_custom_waifus
      WHERE guild_id = $1 AND is_nsfw = FALSE AND id IN (
        SELECT waifu_id as id
        FROM cg_custom_waifu_table
        WHERE guild_id = $1 AND waifu_id IS NOT NULL
      )
      ORDER BY random()
      LIMIT 1
    ) t1
    LEFT JOIN cg_custom_waifu_table t2 on t2.waifu_id = t1.id AND t2.guild_id = $1;
  `, [guildId]);
};

/**
 * gets the unique members from the guild who have claimed a custom.
 * @param guildID the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getUniqueGuildMembersCustom = async guildID => poolQuery(`
  SELECT DISTINCT user_id
  FROM cg_custom_waifu_table
  WHERE guild_id = $1;
`, [guildID]);

/**
 * gets specific claim waifu from the guild.
 * @param waifuID the waifu's id
 * @param guildID the guild's id
 * @returns {Promise<*>}
 */
const getSpecificCustomWaifuOwner = async (waifuID, guildID) => poolQuery(`
  SELECT user_id, date
  FROM cg_custom_waifu_table
  WHERE waifu_id = $1 AND guild_id = $2
  ORDER BY date ASC;
`, [waifuID, guildID]);

/**
 * finds the bought waifu by name, has all the needed stuff in it.
 * @param userID the user's ID
 * @param guildID the guild's id.
 * @param waifuName the waifu's name to search
 * @returns {Promise<*>}
 */
const findCustomWaifuSearchName = async (userID, guildID, waifuName) => poolQuery(`
  SELECT waifu_id, wt.name, wt.series, wt.url, favorite, wt.image_url
  FROM (
    SELECT waifu_id, favorite
    FROM cg_custom_waifu_table
    WHERE user_id = $1 AND guild_id = $2
  ) cgcwt
  JOIN guild_custom_waifus wt ON cgcwt.waifu_id = wt.id
  WHERE wt.name ILIKE '%' || $3 || '%'
  ORDER BY
    CASE WHEN wt.name ILIKE $3 || '%' THEN 0 ELSE 1 END, wt.name
  LIMIT 20;
`, [userID, guildID, waifuName]);


/**
 * finds the bought waifu by name, has all the needed stuff in it.
 * @param guildID the guild's id.
 * @param waifuName the waifu's ID.
 * @returns {Promise<*>}
 */
const findCustomClaimWaifuByName = async (guildID, waifuName) => poolQuery(`
  SELECT waifu_id, gcw.name, gcw.series, gcw.url, gcw.image_url, cgcwt.user_id
  FROM (
    SELECT waifu_id, user_id
    FROM cg_custom_waifu_table
    WHERE guild_id = $1
  ) cgcwt
  JOIN guild_custom_waifus gcw ON cgcwt.waifu_id = gcw.id
  WHERE gcw.name ILIKE '%' || $2 || '%'
  LIMIT 20;
`, [guildID, waifuName]);

/**
 * finds the bought waifu by name, has all the needed stuff in it.
 * @param userID the user's ID
 * @param guildID the guild's id.
 * @param waifuName the waifu's name to search
 * @returns {Promise<*>}
 */
const findCustomWaifuSearchNameFavorites = async (userID, guildID, waifuName, favorite = false) => poolQuery(`
  SELECT waifu_id, wt.name, wt.series, wt.url, favorite, wt.image_url
  FROM (
    SELECT waifu_id, favorite
    FROM cg_custom_waifu_table
    WHERE user_id = $1 AND guild_id = $2 AND favorite = $4
  ) cgcwt
  LEFT JOIN guild_custom_waifus wt ON cgcwt.waifu_id = wt.id
  WHERE wt.name ILIKE '%' || $3 || '%'
  ORDER BY
    CASE WHEN wt.name ILIKE $3 || '%' THEN 0 ELSE 1 END, wt.name
  LIMIT 20;
`, [userID, guildID, waifuName, favorite]);


/**
 * remove the claimed waifu
 * @param userID the user's id
 * @param guildID the guild's id
 * @param waifuID the waifu's ID.
 * @returns {Promise<*>}
 */
const removeCustomWaifu = async (userID, guildID, waifuID) => poolQuery(`
  DELETE 
  FROM cg_custom_waifu_table
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, waifuID]);

const claimClientCustomWaifuID = async (userID, guildID, waifuID, date) => poolQuery(`
  INSERT INTO cg_custom_waifu_table (guild_user_id, guild_id, user_id, waifu_id, date)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`, [`${guildID}-${userID}`, guildID, userID, waifuID, date]);

/**
 * remove all but favorite claim waifus.
 * @param userId the user's id.
 * @param guildId the guild's id.
 * @returns {Promise<*>}
 */
const removeAllButFavoriteCustomWaifu = async (userId, guildId) => poolQuery(`
  DELETE
  FROM cg_custom_waifu_table
  WHERE user_id = $1 AND guild_id = $2 AND favorite = FALSE
  RETURNING *;
`, [userId, guildId]);

/**
 * gets the sum of the waifu list for a user in a guild.
 * @param userId the user's id.
 * @param guildId the guild's id
 * @returns {Promise<*>}
 */
const getCustomWaifuListSum = async (userId, guildId) => poolQuery(`
  SELECT count(*) AS top
  FROM cg_custom_waifu_table
  WHERE user_id = $1 AND guild_id = $2;
`, [userId, guildId]);

/**
 * get the claimed waifu list and format it special.
 * @param id the user's ID number
 * @param offset the offset to get
 * @param limit the limit to get
 * @param guildId the guild ID number
 * @returns {Promise<*>}
 */
const getCustomWaifuList = async (id, offset, limit, guildId) => poolQuery(`
  SELECT name, favorite, url, t2.id AS waifu_id, series, image_url, 
    count(*) OVER (PARTITION BY series) AS num,
    (
      SELECT count(*)
      FROM guild_custom_waifus gcw
      WHERE gcw.series = t2.series
    )
  FROM cg_custom_waifu_table t1
  
  JOIN guild_custom_waifus t2
  ON t1.waifu_id = t2.id
  
  WHERE t1.user_id = $1 AND t1.guild_id = $4
  ORDER BY favorite DESC, series ASC, name ASC
  LIMIT $3 OFFSET $2;
`, [id, offset, limit, guildId]);

/**
 * add favorite waifu by id.
 * @param userID the user's id
 * @param guildID the guild's id
 * @param id the waifu id to add.
 * @returns {Promise<*>}
 */
const addFavoriteCustomWaifuID = async (userID, guildID, id) => poolQuery(`
  UPDATE cg_custom_waifu_table
  SET favorite = TRUE
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, id]);

/**
 * removed favorite custom waifus.
 * @param userID the user's id
 * @param guildID the guild's id
 * @param waifuID the waifu's id
 * @returns {Promise<*>}
 */
const removeFavoriteCustomWaifuID = async (userID, guildID, waifuID) => poolQuery(`
  UPDATE cg_custom_waifu_table
  SET favorite = FALSE
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, waifuID]);

/**
 * removes all waifus (admin used this)
 * @param userId the user's id
 * @param guildId the guild's id the user is in.
 * @returns {Promise<*>}
 */
const removeAllCustomWaifus = async (userId, guildId) => poolQuery(`
  DELETE
  FROM cg_custom_waifu_table
  WHERE user_id = $1 AND guild_id = $2;
`, [userId, guildId]);

const removeCustomWaifusLeavers = async (guildID, userIDArray) => {
  const q = await poolQuery(`
    WITH deleted AS (
      DELETE
        FROM cg_custom_waifu_table
        WHERE guild_id = $1 AND user_id IN (
          SELECT UNNEST($2::varchar[]) AS user_id
        )
        RETURNING *
    ) SELECT count(*) FROM deleted;
  `, [guildID, userIDArray]);
  if (q && q.rowCount > 0 && q.rows[0] && q.rows[0].count) return parseInt(q.rows[0].count, 10);
  return 0;
};

/**
 * removes half of the random waifus from a server
 * @param {BigInteger} guildID the guild's ID.
 * @param {BigInteger} limit the guild's limit.
 */
const removeCustomWaifusRandomHalf = async (guildID, limit) => poolQuery(`
  DELETE
  FROM cg_claim_waifu_table
  WHERE guild_id = $1 AND id IN (
    SELECT id
    FROM cg_claim_waifu_table
    WHERE guild_id = $1
    ORDER BY random()
    LIMIT $2
  );
`, [guildID, limit]);

const removeCustomWaifusAll = async guildID => poolQuery(`
  DELETE
  FROM cg_custom_waifu_table
  WHERE guild_id = $1;
  `, [guildID]);

const getCustomWaifuServerCount = async (guildID) => {
  const query = await poolQuery(`
    SELECT count(*)
    FROM cg_custom_waifu_table
    WHERE guild_id = $1;
  `, [guildID]);
  if (query && query.rows && query.rowCount > 0 && query.rows[0] && query.rows[0].count) {
    return query.rows[0].count;
  }
  return 0;
};

const removeAllGuildCustomsCharactersByID = async (guildID, characterID) => poolQuery(`
  DELETE
  FROM cg_custom_waifu_table
  WHERE guild_id = $1 AND waifu_id = $2
  RETURNING *;
`, [guildID, characterID]);

module.exports = {
  getRandomCustomWaifuOwnerNotClaimed,
  getRandomCustomWaifuOwnerClaimed,
  claimClientCustomWaifuID,
  getSpecificCustomWaifuOwner,
  findCustomWaifuSearchName,
  removeCustomWaifu,
  removeAllButFavoriteCustomWaifu,
  getCustomWaifuListSum,
  getCustomWaifuList,
  addFavoriteCustomWaifuID,
  removeFavoriteCustomWaifuID,
  findCustomWaifuSearchNameFavorites,
  removeAllCustomWaifus,
  findCustomClaimWaifuByName,
  getUniqueGuildMembersCustom,
  removeCustomWaifusLeavers,
  removeCustomWaifusRandomHalf,
  getCustomWaifuServerCount,
  removeCustomWaifusAll,
  removeAllGuildCustomsCharactersByID,
};
