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
  -- buffer bytea, 
  width real,
  height real,
);

create index name_trgm_idx ON waifu_schema.series_table using gist (name gist_trgm_ops);
create index alternate_name_trgm_idx ON waifu_schema.series_table using gist (alternate_name gist_trgm_ops);
create index accent_series_idx on waifu_schema.series_table (f_unaccent(name));
create index accent_series_gin_idx on waifu_schema.series_table using gin (f_unaccent(name) gin_trgm_ops);
