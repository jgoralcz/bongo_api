-- noinspection SqlNoDataSourceInspectionForFile

CREATE TABLE IF NOT EXISTS "guildsTable" (
  "guildId" varchar(32) PRIMARY KEY NOT NULL,
  "prefixForAllEnable" BOOLEAN NOT NULL DEFAULT TRUE,
  "guildPrefix" varchar(11) NOT NULL DEFAULT 'b.',
  "maxVolume" SMALLINT NOT NULL DEFAULT 500,
  "voteSkip" SMALLINT NOT NULL DEFAULT 50,
  auto_now_play BOOLEAN NOT NULL DEFAULT FALSE,
  show_skips BOOLEAN NOT NULL DEFAULT TRUE,
  max_songs_per_user SMALLINT NOT NULL DEFAULT 1000,
  patron_one BOOLEAN NOT NULL DEFAULT FALSE,
  patron_two BOOLEAN NOT NULL DEFAULT FALSE,
  claim_seconds SMALLINT NOT NULL DEFAULT 120,
  unlimited_claims BOOLEAN NOT NULL DEFAULT FALSE,
  roll_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  shuffle_index SMALLINT NOT NULL DEFAULT 0,
  seek INTEGER NOT NULL DEFAULT 0,
  volume NUMERIC NOT NULL DEFAULT 0,
  loop varchar(3) NOT NULL default 'off',
  shuffle BOOLEAN NOT NULL DEFAULT FALSE,
  bass_boost NUMERIC NOT NULL DEFAULT 0,
  auto_timeout BOOLEAN NOT NULL DEFAULT FALSE,
  autoplay BOOLEAN NOT NULL DEFAULT FALSE,
  roll_claim_minute SMALLINT NOT NULL DEFAULT 0,
  wait_minutes SMALLINT NOT NULL DEFAULT 0,
  dj_only BOOLEAN NOT NULL DEFAULT FALSE,
  buy_rolls BOOLEAN NOT NULL DEFAULT TRUE,
  buy_claims BOOLEAN NOT NULL DEFAULT FALSE,
  "severQueue" json[],
  music_channel varchar(32), -- music channel I send messages to.
  voice_channel varchar(32), -- last voice channel I was in
  vote_skippers varchar(32)[],
  queue_last_updated TIMESTAMP,
  rarity INTEGER DEFAULT 100,
  wishlist_multiplier SMALLINT DEFAULT 1
);

create index idx_server_queue_date_added on "guildsTable"(queue_last_updated);
