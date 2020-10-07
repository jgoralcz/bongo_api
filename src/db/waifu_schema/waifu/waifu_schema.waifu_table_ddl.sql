CREATE TABLE IF NOT EXISTS waifu_schema.waifu_table (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  series TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_file_path TEXT NOT NULL,
  url TEXT NOT NULL,
  origin TEXT,
  original_name TEXT,
  romaji_name TEXT,
  age SMALLINT,
  date_of_birth DATE,
  hip_cm REAL,
  waist_cm REAL,
  bust_cm REAL,
  weight_kg REAL,
  height_cm REAL,
  blood_type TEXT,
  likes INTEGER,
  dislikes INTEGER,
  husbando BOOLEAN,
  nsfw BOOLEAN,
  date_added DATE,
  image_url_cdn TEXT,
  western BOOLEAN,
  reviewer TEXT,
  game TEXT,
  unknown_gender BOOLEAN,
  nsfw_image BOOLEAN DEFAULT FALSE,
  file_type TEXT,
  image_url_clean varchar(256),
  width_clean SMALLINT,
  height_clean SMALLINT,
  buffer_length_clean INTEGER,
  file_type_clean varchar(16),
  image_url_clean_discord varchar(256),

  UNIQUE (name, series),
  UNIQUE (url)
);


-- refresh every minute
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_character_count AS
  SELECT count(*) AS count
  FROM waifu_schema.waifu_table;
