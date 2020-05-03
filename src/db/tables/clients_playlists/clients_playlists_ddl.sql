CREATE TABLE IF NOT EXISTS clients_playlists (
  id SERIAL NOT NULL,
  user_id varchar(32) NOT NULL,
  playlist_name TEXT NOT NULL,
  playlist json[] NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  length SMALLINT NOT NULL DEFAULT 0,

  PRIMARY KEY(user_id, playlist_name)
)
