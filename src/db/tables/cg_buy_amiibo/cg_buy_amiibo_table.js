const { poolQuery } = require('../../index.js');

/**
 * removes all but their favorite amiibos
 * @param id the user's id
 * @returns {Promise<*>}
 */
const removeAllButFavoriteBuyAmiibo = async id => poolQuery(`
  DELETE
  FROM cg_buy_amiibo_table
  WHERE user_id = $1 AND favorite=FALSE
  RETURNING *;
`, [id]);


/**
 * removes a favorite bought amiibo
 * @param id the user's id
 * @param amiiboID the amiibo's id
 * @returns {Promise<*>}
 */
const removeFavoriteBuyAmiibo = async (id, amiiboID) => poolQuery(`
  UPDATE cg_buy_amiibo_table
  SET favorite = FALSE
  WHERE user_id = $1
    AND amiibo_id = $2
    AND favorite = TRUE;
`, [id, amiiboID]);

/**
 * favorites a bought amiibo
 * @param id the user's id
 * @param amiiboID the amiibo's id
 * @returns {Promise<*>}
 */
const addFavoriteBuyAmiibo = async (id, amiiboID) => poolQuery(`
  UPDATE cg_buy_amiibo_table
  SET favorite = TRUE
  WHERE user_id = $1 AND amiibo_id = $2;
`, [id, amiiboID]);

/**
 * gets the sum of amiibo lists
 * @param userID the user's id
 * @returns {Promise<*>}
 */
const getAmiiboListSum = async userID => poolQuery(`
  SELECT count(amiibo_name) AS top
  FROM cg_buy_amiibo_table
  WHERE user_id = $1;
`, [userID]);

/**
 * gets the top server amiibo
 * @param guildID the guild's id
 * @returns {Promise<*>}
 */
const getTopServerAmiibo = async guildID => poolQuery(`
  SELECT user_id AS "userId", count(amiibo_name) AS top
  FROM cg_buy_amiibo_table
  WHERE guild_id = $1
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;
`, [guildID]);

/**
 * gets the top 20 amiibos
 * @returns {Promise<*>}
 */
const getTopAmiibo = async () => poolQuery(`
  SELECT *
  FROM mv_top_buy_amiibo;
`, []);

/**
 * removes the amiibo based off the amiibo name
 * @param id the user's id
 * @param amiiboID the amiibo's ID (limited to 1)
 * @returns {Promise<*>}
 */
const removeAmiibo = async (id, amiiboID) => poolQuery(`
  DELETE FROM cg_buy_amiibo_table
  WHERE id IN (
    SELECT id FROM cg_buy_amiibo_table WHERE user_id = $1
    AND amiibo_id IS NOT NULL
    AND amiibo_id = $2
    LIMIT 1
  );
`, [id, amiiboID]);

/**
 * inserts the amiibo into their database.
 * Checks whether the amiibo has an ID or not.
 * @param userID the user's id.
 * @param guildID the guild's id.
 * @param amiiboName the amiibo's name.
 * @param amiiboID the amiibo's ID.
 * @returns {Promise<*>}
 */
const buyAmiibo = async (userID, guildID, amiiboName, amiiboID) => {
  if (amiiboID) {
    return poolQuery(`
    INSERT INTO cg_buy_amiibo_table(user_guild_id, user_id, guild_id, amiibo_name, amiibo_id)
    VALUES($1, $2, $3, $4, $5);
  `, [`${guildID}-${userID}`, userID, guildID, amiiboName, amiiboID]);
  }
  return poolQuery(`
    INSERT INTO cg_buy_amiibo_table(user_guild_id, user_id, guild_id, amiibo_name)
    VALUES($1, $2, $3, $4);
  `, [`${guildID}-${userID}`, userID, guildID, amiiboName]);
};

/**
 * gets the amiibo by id
 * @param id the user's id
 * @param amiiboName the amiibo's name
 * @returns {Promise<*>}
 */
const findAmiiboByID = async (id, amiiboName) => poolQuery(`
  SELECT amiibo_id, amiibo_name, image_url, game_series, favorite
  FROM (
    SELECT amiibo_id, amiibo_name, favorite
    FROM cg_buy_amiibo_table
    WHERE user_id = $1 AND amiibo_name ILIKE '%' || $2 || '%'
    LIMIT 20
  ) cgat
  JOIN amiibo.amiibo_table at ON at.id = cgat.amiibo_id;
`, [id, amiiboName]);

/**
 * gets the amiibo by id and filters by favorites.
 * @param id the user's id
 * @param amiiboName the amiibo's name
 * @returns {Promise<*>}
 */
const findAmiiboByIDFavorites = async (id, amiiboName) => poolQuery(`
  SELECT amiibo_id, amiibo_name, image_url, game_series, favorite
  FROM (
    SELECT amiibo_id, amiibo_name, favorite
    FROM cg_buy_amiibo_table
    WHERE user_id = $1 AND amiibo_name ILIKE '%' || $2 || '%' AND favorite = TRUE
    ORDER BY
      CASE WHEN amiibo_name ILIKE $2 || '%' THEN 0 ELSE 1 END, amiibo_name
    LIMIT 20
  ) cgat
  JOIN amiibo.amiibo_table at ON at.id = cgat.amiibo_id;
`, [id, amiiboName]);

/**
 * gets their amiibo list and how many they have
 * @param id the user's id
 * @returns {Promise<*>}
 */
const getAmiiboList = async id => poolQuery(`
  SELECT amiibo_name AS name, favorite, note, t2.id AS amiibo_id, game_series AS series, image_url,
    count(*) OVER (PARTITION BY game_series) AS num,
    (
        SELECT count(*)
        FROM amiibo.amiibo_table
        WHERE amiibo.amiibo_table.game_series = t2.game_series
    )
  FROM public.cg_buy_amiibo_table t1

  LEFT JOIN amiibo.amiibo_table t2
  ON t1.amiibo_id = t2.id

  LEFT JOIN user_amiibo_notes t3
  ON t2.id = t3.amiibo_id AND t1.user_id = t3.user_id

  WHERE t1.user_id = $1
  ORDER BY favorite DESC, game_series DESC, amiibo_name ASC;
`, [id]);

module.exports = {
  getAmiiboList,
  findAmiiboByID,
  findAmiiboByIDFavorites,
  buyAmiibo,
  removeAmiibo,
  getTopAmiibo,
  getTopServerAmiibo,
  getAmiiboListSum,
  addFavoriteBuyAmiibo,
  removeFavoriteBuyAmiibo,
  removeAllButFavoriteBuyAmiibo,
};
