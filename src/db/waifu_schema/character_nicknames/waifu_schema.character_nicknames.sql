CREATE TABLE IF NOT EXISTS waifu_schema.character_nicknames (
  id SERIAL PRIMARY KEY,
  character_id INTEGER,
  nickname TEXT UNIQUE NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW(),
  updated TIMESTAMP
);

create index accent_nickname_idx on waifu_schema.character_nicknames (f_unaccent(nickname));
create index accent_nickname_gin_idx on waifu_schema.character_nicknames using gin (f_unaccent(nickname) gin_trgm_ops);
