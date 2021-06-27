CREATE TABLE IF NOT EXISTS waifu_schema.series_appears_in_series (
  id SERIAL PRIMARY KEY,
  series_id INTEGER NOT NULL,
  series_appears_in_id INTEGER NOT NULL,

  UNIQUE (series_id, series_appears_in_id),

  FOREIGN KEY (series_id) REFERENCES waifu_schema.series_table ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (series_appears_in_id) REFERENCES waifu_schema.series_table ON DELETE CASCADE ON UPDATE CASCADE
);
