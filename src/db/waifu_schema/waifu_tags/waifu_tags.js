const { poolQuery } = require('../../index');

const insertWaifuTag = async (waifuID, tagID) => poolQuery(`
  INSERT INTO waifu_schema.waifu_table_tags(waifu_id, tag_id)
  VALUES ($1, $2)
  ON CONFLICT (waifu_id, tag_id)
  DO NOTHING;
`, [waifuID, tagID]);

module.exports = {
  insertWaifuTag,
};
