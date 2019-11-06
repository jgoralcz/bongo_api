CREATE TABLE IF NOT EXISTS waifu_schema.waifu_table_tags (
  waifu_id INTEGER,
  tag_id INTEGER,

  PRIMARY KEY (waifu_id, tag_id),

  FOREIGN KEY (tag_id) REFERENCES waifu_table_tag_type ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (waifu_id) REFERENCES waifu_table ON DELETE CASCADE ON UPDATE CASCADE
);
