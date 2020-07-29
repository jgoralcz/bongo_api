CREATE TABLE IF NOT EXISTS "clientsTable" (
  "userId" varchar(32) PRIMARY KEY NOT NULL,
  prefix varchar(51) NOT NULL DEFAULT 'b.',
  "paidRespectsCount" INTEGER NOT NULL DEFAULT 0,
  "allowGuild" BOOLEAN NOT NULL DEFAULT FALSE,
  "allowGuildId" varchar(32),
  "allowAnyone" BOOLEAN NOT NULL DEFAULT FALSE,
  "bankPoints" INTEGER DEFAULT 0,
  game_points INTEGER DEFAULT 0,
  waifu_list_title varchar(200),
  pokemon_list_title varchar(200),
  amiibo_list_title varchar(200),
  daily_gather BOOLEAN,
  waifu_list_url varchar(128),
  streak_daily INTEGER DEFAULT 0,
  streak_daily_date timestamp,
  streak_vote INTEGER DEFAULT 0,
  streak_vote_date timestamp,
  vote_date timestamp,
  vote_enabled BOOLEAN,
  donut INTEGER DEFAULT 0,
  pizza INTEGER DEFAULT 0,
  cookie INTEGER DEFAULT 0,
  fuel INTEGER DEFAULT 0,
  ramen INTEGER DEFAULT 0,
  stones TEXT ARRAY,
  patron BOOLEAN NOT NULL DEFAULT FALSE,
  anime_reactions BOOLEAN NOT NULL DEFAULT FALSE,
  waifu_guess_correct INTEGER NOT NULL DEFAULT 0,
  waifu_guess_wrong INTEGER NOT NULL DEFAULT 0,
  series_guess_correct INTEGER NOT NULL DEFAULT 0,
  series_guess_wrong INTEGER NOT NULL DEFAULT 0,
  user_roll_claimed BOOLEAN NOT NULL DEFAULT TRUE,
  play_first BOOLEAN NOT NULL DEFAULT TRUE,
  gauntlet BOOLEAN NOT NULL DEFAULT FALSE,
  gauntlet_quest_complete BOOLEAN NOT NULL DEFAULT FALSE,
  achievement_sniper BOOLEAN NOT NULL DEFAULT FALSE,
  achievement_tag BOOLEAN NOT NULL DEFAULT FALSE,
  sniped BOOLEAN NOT NULL DEFAULT FALSE,
  pats INTEGER NOT NULL DEFAULT 0,
  owoify BOOLEAN NOT NULL DEFAULT FALSE,
  achievement_aki BOOLEAN NOT NULL DEFAULT FALSE,
  achievement_reddit BOOLEAN NOT NULL DEFAULT FALSE,
  achievement_search_anime BOOLEAN NOT NULL DEFAULT FALSE,
  roll_game BOOLEAN NOT NULL DEFAULT TRUE,
  roll_western BOOLEAN NOT NULL DEFAULT TRUE,
  cropped_images BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_cookie ON "clientsTable"(cookie) WHERE cookie > 0;
CREATE INDEX IF NOT EXISTS idx_donut ON "clientsTable"(donut) WHERE donut > 0;
CREATE INDEX IF NOT EXISTS idx_fuel ON "clientsTable"(fuel) WHERE fuel > 0;
CREATE INDEX IF NOT EXISTS idx_patron ON "clientsTable"(patron);
CREATE INDEX IF NOT EXISTS idx_patron_user_id ON "clientsTable"(patron, "userId");
CREATE INDEX IF NOT EXISTS idx_pizza ON "clientsTable"(pizza) WHERE pizza > 0;
CREATE INDEX IF NOT EXISTS idx_ramen ON "clientsTable"(ramen) WHERE ramen > 0;
