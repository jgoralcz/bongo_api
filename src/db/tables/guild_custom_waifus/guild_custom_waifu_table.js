const { poolQuery } = require('../../index.js');

/**
 * calculates all the custom waifus for this server
 * @returns {Promise<Promise<*>|*>}
 */
const checkCustomWaifuCount = async guildID => poolQuery(`
  SELECT count(*)
  FROM guild_custom_waifus
  WHERE guild_id = $1;
`, [guildID]);

/**
 * calculates all the custom waifus for this server
 * @param guildID the guild's ID.
 * @param name the name to search for.
 * @returns {Promise<Promise<*>|*>}
 */
const countCustomWaifusByName = async (guildID, name) => poolQuery(`
  SELECT count(*)
  FROM guild_custom_waifus
  WHERE guild_id = $1 AND (name ILIKE '%' || $2 || '%' OR levenshtein(name, $2) <= 3);
`, [guildID, name]);


/**
 * adds the custom waifu to the database.
 * @param guildID the guild's id.
 * @param userID the user's id.
 * @param name the user's name.
 * @param series the user's series.
 * @param url the url to find.
 * @param image the user's image.
 * @param isHusbando is the character a male?
 * @param isNSFW is the character nsfw?
 * @returns {Promise<Promise<*>|*>}
 */
const addCustomWaifu = async (guildID, userID, name, series, url, image, isHusbando, isNSFW) => poolQuery(`
  INSERT INTO guild_custom_waifus (guild_id, user_id, name, series, url, image_url, is_husbando, is_nsfw)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
`, [guildID, userID, name, series, url, image, isHusbando, isNSFW]);

/**
 * gets all custom waifus by the series name.
 * Then checks the guild id if available
 * @param waifuSeries the series to search for.
 * @param guildID the guild's id.
 * @returns {Promise<*>}
 */
const getAllCustomWaifusBySeries = async (waifuSeries, guildID) => poolQuery(`
  SELECT name, series, user_id, url, image_url, ws.id
  FROM (
    SELECT name, series, image_url, url, id
    FROM guild_custom_waifus
    WHERE guild_id = $2 AND (series ILIKE '%' || $1 || '%' OR levenshtein(series, $1) <= 3)
  ) ws
  LEFT JOIN cg_custom_waifu_table cg ON cg.waifu_id = ws.id AND guild_id = $2
  ORDER BY series DESC, name ASC
  LIMIT 100;
`, [waifuSeries, guildID]);

/**
 * updates the custom waifu to the database.
 * @param waifuID the waifu's ID.
 * @param userID the user's id who updated.
 * @param name the user's name.
 * @param series the user's series.
 * @param image the user's image.
 * @param isHusbando is the character a male?
 * @param isNSFW is the character nsfw?
 * @returns {Promise<Promise<*>|*>}
 */
const updateCustomWaifu = async (waifuID, userID, name, series, image, isHusbando, isNSFW) => poolQuery(`
  UPDATE guild_custom_waifus
  SET user_id = $2, name = $3, series = $4, image_url = $5, is_husbando = $6, is_nsfw = $7
  WHERE id = $1;
`, [waifuID, userID, name, series, image, isHusbando, isNSFW]);


/**
 * removes a custom waifu
 * @param guildID the guild's id.
 * @param waifuID the waifu's id.
 * @returns {Promise<Promise<*>|*>}
 */
const removeCustomWaifu = async (guildID, waifuID) => poolQuery(`
  DELETE
  FROM guild_custom_waifus
  WHERE guild_id = $1 AND id = $2;
`, [guildID, waifuID]);

/**
 * searches custom waifu by name
 * @param guildID the guild's id.
 * @param name the user's name.
 * @param limit the limit to allow.
 * @param offset the offset to allow.
 * @returns {Promise<Promise<*>|*>}
 */
const searchCustomWaifusByName = async (guildID, name, limit, offset) => poolQuery(`
  SELECT cgwt.guild_id, cgwt.user_id AS "ownerID", name, t1.url,
  series, t1.user_id AS user_id, image_url, is_husbando, is_nsfw, date_added, t1.id
  FROM (
    SELECT *
    FROM guild_custom_waifus
    WHERE guild_id = $1 AND (name ILIKE '%' || $2 || '%' OR levenshtein(name, $2) <= 3)
    ORDER BY series, name DESC
    LIMIT $3 OFFSET $4
  ) t1
  LEFT JOIN cg_custom_waifu_table cgwt ON cgwt.waifu_id = t1.id AND cgwt.guild_id = t1.guild_id
  LIMIT $3;
`, [guildID, name, limit, offset]);

/**
 * searches custom waifu by name
 * @param guildID the guild's id.
 * @param limit the limit to allow.
 * @param offset the offset to allow.
 * @returns {Promise<Promise<*>|*>}
 */
const getAllCustomWaifusByPage = async (guildID, limit, offset) => poolQuery(`
  SELECT cgwt.guild_id, cgwt.user_id AS "ownerID", name, t1.url, 
  series, t1.user_id AS user_id, image_url, is_husbando, is_nsfw, date_added, t1.id
  FROM (
    SELECT name, url, series, user_id, guild_id,
      image_url, is_husbando, is_nsfw, date_added, id
    FROM guild_custom_waifus
    WHERE guild_id = $1
    ORDER BY series, name DESC
    LIMIT $2 OFFSET $3
  ) t1
  LEFT JOIN cg_custom_waifu_table cgwt ON cgwt.waifu_id = t1.id AND cgwt.guild_id = t1.guild_id
`, [guildID, limit, offset]);


/**
 * gets all waifus by the requested name.
 * Then checks the guild id if available.
 * @param waifuName the waifu's name
 * @param guildID the guild's id.
 * @param limit the number to limit
 * @returns {Promise<*>}
 */
const getAllCustomWaifusByName = async (waifuName, guildID, limit = 100) => poolQuery(`
  SELECT name, series, cgwt.user_id, image_url, gcw.id, gcw.guild_id, gcw.url
  FROM (
    SELECT name, series, image_url, id, guild_id, url
    FROM guild_custom_waifus ws
    WHERE guild_id = $2 AND (name ILIKE '%' || $1 || '%' OR levenshtein(name, $1) <= 3)
  ) gcw
  LEFT JOIN cg_custom_waifu_table cgwt ON cgwt.waifu_id = gcw.id AND cgwt.guild_id = gcw.guild_id
  ORDER BY
    CASE
    WHEN gcw.name ILIKE $1 THEN 0
    WHEN gcw.name ILIKE $1 || '%' THEN 1
    WHEN gcw.name ILIKE '%' || $1 || '%' THEN 2
    WHEN levenshtein(gcw.name, $1) <= 3 THEN 3
    WHEN gcw.name ILIKE '%' || $1 || '%' THEN 4
    ELSE 8 END, gcw.name
  LIMIT $3;
`, [waifuName, guildID, limit]);

const getCustomWaifuCount = async (guildID) => poolQuery(`
  SELECT count(*) AS count
  FROM guild_custom_waifus
  WHERE guild_id = $1;
`, [guildID]);


module.exports = {
  checkCustomWaifuCount,
  addCustomWaifu,
  removeCustomWaifu,
  searchCustomWaifusByName,
  countCustomWaifusByName,
  getAllCustomWaifusByPage,
  updateCustomWaifu,
  getAllCustomWaifusBySeries,
  getAllCustomWaifusByName,
  getCustomWaifuCount,
};
