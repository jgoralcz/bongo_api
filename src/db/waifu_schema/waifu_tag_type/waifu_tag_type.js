const { poolQuery } = require('../../index');

/**
 * inserts a tag type to the waifu.
 * @param tagName the tag name.
 * @returns {Promise<*>}
 */
const insertWaifuTagType = async tagName => poolQuery(`
    INSERT INTO waifu_schema.waifu_table_tag_type(tag_name)
    VALUES ($1)
    ON CONFLICT (tag_name)
    DO NOTHING;
`, [tagName]);

/**
 * search for a tag by the name
 * @param tagName the tag's name.
 * @returns {Promise<*>}
 */
const getTagByName = async tagName => poolQuery(`
  SELECT tag_id
  FROM waifu_schema.waifu_table_tag_type
  WHERE tag_name = $1;
`, [tagName]);


module.exports = {
  insertWaifuTagType,
  getTagByName,
};
