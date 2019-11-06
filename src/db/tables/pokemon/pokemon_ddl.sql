CREATE TABLE IF NOT EXISTS cg_buy_pokemon_table (
  id SERIAL PRIMARY KEY,
  user_guild_id varchar(65) NOT NULL REFERENCES "clientsGuildsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  guild_id varchar(32),
  pokemon_id INTEGER,
  pokemon_name TEXT NOT NULL,
  favorite BOOLEAN DEFAULT FALSE
);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_pokemon AS SELECT user_id AS "userId", count(pokemon_name) AS top
  FROM cg_buy_pokemon_table
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;
