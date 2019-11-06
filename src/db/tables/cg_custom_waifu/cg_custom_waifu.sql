CREATE TABLE IF NOT EXISTS cg_custom_waifu_table (
  id SERIAL PRIMARY KEY,
  guild_user_id varchar(65) NOT NULL REFERENCES "clientsGuildsTable" ON UPDATE CASCADE,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON UPDATE CASCADE,
  guild_id varchar(32) NOT NULL REFERENCES "guildsTable" ON UPDATE CASCADE,
  waifu_id INTEGER,
  favorite BOOLEAN DEFAULT FALSE,
  date timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cg_custom_waifu_table_waifu_id_guild_id ON cg_custom_waifu_table(user_id, guild_id, waifu_id);
CREATE INDEX IF NOT EXISTS idx_cg_custom_waifu_table_waifu_id_guild_id ON cg_custom_waifu_table(waifu_id, guild_id);
CREATE INDEX IF NOT EXISTS idx_cg_custom_guild_id ON cg_custom_waifu_table(guild_id);
CREATE INDEX IF NOT EXISTS idx_cg_custom_guild_id_user_id ON cg_custom_waifu_table(user_id, guild_id);
