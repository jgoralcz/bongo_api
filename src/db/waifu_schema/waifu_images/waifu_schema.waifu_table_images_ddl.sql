CREATE TABLE IF NOT EXISTS waifu_schema.waifu_table_images (
  image_id SERIAL PRIMARY KEY,
  waifu_id INTEGER,
  image_file_path_extra TEXT UNIQUE NOT NULL,
  image_url_path_extra TEXT UNIQUE NOT NULL,
  nsfw BOOLEAN,
  reviewer TEXT,
  bad_image BOOLEAN,
  buffer BYTEA,
  width REAL,
  height REAL,
  image_url_cdn_extra TEXT,
  image_url_cdn_extra_backup TEXT,
  image_url_path_extra_mwl_backup TEXT,
  buffer_length BIGINT,
  file_type TEXT,
  date_added TIMESTAMP now(),
  uploader TEXT,

  FOREIGN KEY (waifu_id) REFERENCES waifu_table ON DELETE CASCADE ON UPDATE CASCADE
);

-- update waifu_schema.waifu_table_images set image_url_path_extra = image_url_cdn_extra_backup where image_url_cdn_extra_backup is not null and image_url_path_extra ilike '%mywaifulist%';
