CREATE TABLE IF NOT EXISTS patron_table (
  id SERIAL PRIMARY KEY,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  guild_id varchar(32),
  date timestamp NOT NULL DEFAULT now(),
);
