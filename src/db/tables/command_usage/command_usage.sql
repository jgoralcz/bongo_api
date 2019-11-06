CREATE TABLE IF NOT EXISTS command_usage (
  id SERIAL PRIMARY KEY,
  guild_id varchar(32) REFERENCES "guildsTable"("guildId") ON UPDATE CASCADE ON DELETE CASCADE,
  user_id varchar(32) REFERENCES "clientsTable"("userId") ON UPDATE CASCADE ON DELETE CASCADE,
  channel_id varchar(32) NOT NULL,
  shard_id INTEGER NOT NULL,
  command_name TEXT NOT NULL,
  date timestamp NOT NULL DEFAULT now()
);
