const { poolQuery } = require('../../index.js');

const getTopBoughtCharacters = async (offset, limit, guildID, userID, useDiscordImage) => poolQuery(`
  SELECT name, series, url, waifu_id, user_id, count, position, (
    SELECT
      CASE
      WHEN ct.cropped_images = FALSE OR image_url_clean IS NULL THEN
        image_url
      WHEN ct.cropped_images = TRUE AND ct.cropped_images = $5 AND image_url_clean_discord IS NOT NULL THEN
        image_url_clean_discord
      ELSE
        image_url_clean
      END
    FROM (
      SELECT cropped_images
      FROM "clientsTable"
      WHERE "userId" = $4
    ) ct
  ) AS image_url
  FROM (
    SELECT wswt.name, wsst.name AS series, wswt.url, top.waifu_id,
      COALESCE(json_object_agg(cg.date, cg.user_id ORDER BY cg.date) FILTER (WHERE cg.user_id IS NOT NULL), '[]') AS user_id,
      wswt.image_url, wswt.image_url_clean, wswt.image_url_clean_discord,
      top.count, top.position
    FROM (
      SELECT waifu_id, count, position
      FROM mv_rank_buy_waifu
      LIMIT $2 OFFSET $1
    ) top
    JOIN waifu_schema.waifu_table wswt ON top.waifu_id = wswt.id
    JOIN waifu_schema.series_table wsst ON wsst.id = wswt.series_id
    LEFT JOIN cg_claim_waifu_table cg ON cg.waifu_id = top.waifu_id AND cg.guild_id = $3
    GROUP BY wswt.name, wsst.name, wswt.url, top.waifu_id, wswt.image_url,
      wswt.image_url_clean, wswt.image_url_clean_discord, top.count, top.position
    ORDER BY top.position
  ) t;
`, [offset, limit, guildID, userID, useDiscordImage]);

const updateFavoriteBuyWaifuBySeriesID = async (userID, seriesID, favorite = false) => poolQuery(`
  UPDATE cg_buy_waifu_table
  SET favorite = $3
  WHERE user_id = $1
    AND waifu_id IN (
      SELECT id
      FROM waifu_schema.waifu_table
      WHERE series_id = $2
    );
`, [userID, seriesID, favorite]);

const updateFavoriteBuyCharacter = async (userID, characterID, favorite = false) => poolQuery(`
  UPDATE cg_buy_waifu_table
  SET favorite = $3
  WHERE user_id = $1  AND waifu_id = $2;
`, [userID, characterID, favorite]);

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

const getUniqueWaifu = async (userID, nsfw = false, useDiscordImage = false, limit = 1) => poolQuery(`
  SELECT wswt.name, wswt.id, wsst.name AS series, wswt.url, (
    SELECT
      CASE
      WHEN ct.cropped_images = FALSE OR wswt.image_url_clean IS NULL THEN
        wswt.image_url
      WHEN ct.cropped_images = TRUE AND ct.cropped_images = $3 AND wswt.image_url_clean_discord IS NOT NULL THEN
        wswt.image_url_clean_discord
      ELSE
        wswt.image_url_clean
      END
    FROM (
      SELECT cropped_images
      FROM "clientsTable"
      WHERE "userId" = $1
    ) ct
  ) AS image_url

  FROM waifu_schema.waifu_table wswt
  JOIN waifu_schema.series_table wsst ON wsst.id = wswt.series_id
  WHERE wswt.id NOT IN (
    SELECT waifu_id as id
    FROM cg_buy_waifu_table
    WHERE user_id = $1 AND waifu_id IS NOT NULL
  )
  AND (
    $2 = FALSE
      OR ((wsst.nsfw = $2 AND wsst.nsfw = TRUE) OR wsst.nsfw = FALSE)
      OR wsst.nsfw IS NULL
  )
  ORDER BY random()
  LIMIT $4;
`, [userID, nsfw, useDiscordImage, limit]);

const moveAllBuyWaifu = async (myID, theirID) => poolQuery(`
  UPDATE cg_buy_waifu_table
  SET user_id = $2
  WHERE user_id = $1;
`, [myID, theirID]);

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

const buyWaifu = async (userID, guildID, waifuName, waifuID) => poolQuery(`
  INSERT INTO cg_buy_waifu_table(user_guild_id, user_id, guild_id, waifu_name, waifu_id)
  VALUES($1, $2, $3, $4, $5)
  RETURNING *;
`, [`${guildID}-${userID}`, userID, guildID, waifuName, waifuID]);

const removeBuyWaifu = async (userID, waifuName, waifuID) => poolQuery(`
  DELETE FROM cg_buy_waifu_table
  WHERE id IN (SELECT id FROM cg_buy_waifu_table WHERE user_id = $1 AND
    ((waifu_id IS NOT NULL AND waifu_id = $3) OR (f_unaccent(waifu_name) ILIKE $2 || '%')) LIMIT 1)
  RETURNING *;
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
  getTopBoughtCharacters,
  getBuyWaifuList,
  getUniqueWaifu,
  updateFavoriteBuyCharacter,
  removeAllButFavoriteBuyWaifu,
  buyWaifu,
  removeBuyWaifu,
  getTopBuyWaifu,
  getTopServerBuyWaifu,
  getBuyWaifuListSum,
  moveAllBuyWaifu,
  updateFavoriteBuyWaifuBySeriesID,
};
