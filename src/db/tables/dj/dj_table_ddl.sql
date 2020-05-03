CREATE TABLE IF NOT EXISTS dj_table (
  id SERIAL PRIMARY KEY,
  giver_user_id varchar(32) NOT NULL REFERENCES "clientsTable"("userId") ON UPDATE CASCADE,
  giver_guild_id varchar(32) NOT NULL REFERENCES "guildsTable"("guildId") ON UPDATE CASCADE,
  giver_guild_user_id varchar(65) NOT NULL REFERENCES "clientsGuildsTable"(id) ON UPDATE CASCADE,
  dj_user_id varchar(32) NOT NULL,
  dj_guild_id varchar(32) NOT NULL REFERENCES "guildsTable"("guildId") ON UPDATE CASCADE,
  dj_guild_user_id varchar(65) NOT NULL,
  date timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_giver_user_guild_id ON dj_table(giver_user_id, giver_guild_id);
CREATE INDEX IF NOT EXISTS idx_giver_guild_user_id ON dj_table(giver_guild_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_dj_user_guild_id ON dj_table(dj_user_id, dj_guild_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_dj_guild_user_id ON dj_table(dj_guild_user_id);
