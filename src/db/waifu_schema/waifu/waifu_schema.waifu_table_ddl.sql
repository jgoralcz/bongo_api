CREATE TABLE IF NOT EXISTS waifu_schema.waifu_table (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  series TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_file_path TEXT NOT NULL,
  url TEXT NOT NULL,
  origin TEXT,
  original_name TEXT,
  romaji_name TEXT,
  age SMALLINT,
  date_of_birth DATE,
  hip_cm REAL,
  waist_cm REAL,
  bust_cm REAL,
  weight_kg REAL,
  height_cm REAL,
  blood_type TEXT,
  likes INTEGER,
  dislikes INTEGER,
  husbando BOOLEAN,
  nsfw BOOLEAN,
  date_added DATE,
  image_url_cdn TEXT,
  western BOOLEAN,
  reviewer TEXT,
  game TEXT,
  unknown_gender BOOLEAN,
  nsfw_image BOOLEAN DEFAULT FALSE,
  file_type TEXT,
  image_url_clean varchar(256),
  width_clean SMALLINT,
  height_clean SMALLINT,
  buffer_length_clean INTEGER,
  file_type_clean varchar(16),
  image_url_clean_discord varchar(256),
  last_edit_by varchar(32) NOT NULL default '339926969548275722', -- my bot id
  last_edit_date timestamp NOT NULL DEFAULT now()

  UNIQUE (name, series),
  UNIQUE (url)
);

create index accent_name_idx on waifu_schema.waifu_table (f_unaccent(name));
create index accent_name_gin_idx on waifu_schema.waifu_table using gin (f_unaccent(name) gin_trgm_ops);

--
-- Indexes:
--     "waifu_table_pkey" PRIMARY KEY, btree (id)
--     "idx_original_name" btree (original_name)
--     "idx_r" btree (r)
--     "idx_romaji_name" btree (romaji_name)
--     "idx_series" btree (series)
--     "idx_url" btree (url)
--     "idx_waifu_last_edit_data" btree (last_edit_date)
--     "idx_waifu_series_id" btree (series_id)
--     "idx_waifu_table_name_series" btree (name, series)
--     "name" btree (name)
--     "unique_name_series" UNIQUE, btree (name, series_id)
--     "waifu_original_name_trgm_idx" gist (original_name gist_trgm_ops)
--     "waifu_trgm_gin" gin (name gin_trgm_ops)
-- Foreign-key constraints:
--     "fk_series" FOREIGN KEY (series) REFERENCES waifu_schema.series_table(name) ON UPDATE CASCADE
--     "fk_waifu_series_id" FOREIGN KEY (series_id) REFERENCES waifu_schema.series_table(id)
-- Referenced by:
--     TABLE "waifu_schema.appears_in" CONSTRAINT "appears_in_waifu_id_fkey" FOREIGN KEY (waifu_id) REFERENCES waifu_schema.waifu_table(id) ON UPDATE CASCADE ON DELETE CASCADE
--     TABLE "cg_wishlist_waifu_table" CONSTRAINT "cg_wishlist_waifu_table_waifu_id_fkey" FOREIGN KEY (waifu_id) REFERENCES waifu_schema.waifu_table(id) ON UPDATE CASCADE ON DELETE CASCADE
--     TABLE "claim_waifu_user_images" CONSTRAINT "claim_waifu_user_images_waifu_id_fkey" FOREIGN KEY (waifu_id) REFERENCES waifu_schema.waifu_table(id) ON UPDATE CASCADE ON DELETE CASCADE
--     TABLE "guild_rolled" CONSTRAINT "guild_rolled_character_id_fkey" FOREIGN KEY (character_id) REFERENCES waifu_schema.waifu_table(id) ON UPDATE CASCADE ON DELETE CASCADE
--     TABLE "pending_images" CONSTRAINT "pending_images_waifu_id_fkey" FOREIGN KEY (waifu_id) REFERENCES waifu_schema.waifu_table(id) ON UPDATE CASCADE ON DELETE CASCADE
--     TABLE "true_love" CONSTRAINT "true_love_waifu_id_fkey" FOREIGN KEY (waifu_id) REFERENCES waifu_schema.waifu_table(id) ON UPDATE CASCADE ON DELETE CASCADE
--     TABLE "waifu_schema.waifu_table_images" CONSTRAINT "waifu_table_images_waifu_id_fkey" FOREIGN KEY (waifu_id) REFERENCES waifu_schema.waifu_table(id) ON UPDATE CASCADE ON DELETE CASCADE
--     TABLE "waifu_schema.waifu_table_tags" CONSTRAINT "waifu_table_tags_waifu_id_fkey" FOREIGN KEY (waifu_id) REFERENCES waifu_schema.waifu_table(id) ON UPDATE CASCADE ON DELETE CASCADE

-- refresh every minute
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_character_count AS
  SELECT count(*) AS count
  FROM waifu_schema.waifu_table;
