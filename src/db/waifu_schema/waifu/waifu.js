const { poolQuery } = require('../../index');

const insertWaifu = async waifu => poolQuery(`
  INSERT INTO waifu_schema.waifu_table (name, series, description, image_url, image_file_path, url, origin, original_name, romaji_name, age, 
  date_of_birth, hip_cm, waist_cm, bust_cm, weight_kg, height_cm, blood_type, likes, dislikes, husbando, nsfw, date_added, website_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
  
  RETURNING *;
`, [waifu.name, waifu.series, waifu.description, waifu.imageURL, waifu.filepath, waifu.url, waifu.origin, waifu.originName, waifu.romajiName,
waifu.age, waifu.birthday, waifu.hip, waifu.waist, waifu.bust, waifu.weight, waifu.height,
waifu.bloodType, waifu.likes, waifu.dislikes, waifu.husbando, waifu.nsfw, waifu.date_added, waifu.website_id]);

const upsertWaifu = async waifu => poolQuery(`
  INSERT INTO waifu_schema.waifu_table (name, series, description, image_url, image_file_path, url, origin, original_name, romaji_name, age, 
  date_of_birth, hip_cm, waist_cm, bust_cm, weight_kg, height_cm, blood_type, likes, dislikes, husbando, nsfw, date_added, website_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
  
  ON CONFLICT(url) DO UPDATE
    SET name = $1, series = $2, description = $3, image_url = $4, image_file_path = $5, url = $6, origin = $7, original_name = $8,
    romaji_name = $9, age = $10, date_of_birth = $11, hip_cm = $12, waist_cm = $13, bust_cm = $14, weight_kg = $15, height_cm = $16,
    blood_type = $17, likes = $18, dislikes = $19, husbando = $20, nsfw = $21, date_added = $22, website_id = $23;
  `, [waifu.name, waifu.series, waifu.description, waifu.imageURL, waifu.filepath, waifu.url, waifu.origin, waifu.originName, waifu.romajiName,
waifu.age, waifu.birthday, waifu.hip, waifu.waist, waifu.bust, waifu.weight, waifu.height, waifu.bloodType, waifu.likes, waifu.dislikes,
waifu.husbando, waifu.nsfw, waifu.date_added, waifu.website_id]);

const storeNewWaifuImageBuffer = async (id, imageURL, buffer, width, height, nsfw, bufferLength, fileType) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET image_url = $2, buffer = $3, width = $4, height = $5,
  nsfw = $6, buffer_length = $7, file_type = $8
  WHERE id = $1
  RETURNING *;
`, [id, imageURL, buffer, width, height, nsfw, bufferLength, fileType]);

const getWaifuCount = async () => {
  const query = await poolQuery(`
    SELECT count(*) AS count
    FROM waifu_schema.waifu_table;
  `, []);
  if (query && query.rowCount > 0 && query.rows[0]) {
    return query.rows[0].count;
  }
  return 0;
};

/**
 * the waifu series id
 * @param url the waifu's url
 * @param seriesID the serie's id.
 * @returns {Promise<void>}
 */
const updateWaifuSeriesId = async (url, seriesID) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET series_id = $2
  WHERE url = $1;
`, [url, seriesID]);

/**
 * gets the waifu by the character's id.
 * @param waifuID the waifu's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getWaifuById = async (waifuID) => poolQuery(`
  SELECT *
  FROM waifu_schema.waifu_table
  WHERE id = $1;
`, [waifuID]);

/**
 * finds the waifu by the url
 * @param url the waifu's url
 * @returns {Promise<*>}
 */
const findWaifuByURL = async url => poolQuery(`
  SELECT *
  FROM waifu_schema.waifu_table
  WHERE url = $1;
`, [url]);

// /**
//  * gets all waifus that have a similar name
//  * @param waifuName the waifu's name.
//  * @returns {Promise<*>}
//  */
// const getAllWaifusByNameOrSeries = async (waifuName) => poolQuery(`
//   SELECT *
//   FROM (
//     SELECT *
//     FROM waifu_schema.waifu_table
//     WHERE
//       name ILIKE '%' || $1 || '%' OR levenshtein(name, $1) <= 3
//       OR series ILIKE '%' || $1 || '%'
//     ) alias
//   ORDER BY
//     CASE
//     WHEN name ILIKE $1 || '%' THEN 0
//     ELSE 1 END, name;
// `, [waifuName]);

/**
* gets all waifus by the requested name.
* Then checks the guild id if available.
* @param waifuName the waifu's name
* @param guildID the guild's id.
* @param limit the number to limit
* @returns {Promise<*>}
*/
const getAllWaifusByName = async (waifuName, guildID, limit = 100) => poolQuery(`
  SELECT name, series, user_id, image_url, url, description, ws.id, original_name, origin
  FROM waifu_schema.waifu_table ws
  LEFT JOIN cg_claim_waifu_table cg ON cg.waifu_id = ws.id AND guild_id = $2
  WHERE name ILIKE '%' || $1 || '%' OR levenshtein(name, $1) <= 3 
    OR (original_name ILIKE '%' || $1 || '%' AND original_name IS NOT NULL)
    OR (romaji_name ILIKE '%' || $1 || '%' AND romaji_name IS NOT NULL) 
  ORDER BY
    CASE
    WHEN name ILIKE $1 THEN 0
    WHEN name ILIKE $1 || '%' THEN 1
    WHEN name ILIKE '%' || $1 || '%' THEN 2
    WHEN levenshtein(name, $1) <= 3 THEN 3
    WHEN name ILIKE '%' || $1 || '%' THEN 4
    WHEN romaji_name ILIKE $1 THEN 5
    WHEN romaji_name ILIKE $1 || '%' THEN 6
    WHEN original_name ILIKE $1 THEN 7
    WHEN original_name ILIKE $1 || '%' THEN 8
    ELSE 8 END, name, romaji_name, original_name
  LIMIT $3;
`, [waifuName, guildID, limit]);

/**
 * gets all waifus by the series name.
 * Then checks the guild id if available
 * @param waifuSeries the series to search for.
 * @param guildID the guild's id.
 * @returns {Promise<*>}
 */
const getAllWaifusBySeries = async (waifuSeries, guildID) => poolQuery(`
  SELECT name, series, user_id, image_url, url, description, ws.id, original_name, origin
  FROM (
    SELECT name, series, image_url, url, description, id, original_name, origin
    FROM waifu_schema.waifu_table
    WHERE series ILIKE '%' || $1 || '%' OR levenshtein(series, $1) <= 3
  ) ws
  LEFT JOIN cg_claim_waifu_table cg ON cg.waifu_id = ws.id AND guild_id = $2
  ORDER BY series DESC, name ASC
  LIMIT 200;
`, [waifuSeries, guildID]);

/**
 * gets specific waifus by the name and series
 * @param waifu the waifu
 * @param series the series
 * @returns {Promise<Promise<*>|*>}
 */
const getSpecificWaifu = async (waifu, series) => poolQuery(`
  SELECT *
  FROM waifu_schema.waifu_table
  WHERE name = $1 AND series = $2;
`, [waifu, series]);

/**
 * gets a random, sfw waifu
 * @returns {Promise<*>}
 */
const getRandomWaifuSFW = async () => poolQuery(`
  SELECT name, series, id, image_url, url
  FROM waifu_schema.waifu_table
  WHERE (nsfw = FALSE OR nsfw IS NULL)
  ORDER BY random()
  LIMIT 1;
`, []);

/**
 * gets today's birthday for the waifus
 * @param guildID the guild's ID number.
 * @returns {Promise<void>}
 */
const todaysBirthdaysClaims = async guildID => poolQuery(`
  SELECT name, series, image_url, url, user_id, wsst.id
  FROM (
    SELECT name, series, image_url, url, id
    FROM waifu_schema.waifu_table
    
    WHERE
        DATE_PART('day', date_of_birth) = date_part('day', CURRENT_DATE)
    AND
        DATE_PART('month', date_of_birth) = date_part('month', CURRENT_DATE)
    LIMIT 15
  ) wsst
  
  LEFT JOIN cg_claim_waifu_Table cgcwt ON wsst.id = cgcwt.waifu_id AND cgcwt.guild_id = $1;

`, [guildID]);

/**
 * gets todays birthday for the waifus
 * @returns {Promise<void>}
 */
const todaysBirthdays = async () => poolQuery(`
  SELECT name, series, image_url, url, id
  FROM waifu_schema.waifu_table
  
  WHERE
    DATE_PART('day', date_of_birth) = date_part('day', CURRENT_DATE)
  AND
    DATE_PART('month', date_of_birth) = date_part('month', CURRENT_DATE);
`, []);

const getRandomNoBufferWaifuImageByURL = async () => poolQuery(`
  SELECT image_url
  FROM waifu_schema.waifu_table
  WHERE buffer is null
  ORDER BY random()
  LIMIT 1;
`, []);

const storeWaifuImageBufferByURL = async (url, buffer, width, height) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET buffer = $2, width = $3, height = $4
  WHERE image_url = $1
  RETURNING *;
`, [url, buffer, width, height]);

const getWaifuImageNoCDNurl = async () => poolQuery(`
  SELECT id, buffer
  FROM waifu_schema.waifu_table
  WHERE image_url_cdn IS NULL AND buffer IS NOT NULL
  LIMIT 1;
`, []);

const updateWaifuCDNurl = async (id, CDNurl) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET image_url_cdn = $2
  WHERE id = $1
  RETURNING *;
`, [id, CDNurl]);

const updateWaifuImage = async (id, buffer, CDNurl, width, height, nsfw, bufferLength, fileType) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET buffer = $2, image_url = $3, image_url_cdn = $3, 
    width = $4, height = $5, nsfw_image = $6, buffer_length = $7, file_type = $8
  WHERE id = $1
  RETURNING *;
`, [id, buffer, CDNurl, width, height, nsfw, bufferLength, fileType]);

const deleteWaifuByID = async (id) => poolQuery(`
  DELETE
  FROM waifu_schema.waifu_table
  WHERE id = $1;
`, [id]);

const mergeWaifus = async (mergeID, dupeID) => poolQuery(`
  UPDATE cg_claim_waifu_table
  SET waifu_id = $1
  WHERE waifu_id = $2;
`, [mergeID, dupeID]);

const getWaifuByURL = async (url) => poolQuery(`
  SELECT id, name, series, series_id
  FROM waifu_schema.waifu_table
  WHERE url = $1;
`, [url]);

const searchWaifuExactly = async (name, series) => poolQuery(`
  SELECT id
  FROM waifu_schema.waifu_table
  WHERE name ILIKE $1
    AND (series ILIKE $2
      OR series ILIKE ANY (
        SELECT UNNEST(string_to_array(wt1.series, ' ')) AS series
        FROM (
          SELECT series
          FROM waifu_schema.appears_in wsai
          JOIN waifu_schema.waifu_table wswt ON wswt.id = wsai.waifu_id
          WHERE name ILIKE $1
        ) wt1
      )
    );
`, [name, series]);

module.exports = {
  upsertWaifu,
  updateWaifuSeriesId,
  getWaifuById,
  findWaifuByURL,
  // getAllWaifusByNameOrSeries,
  getAllWaifusByName,
  getAllWaifusBySeries,
  getSpecificWaifu,
  getRandomWaifuSFW,
  todaysBirthdaysClaims,
  todaysBirthdays,
  getWaifuCount,
  storeWaifuImageBufferByURL,
  getRandomNoBufferWaifuImageByURL,
  getWaifuImageNoCDNurl,
  updateWaifuCDNurl,
  updateWaifuImage,
  deleteWaifuByID,
  mergeWaifus,
  getWaifuByURL,
  insertWaifu,
  storeNewWaifuImageBuffer,
  searchWaifuExactly,
};
