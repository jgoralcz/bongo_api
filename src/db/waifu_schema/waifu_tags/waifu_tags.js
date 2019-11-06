const { poolQuery } = require('../../index');

/**
 * inserts a tag into the database.
 * @param waifuID the tag name to search for.
 * @param tagID the ID of the tag.
 * @returns {Promise<*>}
 */
const insertWaifuTag = async (waifuID, tagID) => poolQuery(`
  INSERT INTO waifu_schema.waifu_table_tags(waifu_id, tag_id)
  VALUES ($1, $2)
  ON CONFLICT (waifu_id, tag_id)
  DO NOTHING;
`, [waifuID, tagID]);

/**
 * gets all tags from based off specific tag name.
 * @param tag the tag name to search for
 * @param guildID the id of the guild.
 * @returns {Promise<*>}
 */
const getWaifusByTag = async (guildID, tag) => poolQuery(`
  SELECT distinct(wswt.id), name, series, user_id, image_url, url, description, original_name, origin
  FROM (
      SELECT tag_id
      FROM waifu_schema.waifu_table_tag_type
      WHERE tag_name ILIKE '%' || $2 || '%'
  )  wswttt
  
  LEFT JOIN waifu_schema.waifu_table_tags wswtt ON wswtt.tag_id = wswttt.tag_id 
  LEFT JOIN waifu_schema.waifu_table wswt ON wswt.id = wswtt.waifu_id
  LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = wswt.id AND cgcwt.guild_id = $1

  ORDER BY series DESC, name ASC
  LIMIT 300;
`, [guildID, tag]);

module.exports = {
  insertWaifuTag,
  getWaifusByTag,
};
