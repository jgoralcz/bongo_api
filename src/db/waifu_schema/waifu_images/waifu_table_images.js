const { poolQuery } = require('../../index');

const getRandomWaifuImageNonReviewed = async () => poolQuery(`
  SELECT wti.image_id, wti.image_url_path_extra as image_url, name, url
  FROM waifu_schema.waifu_table_images wti
  LEFT JOIN waifu_schema.waifu_table ws ON ws.id = wti.waifu_id
  WHERE reviewer IS NULL
  ORDER BY random()
  LIMIT 1;
`, []);

const getImageInfoByURL = async (uri) => poolQuery(`
  SELECT waifu_id, image_id, image_url_path_extra, image_url_clean_path_extra, image_url_clean_discord_path_extra
  FROM waifu_schema.waifu_table_images
  WHERE image_url_path_extra = $1 OR image_url_clean_path_extra = $1;
`, [uri]);

const getRemainingImages = async () => poolQuery(`
  SELECT count(*) AS remaining
  FROM waifu_schema.waifu_table_images
  WHERE reviewer IS NULL;
`, []);

const updateWaifuImageReview = async (nsfw, reviewed, badImage, imageID) => poolQuery(`
  UPDATE waifu_schema.waifu_table_images
  SET nsfw = $1, reviewer = $2, bad_image = $3
  WHERE image_id = $4;
`, [nsfw, reviewed, badImage, imageID]);

const deleteImage = async (imageID) => poolQuery(`
  DELETE
  FROM waifu_schema.waifu_table_images
  WHERE image_id = $1
  RETURNING *;
`, [imageID]);

const selectImage = async (imageID) => poolQuery(`
  SELECT image_id, waifu_id, image_url_path_extra, image_url_clean_path_extra
  FROM waifu_schema.waifu_table_images
  WHERE image_id = $1;
`, [imageID]);

const selectAllImage = async (imageID) => poolQuery(`
  SELECT *
  FROM waifu_schema.waifu_table_images
  WHERE image_id = $1;
`, [imageID]);

const selectImageByURL = async (url) => poolQuery(`
  SELECT image_id, waifu_id, image_url_path_extra
  FROM waifu_schema.waifu_table_images
  WHERE image_url_path_extra = $1;
`, [url]);

/**
 * inserts waifu images.
 * @param waifuID the waifu ID.
 * @param imageFilePath the image file path on my system
 * @param imageURLPath the image url path.
 * @returns {Promise<*>}
 */
const insertWaifuImages = async (waifuID, imageFilePath, imageURLPath) => {
  // eslint-disable-next-line prefer-template
  console.log('inserting: ' + waifuID);
  return poolQuery(`
  INSERT INTO waifu_schema.waifu_table_images(waifu_id, image_file_path_extra, image_url_path_extra)
  VALUES ($1, $2, $3)
  
  ON CONFLICT(image_url_path_extra) DO UPDATE
      SET waifu_id = $1, image_file_path_extra = $2, image_url_path_extra = $3;
`, [waifuID, imageFilePath, imageURLPath]);
};

/**
 * get images and filter if they're nsfw or not
 * @param waifuID the waifu id to look up.
 * @param nsfw whether the channel is nsfw or not
 * @returns {Promise<*>}
 */
const getWaifuImagesById = async (waifuID, nsfw = false) => {
  if (nsfw) {
    return poolQuery(`
      SELECT image_id
      FROM waifu_schema.waifu_table_images
      WHERE waifu_id = $1;
`, [waifuID]);
  }
  return poolQuery(`
    SELECT image_id
    FROM waifu_schema.waifu_table_images
    WHERE waifu_id = $1 AND (nsfw = FALSE OR nsfw IS NULL);
`, [waifuID]);
};

const storeNewImage = async (id, imageURL, buffer, width, height, nsfw, bufferLength, fileType) => poolQuery(`
  INSERT INTO waifu_schema.waifu_table_images (waifu_id, image_url_path_extra, 
    width, height, nsfw, buffer_length, file_type, buffer_hash)
  VALUES ($1, $2, $3, $4, $5, $6, $7, h_int(encode($8::BYTEA, 'base64')))
  RETURNING *;
`, [id, imageURL, width, height, nsfw, bufferLength, fileType, buffer]);

const getHashFromBufferID = async (id, buffer) => poolQuery(`
  SELECT buffer_hash
  FROM waifu_schema.waifu_table_images
  WHERE waifu_id = $1 AND buffer_hash = h_int(encode($2::BYTEA, 'base64'));
`, [id, buffer]);

const getWaifuImageByURL = async (url) => poolQuery(`
  SELECT *
  FROM waifu_schema.waifu_table_images
  WHERE image_fi = $1;
`, [url]);

const deleteImageByURL = async (url) => poolQuery(`
  DELETE
  FROM waifu_schema.waifu_table_images
  WHERE image_url_path_extra = $1;
`, [url]);

const updateWaifusCDNurl = async (id, CDNurl) => poolQuery(`
  UPDATE waifu_schema.waifu_table_images
  SET image_url_cdn_extra_backup = $2
  WHERE image_id = $1
  RETURNING *;
`, [id, CDNurl]);

const mergeWaifuImages = async (mergeID, dupeID) => poolQuery(`
  UPDATE waifu_schema.waifu_table_images
  SET waifu_id = $1
  WHERE waifu_id = $2;
`, [mergeID, dupeID]);

const updateImage = async (updatedImage) => poolQuery(`
  UPDATE waifu_schema.waifu_table_images
  SET waifu_id = $2, image_file_path_extra = $3, image_url_path_extra = $4,
    nsfw = $5, reviewer = $6, bad_image = $7, width = $8,
    height = $9, image_url_cdn_extra = $10, image_url_cdn_extra_backup = $11,
    image_url_path_extra_mwl_backup = $12, buffer_length = $13, file_type = $14,
    date_added = $15, uploader = $16;
  WHERE image_id = $1
  RETURNING *;
`, [updatedImage.waifu_id, updatedImage.image_file_path_extra, updatedImage.image_url_path_extra,
updatedImage.nsfw, updatedImage.reviewer, updatedImage.bad_image,
updatedImage.width, updatedImage.height, updatedImage.image_url_cdn_extra, updatedImage.image_url_cdn_extra_backup,
updatedImage.image_url_path_extra_mwl_backup, updatedImage.buffer_length, updatedImage.file_type,
updatedImage.date_added, updatedImage.uploader]);

const updateImageNSFW = async (id, nsfw) => poolQuery(`
  UPDATE waifu_schema.waifu_table_images
  SET nsfw = $2
  WHERE image_id = $1
  RETURNING *;
`, [id, nsfw]);

const getWaifuImagesByNoCleanImageRandom = async () => poolQuery(`
  SELECT image_id, image_url_path_extra, nsfw, uploader
  FROM waifu_schema.waifu_table_images
  WHERE image_url_clean_path_extra is NULL
  ORDER BY random()
  LIMIT 1;
`, []);

const storeCleanWaifuImage = async (id, imageURL, _, width, height, nsfw, bufferLength, fileType) => poolQuery(`
  UPDATE waifu_schema.waifu_table_images
  SET image_url_clean_path_extra = $2, width_clean = $3, height_clean = $4,
  buffer_length_clean = $5, file_type_clean = $6
  WHERE image_id = $1
  RETURNING waifu_id, image_id, image_url_clean_path_extra, image_url_path_extra;
`, [id, imageURL, width, height, bufferLength, fileType]);

const getWaifuImagesAndInfoByID = async (id, imageID) => poolQuery(`
  SELECT id, image_id, name, url, series, image_url_path_extra, image_url_clean_path_extra
  FROM waifu_schema.waifu_table wswt
  JOIN waifu_schema.waifu_table_images wswti ON wswti.waifu_id = wswt.id
  WHERE wswt.id = $1 AND wswti.image_id = $2;
`, [id, imageID]);

const updateWaifuDiscordImageURL = async (id, imageDiscordURL) => poolQuery(`
  UPDATE waifu_schema.waifu_table_images
  SET image_url_clean_discord_path_extra = $2
  WHERE image_id = $1;
`, [id, imageDiscordURL]);

module.exports = {
  getRandomWaifuImageNonReviewed,
  getRemainingImages,
  updateWaifuImageReview,
  deleteImage,
  insertWaifuImages,
  getWaifuImagesById,
  getWaifuImageByURL,
  deleteImageByURL,
  updateWaifusCDNurl,
  storeNewImage,
  getHashFromBufferID,
  mergeWaifuImages,
  selectImage,
  selectImageByURL,
  selectAllImage,
  updateImage,
  updateImageNSFW,
  getWaifuImagesByNoCleanImageRandom,
  storeCleanWaifuImage,
  getWaifuImagesAndInfoByID,
  updateWaifuDiscordImageURL,
  getImageInfoByURL,
};
