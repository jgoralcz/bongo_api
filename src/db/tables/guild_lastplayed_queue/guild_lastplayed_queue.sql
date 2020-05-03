CREATE TABLE IF NOT EXISTS guild_lastplayed_queue (
  guild_id varchar(32) NOT NULL REFERENCES "guildsTable"("guildId"),
  track JSON NOT NULL,
  date_added timestamp NOT NULL DEFAULT now()
);
create index idx_last_played_date_added on guild_lastplayed_queue(date_added);
