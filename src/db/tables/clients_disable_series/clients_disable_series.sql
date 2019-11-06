CREATE TABLE IF NOT EXISTS clients_disable_series (
  id SERIAL NOT NULL,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable"("userId") ON UPDATE CASCADE ON DELETE CASCADE,
  series_id INTEGER NOT NULL REFERENCES waifu_schema.series_table(id) ON UPDATE CASCADE ON DELETE CASCADE,

  PRIMARY KEY(user_id, series_id)
);
