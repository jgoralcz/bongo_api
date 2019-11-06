const { poolQuery } = require('../../index.js');

/**
 * adds the waifu to the user's wish list.
 * @param userID the user's id.
 * @param guildID the guild's id.
 * @param seriesID the series id.
 * @returns {Promise<*>}
 */
const addWishlistSeriesUserGuild = async (userID, guildID, seriesID) => poolQuery(`
  INSERT INTO cg_wishlist_series_table (user_guild_id, user_id, guild_id, series_id)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (user_guild_id, series_id)
  DO NOTHING;
`, [`${guildID}-${userID}`, userID, guildID, seriesID]);

/**
 * gets the users wishlist series
 * @param userID the user's id.
 * @param guildID the guild's id.
 * @returns {Promise<*>}
 */
const getWishlistSeriesUserGuild = async (userID, guildID) => poolQuery(`
  SELECT name, url, series_id, public_wish_list, image_url
  FROM (
    SELECT series_id, user_guild_id
    FROM cg_wishlist_series_table cgt
    WHERE user_guild_id = $1
  ) cgt
  JOIN waifu_schema.series_table st ON cgt.series_id = st.id
  JOIN "clientsGuildsTable" ct ON ct.id = cgt.user_guild_id
  LIMIT 5;
`, [`${guildID}-${userID}`]);

/**
 * gets all series by name from their wish list.
 * @param userID the user's id.
 * @param guildID the guild's id
 * @param name the series name.
 * @returns {Promise<void>}
 */
const getAllSeriesByNameWishlist = async (userID, guildID, name) => poolQuery(`
  SELECT name, url, series_id, public_wish_list, image_url
  FROM (
    SELECT series_id, user_guild_id
    FROM cg_wishlist_series_table cgt
    WHERE user_guild_id = $1
  ) cgt
   JOIN waifu_schema.series_table st ON cgt.series_id = st.id
   JOIN "clientsGuildsTable" ct ON ct.id = cgt.user_guild_id
   WHERE name ILIKE '%' || $2 || '%';
`, [`${guildID}-${userID}`, name]);

/**
 * removes the users from the user's wish list.
 * @param userID the user's id.
 * @param guildID the guild's id.
 * @param seriesID the series id.
 * @returns {Promise<*>}
 */
const removeWishlistSeriesUserGuild = async (userID, guildID, seriesID) => poolQuery(`
  DELETE 
  FROM cg_wishlist_series_table
  WHERE user_id = $1 AND guild_id = $2 AND series_id = $3;
`, [userID, guildID, seriesID]);

/**
 * gets all waifus or series this user wants
 * @param guildID the guild's id
 * @param seriesID the series id
 * @returns {Promise<void>}
 */
const getUsersWishSeries = async (guildID, seriesID) => poolQuery(`
  SELECT user_id, public_wish_list AS public
    FROM (
      SELECT user_id, guild_id
      FROM cg_wishlist_series_table
      WHERE guild_id = $1 AND series_id = $2
    ) cg
  JOIN "clientsGuildsTable" cgt ON cgt."userId" = cg.user_id AND cgt."guildId" = $1;
`, [guildID, seriesID]);

module.exports = {
  addWishlistSeriesUserGuild,
  getWishlistSeriesUserGuild,
  removeWishlistSeriesUserGuild,
  getUsersWishSeries,
  getAllSeriesByNameWishlist,
};
