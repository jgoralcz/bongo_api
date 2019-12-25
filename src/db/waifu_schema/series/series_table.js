const { poolQuery } = require('../../index');

/**
 * Get all series names by the information they give us.
 * We need to make sure we only get the ones that have at least 1 waifu
 * @param name the name to search
 * @returns {Promise<*>}
 */
const getAllSeriesByName = async (name) => poolQuery(`
  SELECT wsst2.name, wsst2.url, wsst2.id
  FROM (
    SELECT DISTINCT(wsst1.name), wsst1.url, wsst1.id
    FROM (
      SELECT name, url, id
      FROM waifu_schema.series_table wsst
      WHERE name ILIKE '%' || $1 || '%' OR levenshtein(name, $1) <= 3 
      ORDER BY
        CASE
        WHEN wsst.name ILIKE $1 THEN 0
        WHEN wsst.name ILIKE $1 || '%' THEN 1
        WHEN wsst.name ILIKE '%' || $1 THEN 2
        ELSE 3 END, wsst.name
      LIMIT 20
    ) wsst1
    JOIN waifu_schema.waifu_table wswt ON wsst1.id = wswt.series_id
  ) wsst2
  ORDER BY
    CASE
    WHEN wsst2.name ILIKE $1 THEN 0
    WHEN wsst2.name ILIKE $1 || '%' THEN 1
    WHEN wsst2.name ILIKE '%' || $1 THEN 2
    ELSE 3 END, wsst2.name;
`, [name]);

const getSeries = async (name) => poolQuery(`
  SELECT id
  FROM waifu_schema.series_table
  WHERE name ILIKE $1;
`, [name]);

const upsertSeries = async (series) => poolQuery(`
  INSERT INTO waifu_schema.series_table (name, alternate_name, description, image_url, image_file_path, url, nsfw, is_game, is_western)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  
  ON CONFLICT(name) DO UPDATE
    SET name = $1, alternate_name = $2, description = $3, image_url = $4, image_file_path = $5, url = $6, is_game = $8, is_western = $9
  RETURNING *;
`, [series.name, series.alternate_name, series.description, series.image_url, series.image_file_path, series.url, series.nsfw, series.game, series.western]);


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
};
