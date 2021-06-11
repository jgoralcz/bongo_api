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

const updateMudaeNameSeries = async (id, mudaeName, mudaeSeries) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET mudae_name = $2, mudae_series = $3
  WHERE id = $1;
`, [id, mudaeName, mudaeSeries]);

const updateWaifu = async (waifu) => poolQuery(`
  UPDATE waifu_schema.waifu_table
  SET name = $1, series = $2, description = $3, image_url = $4, image_file_path = $5, url = $6, origin = $7, original_name = $8,
    romaji_name = $9, age = $10, date_of_birth = $11, hip_cm = $12, waist_cm = $13, bust_cm = $14, weight_kg = $15, height_cm = $16,
    blood_type = $17, likes = $18, dislikes = $19, husbando = $20, nsfw = $21, date_added = $22, website_id = $23, unknown_gender = $24,
    image_url_clean = $25, image_url_clean_discord = $26, series_id = $27, last_edit_by = $28, last_edit_date = now()

    WHERE id = $29;
`, [waifu.name, waifu.series, waifu.description, waifu.image_url || waifu.imageURL, waifu.filepath, waifu.url, waifu.origin, waifu.originName, waifu.romajiName,
waifu.age, waifu.date_of_birth, waifu.hip, waifu.waist, waifu.bust, waifu.weight, waifu.height, waifu.bloodType, waifu.likes, waifu.dislikes,
waifu.husbando, waifu.nsfw, waifu.date_added, waifu.website_id, waifu.unknown_gender || waifu.unknownGender || false, waifu.image_url_clean, waifu.image_url_clean_discord, waifu.series_id, waifu.last_edit_by, waifu.id]);

const upsertWaifu = async (waifu) => poolQuery(`
  INSERT INTO waifu_schema.waifu_table (
    name, series, description, image_url, image_file_path, url, origin, original_name, romaji_name, age, 
    date_of_birth, hip_cm, waist_cm, bust_cm, weight_kg, height_cm, blood_type, likes, dislikes, husbando, nsfw, date_added, website_id, unknown_gender,
    series_id, image_url_clean, image_url_clean_discord
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
  
  ON CONFLICT(name, series_id) DO UPDATE
    SET name = $1, series = $2, description = $3, image_url = $4, image_file_path = $5, url = $6, origin = $7, original_name = $8,
    romaji_name = $9, age = $10, date_of_birth = $11, hip_cm = $12, waist_cm = $13, bust_cm = $14, weight_kg = $15, height_cm = $16,
    blood_type = $17, likes = $18, dislikes = $19, husbando = $20, nsfw = $21, date_added = $22, website_id = $23, unknown_gender = $24, series_id = $25,
    image_url_clean = $26, image_url_clean_discord = $27, last_edit_by = $28
  
  RETURNING *;
    `, [
  waifu.name, waifu.series, waifu.description, waifu.image_url || waifu.imageURL, waifu.filepath, waifu.url, waifu.origin, waifu.originName, waifu.romajiName,
  waifu.age, waifu.date_of_birth, waifu.hip, waifu.waist, waifu.bust, waifu.weight, waifu.height, waifu.bloodType, waifu.likes, waifu.dislikes,
  waifu.husbando, waifu.nsfw, waifu.date_added, waifu.website_id, waifu.unknown_gender || waifu.unknownGender || false, waifu.series_id,
  waifu.image_url_clean, waifu.image_url_clean_discord, waifu.last_edit_by,
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
  SELECT wswt.name, wsst.name AS series, wswt.id, wswt.url, (
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
      WHERE "userId" = $2
    ) ct
  ) AS image_url,
  COALESCE(array_remove(array_agg(DISTINCT(wscn.nickname)), NULL), '{}') AS nicknames,
  COALESCE(array_remove(array_agg(DISTINCT(wssn.nickname)), NULL), '{}') AS series_nicknames
  FROM waifu_schema.waifu_table wswt
  JOIN waifu_schema.series_table wsst ON wsst.id = wswt.series_id
  LEFT JOIN waifu_schema.series_nicknames wssn ON wssn.series_id = wsst.id
  LEFT JOIN waifu_schema.character_nicknames wscn ON wscn.character_id = wswt.id
  WHERE (((wsst.nsfw = $1 AND wsst.nsfw = FALSE))
    OR ((wsst.nsfw = $1 AND wsst.nsfw = TRUE) OR wsst.nsfw = FALSE)
    OR wsst.nsfw IS NULL
  )
  GROUP BY wswt.name, wsst.name, wswt.id, wswt.url, wswt.image_url, wswt.image_url_clean_discord, wswt.image_url_clean
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
  SELECT id, name, series, series_id, mudae_name, mudae_series
  FROM waifu_schema.waifu_table
  WHERE image_url = $1
    OR image_url_clean = $1
    OR image_url_clean_discord = $1;
`, [imageURL]);

const searchCharacterExactly = async (name, series, seriesID) => poolQuery(`
  SELECT id, image_url_clean AS "imageCropped", image_url AS url
  FROM waifu_schema.waifu_table
  WHERE name ILIKE $1
    AND (series ILIKE $2
      OR series ILIKE ANY (
        SELECT UNNEST(string_to_array(wt1.series, ' ')) AS series
        FROM (
          SELECT series
          FROM waifu_schema.appears_in wsai
          JOIN waifu_schema.waifu_table wswt ON wswt.id = wsai.waifu_id AND wsai.series_id = $3
          WHERE f_unaccent(name) ILIKE $1
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

const selectMainImage = async (id, uri) => poolQuery(`
  SELECT image_url, image_url_clean, image_url_clean_discord
  FROM waifu_schema.waifu_table
  WHERE id = $1
    OR image_url = $2
    OR image_url_clean = $2
    OR image_url_clean_discord = $2;
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
  updateWaifu,
  updateWaifuCleanImage,
  getWaifuByImageURL,
  updateCharacterMainImage,
  selectMainImage,
  updateMudaeNameSeries,
};
