CREATE TABLE IF NOT EXISTS guild_custom_waifus (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(32) REFERENCES "guildsTable"("guildId"),
  user_id VARCHAR(32) REFERENCES "clientsTable"("userId"),
  name varchar(256) NOT NULL,
  series varchar(256) NOT NULL,
  url TEXT,
  image_url TEXT NOT NULL,
  is_husbando BOOLEAN NOT NULL DEFAULT FALSE,
  is_nsfw BOOLEAN NOT NULL DEFAULT FALSE,
  date_added TIMESTAMP NOT NULL DEFAULT NOW()
);


create index custom_accent_name_idx on guild_custom_waifus (f_unaccent(name));
create index custom_accent_name_gin_idx on guild_custom_waifus using gin (f_unaccent(name) gin_trgm_ops);
