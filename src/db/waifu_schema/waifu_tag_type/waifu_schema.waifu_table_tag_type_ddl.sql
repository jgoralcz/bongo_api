CREATE TABLE IF NOT EXISTS waifu_schema.waifu_table_tag_type (
  tag_id SERIAL PRIMARY KEY,
  tag_name TEXT NOT NULL,

  UNIQUE (tag_name)
);
