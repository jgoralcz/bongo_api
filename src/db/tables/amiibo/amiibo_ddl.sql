CREATE TABLE IF NOT EXISTS amiibo.amiibo_table (
  id SERIAL PRIMARY KEY,
  character TEXT NOT NULL,
  name TEXT NOT NULL,
  amiibo_series TEXT NOT NULL,
  game_series TEXT NOT NULL,
  head TEXT,
  tail TEXT,
  release_au timestamp,
  release_eu timestamp,
  release_jp timestamp,
  release_na timestamp,
  type TEXT,
  image_url TEXT NOT NULL,
  image_file_path TEXT NOT NULL,

  UNIQUE (image_url),
  UNIQUE (name, amiibo_series, game_series, head, tail, release_au, release_eu, release_jp, type)
)
