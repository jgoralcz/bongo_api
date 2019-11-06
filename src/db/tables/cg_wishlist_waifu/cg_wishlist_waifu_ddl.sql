CREATE TABLE IF NOT EXISTS cg_wishlist_waifu_table (
  id SERIAL PRIMARY KEY,
  user_guild_id varchar(65) NOT NULL REFERENCES "clientsGuildsTable" ON UPDATE CASCADE,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON UPDATE CASCADE,
  guild_id varchar(32) NOT NULL REFERENCES "guildsTable" ON UPDATE CASCADE,
  waifu_id INTEGER NOT NULL REFERENCES waifu_schema.waifu_table ON UPDATE CASCADE ON DELETE CASCADE,

  UNIQUE (user_guild_id, waifu_id),
  UNIQUE (user_id, guild_id, waifu_id)
);
