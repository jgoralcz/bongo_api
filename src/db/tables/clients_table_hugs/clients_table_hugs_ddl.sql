CREATE TABLE IF NOT EXISTS clients_table_hugs (
  user_id varchar(32) NOT NULL REFERENCES "clientsTable"("userId"),
  receiver_user_id varchar(32) NOT NULL,
  date timestamp NOT NULL DEFAULT now(),

  PRIMARY KEY(user_id, receiver_user_id)
);
