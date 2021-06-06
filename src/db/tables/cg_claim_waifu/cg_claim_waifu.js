const { poolQuery } = require('../../index.js');

const getTopClaimCharacters = async (offset, limit, guildID, userID, useDiscordImage) => poolQuery(`
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
      FROM mv_rank_claim_waifu
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

const getRandomWaifuOwnerWishlistNotClaimed = async (userID, guildID, nsfw, rollWestern, rollGame, croppedImage, limitMultiplier, rollAnime, isHusbando, rollRankGreaterThan) => poolQuery(`
  SELECT name, nsfw, husbando, unknown_gender, user_id AS "ownerID", original_name, origin, series, series_id, url, t1.id, t1.date, is_game, is_western, (
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
      WHEN ct.cropped_images = TRUE AND ct.cropped_images = $6 AND image_url_clean_discord IS NOT NULL THEN
        image_url_clean_discord
      ELSE
        image_url_clean
      END
    FROM (
      SELECT 
        CASE
        WHEN ctt.cropped_images = TRUE OR gt.cropped_images_server THEN
          TRUE
        ELSE
          FALSE
        END AS cropped_images
      FROM "clientsTable" ctt
      JOIN "guildsTable" gt ON gt."guildId" = $2
      WHERE "userId" = $1
    ) ct
  ) AS image_url
  FROM (
    SELECT name, nsfw, husbando, unknown_gender, cgw.id, user_id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, date, series_id, is_game, is_western
    FROM (
      SELECT name, nsfw, husbando, unknown_gender, id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, series_id, is_game, is_western
      FROM (
        SELECT *
        FROM mv_random_waifu_series ws
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
        AND ws.id NOT IN (
          SELECT character_id AS id
          FROM clients_disable_characters
          WHERE user_id = $1 and character_id is NOT NULL
        )
        AND ws.id NOT IN (
          SELECT character_id as id
          FROM guild_rolled
          WHERE guild_id = $2
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
        AND (((is_western = $8 AND is_western = FALSE))
          OR ((is_western = $8 AND is_western = TRUE) OR is_western = TRUE)
        )
        AND (
          ($9 = 'FALSE' AND husbando = FALSE)
          OR ($9 = 'TRUE' AND husbando = TRUE)
          OR unknown_gender = TRUE
          OR ($9 != 'TRUE' AND $9 != 'FALSE')
        )
        AND (
          $10 = 0 OR
          ws.id IN (
            SELECT waifu_id AS id
            FROM mv_rank_claim_waifu
            WHERE position < $10
          )
        )
        LIMIT $7
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
      OR ($7 > 25
        AND s1.id IN (
          SELECT waifu_id AS id
          FROM mat_view_top_thousand_waifus
          ORDER BY random()
        )
      )
      LIMIT 3000
    ) cgw
    LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = cgw.id AND cgcwt.guild_id = $2
    ORDER BY random()
    LIMIT 3
  ) t1;
`, [userID, guildID, nsfw, rollWestern, rollGame, croppedImage, limitMultiplier, rollAnime, isHusbando, rollRankGreaterThan]);

const getRandomWaifuOwnerPersonalWishlist = async (userID, guildID, nsfw, rollWestern, rollGame, croppedImage, personalWishlistMultiplier, rollAnime, isHusbando, rollRankGreaterThan) => poolQuery(`
  SELECT name, nsfw, husbando, unknown_gender, user_id AS "ownerID", original_name, origin, series, series_id, url, t1.id, t1.date, is_game, is_western, (
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
      WHEN ct.cropped_images = TRUE AND ct.cropped_images = $6 AND image_url_clean_discord IS NOT NULL THEN
        image_url_clean_discord
      ELSE
        image_url_clean
      END
    FROM (
      SELECT 
        CASE
        WHEN ctt.cropped_images = TRUE OR gt.cropped_images_server THEN
          TRUE
        ELSE
          FALSE
        END AS cropped_images
      FROM "clientsTable" ctt
      JOIN "guildsTable" gt ON gt."guildId" = $2
      WHERE "userId" = $1
    ) ct
  ) AS image_url
  FROM (
    SELECT name, nsfw, husbando, unknown_gender, cgw.id, user_id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, date, series_id, is_game, is_western
    FROM (
      SELECT name, nsfw, husbando, unknown_gender, id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, series_id, is_game, is_western
      FROM (
        SELECT *
        FROM mv_random_waifu_series ws
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
        AND ws.id NOT IN (
          SELECT character_id AS id
          FROM clients_disable_characters
          WHERE user_id = $1 and character_id is NOT NULL
        )
        AND ws.id NOT IN (
          SELECT character_id as id
          FROM guild_rolled
          WHERE guild_id = $2
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
        AND (((is_western = $8 AND is_western = FALSE))
          OR ((is_western = $8 AND is_western = TRUE) OR is_western = TRUE)
        )
        AND (
          ($9 = 'FALSE' AND husbando = FALSE)
          OR ($9 = 'TRUE' AND husbando = TRUE)
          OR unknown_gender = TRUE
          OR ($9 != 'TRUE' AND $9 != 'FALSE')
        )
        AND (
          $10 = 0 OR
          ws.id IN (
            SELECT waifu_id AS id
            FROM mv_rank_claim_waifu
            WHERE position < $10
          )
        )
        LIMIT $7
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
      LIMIT 3000
    ) cgw
    LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = cgw.id AND cgcwt.guild_id = $2
    ORDER BY random()
    LIMIT 3
  ) t1;
`, [userID, guildID, nsfw, rollWestern, rollGame, croppedImage, personalWishlistMultiplier, rollAnime, isHusbando, rollRankGreaterThan]);

const getRandomWaifuOwnerNotClaimed = async (userID, guildID, nsfw, rollWestern, rollGame, croppedImage, limitMultiplier, rollAnime, isHusbando, rollRankGreaterThan) => poolQuery(`
  SELECT name, husbando, nsfw, unknown_gender, user_id AS "ownerID", original_name, origin, series, series_id, url, t1.id, t1.date, is_game, is_western, (
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
      WHEN ct.cropped_images = TRUE AND ct.cropped_images = $6 AND image_url_clean_discord IS NOT NULL THEN
        image_url_clean_discord
      ELSE
        image_url_clean
      END
    FROM (
      SELECT 
        CASE
        WHEN ctt.cropped_images = TRUE OR gt.cropped_images_server THEN
          TRUE
        ELSE
          FALSE
        END AS cropped_images
      FROM "clientsTable" ctt
      JOIN "guildsTable" gt ON gt."guildId" = $2
      WHERE "userId" = $1
    ) ct
  ) AS image_url
  FROM (
    SELECT name, husbando, nsfw, unknown_gender, cgw.id, user_id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, series_id, date, is_game, is_western
    FROM (
      SELECT *
      FROM mv_random_waifu_series ws
      WHERE ws.id NOT IN (
        SELECT waifu_id as id
        FROM cg_claim_waifu_table
        WHERE guild_id = $2 AND waifu_id IS NOT NULL
      )
      AND ws.id NOT IN (
        SELECT character_id as id
        FROM guild_rolled
        WHERE guild_id = $2
      )
      AND ws.id NOT IN (
        SELECT character_id AS id
        FROM clients_disable_characters
        WHERE user_id = $1 and character_id is NOT NULL
      )
      AND ws.series_id NOT IN (
        SELECT series_id
        FROM clients_disable_series
        WHERE user_id = $1 AND series_id IS NOT NULL
      )
      -- AND ws.id NOT IN (
        -- SELECT wswt.id
        -- FROM (
          -- SELECT series_id
          -- FROM clients_disable_series
          -- WHERE user_id = $1 AND series_id IS NOT NULL AND series_id NOT IN (
            -- SELECT series_id
            -- FROM cg_wishlist_series_table
            -- WHERE user_id = $1 AND guild_id = $2
          -- )
        -- ) cs
        -- JOIN waifu_schema.waifu_table wswt ON ws.series_id = cs.series_id
        -- WHERE wswt.id NOT IN (
          -- SELECT waifu_id AS id
          -- FROM cg_wishlist_waifu_table
          -- WHERE user_id = $1 AND guild_id = $2
        -- )
      -- )
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
      AND (((is_western = $7 AND is_western = FALSE))
        OR ((is_western = $7 AND is_western = TRUE) OR is_western = TRUE)
      )
      AND (
        ($8 = 'FALSE' AND husbando = FALSE)
        OR ($8 = 'TRUE' AND husbando = TRUE)
        OR unknown_gender = TRUE
        OR ($8 != 'TRUE' AND $8 != 'FALSE')
      )
      AND (
        $9 = 0 OR
        ws.id IN (
          SELECT waifu_id AS id
          FROM mv_rank_claim_waifu
          WHERE position < $9
        )
      )
      LIMIT 3000
    ) cgw
    LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = cgw.id AND cgcwt.guild_id = $2
    ORDER BY random()
    LIMIT 3
  ) t1;
`, [userID, guildID, nsfw, rollWestern, rollGame, croppedImage, rollAnime, isHusbando, rollRankGreaterThan]);

const getRandomWaifuOwnerClaimed = async (userID, guildID, nsfw, rollWestern, rollGame, croppedImage, limitMultiplier, rollAnime, isHusbando, rollRankGreaterThan) => poolQuery(`
  SELECT name, nsfw, husbando, unknown_gender, t1.user_id AS "ownerID", original_name, origin, series, series_id, image_url, url, t1.id, t1.date, is_game, is_western, (
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
      WHEN ct.cropped_images = TRUE AND ct.cropped_images = $6 AND image_url_clean_discord IS NOT NULL THEN
        image_url_clean_discord
      ELSE
        image_url_clean
      END
    FROM (
      SELECT 
        CASE
        WHEN ctt.cropped_images = TRUE OR gt.cropped_images_server THEN
          TRUE
        ELSE
          FALSE
        END AS cropped_images
      FROM "clientsTable" ctt
      JOIN "guildsTable" gt ON gt."guildId" = $2
      WHERE "userId" = $1
    ) ct
  ) AS image_url
  FROM (
    SELECT name, nsfw, husbando, unknown_gender, user_id, cgw.id, original_name, origin, series, image_url, image_url_clean_discord, image_url_clean, url, series_id, date, is_game, is_western
    FROM (
      SELECT *
      FROM mv_random_waifu_series ws
      WHERE ws.series_id NOT IN (
        SELECT series_id
        FROM clients_disable_series
        WHERE user_id = $1 AND series_id is NOT NULL
      )
      AND ws.id NOT IN (
        SELECT character_id AS id
        FROM clients_disable_characters
        WHERE user_id = $1 and character_id is NOT NULL
      )
      AND ws.id NOT IN (
        SELECT character_id as id
        FROM guild_rolled
        WHERE guild_id = $2
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
      AND (((is_western = $7 AND is_western = FALSE))
        OR ((is_western = $7 AND is_western = TRUE) OR is_western = TRUE)
      )
      AND (
        ($8 = 'FALSE' AND husbando = FALSE)
        OR ($8 = 'TRUE' AND husbando = TRUE)
        OR unknown_gender = TRUE
        OR ($8 != 'TRUE' AND $8 != 'FALSE')
      )
      AND (
        $9 = 0 OR
        ws.id IN (
          SELECT waifu_id AS id
          FROM mv_rank_claim_waifu
          WHERE position < $9
        )
      )
      LIMIT 3000
    ) cgw
    LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = cgw.id AND cgcwt.guild_id = $2
    ORDER BY random()
    LIMIT 3
  ) t1;
`, [userID, guildID, nsfw, rollWestern, rollGame, croppedImage, rollAnime, isHusbando, rollRankGreaterThan]);

const getSpecificClaimWaifuOwner = async (waifuID, guildID) => poolQuery(`
  SELECT user_id, date
  FROM cg_claim_waifu_table
  WHERE waifu_id = $1 AND guild_id = $2
  ORDER BY date ASC;
`, [waifuID, guildID]);

const getClaimWaifuList = async (userID, guildID, offset, limit) => poolQuery(`
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
  
  WHERE t1.user_id = $1 AND t1.guild_id = $2
  ORDER BY favorite DESC, series ASC, name ASC
  LIMIT $4 OFFSET $3;
`, [userID, guildID, offset, limit]);

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

const claimClientWaifuID = async (userID, guildID, waifuID, date) => poolQuery(`
  INSERT INTO cg_claim_waifu_table (guild_user_id, guild_id, user_id, waifu_id, date)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`, [`${guildID}-${userID}`, guildID, userID, waifuID, date]);

const removeClaimWaifu = async (userID, guildID, waifuID) => poolQuery(`
  DELETE 
  FROM cg_claim_waifu_table
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, waifuID]);

const updateFavoriteClaimCharacter = async (userID, guildID, characterID, favorite = false) => poolQuery(`
  UPDATE cg_claim_waifu_table
  SET favorite = $4
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, characterID, favorite]);

const updateFavoriteClaimWaifuBySeriesID = async (userID, guildID, seriesID, favorite = false) => poolQuery(`
  UPDATE cg_claim_waifu_table
  SET favorite = $4
  WHERE user_id = $1
    AND guild_id = $2
    AND waifu_id IN (
      SELECT id
      FROM waifu_schema.waifu_table
      WHERE series_id = $3
    );
`, [userID, guildID, seriesID, favorite]);

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

const getTopClaimWaifu = async () => poolQuery(`
  SELECT *
  FROM mv_top_claim_waifu;
`, []);

const removeAllButFavoriteClaimWaifu = async (userId, guildID) => poolQuery(`
  DELETE
  FROM cg_claim_waifu_table
  WHERE user_id = $1 AND guild_id = $2 AND favorite = FALSE
  RETURNING *;
`, [userId, guildID]);

const removeAllClaimWaifus = async (userId, guildID) => poolQuery(`
  DELETE
  FROM cg_claim_waifu_table
  WHERE user_id = $1 AND guild_id = $2;
`, [userId, guildID]);

const getTopServerClaimWaifu = async (guildID) => poolQuery(`
  SELECT user_id AS "userId", count(waifu_id) AS top
  FROM cg_claim_waifu_table
  WHERE guild_id = $1
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;
`, [guildID]);

const getRemainingClaimWaifusServer = async (guildID) => poolQuery(`
  SELECT count(DISTINCT(waifu_id)) AS claimed_waifus
  FROM cg_claim_waifu_table
  WHERE guild_id = $1;
`, [guildID]);

const getAllGuildClaimCount = async (guildID) => poolQuery(`
  SELECT count(*)
  FROM cg_claim_waifu_table
  WHERE guild_id = $1;
`, [guildID]);

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

const removeAllGuildClaimCharactersByID = async (guildID, characterID) => poolQuery(`
  DELETE
  FROM cg_claim_waifu_table
  WHERE guild_id = $1 AND waifu_id = $2
  RETURNING *;
`, [guildID, characterID]);

const moveAllClaimedWaifu = async (myID, guildID, theirID) => poolQuery(`
  UPDATE cg_claim_waifu_table
  SET user_id = $3
  WHERE user_id = $1 AND guild_id = $2;
`, [myID, guildID, theirID]);

const moveSeries = async (userID, theirID, guildID, seriesID) => poolQuery(`
  UPDATE cg_claim_waifu_table
  SET user_id = $2, date = NOW(), favorite = FALSE
  WHERE user_id = $1
    AND guild_id = $3
    AND waifu_id IN (
      SELECT id AS waifu_id
      FROM waifu_schema.waifu_table
      WHERE series_id = $4
    );
`, [userID, theirID, guildID, seriesID]);

const moveBuySeries = async (userID, theirID, guildID, seriesID) => poolQuery(`
  UPDATE cg_buy_waifu_table
  SET user_id = $2, date = NOW(), favorite = FALSE
  WHERE user_id = $1
    AND guild_id = $3
    AND waifu_id IN (
      SELECT id AS waifu_id
      FROM waifu_schema.waifu_table
      WHERE series_id = $4
    );
`, [userID, theirID, guildID, seriesID]);

module.exports = {
  getTopClaimCharacters,
  getRandomWaifuOwnerWishlistNotClaimed,
  getRandomWaifuOwnerNotClaimed,
  getRandomWaifuOwnerClaimed,
  getSpecificClaimWaifuOwner,
  getClaimWaifuList,
  checkWaifuOwner,
  claimClientWaifuID,
  removeClaimWaifu,
  updateFavoriteClaimCharacter,
  getTopClaimWaifu,
  removeAllButFavoriteClaimWaifu,
  removeAllClaimWaifus,
  getTopServerClaimWaifu,
  getRemainingClaimWaifusServer,
  getClaimWaifuListSum,
  getUniqueGuildMembersClaim,
  removeClaimWaifusLeavers,
  removeClaimWaifusRandomHalf,
  getClaimedWaifuServerCount,
  removeClaimWaifusAll,
  getUniqueGuildMembersClaimLessThanDays,
  removeDuplicateWaifuClaims,
  removeAllGuildClaimCharactersByID,
  getAllGuildClaimCount,
  moveAllClaimedWaifu,
  moveSeries,
  moveBuySeries,
  updateFavoriteClaimWaifuBySeriesID,
  getRandomWaifuOwnerPersonalWishlist,
};
