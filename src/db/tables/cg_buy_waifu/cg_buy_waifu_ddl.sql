CREATE TABLE IF NOT EXISTS cg_buy_waifu_table (
  id SERIAL PRIMARY KEY,
  user_guild_id varchar(65) NOT NULL REFERENCES "clientsGuildsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  guild_id varchar(32) NOT NULL,
  waifu_id INTEGER NOT NULL REFERENCES waifu_schema.waifu_table ON DELETE CASCADE ON UPDATE CASCADE,
  waifu_name TEXT NOT NULL,
  favorite BOOLEAN DEFAULT FALSE
);


CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_buy_waifu AS SELECT user_id AS "userId", count(waifu_name) AS top
FROM cg_buy_waifu_table
GROUP BY "userId"
ORDER BY top DESC
LIMIT 20;


-- we need to store the waifu_name as well because there's a special case they may want to
-- buy a waifu that doesn't exist in our database.
