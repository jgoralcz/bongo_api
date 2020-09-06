const { poolQuery } = require('../../index');

const insertWaifu = async (waifu) => poolQuery(`
  INSERT INTO waifu_schema.waifu_table (
    name, series, description, image_url, image_file_path, url, origin, original_name, romaji_name, age, 
    date_of_birth, hip_cm, waist_cm, bust_cm, weight_kg, height_cm, blood_type, likes, dislikes, husbando, nsfw, date_added, website_id, unknown_gender,
    series_id, image_url_clean, image_url_clean_discord
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
  
  RETURNING *;
`, [
  waifu.name, waifu.series, waifu.description, waifu.imageURL, waifu.filepath, waifu.url, waifu.origin, waifu.originName, waifu.romajiName, waifu.age,
  waifu.date_of_birth, waifu.hip, waifu.waist, waifu.bust, waifu.weight, waifu.height, waifu.bloodType, waifu.likes, waifu.dislikes, waifu.husbando, waifu.nsfw, waifu.date_added, waifu.website_id, waifu.unknown_gender || waifu.unknownGender || false,
  waifu.series_id, waifu.image_url_clean, waifu.image_url_clean_discord,
]);

const updateWaifu = async (waifu) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET name = $1, series = $2, description = $3, image_url = $4, image_file_path = $5, url = $6, origin = $7, original_name = $8,
    romaji_name = $9, age = $10, date_of_birth = $11, hip_cm = $12, waist_cm = $13, bust_cm = $14, weight_kg = $15, height_cm = $16,
    blood_type = $17, likes = $18, dislikes = $19, husbando = $20, nsfw = $21, date_added = $22, website_id = $23, unknown_gender = $24,
    image_url_clean = $25, image_url_clean_discord = $26, series_id = $27

    WHERE id = $28;
`, [waifu.name, waifu.series, waifu.description, waifu.image_url || waifu.imageURL, waifu.filepath, waifu.url, waifu.origin, waifu.originName, waifu.romajiName,
waifu.age, waifu.date_of_birth, waifu.hip, waifu.waist, waifu.bust, waifu.weight, waifu.height, waifu.bloodType, waifu.likes, waifu.dislikes,
waifu.husbando, waifu.nsfw, waifu.date_added, waifu.website_id, waifu.unknown_gender || waifu.unknownGender || false, waifu.image_url_clean, waifu.image_url_clean_discord, waifu.series_id, waifu.id]);

const upsertWaifu = async (waifu) => poolQuery(`
  INSERT INTO waifu_schema.waifu_table (
    name, series, description, image_url, image_file_path, url, origin, original_name, romaji_name, age, 
    date_of_birth, hip_cm, waist_cm, bust_cm, weight_kg, height_cm, blood_type, likes, dislikes, husbando, nsfw, date_added, website_id, unknown_gender,
    series_id, image_url_clean, image_url_clean_discord
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
  
  ON CONFLICT(name, series_id, original_name, romaji_name) DO UPDATE
    SET name = $1, series = $2, description = $3, image_url = $4, image_file_path = $5, url = $6, origin = $7, original_name = $8,
    romaji_name = $9, age = $10, date_of_birth = $11, hip_cm = $12, waist_cm = $13, bust_cm = $14, weight_kg = $15, height_cm = $16,
    blood_type = $17, likes = $18, dislikes = $19, husbando = $20, nsfw = $21, date_added = $22, website_id = $23, unknown_gender = $24, series_id = $25,
    image_url_clean = $26, image_url_clean_discord = $27
  
  RETURNING *;
    `, [
  waifu.name, waifu.series, waifu.description, waifu.image_url || waifu.imageURL, waifu.filepath, waifu.url, waifu.origin, waifu.originName, waifu.romajiName,
  waifu.age, waifu.date_of_birth, waifu.hip, waifu.waist, waifu.bust, waifu.weight, waifu.height, waifu.bloodType, waifu.likes, waifu.dislikes,
  waifu.husbando, waifu.nsfw, waifu.date_added, waifu.website_id, waifu.unknown_gender || waifu.unknownGender || false, waifu.series_id,
  waifu.image_url_clean, waifu.image_url_clean_discord,
]);

const storeNewWaifuImage = async (id, imageURL, _, width, height, nsfw, bufferLength, fileType) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET image_url = $2, width = $3, height = $4,
  nsfw = $5, buffer_length = $6, file_type = $7
  WHERE id = $1
  RETURNING *;
`, [id, imageURL, width, height, nsfw, bufferLength, fileType]);

const storeCleanWaifuImage = async (id, imageURL, _, width, height, __, bufferLength, fileType) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET image_url_clean = $2, width_clean = $3, height_clean = $4,
  buffer_length_clean = $5, file_type_clean = $6
  WHERE id = $1
  RETURNING *;
`, [id, imageURL, width, height, bufferLength, fileType]);

const getWaifuCount = async () => poolQuery(`
  SELECT count(*) AS count
  FROM waifu_schema.waifu_table;
`, []);

const updateWaifuSeriesId = async (url, seriesID) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET series_id = $2
  WHERE url = $1;
`, [url, seriesID]);

const getWaifuById = async (waifuID) => poolQuery(`
  SELECT *
  FROM waifu_schema.waifu_table
  WHERE id = $1;
`, [waifuID]);

const findWaifuByURL = async (url) => poolQuery(`
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

const searchWaifuByName = async (waifuName, limit = 100) => poolQuery(`
  SELECT name, series, husbando, unknown_gender, image_url, url, description, wt.id, original_name, origin
  FROM (
    SELECT name, series, husbando, unknown_gender, image_url, url, description, ws.id, original_name, origin
    FROM waifu_schema.waifu_table ws
    WHERE name ILIKE '%' || $1 || '%' OR levenshtein(name, $1) <= 1
      OR (original_name ILIKE '%' || $1 || '%' AND original_name IS NOT NULL)
      OR (romaji_name ILIKE '%' || $1 || '%' AND romaji_name IS NOT NULL)
    ORDER BY
      CASE
      WHEN name ILIKE $1 THEN 0
      WHEN name ILIKE $1 || '%' THEN 1
      WHEN name ILIKE '%' || $1 || '%' THEN 2
      WHEN romaji_name ILIKE $1 THEN 3
      WHEN romaji_name ILIKE $1 || '%' THEN 4
      WHEN original_name ILIKE $1 THEN 5
      WHEN original_name ILIKE $1 || '%' THEN 6
      WHEN levenshtein(name, $1) <= 1 THEN 7
      ELSE 8 END, name, romaji_name, original_name
    LIMIT $2
  ) wt
  ORDER BY
    CASE
    WHEN name ILIKE $1 THEN 0
    WHEN original_name ILIKE $1 THEN 1
    WHEN $1 ILIKE ANY (
      SELECT UNNEST(string_to_array(wt.name, ' ')) AS name
    ) THEN 2
    WHEN name ILIKE $1 || '%' THEN 3
    WHEN name ILIKE '%' || $1 || '%' THEN 4
    WHEN original_name ILIKE $1 THEN 5
    WHEN original_name ILIKE $1 || '%' THEN 6
    WHEN levenshtein(name, $1) <= 1 THEN 7
    ELSE 8 END, name, original_name
  LIMIT $2;
`, [waifuName, limit]);

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

const getRandomWaifu = async (nsfw, userID, useDiscordImage = false) => poolQuery(`
  SELECT name, series, id, url, (
    SELECT
      CASE
      WHEN ct.cropped_images = FALSE OR image_url_clean IS NULL THEN
        image_url
      WHEN ct.cropped_images = TRUE AND ct.cropped_images = $3 AND image_url_clean_discord IS NOT NULL THEN
        image_url_clean_discord
      ELSE
        image_url_clean
      END
    FROM (
      SELECT cropped_images
      FROM "clientsTable"
      WHERE "userId" = $2
    ) ct
  ) AS image_url
  FROM waifu_schema.waifu_table
  WHERE (((nsfw = $1 AND nsfw = FALSE))
    OR ((nsfw = $1 AND nsfw = TRUE) OR nsfw = FALSE)
    OR nsfw IS NULL
  )
  ORDER BY random()
  LIMIT 1;
`, [nsfw, userID, useDiscordImage]);

/**
 * gets today's birthday for the waifus
 * @param guildID the guild's ID number.
 * @returns {Promise<void>}
 */
const todaysBirthdaysClaims = async (guildID) => poolQuery(`
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

const updateWaifuCDNurl = async (id, CDNurl) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET image_url_cdn = $2
  WHERE id = $1
  RETURNING *;
`, [id, CDNurl]);

const updateWaifuImage = async (id, CDNurl, width, height, nsfw, bufferLength, fileType) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET image_url = $2, image_url_cdn = $2, 
    width = $3, height = $4, nsfw_image = $5, buffer_length = $6, file_type = $7
  WHERE id = $1
  RETURNING *;
`, [id, CDNurl, width, height, nsfw, bufferLength, fileType]);

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

const getWaifuByImageURL = async (imageURL) => poolQuery(`
  SELECT id, name, series, series_id
  FROM waifu_schema.waifu_table
  WHERE image_url = $1
    OR image_url_clean = $1
    OR image_url_clean_discord = $1;
`, [imageURL]);

const searchCharacterExactly = async (name, series, seriesID) => poolQuery(`
  SELECT id
  FROM waifu_schema.waifu_table
  WHERE name ILIKE $1
    AND (series ILIKE $2
      OR series ILIKE ANY (
        SELECT UNNEST(string_to_array(wt1.series, ' ')) AS series
        FROM (
          SELECT series
          FROM waifu_schema.appears_in wsai
          JOIN waifu_schema.waifu_table wswt ON wswt.id = wsai.waifu_id AND wsai.series_id = $3
          WHERE name ILIKE $1
        ) wt1
      )
    );
`, [name, series, seriesID]);

const getWaifuByNoCleanImageRandom = async () => poolQuery(`
  SELECT id, image_url, nsfw, uploader
  FROM waifu_schema.waifu_table
  WHERE image_url_clean is NULL
  ORDER BY random()
  LIMIT 1;
`, []);

const updateCharacterMainImage = async (characterID, discordCropURL, cropURL, imageURL) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET image_url_clean_discord = $2,
    image_url_clean = $3,
    image_url = $4
  WHERE id = $1
  RETURNING *;
`, [characterID, discordCropURL, cropURL, imageURL]);

const updateWaifuCleanImage = async (id, uri) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET image_url_clean_discord = $2
  WHERE id = $1;
`, [id, uri]);

module.exports = {
  upsertWaifu,
  updateWaifuSeriesId,
  getWaifuById,
  findWaifuByURL,
  getSpecificWaifu,
  getRandomWaifu,
  todaysBirthdaysClaims,
  todaysBirthdays,
  getWaifuCount,
  updateWaifuCDNurl,
  updateWaifuImage,
  deleteWaifuByID,
  mergeWaifus,
  getWaifuByURL,
  insertWaifu,
  storeNewWaifuImage,
  searchCharacterExactly,
  storeCleanWaifuImage,
  getWaifuByNoCleanImageRandom,
  searchWaifuByName,
  updateWaifu,
  updateWaifuCleanImage,
  getWaifuByImageURL,
  updateCharacterMainImage,
};
