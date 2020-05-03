CREATE TABLE IF NOT EXISTS waifu_schema.appears_in (
  waifu_id INTEGER NOT NULL,
  series_id INTEGER NOT NULL,

  PRIMARY KEY (waifu_id, series_id),

  FOREIGN KEY (waifu_id) REFERENCES waifu_schema.waifu_table ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (series_id) REFERENCES waifu_schema.series_table ON DELETE CASCADE ON UPDATE CASCADE
);
