CREATE TABLE IF NOT EXISTS patron_ranks(
  patron_id SERIAL PRIMARY KEY,
  patron_name varchar(64) NOT NULL,

  UNIQUE(patron_name)
);

INSERT INTO patron_ranks(patron_name) VALUES('Super Bongo') ON CONFLICT(patron_name) DO NOTHING;
INSERT INTO patron_ranks(patron_name) VALUES('Bongo Daddy') ON CONFLICT(patron_name) DO NOTHING;
INSERT INTO patron_ranks(patron_name) VALUES('Bongo Neko') ON CONFLICT(patron_name) DO NOTHING;
INSERT INTO patron_ranks(patron_name) VALUES('Smol Neko') ON CONFLICT(patron_name) DO NOTHING;
