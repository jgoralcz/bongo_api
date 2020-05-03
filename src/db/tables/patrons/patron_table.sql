CREATE TABLE IF NOT EXISTS patron_table (
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  guild_id varchar(32),
  patron_id INTEGER NOT NULL REFERENCES patron_ranks ON DELETE CASCADE ON UPDATE CASCADE,
  date timestamp NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, guild_id, patron_id, date)
);
