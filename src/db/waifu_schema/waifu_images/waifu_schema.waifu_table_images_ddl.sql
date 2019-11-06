CREATE TABLE IF NOT EXISTS waifu_schema.waifu_table_images (
  image_id SERIAL PRIMARY KEY,
  waifu_id INTEGER,
  image_file_path_extra TEXT UNIQUE NOT NULL,
  image_url_path_extra TEXT UNIQUE NOT NULL,
  nsfw boolean,
  reviewer TEXT,
  bad_image boolean,
  buffer bytea,
  width real,
  height real,

  FOREIGN KEY (waifu_id) REFERENCES waifu_table ON DELETE CASCADE ON UPDATE CASCADE
);
