CREATE TABLE IF NOT EXISTS pending_images(
  id SERIAL PRIMARY KEY,
  message_id varchar(32),
  waifu_id INTEGER NOT NULL REFERENCES waifu_schema.waifu_table ON DELETE CASCADE ON UPDATE CASCADE,
  body varchar(2000) NOT NULL,
  uploader_id varchar(32) NOT NULL REFERENCES "clientsTable"("userId"),
  image_url varchar(1000) NOT NULL,
  nsfw BOOLEAN NOT NULL,
  date timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX message_id_pending_images_idx ON pending_images(message_id);
