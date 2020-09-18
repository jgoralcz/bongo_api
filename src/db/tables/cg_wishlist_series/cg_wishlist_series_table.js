const { poolQuery } = require('../../index.js');

const addWishlistSeriesUserGuild = async (userID, guildID, seriesID) => poolQuery(`
  INSERT INTO cg_wishlist_series_table (user_guild_id, user_id, guild_id, series_id)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (user_guild_id, series_id)
  DO NOTHING;
`, [`${guildID}-${userID}`, userID, guildID, seriesID]);

const getWishlistSeriesUserGuild = async (userID, guildID) => poolQuery(`
  SELECT name, url, series_id, public_wish_list, image_url
  FROM (
    SELECT series_id, user_guild_id
    FROM cg_wishlist_series_table cgt
    WHERE user_id = $1 AND guild_id = $2
  ) cgt
  JOIN waifu_schema.series_table st ON cgt.series_id = st.id
  JOIN "clientsGuildsTable" ct ON ct.id = cgt.user_guild_id;
`, [userID, guildID]);

const getAllSeriesByNameWishlist = async (userID, guildID, name) => poolQuery(`
  SELECT name, url, series_id, public_wish_list, image_url
  FROM (
    SELECT series_id, user_guild_id
    FROM cg_wishlist_series_table cgt
    WHERE user_id = $1 AND guild_id = $2
  ) cgt
   JOIN waifu_schema.series_table st ON cgt.series_id = st.id
   JOIN "clientsGuildsTable" ct ON ct.id = cgt.user_guild_id
   WHERE name ILIKE '%' || $3 || '%';
`, [userID, guildID, name]);

const removeWishlistSeriesUserGuild = async (userID, guildID, seriesID) => poolQuery(`
  DELETE 
  FROM cg_wishlist_series_table
  WHERE user_id = $1 AND guild_id = $2 AND series_id = $3;
`, [userID, guildID, seriesID]);

const removeAllSeriesWishlist = async (userID, guildID) => poolQuery(`
  DELETE
  FROM cg_wishlist_series_table
  WHERE user_id = $1 AND guild_id = $2;
`, [userID, guildID]);

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
  removeAllSeriesWishlist,
};
