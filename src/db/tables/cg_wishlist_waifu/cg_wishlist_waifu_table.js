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

const removeAllCharactersWishlist = async (userID, guildID) => poolQuery(`
  DELETE
  FROM cg_wishlist_waifu_table
  WHERE user_id = $1 AND guild_id = $2;
`, [userID, guildID]);

const getWishlistWaifuUserGuild = async (userID, guildID) => poolQuery(`
  SELECT wt.name, wsst.name AS series, wt.url, cgt.waifu_id AS id, cgcwt.user_id AS "ownerID", public_wish_list
  FROM cg_wishlist_waifu_table cgt
  LEFT JOIN waifu_schema.waifu_table wt ON wt.id = cgt.waifu_id
  JOIN waifu_schema.series_table wsst ON wsst.id = wt.series_id
  
  LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.guild_id = cgt.guild_id AND cgt.waifu_id = cgcwt.waifu_id
  JOIN "clientsGuildsTable" ct ON ct.id = cgt.user_guild_id
  WHERE cgt.user_id = $1 AND cgt.guild_id = $2;
`, [userID, guildID]);

const getAllWaifusByNameWishlist = async (userID, guildID, name) => poolQuery(`
  SELECT ws.name, wsst.name AS series, ws.url, ws.id
  FROM cg_wishlist_waifu_table cgt
  JOIN waifu_schema.waifu_table ws ON wt.id = cgt.waifu_id
  JOIN waifu_schema.series_table wsst ON wsst.id = wt.series_id
  WHERE user_id = $1
    AND guild_id = $2
    AND LEFT JOIN waifu_schema.character_nicknames wscn ON wscn.character_id = ws.id
      WHERE f_unaccent(ws.name) ILIKE '%' || f_unaccent($3) || '%'
        OR levenshtein(f_unaccent(ws.name), f_unaccent($3)) <= 1
        OR f_unaccent(ws.name) ILIKE ANY (
          SELECT UNNEST(string_to_array($1 || '%', ' ')) AS name
        )
        OR f_unaccent(wscn.nickname) ILIKE '%' || f_unaccent($3) || '%'
      ORDER BY
        CASE
        WHEN f_unaccent(ws.name) ILIKE f_unaccent($3) THEN 0
        WHEN f_unaccent(wscn.nickname) ILIKE f_unaccent($3) THEN 1
        WHEN f_unaccent(ws.name) ILIKE f_unaccent($3) || '%' THEN 2
        WHEN f_unaccent(wscn.nickname) ILIKE f_unaccent($3) || '%' THEN 3
        WHEN f_unaccent(ws.name) ILIKE '%' || f_unaccent($3)  || '%' THEN 4
        WHEN f_unaccent(wscn.nickname) ILIKE '%' || f_unaccent($3) || '%' THEN 5
        WHEN levenshtein(f_unaccent(ws.name) , f_unaccent($3) ) <= 1 THEN 6
        ELSE 7 END, ws.name;
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

const removeCharactersWishlistInArray = async (guildID, usersArray) => poolQuery(`
  WITH deleted AS (
    DELETE
      FROM cg_wishlist_waifu_table
      WHERE guild_id = $1 AND user_id IN (
        SELECT UNNEST($2::varchar[]) AS user_id
      )
      RETURNING *
  ) SELECT count(*) FROM deleted;
`, [guildID, usersArray]);

const getUniqueUserCharacterWishlist = async (guildID) => poolQuery(`
  SELECT DISTINCT user_id
  FROM cg_wishlist_waifu_table
  WHERE guild_id = $1;
`, [guildID]);

module.exports = {
  addWishlistWaifuUserGuild,
  removeWishlistWaifuUserGuild,
  getWishlistWaifuUserGuild,
  getAllWaifusByNameWishlist,
  getUsersWishWaifu,
  removeAllCharactersWishlist,
  removeCharactersWishlistInArray,
  getUniqueUserCharacterWishlist,
};
