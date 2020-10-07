CREATE TABLE IF NOT EXISTS guild_rolled (
  id SERIAL PRIMARY KEY,
  guild_id varchar(32) NOT NULL REFERENCES "guildsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  character_id INTEGER NOT NULL REFERENCES waifu_schema.waifu_table ON DELETE CASCADE ON UPDATE CASCADE,
  date_rolled timestamp DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_date_rolled ON guild_rolled(date_rolled);
CREATE INDEX IF NOT EXISTS idx_guild_rolled ON guild_rolled(guild_id);
