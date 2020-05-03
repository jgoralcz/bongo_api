CREATE TABLE IF NOT EXISTS cg_buy_amiibo_table (
  id SERIAL PRIMARY KEY,
  user_guild_id varchar(65) NOT NULL REFERENCES "clientsGuildsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  guild_id varchar(32) NOT NULL,
  amiibo_id INTEGER,
  amiibo_name TEXT NOT NULL,
  favorite BOOLEAN DEFAULT FALSE
);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_buy_amiibo AS SELECT user_id AS "userId", count(amiibo_name) AS top
  FROM cg_buy_amiibo_table
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;

CREATE INDEX IF NOT EXISTS cg_user_amiibo_id_idx ON cg_buy_amiibo_table(user_id, amiibo_id);
CREATE INDEX IF NOT EXISTS cg_amiibo_name_idx ON cg_buy_amiibo_table(amiibo_name);
