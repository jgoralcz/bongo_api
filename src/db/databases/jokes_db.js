// TODO: move this into an API
// TODO: use full text search
// TODO: automate/get better jokes
const { Pool } = require('pg');

const {
  joke_db: {
    user, host, database, password, port, max, connectionTimeoutMillis, idleTimeoutMillis,
  },
} = require('../../../config.json');

const pool = new Pool({
  user,
  host,
  database,
  password,
  port,
  max,
  connectionTimeoutMillis,
  idleTimeoutMillis,
});

/**
 * pool query function
 * @param {string} query the query to use against
 * @param {array<string>} paramsArray
 * @returns {Promise<*>}
 */
const poolQuery = async (query, paramsArray) => {
  const client = await pool.connect();
  try {
    return await client.query(query, paramsArray);
  } finally {
    client.release();
  }
};

/**
 * add a joke to the database.
 * @param title the joke's title (if available)
 * @param body the joke's body
 * @param score the joke's score (from reddit)
 * @param category the category
 * @param redditID the joke's reddit ID (if provided)
 * @returns {Promise<*>}
 */
const addJoke = async (title, body, score, category, redditID) => poolQuery(`
  INSERT INTO jokes_table (title, body, score, category, reddit_id)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (title, body) DO NOTHING;
`, [title, body, score, category, redditID]);

/**
 * gets the joke category
 * @param wordOrPhrase the word or phrase (category) to search for.
 * @returns {Promise<*>}
 */
const getJokeCategory = async wordOrPhrase => poolQuery(`
  SELECT title, body
  FROM jokes_table
  WHERE length(body) <= 1400 AND category = $1 AND (score >= 2 OR score IS NULL)
  ORDER BY random()
  LIMIT 1;
`, [wordOrPhrase]);


/**
 * gets the joke exactly how it was spelt from the user.
 * @param wordOrPhrase the word or phrase they're looking for.
 * @returns {Promise<void>}
 */
const getJokeExact = async wordOrPhrase => poolQuery(`
  SELECT title, body
  FROM jokes_table
  WHERE length(body) <= 1400 AND ( body ~ ('(\\s+|^)' || $1 || '([^a-zA-Z]|$)') OR title ~ ('(\\s+|^)' || $1 || '([^a-zA-Z]|$)') )
   AND (score >= 2 OR score IS NULL)
  ORDER BY random()
  LIMIT 1;
`, [wordOrPhrase]);

/**
 * gets a joke by the word or phrase
 * @param wordOrPhrase the word or phrase they're looking for.
 * @returns {Promise<*>}
 */
const getJokeAnyWord = async wordOrPhrase => poolQuery(`
  SELECT title, body
  FROM jokes_table
  WHERE length(body) <= 1400 AND (body ILIKE '%' || $1 || '%'  OR title ILIKE '%' || $1 || '%' ) AND (score >= 4 OR score IS NULL)
  ORDER BY random()
  LIMIT 1;
`, [wordOrPhrase]);

/**
 * gets random joke, using the length instead of ordering by
 * @returns {Promise<void>}
 */
const getRandomJoke = async () => poolQuery(`
  SELECT title, body
  FROM jokes_table
  WHERE length(body) <= 1400 AND (score >= 20) AND
  r > (
    SELECT MAX(r)
    FROM jokes_table
  ) * random()
  ORDER BY r
  LIMIT 1;
`, []);

module.exports = {
  addJoke,
  getJokeCategory,
  getJokeExact,
  getJokeAnyWord,
  getRandomJoke,
};
