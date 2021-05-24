CREATE TABLE IF NOT EXISTS waifu_schema.character_nicknames (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL, -- REFERENCES waifu_schema.waifu_table ON UPDATE CASCADE ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  nickname_lower TEXT, -- f_unaccent(lower(nickname))
  created TIMESTAMP,
  updated TIMESTAMP,
  is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,
  
  UNIQUE (character_id, nickname)
);

create index accent_nickname_idx on waifu_schema.character_nicknames (f_unaccent(nickname));
create index accent_nickname_gin_idx on waifu_schema.character_nicknames using gin (f_unaccent(nickname) gin_trgm_ops);

create index accent_nickname_lower_idx on waifu_schema.character_nicknames (nickname_lower);
create index accent_nickname_gin_lower_idx on waifu_schema.character_nicknames using gin (nickname_lower gin_trgm_ops);

create index character_nicknames_is_spoiler ON waifu_schema.character_nicknames(is_spoiler);

CREATE OR REPLACE FUNCTION lowercase_character_nickname_on_insert() RETURNS trigger AS $lowercase_character_nickname_on_insert$
  BEGIN
    NEW.nickname_lower = f_unaccent(lower(NEW.nickname));
    RETURN NEW;
  END;
$lowercase_character_nickname_on_insert$ LANGUAGE plpgsql;

CREATE TRIGGER lowercase_character_nickname_on_insert_trigger BEFORE INSERT OR UPDATE ON waifu_schema.character_nicknames
  FOR EACH ROW EXECUTE PROCEDURE lowercase_character_nickname_on_insert();
