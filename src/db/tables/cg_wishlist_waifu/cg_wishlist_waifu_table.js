const { poolQuery } = require('../../index.js');

/**
 * adds the waifu to the user's wish list.
 * @param userID the user's id.
 * @param guildID the guild's id.
 * @param waifuID the waifu id.
 * @returns {Promise<*>}
 */
const addWishlistWaifuUserGuild = async (userID, guildID, waifuID) => poolQuery(`
  INSERT INTO cg_wishlist_waifu_table (user_guild_id, user_id, guild_id, waifu_id)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (user_guild_id, waifu_id)
  DO NOTHING;
`, [`${guildID}-${userID}`, userID, guildID, waifuID]);

/**
 * removes the waifu from the user's wish list.
 * @param userID the user's id.
 * @param guildID the guild's id.
 * @param waifuID the waifu id.
 * @returns {Promise<*>}
 */
const removeWishlistWaifuUserGuild = async (userID, guildID, waifuID) => poolQuery(`
  DELETE
  FROM cg_wishlist_waifu_table
  WHERE user_guild_id = $1 AND waifu_id = $2;
`, [`${guildID}-${userID}`, waifuID]);

/**
 * gets the waifus from the user's list and adds the names next to the ones that have claimed.
 * @param userID the user's id.
 * @param guildID the guild's id.
 * @returns {Promise<*>}
 */
const getWishlistWaifuUserGuild = async (userID, guildID) => poolQuery(`
  SELECT name, series, url, cgt.waifu_id AS id, cgcwt.user_id AS "ownerID", public_wish_list
  FROM cg_wishlist_waifu_table cgt
  LEFT JOIN waifu_schema.waifu_table wt ON wt.id = cgt.waifu_id
  
  LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.guild_id = cgt.guild_id AND cgt.waifu_id = cgcwt.waifu_id
  JOIN "clientsGuildsTable" ct ON ct.id = cgt.user_guild_id
  WHERE cgt.user_id = $1 AND cgt.guild_id = $2;
`, [userID, guildID]);

/**
 * gets all waifus by name from their wish list.
 * @param userID the user's id.
 * @param guildID the guild's id
 * @param name the waifu's name.
 * @returns {Promise<void>}
 */
const getAllWaifusByNameWishlist = async (userID, guildID, name) => poolQuery(`
  SELECT name, series, url, waifu_id AS id
  FROM cg_wishlist_waifu_table cgt
  JOIN waifu_schema.waifu_table wt ON wt.id = cgt.waifu_id
  WHERE user_guild_id = $1 AND name ILIKE '%' || $2 || '%';
`, [`${guildID}-${userID}`, name]);

/**
 * gets all waifus or series this user wants
 * @param guildID the guild's id
 * @param waifuID the waifu's id
 * @returns {Promise<void>}
 */
const getUsersWishWaifu = async (guildID, waifuID) => poolQuery(`
  SELECT user_id, public_wish_list AS public
  FROM (
    SELECT user_id, guild_id
    FROM cg_wishlist_waifu_table
    WHERE guild_id = $1 AND waifu_id = $2
  ) cg
  JOIN "clientsGuildsTable" cgt ON cgt."userId" = cg.user_id AND cgt."guildId" = $1;
`, [guildID, waifuID]);


module.exports = {
  addWishlistWaifuUserGuild,
  removeWishlistWaifuUserGuild,
  getWishlistWaifuUserGuild,
  getAllWaifusByNameWishlist,
  getUsersWishWaifu,
};
