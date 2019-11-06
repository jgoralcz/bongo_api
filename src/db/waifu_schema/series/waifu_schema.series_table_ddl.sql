CREATE TABLE IF NOT EXISTS waifu_schema.series_table (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  alternate_name TEXT,
  description TEXT,
  image_url TEXT UNIQUE,
  image_file_path TEXT UNIQUE,
  url TEXT UNIQUE,
  release_date DATE,
  date_added DATE
  buffer bytea, 
  width real,
  height real,
);
