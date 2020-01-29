const { poolQuery } = require('../../index.js');

/**
 * gets the waifu id's rank.
 * @param waifuID the waifu's ID
 * @returns {Promise<*>}
 */
const getWaifuRankById = async (waifuID) => poolQuery(`
  SELECT top.position as rank
  FROM (
    SELECT waifu_id, 
    row_number() over (
      ORDER BY count(cgcwt.waifu_id) DESC
    ) as position
    FROM cg_claim_waifu_table cgcwt
    GROUP BY waifu_id                   
  ) top
  WHERE top.waifu_id = $1;
`, [waifuID]);

/**
 * gets the top 500 claimed waifus of a server
 * @param offset the offset
 * @param limit the limit
 * @param guildID the guild's id.
 * @returns {Promise<*>}
 */
const getTopClaimWaifus = async (offset, limit, guildID) => poolQuery(`
  SELECT name, series, url, top_waifu, top.waifu_id, image_url, cg.user_id
  FROM (
    SELECT waifu_id, count(waifu_id) AS top_waifu
    FROM cg_claim_waifu_table cgcwt
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

const getRandomWaifuOwnerWishlistNotClaimed = async (userID, guildID, nsfw, rollWestern, rollGame, limitMultiplier) => {
  return poolQuery(`
    SELECT name, husbando, unknown_gender, user_id AS "ownerID", original_name, origin, series, series_id, url, t1.id, t1.date, is_game, is_western, (
      SELECT COALESCE (
        (
          SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw)
          FROM (
            SELECT image_id
            FROM claim_waifu_user_images
            WHERE user_id = t1.user_id AND waifu_id = t1.id
          ) cwui
          JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
        ),
        (
          SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw) 
          FROM (
            SELECT image_id
            FROM claim_waifu_user_images
            WHERE user_id = $1 AND waifu_id = t1.id
          ) cwui
          JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
        )
      ) AS user_image
    ),
    (
      SELECT
        CASE
        WHEN ct.cropped_images = FALSE OR image_url_clean IS NULL THEN
          image_url
        WHEN ct.cropped_images = TRUE AND image_url_clean_discord IS NOT NULL THEN
          image_url_clean_discord
        ELSE
          image_url_clean
        END
      FROM (
        SELECT cropped_images
        FROM "clientsTable"
        WHERE "userId" = $1
      ) ct
    ) AS image_url
    FROM (
      SELECT name, husbando, unknown_gender, cgw.id, user_id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, date, series_id, is_game, is_western
      FROM (
        SELECT name, husbando, unknown_gender, id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, series_id, is_game, is_western
        FROM (
          SELECT ws.name, ws.husbando, ws.unknown_gender, ws.id, ws.original_name, ws.origin, ws.series, ws.image_url, ws.image_url_clean_discord, ws.image_url_clean, ws.url, ws.series_id, wsst.is_game, wsst.is_western
          FROM waifu_schema.waifu_table ws
          JOIN waifu_schema.series_table wsst ON wsst.id = ws.series_id
          WHERE ws.id NOT IN (
            SELECT waifu_id as id
            FROM cg_claim_waifu_table
            WHERE guild_id = $2 AND waifu_id IS NOT NULL
          ) 
          AND ws.series_id NOT IN (
            SELECT series_id
            FROM clients_disable_series
            WHERE user_id = $1 AND series_id IS NOT NULL
          )
          AND (((ws.nsfw = $3 AND ws.nsfw = FALSE))
            OR ((ws.nsfw = $3 AND ws.nsfw = TRUE) OR ws.nsfw = FALSE)
            OR ws.nsfw IS NULL
          )
          AND (((is_western = $4 AND is_western = FALSE))
            OR ((is_western = $4 AND is_western = TRUE) OR is_western = FALSE)
          )
          AND (((is_game = $5 AND is_game = FALSE))
            OR ((is_game = $5 AND is_game = TRUE) OR is_game = FALSE)
          )
          ORDER BY random()
          LIMIT 10 * $6 / 6 + 10
        ) s1
        WHERE s1.id IN (
          SELECT DISTINCT(waifu_id) AS id
          FROM cg_wishlist_waifu_table cgt
          WHERE cgt.user_id = $1 and cgt.guild_id = $2
        ) 
        OR s1.series_id IN (
          SELECT DISTINCT(series_id) AS id
          FROM cg_wishlist_series_table cgt
          WHERE cgt.user_id = $1 AND cgt.guild_id = $2
        )
        OR s1.id IN (
          SELECT DISTINCT(waifu_id) AS id
          FROM cg_wishlist_waifu_table cgt
          WHERE cgt.guild_id = $2
        )
        OR s1.series_id IN (
          SELECT DISTINCT(series_id) AS id
          FROM cg_wishlist_series_table cgt
          WHERE cgt.guild_id = $2
        )
        OR ($6 > 20
          AND s1.id IN (
            SELECT waifu_id AS id
            FROM mat_view_top_thousand_waifus
            ORDER BY random()
            LIMIT 1
          )
        )
        ORDER BY random()
        LIMIT 1
      ) cgw
      LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = cgw.id AND cgcwt.guild_id = $2
    ) t1;
  `, [userID, guildID, nsfw, rollWestern, rollGame, limitMultiplier]);
};

const getRandomWaifuOwnerNotClaimed = async (userID, guildID, nsfw, rollWestern, rollGame) => {
  return poolQuery(`
    SELECT name, husbando, unknown_gender, user_id AS "ownerID", original_name, origin, series, series_id, url, t1.id, t1.date, is_game, is_western, (
      SELECT COALESCE (
        (
          SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw)
          FROM (
            SELECT image_id
            FROM claim_waifu_user_images
            WHERE user_id = t1.user_id AND waifu_id = t1.id
          ) cwui
          JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
        ),
        (
          SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw) 
          FROM (
            SELECT image_id
            FROM claim_waifu_user_images
            WHERE user_id = $1 AND waifu_id = t1.id
          ) cwui
          JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
        )
      ) AS user_image
    ),
    (
      SELECT
        CASE
        WHEN ct.cropped_images = FALSE OR image_url_clean IS NULL THEN
          image_url
        WHEN ct.cropped_images = TRUE AND image_url_clean_discord IS NOT NULL THEN
          image_url_clean_discord
        ELSE
          image_url_clean
        END
      FROM (
        SELECT cropped_images
        FROM "clientsTable"
        WHERE "userId" = $1
      ) ct
    ) AS image_url
    FROM (
      SELECT name, husbando, unknown_gender, cgw.id, user_id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, series_id, date, is_game, is_western
      FROM (
        SELECT ws.name, ws.husbando, ws.unknown_gender, ws.id, ws.original_name, ws.origin, ws.series, ws.image_url, ws.image_url_clean_discord, ws.image_url_clean, ws.url, ws.series_id, wsst.is_game, wsst.is_western
        FROM waifu_schema.waifu_table ws
        JOIN waifu_schema.series_table wsst ON wsst.id = ws.series_id
        WHERE ws.id NOT IN (
          SELECT waifu_id as id
          FROM cg_claim_waifu_table
          WHERE guild_id = $2 AND waifu_id IS NOT NULL
        )
        AND ws.series_id NOT IN (
          SELECT series_id
          FROM clients_disable_series
          WHERE user_id = $1 AND series_id IS NOT NULL
        )
        AND (((ws.nsfw = $3 AND ws.nsfw = FALSE))
          OR ((ws.nsfw = $3 AND ws.nsfw = TRUE) OR ws.nsfw = FALSE)
          OR ws.nsfw IS NULL
        )
        AND (((is_western = $4 AND is_western = FALSE))
          OR ((is_western = $4 AND is_western = TRUE) OR is_western = FALSE)
        )
        AND (((is_game = $5 AND is_game = FALSE))
          OR ((is_game = $5 AND is_game = TRUE) OR is_game = FALSE)
        )
        ORDER BY random()
        LIMIT 1
      ) cgw
      LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = cgw.id AND cgcwt.guild_id = $2
    ) t1;
  `, [userID, guildID, nsfw, rollWestern, rollGame]);
};

const getRandomWaifuOwnerWishlistClaimed = async (userID, guildID, nsfw, rollWestern, rollGame) => {
  return poolQuery(`
    SELECT name, husbando, unknown_gender, user_id AS "ownerID", original_name, origin, series, series_id, image_url, url, t1.id, t1.date, is_game, is_western, (
      SELECT COALESCE (
        (
          SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw)
          FROM (
            SELECT image_id
            FROM claim_waifu_user_images
            WHERE user_id = t1.user_id AND waifu_id = t1.id
          ) cwui
          JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
        ),
        (
          SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw) 
          FROM (
            SELECT image_id
            FROM claim_waifu_user_images
            WHERE user_id = $1 AND waifu_id = t1.id
          ) cwui
          JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
        )
      ) AS user_image
    ),
    (
      SELECT
        CASE
        WHEN ct.cropped_images = FALSE OR image_url_clean IS NULL THEN
          image_url
        WHEN ct.cropped_images = TRUE AND image_url_clean_discord IS NOT NULL THEN
          image_url_clean_discord
        ELSE
          image_url_clean
        END
      FROM (
        SELECT cropped_images
        FROM "clientsTable"
        WHERE "userId" = $1
      ) ct
    ) AS image_url
    FROM (
      SELECT name, husbando, unknown_gender, cgw.id, user_id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, series_id, date, is_game, is_western
      FROM (
        SELECT ws.name, ws.husbando, ws.unknown_gender, ws.id, ws.original_name, ws.origin, ws.series, ws.image_url, ws.image_url_clean_discord, ws.image_url_clean, ws.url, ws.series_id, wsst.is_game, wsst.is_western
        FROM waifu_schema.waifu_table ws
        JOIN waifu_schema.series_table wsst ON wsst.id = ws.series_id
        WHERE ws.series_id NOT IN (
          SELECT series_id
          FROM clients_disable_series
          WHERE user_id = $1 AND series_id is NOT NULL
        )
        AND ws.id IN (
          SELECT waifu_id as id
          FROM cg_claim_waifu_table
          WHERE guild_id = $2 AND waifu_id IS NOT NULL
        ) 
        AND (((ws.nsfw = $3 AND ws.nsfw = FALSE))
          OR ((ws.nsfw = $3 AND ws.nsfw = TRUE) OR ws.nsfw = FALSE)
          OR ws.nsfw IS NULL
        )
        AND (((is_western = $4 AND is_western = FALSE))
          OR ((is_western = $4 AND is_western = TRUE) OR is_western = FALSE)
        )
        AND (((is_game = $5 AND is_game = FALSE))
          OR ((is_game = $5 AND is_game = TRUE) OR is_game = FALSE)
        )
        ORDER BY random()
        LIMIT 1
      ) cgw
      LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = cgw.id AND cgcwt.guild_id = $2
    ) t1;
  `, [userID, guildID, nsfw, rollWestern, rollGame]);
};

const getRandomWaifuOwnerClaimed = async (userID, guildID, nsfw, rollWestern, rollGame) => {
  return poolQuery(`
    SELECT name, husbando, unknown_gender, t1.user_id AS "ownerID", original_name, origin, series, series_id, image_url, url, t1.id, t1.date, is_game, is_western, (
      SELECT COALESCE (
        (
          SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw)
          FROM (
            SELECT image_id
            FROM claim_waifu_user_images
            WHERE user_id = t1.user_id AND waifu_id = t1.id
          ) cwui
          JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
        ),
        (
          SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw)
          FROM (
            SELECT user_id, image_id
            FROM claim_waifu_user_images
            WHERE user_id = $1 AND waifu_id = t1.id
          ) cwui
          JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
        )
      ) AS user_image
    ),
    (
      SELECT
        CASE
        WHEN ct.cropped_images = FALSE OR image_url_clean IS NULL THEN
          image_url
        WHEN ct.cropped_images = TRUE AND image_url_clean_discord IS NOT NULL THEN
          image_url_clean_discord
        ELSE
          image_url_clean
        END
      FROM (
        SELECT cropped_images
        FROM "clientsTable"
        WHERE "userId" = $1
      ) ct
    ) AS image_url
    FROM (
      SELECT name, husbando, unknown_gender, user_id, cgw.id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, series_id, date, is_game, is_western
      FROM (
        SELECT ws.name, ws.husbando, ws.unknown_gender, ws.id, ws.original_name, ws.origin, ws.series, ws.image_url, image_url_clean_discord, image_url_clean, ws.url, ws.series_id, wsst.is_game, wsst.is_western
        FROM waifu_schema.waifu_table ws
        JOIN waifu_schema.series_table wsst ON wsst.id = ws.series_id
        WHERE ws.series_id NOT IN (
          SELECT series_id
          FROM clients_disable_series
          WHERE user_id = $1 AND series_id is NOT NULL
        )
        AND ws.id IN (
          SELECT waifu_id as id
          FROM cg_claim_waifu_table
          WHERE guild_id = $2 AND waifu_id IS NOT NULL
        )
        AND (((ws.nsfw = $3 AND ws.nsfw = FALSE))
          OR ((ws.nsfw = $3 AND ws.nsfw = TRUE) OR ws.nsfw = FALSE)
          OR ws.nsfw IS NULL
        )
        AND (((is_western = $4 AND is_western = FALSE))
          OR ((is_western = $4 AND is_western = TRUE) OR is_western = FALSE)
        )
        AND (((is_game = $5 AND is_game = FALSE))
          OR ((is_game = $5 AND is_game = TRUE) OR is_game = FALSE)
        )
        ORDER BY random()
        LIMIT 1
      ) cgw
      LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = cgw.id AND cgcwt.guild_id = $2
    ) t1;
  `, [userID, guildID, nsfw, rollWestern, rollGame]);
};

/**
 * gets specific claim waifu from the guild.
 * @param waifuID the waifu's id
 * @param guildID the guild's id
 * @returns {Promise<*>}
 */
const getSpecificClaimWaifuOwner = async (waifuID, guildID) => poolQuery(`
  SELECT user_id, date
  FROM cg_claim_waifu_table
  WHERE waifu_id = $1 AND guild_id = $2
  ORDER BY date ASC;
`, [waifuID, guildID]);

/**
 * get the claimed waifu list and format it special.
 * @param id the user's ID number
 * @param offset the offset to get
 * @param limit the limit to get
 * @param guildID the guild ID number
 * @returns {Promise<*>}
 */
const getClaimWaifuList = async (id, offset, limit, guildID) => poolQuery(`
  SELECT name, favorite, note, t2.id AS waifu_id, series, image_url, 
    count(*) OVER (PARTITION BY series) AS num, url,
    (
      SELECT count(*)
      FROM waifu_schema.waifu_table
      WHERE waifu_schema.waifu_table.series = t2.series
    )
  FROM cg_claim_waifu_table t1
  
  JOIN waifu_schema.waifu_table t2
  ON t1.waifu_id = t2.id
  
  LEFT JOIN user_waifu_notes t3
  ON t2.id = t3.waifu_id AND t1.user_id = t3.user_id
  
  WHERE t1.user_id = $1 AND t1.guild_id = $4
  ORDER BY favorite DESC, series ASC, name ASC
  LIMIT $3 OFFSET $2;
`, [id, offset, limit, guildID]);

/**
 * finds the bought waifu by name, has all the needed stuff in it.
 * @param userID the user's ID
 * @param guildID the guild's id.
 * @param waifuName the waifu's name to search.
 * @returns {Promise<*>}
 */
const findClaimWaifuByIdJoinURL = async (userID, guildID, waifuName) => poolQuery(`
  SELECT waifu_id, wt.name, wt.url, wt.series, favorite, wt.image_url
  FROM (
    SELECT waifu_id, favorite
    FROM cg_claim_waifu_table
    WHERE user_id = $1 AND guild_id = $2
  ) cgcwt
  LEFT JOIN waifu_schema.waifu_table wt ON cgcwt.waifu_id = wt.id
  WHERE wt.name ILIKE '%' || $3 || '%'
  ORDER BY
    CASE WHEN wt.name ILIKE $3 || '%' THEN 0 ELSE 1 END, wt.name
  LIMIT 20;
`, [userID, guildID, waifuName]);

/**
 * finds the bought waifu by name, has all the needed stuff in it.
 * @param userID the user's ID
 * @param guildID the guild's id.
 * @param waifuName the waifu's ID.
 * @param favorite whether it's favorited or not.
 * @returns {Promise<*>}
 */
const findClaimWaifuByIdJoinURLFavorites = async (userID, guildID, waifuName, favorite = true) => poolQuery(`
  SELECT waifu_id, wt.name, wt.url, wt.series, favorite, wt.image_url
  FROM (
    SELECT waifu_id, favorite
    FROM cg_claim_waifu_table
    WHERE user_id = $1 AND guild_id = $2 AND favorite = $4
  ) cgcwt
  
  JOIN waifu_schema.waifu_table wt ON cgcwt.waifu_id = wt.id
  WHERE wt.name ILIKE '%' || $3 || '%'
  ORDER BY
    CASE WHEN wt.name ILIKE $3 || '%' THEN 0 ELSE 1 END, wt.name
  LIMIT 20;
`, [userID, guildID, waifuName, favorite]);

/**
 * check if the user owns this waifu
 * @param userID the user's ID.
 * @param guildID the guild's ID.
 * @param waifuID the waifu's ID.
 * @returns {Promise<*>}
 */
const checkWaifuOwner = async (userID, guildID, waifuID) => poolQuery(`
  SELECT null
  FROM cg_claim_waifu_table
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, waifuID]);

/**
 * finds the bought waifu by name, has all the needed stuff in it.
 * @param guildID the guild's id.
 * @param waifuName the waifu's ID.
 * @returns {Promise<*>}
 */
const findClaimWaifuByNameJoinURL = async (guildID, waifuName) => poolQuery(`
  SELECT waifu_id, wt.name, wt.url, wt.series, wt.image_url, cgcwt.user_id
  FROM (
    SELECT waifu_id, user_id
    FROM cg_claim_waifu_table
    WHERE guild_id = $1
  ) cgcwt
  JOIN waifu_schema.waifu_table wt ON cgcwt.waifu_id = wt.id
  WHERE wt.name ILIKE '%' || $2 || '%'
  LIMIT 20;
`, [guildID, waifuName]);

/**
 * finds the bought waifu by name and user's ID.
 * @param userID the user's id.
 * @param guildID the guild's id.
 * @param waifuName the waifu's ID.
 * @returns {Promise<*>}
 */
const findClaimWaifuByNameAndIDJoinURL = async (userID, guildID, waifuName) => poolQuery(`
  SELECT waifu_id, wt.name, wt.url, wt.series, wt.image_url, cgcwt.user_id
  FROM (
    SELECT waifu_id, user_id
    FROM cg_claim_waifu_table
    WHERE user_id = $1 AND guild_id = $2
  ) cgcwt
  JOIN waifu_schema.waifu_table wt ON cgcwt.waifu_id = wt.id
  WHERE wt.name ILIKE '%' || $3 || '%'
  LIMIT 20;
`, [userID, guildID, waifuName]);

/**
 * claim the waifu
 * @param guildID the guild id
 * @param userID the user'd id
 * @param waifuID the waifu id
 * @param date the date the waifu added.
 * @returns {Promise<void>}
 */
const claimClientWaifuID = async (userID, guildID, waifuID, date) => poolQuery(`
  INSERT INTO cg_claim_waifu_table (guild_user_id, guild_id, user_id, waifu_id, date)
  VALUES ($1, $2, $3, $4, $5);
`, [`${guildID}-${userID}`, guildID, userID, waifuID, date]);

/**
 * remove the claimed waifu
 * @param userID the user's id
 * @param guildID the guild's id
 * @param waifuID the waifu's ID.
 * @returns {Promise<*>}
 */
const removeClaimWaifu = async (userID, guildID, waifuID) => poolQuery(`
  DELETE 
  FROM cg_claim_waifu_table
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, waifuID]);

// /**
//  * adds a favorite to their claim waifu in the database.
//  * @param userID the id of the user
//  * @param guildID the id of the guild
//  * @param waifuID the id of the waifu
//  * @returns {Promise<*>}
//  */
// const addFavoriteClaimWaifu = async (userID, guildID, waifuID) => poolQuery(`
//   UPDATE cg_claim_waifu_table
//   SET favorite = TRUE
//   WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
// `, [userID, guildID, waifuID]);

/**
 * add favorite waifu by id.
 * @param userID the user's id
 * @param guildID the guild's id
 * @param id the waifu id to add.
 * @returns {Promise<*>}
 */
const addFavoriteClaimWaifuID = async (userID, guildID, id) => poolQuery(`
  UPDATE cg_claim_waifu_table
  SET favorite = TRUE
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, id]);

/**
 * removed favorite waifus
 * @param userID the user's id
 * @param guildID the guild's id
 * @param waifuID the waifu's id
 * @returns {Promise<*>}
 */
const removeFavoriteClaimWaifuID = async (userID, guildID, waifuID) => poolQuery(`
  UPDATE cg_claim_waifu_table
  SET favorite = FALSE
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, waifuID]);

const removeClaimWaifusLeavers = async (guildID, userIDArray) => {
  const q = await poolQuery(`
    WITH deleted AS (
      DELETE
        FROM cg_claim_waifu_table
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
 * gets the top 20 claimed waifus overall from our stuff.
 */
const getTopClaimWaifu = async () => poolQuery(`
  SELECT *
  FROM mv_top_claim_waifu;
`, []);

/**
 * remove all but favorite claim waifus.
 * @param userId the user's id.
 * @param guildID the guild's id.
 * @returns {Promise<*>}
 */
const removeAllButFavoriteClaimWaifu = async (userId, guildID) => poolQuery(`
  DELETE
  FROM cg_claim_waifu_table
  WHERE user_id = $1 AND guild_id = $2 AND favorite = FALSE
  RETURNING *;
`, [userId, guildID]);

/**
 * removes all waifus (admin used this)
 * @param userId the user's id
 * @param guildID the guild's id the user is in.
 * @returns {Promise<*>}
 */
const removeAllClaimWaifus = async (userId, guildID) => poolQuery(`
  DELETE
  FROM cg_claim_waifu_table
  WHERE user_id = $1 AND guild_id = $2;
`, [userId, guildID]);

/**
 * gets the top claimed server waifus for a guild
 * @param guildID the guild id
 * @returns {Promise<*>}
 */
const getTopServerClaimWaifu = async (guildID) => poolQuery(`
  SELECT user_id AS "userId", count(waifu_id) AS top
  FROM cg_claim_waifu_table
  WHERE guild_id = $1
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;
`, [guildID]);


const getRemainingClaimWaifusServer = async (guildID) => {
  const query = await poolQuery(`
    SELECT count(DISTINCT(waifu_id)) AS claimed_waifus
    FROM cg_claim_waifu_table
    WHERE guild_id = $1;
  `, [guildID]);

  if (query && query.rows && query.rows[0] && query.rows[0].claimed_waifus) return query.rows[0].claimed_waifus;
  return 0;
};

const getUniqueGuildMembersClaim = async (guildID) => poolQuery(`
  SELECT DISTINCT user_id
  FROM cg_claim_waifu_table
  WHERE guild_id = $1;
`, [guildID]);

const getClaimWaifuListSum = async (userId, guildID) => poolQuery(`
  SELECT count(*) AS top
  FROM cg_claim_waifu_table
  WHERE user_id = $1 AND guild_id = $2;
`, [userId, guildID]);

const removeClaimWaifusRandomHalf = async (guildID, limit) => poolQuery(`
  DELETE
  FROM cg_claim_waifu_table
  WHERE guild_id = $1 AND id IN (
    SELECT id
    FROM cg_claim_waifu_table
    WHERE guild_id = $1
    ORDER BY random()
    LIMIT $2
  )
`, [guildID, limit]);

const removeClaimWaifusAll = async (guildID) => poolQuery(`
  DELETE
  FROM cg_claim_waifu_table
  WHERE guild_id = $1;
  `, [guildID]);

const getClaimedWaifuServerCount = async (guildID) => {
  const query = await poolQuery(`
    SELECT count(*)
    FROM cg_claim_waifu_table
    WHERE guild_id = $1;
  `, [guildID]);
  if (query && query.rows && query.rowCount > 0 && query.rows[0] && query.rows[0].count) {
    return query.rows[0].count;
  }
  return 0;
};

const getUniqueGuildMembersClaimLessThanDays = async (guildID, date) => poolQuery(`
  SELECT t.user_id, t.date AS "claimDate", cgcwt.date AS "customDate", cgt.latest_roll_date AS "rollDate"
  FROM (
    SELECT DISTINCT ON (user_id)
    user_id, date
    FROM cg_claim_waifu_table
    WHERE guild_id = $1
    ORDER BY user_id, date DESC
  ) t
  LEFT JOIN cg_custom_waifu_table cgcwt ON t.user_id = cgcwt.user_id AND cgcwt.guild_id = $1
  LEFT JOIN "clientsGuildsTable" cgt ON t.user_id = cgt."userId" AND cgt."guildID" = $1
  WHERE t.date < $2 AND (cgcwt.date IS NULL OR cgcwt.date < $2) AND (cgt.latest_roll_date IS NULL OR cgt.latest_roll_date < $2);
`, [guildID, date]);

const removeDuplicateWaifuClaims = async (dupeID, mergeID) => poolQuery(`
  DELETE
  FROM cg_claim_waifu_table
  WHERE (user_id, guild_id) IN (
    SELECT user_id, guild_id
    FROM cg_claim_waifu_table
    WHERE (user_id, guild_id) IN (
      SELECT user_id, guild_id
      FROM cg_claim_waifu_table
      WHERE waifu_id = $1
    )
    AND (user_id, guild_id) IN (
      SELECT user_id, guild_id
      FROM cg_claim_waifu_table
      WHERE waifu_id = $1
    )
  ) AND waifu_id = $2;
`, [dupeID, mergeID]);

module.exports = {
  getWaifuRankById,
  getTopClaimWaifus,
  getRandomWaifuOwnerWishlistNotClaimed,
  getRandomWaifuOwnerWishlistClaimed,
  getRandomWaifuOwnerNotClaimed,
  getRandomWaifuOwnerClaimed,
  getSpecificClaimWaifuOwner,
  getClaimWaifuList,
  findClaimWaifuByIdJoinURL,
  findClaimWaifuByIdJoinURLFavorites,
  checkWaifuOwner,
  findClaimWaifuByNameJoinURL,
  claimClientWaifuID,
  removeClaimWaifu,
  addFavoriteClaimWaifuID,
  removeFavoriteClaimWaifuID,
  getTopClaimWaifu,
  removeAllButFavoriteClaimWaifu,
  removeAllClaimWaifus,
  getTopServerClaimWaifu,
  getRemainingClaimWaifusServer,
  getClaimWaifuListSum,
  findClaimWaifuByNameAndIDJoinURL,
  getUniqueGuildMembersClaim,
  removeClaimWaifusLeavers,
  removeClaimWaifusRandomHalf,
  getClaimedWaifuServerCount,
  removeClaimWaifusAll,
  getUniqueGuildMembersClaimLessThanDays,
  removeDuplicateWaifuClaims,
};
