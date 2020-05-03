const { poolQuery } = require('../../index.js');

const addWishlistWaifuUserGuild = async (userID, guildID, waifuID) => poolQuery(`
  INSERT INTO cg_wishlist_waifu_table (user_guild_id, user_id, guild_id, waifu_id)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (user_guild_id, waifu_id)
  DO NOTHING;
`, [`${guildID}-${userID}`, userID, guildID, waifuID]);

const removeWishlistWaifuUserGuild = async (userID, guildID, waifuID) => poolQuery(`
  DELETE
  FROM cg_wishlist_waifu_table
  WHERE user_id = $1 AND guild_id = $2 AND waifu_id = $3;
`, [userID, guildID, waifuID]);

const getWishlistWaifuUserGuild = async (userID, guildID) => poolQuery(`
  SELECT name, series, url, cgt.waifu_id AS id, cgcwt.user_id AS "ownerID", public_wish_list
  FROM cg_wishlist_waifu_table cgt
  LEFT JOIN waifu_schema.waifu_table wt ON wt.id = cgt.waifu_id
  
  LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.guild_id = cgt.guild_id AND cgt.waifu_id = cgcwt.waifu_id
  JOIN "clientsGuildsTable" ct ON ct.id = cgt.user_guild_id
  WHERE cgt.user_id = $1 AND cgt.guild_id = $2;
`, [userID, guildID]);

const getAllWaifusByNameWishlist = async (userID, guildID, name) => poolQuery(`
  SELECT name, series, url, waifu_id AS id
  FROM cg_wishlist_waifu_table cgt
  JOIN waifu_schema.waifu_table wt ON wt.id = cgt.waifu_id
  WHERE user_id = $1 AND guild_id = $2 AND name ILIKE '%' || $3 || '%';
`, [userID, guildID, name]);

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
