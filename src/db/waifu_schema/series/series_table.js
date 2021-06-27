const { poolQuery } = require('../../index');

const getAllSeriesByName = async (name, userID, guildID, claimsOnly = false, anyClaimsOnly = false, favoritesOnly = false, boughtOnly = false, boughtFavoriteOnly = false, wishlistOnly = false, disableSeriesOnly = false) => poolQuery(`
SELECT id, name, description, image_url, url, release_date, nsfw, is_game, is_western, nicknames
  FROM (
    SELECT wsst.id, wsst.name, description, image_url, url, release_date, nsfw, is_game, is_western,
    COALESCE(array_remove(array_agg(DISTINCT(wssn.nickname)), NULL), '{}') AS nicknames
    FROM (
      SELECT wsst.id, wssn.series_id, wssn.nickname
      FROM waifu_schema.series_table wsst
      LEFT JOIN waifu_schema.series_nicknames wssn ON wssn.series_id = wsst.id
      WHERE (
          f_unaccent(wsst.name) ILIKE '%' || f_unaccent($1) || '%'
          OR f_unaccent(nickname) ILIKE '%' || f_unaccent($1) || '%'
        )
        -- claims only
        AND (
          ($4 = TRUE AND wsst.id IN (
            SELECT series_id AS id
            FROM cg_claim_waifu_table cgwt
            JOIN waifu_schema.waifu_table wswt ON wswt.id = cgwt.waifu_id
            WHERE guild_id = $3 AND user_id = $2
          )) OR $4 = FALSE
        )
        -- any claims only
        AND (
          ($5 = TRUE AND wsst.id IN (
            SELECT series_id AS id
            FROM cg_claim_waifu_table cgwt
            JOIN waifu_schema.waifu_table wswt ON wswt.id = cgwt.waifu_id
            WHERE guild_id = $3
          )) OR $5 = FALSE
        )
        -- favorite claims
        AND (
          ($6 = TRUE AND wsst.id IN (
            SELECT series_id AS id
            FROM cg_claim_waifu_table cgwt
            JOIN waifu_schema.waifu_table wswt ON wswt.id = cgwt.waifu_id
            WHERE guild_id = $3 AND user_id = $2 AND favorite = TRUE
          )) OR $6 = FALSE
        )
        -- bought only
        AND (
          ($7 = TRUE AND wsst.id IN (
            SELECT series_id AS id
            FROM cg_buy_waifu_table cgwt
            JOIN waifu_schema.waifu_table wswt ON wswt.id = cgwt.waifu_id
            WHERE user_id = $2
          )) OR $7 = FALSE
        )
        -- favorite boughts
        AND (
          ($8 = TRUE AND wsst.id IN (
            SELECT series_id AS id
            FROM cg_buy_waifu_table cgwt
            JOIN waifu_schema.waifu_table wswt ON wswt.id = cgwt.waifu_id
            WHERE user_id = $2 AND favorite = TRUE
          )) OR $8 = FALSE
        )
        -- wishlist only
        AND (
          ($9 = TRUE and wsst.id IN (
              SELECT series_id AS id
              FROM cg_wishlist_series_table
              WHERE user_id = $2
          )) OR $9 = FALSE
        )
        -- disable only
        AND (
          ($10 = TRUE and wsst.id IN (
            SELECT series_id
            FROM clients_disable_series cgs
            WHERE user_id = $2
          )) OR $10 = FALSE
        )
      ORDER BY
        CASE
          WHEN f_unaccent(wsst.name) ILIKE f_unaccent($1) THEN 0
          WHEN f_unaccent(wssn.nickname) ILIKE f_unaccent($1) THEN 1
          WHEN f_unaccent(wsst.name) ILIKE f_unaccent($1) || '%' THEN 2
          WHEN f_unaccent(wssn.nickname) ILIKE f_unaccent($1) || '%' THEN 3
          WHEN f_unaccent(wsst.name) ILIKE '%' || f_unaccent($1) || '%' THEN 4
          WHEN f_unaccent(wssn.nickname) ILIKE '%' || f_unaccent($1) || '%' THEN 5
        ELSE 6 END, wsst.name
      LIMIT 20
    ) wssn
    JOIN waifu_schema.series_table wsst ON wsst.id = wssn.id
    GROUP BY wsst.id, wsst.name, description, image_url, url, release_date, nsfw, is_game, is_western
  ) t1
  ORDER BY
    CASE
      WHEN f_unaccent(name) ILIKE f_unaccent($1) THEN 0
      WHEN f_unaccent($1) ILIKE ANY ( SELECT UNNEST( string_to_array(f_unaccent( UNNEST(nicknames) ), ' ')) ) THEN 1
      WHEN f_unaccent(name) ILIKE f_unaccent($1) || '%' THEN 2
      WHEN f_unaccent($1) || '%' ILIKE ANY ( SELECT UNNEST( string_to_array(f_unaccent( UNNEST(nicknames) ), ' ')) ) THEN 3
      WHEN f_unaccent(name) ILIKE '%' || f_unaccent($1) || '%' THEN 4
      WHEN '%' || f_unaccent($1) || '%' ILIKE ANY ( SELECT UNNEST( string_to_array(f_unaccent( UNNEST(nicknames) ), ' ')) ) THEN 5
    ELSE 6 END, name
  LIMIT 20;
`, [name, userID, guildID, claimsOnly, anyClaimsOnly, favoritesOnly, boughtOnly, boughtFavoriteOnly, wishlistOnly, disableSeriesOnly]);

const getSeries = async (name) => poolQuery(`
  SELECT id
  FROM waifu_schema.series_table wt
  WHERE name ILIKE $1
    OR wt.id IN (
      SELECT series_id as id
      FROM waifu_schema.series_nicknames
      WHERE nickname ILIKE $1
    );
`, [name]);

const getSeriesById = async (id) => poolQuery(`
  SELECT *
  FROM waifu_schema.series_table
  WHERE id = $1;
`, [id]);

const upsertSeries = async (series) => poolQuery(`
  INSERT INTO waifu_schema.series_table (name, alternate_name, description, image_url, image_file_path, url, nsfw, is_game, is_western)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  
  ON CONFLICT(name) DO UPDATE
    SET name = $1, alternate_name = $2, description = $3, image_url = $4, image_file_path = $5, url = $6, nsfw = $7, is_game = $8, is_western = $9
  RETURNING *;
`, [series.name, series.alternate_name, series.description, series.image_url, series.image_file_path, series.url, series.nsfw, series.game, series.western]);

const updateSeries = async (series) => poolQuery(`
  UPDATE waifu_schema.series_table
  SET name = $2, alternate_name = $3, description = $4, image_url = $5, image_file_path = $6, url = $7, nsfw = $8, is_game = $9, is_western = $10
  WHERE id = $1
  RETURNING *;
`, [series.id, series.name, series.alternate_name, series.description, series.image_url, series.image_file_path, series.url, series.nsfw, series.is_game, series.is_western]);

const storeNewSeriesImage = async (id, imageURL, _, width, height, nsfw, bufferLength, fileType) => poolQuery(`
  UPDATE waifu_schema.series_table
  SET image_url = $2, image_url_cdn = $2, width = $3, height = $4,
  nsfw = $5, buffer_length = $6, file_type = $7
  WHERE id = $1
  RETURNING *;
`, [id, imageURL, width, height, nsfw, bufferLength, fileType]);

module.exports = {
  getAllSeriesByName,
  getSeries,
  upsertSeries,
  storeNewSeriesImage,
  getSeriesById,
  updateSeries,
};
