CREATE TABLE IF NOT EXISTS waifu_schema.series_nicknames (
  id SERIAL PRIMARY KEY,
  series_id INTEGER NOT NULL REFERENCES waifu_schema.series_table ON UPDATE CASCADE ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP,
  
  UNIQUE (series_id, nickname)
);

CREATE INDEX accent_series_nickname_idx on waifu_schema.series_nicknames (f_unaccent(nickname));
CREATE INDEX accent_series_nickname_gin_idx on waifu_schema.series_nicknames using gin (f_unaccent(nickname) gin_trgm_ops);
