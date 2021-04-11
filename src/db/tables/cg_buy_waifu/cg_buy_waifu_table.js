const { poolQuery } = require('../../index.js');

/**
 * gets the top 500 bought waifus of a server
 * @param offset the offset
 * @param limit the user's limit
 * @param guildID the guild's id
 * @returns {Promise<*>}
 */
const getTopBoughtWaifus = async (offset, limit, guildID) => poolQuery(`
  SELECT name, series, url, top_waifu, top.waifu_id, image_url, cg.user_id
  FROM (
    SELECT waifu_id, count(waifu_id) AS top_waifu
    FROM cg_buy_waifu_table cgcwt
    GROUP BY waifu_id
    ORDER BY top_waifu DESC
    LIMIT $2 OFFSET $1
  ) top
  JOIN waifu_schema.waifu_table wswt ON top.waifu_id = wswt.id
  LEFT JOIN cg_claim_waifu_table cg ON cg.waifu_id = top.waifu_id AND cg.guild_id = $3
  GROUP BY name, series, url, top_waifu, top.waifu_id, image_url, cg.user_id
  ORDER BY top_waifu DESC
  LIMIT $2;
`, [offset, limit, guildID]);

/**
 * gets the user's bought waifulist based on a range for better performance.
 * @param id the user's id.
 * @param offset the offset number.
 * @param limit the user's limit.
 * @returns {Promise<*>}
 */
const getBuyWaifuList = async (id, offset, limit) => poolQuery(`
  SELECT waifu_name AS name, favorite, note, t2.id AS waifu_id, series, image_url,
    count(*) OVER (PARTITION BY series) AS num, url,
    (
      SELECT count(*)
      FROM waifu_schema.waifu_table wt
      WHERE wt.series = t2.series
    )
  FROM public.cg_buy_waifu_table t1

  LEFT JOIN waifu_schema.waifu_table t2
  ON t1.waifu_id = t2.id

  LEFT JOIN user_waifu_notes t3
  ON t2.id = t3.waifu_id AND t1.user_id = t3.user_id

  WHERE t1.user_id = $1
  ORDER BY favorite DESC, series ASC, waifu_name ASC
  LIMIT $3 OFFSET $2;
`, [id, offset, limit]);

/**
 *
 * @param id the user's id.
 * @param offset the page offset.
 * @param limit the page limit.
 * @returns {Promise<Promise<*>|*>}
 */
const getBuyWaifuListAll = async (id, offset, limit) => poolQuery(`
  SELECT waifu_name AS name, favorite, waifu_id, url
  FROM cg_buy_waifu_table
  LEFT JOIN waifu_schema.waifu_table w ON waifu_id = w.id
  WHERE user_id = $1
  ORDER BY favorite DESC, waifu_name ASC
  LIMIT $3 OFFSET $2;
`, [id, offset, limit]);

/**
 * finds the bought waifu by name, has all the needed stuff in it.
 * @param id the user's id.
 * @param waifuName the waifu's name.
 * @returns {Promise<*>}
 */
const findBuyWaifuByIdJoinURL = async (id, waifuName) => poolQuery(`
  SELECT waifu_id, cgbwt.waifu_name AS name, wt.url, wt.series, cgbwt.favorite
  FROM (
    SELECT waifu_name, waifu_id, favorite
    FROM cg_buy_waifu_table
    WHERE user_id = $1 AND f_unaccent(waifu_name) ILIKE '%' || $2 || '%'
    ORDER BY
      CASE WHEN f_unaccent(waifu_name) ILIKE $2 || '%' THEN 0 ELSE 1 END, waifu_name
    LIMIT 20
  ) cgbwt
  LEFT JOIN waifu_schema.waifu_table wt ON cgbwt.waifu_id = wt.id;
`, [id, waifuName]);

/**
 * finds the bought waifu by name, has all the needed stuff in it.
 * @param id the user's id.
 * @param waifuName the waifu's name.
 * @param favorite whether to check for favorite.
 * @returns {Promise<*>}
 */
const findBuyWaifuByIdJoinURLFavorites = async (id, waifuName, favorite = true) => poolQuery(`
  SELECT waifu_id, cgbwt.waifu_name AS name, wt.url, wt.series, cgbwt.favorite
  FROM (
    SELECT waifu_name, waifu_id, favorite
    FROM cg_buy_waifu_table
    WHERE user_id = $1 AND f_unaccent(waifu_name) ILIKE '%' || $2 || '%' AND favorite = $3
    ORDER BY
      CASE WHEN f_unaccent(waifu_name) ILIKE $2 || '%' THEN 0 ELSE 1 END, waifu_name
    LIMIT 20
  ) cgbwt
  LEFT JOIN waifu_schema.waifu_table wt ON cgbwt.waifu_id = wt.id;
`, [id, waifuName, favorite]);

/**
 * only get unique waifus for people to buy.
 * @param id the user's id
 * @param nsfw whether it's a nsfw channel or not
 * @returns {Promise<*>}
 */
const buyUniqueWaifu = async (id, nsfw = false) => {
  if (nsfw) {
    return poolQuery(`
      SELECT name, id, series, image_url, url
      FROM waifu_schema.waifu_table
      WHERE id NOT IN (
        SELECT waifu_id as id
        FROM cg_buy_waifu_table
        WHERE user_id = $1 AND waifu_id IS NOT NULL
      )
      ORDER BY random()
      LIMIT 1;
    `, [id]);
  }
  return poolQuery(`
    SELECT name, id, series, image_url, url
    FROM waifu_schema.waifu_table
    WHERE id NOT IN (
      SELECT waifu_id as id
      FROM cg_buy_waifu_table
      WHERE user_id = $1 AND waifu_id IS NOT NULL
    ) AND (nsfw = FALSE OR nsfw IS NULL)
    ORDER BY random()
    LIMIT 1;
  `, [id]);
};

/**
 * add favorite waifu by id.
 * @param userID the user's id
 * @param id the id to add.
 * @returns {Promise<*>}
 */
const addFavoriteBuyWaifuID = async (userID, id) => poolQuery(`
  UPDATE cg_buy_waifu_table
  SET favorite = TRUE
  WHERE 
    user_id = $1 
    AND waifu_id = $2;
`, [userID, id]);

/**
 * removes the user's favorite bought waifu by id.
 * @param userID the user's id.
 * @param waifuID the waifu id
 * @returns {Promise<*>}
 */
const removeFavoriteBuyWaifuID = async (userID, waifuID) => poolQuery(`
  UPDATE cg_buy_waifu_table
  SET favorite = FALSE
  WHERE 
    user_id = $1 
    AND waifu_id = $2;
`, [userID, waifuID]);

/**
 * removes all but favorites from the user's buywaifu list
 * @param userID the user's ID
 * @returns {Promise<Promise<*>|*>}
 */
const removeAllButFavoriteBuyWaifu = async (userID) => poolQuery(`
  DELETE
  FROM cg_buy_waifu_table
  WHERE 
    user_id = $1 
    AND favorite = FALSE
  RETURNING *;
`, [userID]);

/**
 * buys a waifu
 * @param userID the user's ID.
 * @param guildID the guild ID.
 * @param waifuName the waifu's name.
 * @param waifuID the waifu's ID.
 * @returns {Promise<*>}
 */
const buyWaifu = async (userID, guildID, waifuName, waifuID) => {
  if (waifuID) {
    return poolQuery(`
      INSERT INTO cg_buy_waifu_table(user_guild_id, user_id, guild_id, waifu_name, waifu_id)
      VALUES($1, $2, $3, $4, $5);
    `, [`${guildID}-${userID}`, userID, guildID, waifuName, waifuID]);
  }
  return poolQuery(`
    INSERT INTO cg_buy_waifu_table(user_guild_id, user_id, guild_id, waifu_name)
    VALUES($1, $2, $3, $4);
  `, [`${guildID}-${userID}`, userID, guildID, waifuName]);
};

/**
 * removes a bought waifu by the name and series
 * @param userID the user's id
 * @param waifuName the waifu name
 * @param waifuID the waifu's ID
 * @returns {Promise<*>}
 */
const removeBuyWaifu = async (userID, waifuName, waifuID) => poolQuery(`
  DELETE FROM cg_buy_waifu_table
  WHERE id IN (SELECT id FROM cg_buy_waifu_table WHERE user_id = $1 AND
      ((waifu_id IS NOT NULL AND waifu_id = $3) OR (f_unaccent(waifu_name) ILIKE $2 || '%')) LIMIT 1);
`, [userID, waifuName, waifuID]);

/**
 * gets the top buy waifus.
 * @returns {Promise<Promise<*>|*>}
 */
const getTopBuyWaifu = async () => poolQuery(`
  SELECT *
  FROM mv_top_buy_waifu;
`, []);

/**
 * gets the top server bought waifus based off of guild ID
 * @param guildID the guild id.
 * @returns {Promise<Promise<*>|*>}
 */
const getTopServerBuyWaifu = async (guildID) => poolQuery(`
  SELECT user_id AS "userId", count(*) AS top
  FROM cg_buy_waifu_table
  WHERE guild_id = $1
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;
`, [guildID]);

/**
 * gets the buy waifu list sum for a user.
 * @param userID the user's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getBuyWaifuListSum = async (userID) => poolQuery(`
  SELECT count(*) AS top
  FROM cg_buy_waifu_table
  WHERE user_id = $1;
`, [userID]);

module.exports = {
  getTopBoughtWaifus,
  getBuyWaifuList,
  getBuyWaifuListAll,
  findBuyWaifuByIdJoinURL,
  findBuyWaifuByIdJoinURLFavorites,
  buyUniqueWaifu,
  addFavoriteBuyWaifuID,
  removeFavoriteBuyWaifuID,
  removeAllButFavoriteBuyWaifu,
  buyWaifu,
  removeBuyWaifu,
  getTopBuyWaifu,
  getTopServerBuyWaifu,
  getBuyWaifuListSum,
};

// const getAllWaifusWithoutID = async () => {
//     return await client.query(`
//       SELECT *
//       FROM cg_buy_waifu_table
//       WHERE waifu_id IS NULL;
//     `, [])
// };

// const updateWaifuWithoutID = async (id, waifu_id) => {
//   return await client.query(`
//     UPDATE cg_buy_waifu_table
//     SET waifu_id = $2
//     WHERE id = $1;
//   `, [id, waifu_id])
// };

// const getCountFromSeries = async () => {
//   return await client.query(`
//                 SELECT count(*), series
//                 FROM waifu_schema.waifu_table
//                 GROUP BY SERIES;
//             `, []);
// };

// /**
//  * gets the top 500 claimed waifus of a server
//  * @param userID the guild's id to get the user who owns it
//  * @param offset the offset
//  * @returns {Promise<*>}
//  */
// const getTopBoughtWaifusGuild = async (userID, offset) => poolQuery(`
//   SELECT top.waifu_id, user_id
//   FROM (
//     SELECT waifu_id, count(waifu_id) AS top_waifu
//     FROM cg_buy_waifu_table cgcwt
//     GROUP BY waifu_id
//     ORDER BY top_waifu DESC
//     LIMIT 15 OFFSET $2
//   ) top
//   JOIN waifu_schema.waifu_table wswt ON top.waifu_id = wswt.id
//   LEFT JOIN cg_buy_waifu_table cg ON cg.waifu_id = top.waifu_id
//   WHERE user_id = $1;
// `, [userID, offset]);

// /**
//  * remove a favorite waifu by id.
//  * @param userID the user's id.
//  * @param name the buywaifu name to remove
//  * @returns {Promise<Promise<*>|*>}
//  */
// const removeFavoriteBuyWaifu = async (userID, name) => poolQuery(`
//   UPDATE cg_buy_waifu_table
//   SET favorite = FALSE
//   WHERE
//     user_id = $1
//     AND waifu_name ILIKE $2;
// `, [userID, name]);
