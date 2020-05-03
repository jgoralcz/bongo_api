CREATE TABLE IF NOT EXISTS cg_wishlist_series_table (
  id SERIAL PRIMARY KEY,
  guild_user_id varchar(65) NOT NULL REFERENCES "clientsGuildsTable" ON UPDATE CASCADE,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON UPDATE CASCADE,
  guild_id varchar(32) NOT NULL REFERENCES "guildsTable" ON UPDATE CASCADE,
  series_id INTEGER NOT NULL REFERENCES waifu_schema.series_table ON UPDATE CASCADE,

  UNIQUE (user_guild_id, series_id),
  UNIQUE (user_id, guild_id, series_id)
);
