CREATE TABLE IF NOT EXISTS waifu_schema.waifu_table_images (
  image_id SERIAL PRIMARY KEY,
  waifu_id INTEGER,
  image_file_path_extra TEXT UNIQUE NOT NULL,
  image_url_path_extra TEXT UNIQUE NOT NULL,
  nsfw BOOLEAN,
  reviewer TEXT,
  bad_image BOOLEAN,
  width REAL,
  height REAL,
  image_url_cdn_extra TEXT,
  image_url_cdn_extra_backup TEXT,
  image_url_path_extra_mwl_backup TEXT,
  buffer_length BIGINT,
  file_type TEXT,
  date_added TIMESTAMP now(),
  uploader TEXT,
  image_url_clean_path_extra varchar(256),
  width_clean SMALLINT,
  height_clean SMALLINT,
  buffer_length_clean INTEGER,
  file_type_clean varchar(16),
  image_url_clean_discord_path_extra varchar(256)

  FOREIGN KEY (waifu_id) REFERENCES waifu_table ON DELETE CASCADE ON UPDATE CASCADE
);
