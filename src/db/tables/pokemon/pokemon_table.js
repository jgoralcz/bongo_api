const { poolQuery } = require('../../index');

/**
 * get all pokemon from their list.
 * @param id the user's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getPokemonList = async id => poolQuery(`
  SELECT pokemon_name AS name, favorite
  FROM cg_buy_pokemon_table
  WHERE user_id = $1
  ORDER BY pokemon_name ASC;
`, [id]);

// TODO: get image
/**
 * find pokemon by the user's id and name.
 * @param id the user's id.
 * @param pokemonName the pokemon's name.
 * @returns {Promise<Promise<*>|*>}
 */
const findPokemonById = async (id, pokemonName) => poolQuery(`
  SELECT pokemon_id, pokemon_name
  FROM cg_buy_pokemon_table
  WHERE user_id = $1 AND pokemon_name ILIKE $2;
`, [id, pokemonName]);


/**
 * if they have an id or not
 * @param userID the user's id.
 * @param guildID the guild's id.
 * @param pokemonName the pokemon's name
 * @param pokemonID the pokemon's ID.
 * @returns {Promise<*>}
 */
const buyPokemon = async (userID, guildID, pokemonName, pokemonID) => {
  if (pokemonID) {
    return poolQuery(`
      INSERT INTO cg_buy_pokemon_table(user_guild_id, user_id, guild_id pokemon_name, pokemon_id)
      VALUES($1, $2, $3, $4, $5)
      `, [`${guildID}-${userID}`, userID, guildID, pokemonName, pokemonID]);
  }
  return poolQuery(`
    INSERT INTO cg_buy_pokemon_table(user_guild_id, user_id, guild_id, pokemon_name)
    VALUES($1, $2, $3, $4)
    `, [`${guildID}-${userID}`, userID, guildID, pokemonName]);
};

/**
 * remove the pokemon
 * @param id the id of the pokemon
 * @param pokemonName the pokemon's name.
 * @returns {Promise<*>}
 */
const removePokemon = async (id, pokemonName) => poolQuery(`
  DELETE FROM cg_buy_pokemon_table
  WHERE id IN (SELECT id FROM cg_buy_pokemon_table WHERE user_id = $1 AND pokemon_name ILIKE $2 LIMIT 1)
`, [id, pokemonName]);

/**
 * get the top pokemon
 * @returns {Promise<*>}
 */
const getTopPokemon = async () => poolQuery(`
  SELECT user_id AS "userId", count(pokemon_name) AS top
  FROM cg_buy_pokemon_table
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;
`, []);


/**
 * get the top server pokemon
 * @param guildId the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getTopServerPokemon = async guildId => poolQuery(`
  SELECT user_id AS "userId", count(pokemon_name) AS top
  FROM cg_buy_pokemon_table
  WHERE guild_id = $1
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;
`, [guildId]);

/**
 * gets the sum of the user's pokemon list.
 * @param userId the user's id.
 * @returns {Promise<*>}
 */
const getPokemonListSum = async userId => poolQuery(`
  SELECT count(pokemon_name) AS top
  FROM cg_buy_pokemon_table
  WHERE user_id = $1;
`, [userId]);

/**
 * remove all but favorite buy pokemon
 * @param userId the user's id.
 * @returns {Promise<Promise<*>|*>}
 */
const removeAllButFavoriteBuyPokemon = async userId => poolQuery(`
  DELETE
  FROM cg_buy_pokemon_table
  WHERE user_id = $1 AND favorite = FALSE
  RETURNING *;
`, [userId]);

module.exports = {
  getPokemonList,
  findPokemonById,
  buyPokemon,
  removePokemon,
  getTopPokemon,
  getTopServerPokemon,
  getPokemonListSum,
  removeAllButFavoriteBuyPokemon,
};
