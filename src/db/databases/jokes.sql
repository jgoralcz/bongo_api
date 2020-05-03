CREATE TABLE IF NOT EXISTS jokes_table (
    title        TEXT,
    body         TEXT,
    score        real,
    category     TEXT,
    reddit_id    TEXT,
    id           SERIAL,

    PRIMARY KEY (id),
    UNIQUE (title, body)
);
CREATE INDEX idx_body_length ON jokes_table(length(body));
CREATE INDEX idx_body_length_score ON jokes_table (length(body), score);
CREATE INDEX idx_title_length ON jokes_table(length(title));
CREATE INDEX idx_score ON jokes_table(score);
-- these indexes should be swapped out for a full text search tsvector when the database is more than 500k rows.
CREATE INDEX idx_jokes_body_trgm_gin ON jokes_table USING gin(body gin_trgm_ops);
CREATE INDEX idx_jokes_title_trgm_gin ON jokes_table USING gin(title gin_trgm_ops);
