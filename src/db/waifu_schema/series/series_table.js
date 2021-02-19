const { poolQuery } = require('../../index');

const getAllSeriesByName = async (name) => poolQuery(`
  SELECT name, url, id
  FROM waifu_schema.series_table wsst
  WHERE name ILIKE '%' || $1 || '%' OR levenshtein(name, $1) <= 3 
  ORDER BY
    CASE
    WHEN name ILIKE $1 THEN 0
    WHEN name ILIKE $1 || '%' THEN 1
    WHEN name ILIKE '%' || $1 THEN 2
    WHEN name ILIKE '%' || $1 || '%' THEN 3
    ELSE 3 END, name
  LIMIT 20;
`, [name]);

const getSeries = async (name) => poolQuery(`
  SELECT id
  FROM waifu_schema.series_table
  WHERE name ILIKE $1;
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
