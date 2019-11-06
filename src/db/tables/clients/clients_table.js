const { poolQuery } = require('../../index');

/**
 * used for reaction images.
 * @param userId the user's id
 * @returns {Promise<*>}
 */
const updateClientAnimeReactions = async userId => poolQuery(`
  UPDATE "clientsTable"
  SET anime_reactions = NOT anime_reactions
  WHERE "userId" = $1;
`, [userId]);

/**
 * used for playing first
 * @param userId the user's id
 * @returns {Promise<*>}
 */
const toggleClientPlayFirst = async userId => poolQuery(`
  UPDATE "clientsTable"
  SET play_first = NOT play_first
  WHERE "userId" = $1;
`, [userId]);

/**
 * adds points if they have not hit a threshold.
 * @param userId the user's id
 * @param points the points to add
 * @returns {Promise<void>}
 */
const addGameAndBankPoints = async (userId, points) => poolQuery(`
  UPDATE "clientsTable"
  SET "bankPoints" = 
    CASE WHEN game_points < 2500
        THEN "bankPoints" + $2
        ELSE "bankPoints"
    END,
  game_points = 
    CASE WHEN game_points < 2000
        THEN game_points + $2
        ELSE 2001
    END
  WHERE "userId" = $1
  RETURNING game_points AS points;
`, [userId, points]);


/**
 * gets the top pizzas owners across all servers
 * @returns {Promise<*>}
 */
const getTopPizzas = async () => poolQuery(`
  SELECT "userId", pizza AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);


/**
 * gets the top pizzas for the server.
 * @param guildId the guild's id
 * @returns {Promise<*>}
 */
const getTopServerPizzas = async guildId => poolQuery(`
  SELECT ct."userId", ct.top
  FROM (
      SELECT "userId", pizza AS top
      FROM "clientsTable"
      WHERE pizza > 0
  ) ct
  JOIN  "clientsGuildsTable" cgt ON cgt."userId"=ct."userId"
  WHERE "guildId" = $1
  ORDER BY top DESC
  LIMIT 20;
`, [guildId]);


/**
 * selects the people with the most amount of stones.
 * @returns {Promise<*>}
 */
const getTopStones = async () => poolQuery(`
  SELECT "userId", stones AS top
  FROM "clientsTable"
  WHERE stones IS NOT NULL AND array_length(stones, 1) > 0
  ORDER BY array_length(stones, 1) DESC
  LIMIT 20;
`, []);


/**
 * get the top server stones
 * @param guildId the guild's id.
 * @returns {Promise<*>}
 */
const getTopServerStones = async guildId => poolQuery(`
  SELECT ct."userId", ct.stones AS top
  FROM (
    SELECT "userId", stones
    FROM "clientsTable"
    WHERE stones IS NOT NULL AND array_length(stones, 1) > 0
  ) ct
  JOIN  "clientsGuildsTable" cgt ON cgt."userId"=ct."userId"
  WHERE "guildId" = $1
  ORDER BY ct.stones DESC
  LIMIT 20;
`, [guildId]);


/**
 * get top server ramen
 * @param guildId
 * @returns {Promise<*>}
 */
const getTopServerRamen = async guildId => poolQuery(`
  SELECT ct."userId", ct.top
  FROM (
    SELECT "userId", ramen AS top
    FROM "clientsTable"
    WHERE ramen > 0
  ) ct
  JOIN  "clientsGuildsTable" cgt ON cgt."userId"=ct."userId"
  WHERE "guildId" = $1
  ORDER BY top DESC
  LIMIT 20;
`, [guildId]);


/**
 * gets the overall top ramen
 * @returns {Promise<*>}
 */
const getTopRamen = async () => poolQuery(`
  SELECT "userId", ramen AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);


/**
 * gets the server's top fuel.
 * @param guildId
 * @returns {Promise<*>}
 */
const getTopServerFuels = async guildId => poolQuery(`
SELECT ct."userId", ct.top
  FROM (
    SELECT "userId", fuel AS top
    FROM "clientsTable"
    WHERE fuel > 0
  ) ct
  JOIN  "clientsGuildsTable" cgt ON cgt."userId"=ct."userId"
  WHERE "guildId" = $1
  ORDER BY top DESC
  LIMIT 20;
`, [guildId]);

/**
 * gets the overall top fuel.
 * @returns {Promise<*>}
 */
const getTopFuels = async () => poolQuery(`
  SELECT "userId", fuel AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);


/**
 * gets the top cookies for this server.
 * @param guildId
 * @returns {Promise<*>}
 */
const getTopServerCookies = async guildId => poolQuery(`
  SELECT ct."userId", ct.top
  FROM (
    SELECT "userId", cookie AS top
    FROM "clientsTable"
    WHERE cookie > 0
  ) ct
  JOIN  "clientsGuildsTable" cgt ON cgt."userId"=ct."userId"
  WHERE "guildId" = $1
  ORDER BY top DESC
  LIMIT 20;
`, [guildId]);

/**
 * gets the top cookie owners.
 * @returns {Promise<*>}
 */
const getTopCookies = async () => poolQuery(`
  SELECT "userId", cookie AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20
`, []);


/**
 * gets the top server donuts
 * @param guildId
 * @returns {Promise<*>}
 */
const getTopServerDonuts = async guildId => poolQuery(`
  SELECT ct."userId", ct.top
  FROM (
    SELECT "userId", donut AS top
    FROM "clientsTable"
    WHERE donut > 0
  ) ct
  JOIN  "clientsGuildsTable" cgt ON cgt."userId"=ct."userId"
  WHERE "guildId" = $1
  ORDER BY top DESC
  LIMIT 20;
`, [guildId]);

/**
 * gets the top donuts.
 * @returns {Promise<*>}
 */
const getTopDonuts = async () => poolQuery(`
  SELECT "userId", donut AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);


/**
 * get top server points based off guild id
 * @param guildId {string} the guild id
 * @returns {Promise<*>}
 */
const getTopServerPoints = async guildId => poolQuery(`
  SELECT ct."userId", "bankPoints" AS top
  FROM "clientsTable" ct
  WHERE ct."userId" IN
    ( SELECT "userId"
      FROM "clientsGuildsTable"
      WHERE "guildId" = $1
    )
  ORDER BY top DESC
  LIMIT 20;
`, [guildId]);

// join AND guild id...

//
// /**
//  * gets the vote streak based off the user ID.
//  * @param {string} userID
//  * @returns {Promise<*>}
//  */
// bot.getVoteStreak = async (userID) => {
//     return await client.query(`
//         SELECT streak_vote, streak_vote_date, vote_enabled, vote_date
//         FROM "clientsTable"
//         WHERE "userId" = $1;
//     `, [userID]);
// };

/**
 * add the url from mywaifulist (maybe other anime sites in the future)
 * @param userID the user'd id
 * @param url the url to add to embeds and database.
 * @returns {Promise<*>}
 */
const addClientWaifuListURL = async (userID, url) => poolQuery(`
  UPDATE "clientsTable"
  SET waifu_list_url = $2
  WHERE "userId" = $1;
`, [userID, url]);

/**
 * gets the overall top bank points
 * @returns {Promise<*>}
 */
const getTopBankPoints = async () => poolQuery(`
  SELECT "userId", "bankPoints" AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);

/**
 * sets the title for their waifulists
 * @param userId
 * @param title
 * @returns {Promise<*>}
 */
const setWaifuListTitle = async (userId, title) => poolQuery(`
  UPDATE "clientsTable"
  SET waifu_list_title = $2
  WHERE "userId" = $1;
`, [userId, title]);

/**
 * gets the title and url for their waifulists
 * @param userId
 * @returns {Promise<*>}
 */
const getWaifuListTitleAndURL = async userId => poolQuery(`
  SELECT waifu_list_title, waifu_list_url
  FROM "clientsTable"
  WHERE "userId" = $1;
`, [userId]);

/**
 * sets the pokemon list title
 * @param userId the user's id
 * @param title the title to add.
 * @returns {Promise<*>}
 */
const setPokemonListTitle = async (userId, title) => poolQuery(`
  UPDATE "clientsTable"
  SET pokemon_list_title = $2
  WHERE "userId" = $1;
`, [userId, title]);

/**
 * gets the pokemon list title
 * @param userId
 * @returns {Promise<*>}
 */
const getPokemonListTitle = async userId => poolQuery(`
  SELECT pokemon_list_title
  FROM "clientsTable"
  WHERE "userId" = $1;
`, [userId]);


/**
 * sets the amiibo list title
 * @param userId the user's id
 * @param title the amiibo title
 * @returns {Promise<*>}
 */
const setAmiiboListTitle = async (userId, title) => poolQuery(`
  UPDATE "clientsTable"
  SET amiibo_list_title = $2
  WHERE "userId" = $1;
`, [userId, title]);

/**
 * gets the amiibo list title
 * @param userId the user's id
 * @returns {Promise<*>}
 */
const getAmiiboListTitle = async userId => poolQuery(`
  SELECT amiibo_list_title
  FROM "clientsTable"
  WHERE "userId" = $1;
`, [userId]);

/**
 * update client bank points daily
 * @param userId the user's id
 * @param points the user's points
 * @param dailyGather the points to add
 * @returns {Promise<*>}
 */
const updateClientBankPointsDaily = async (userId, points, dailyGather) => poolQuery(`
  UPDATE "clientsTable"
  SET "bankPoints" = "bankPoints" + $2, daily_gather = $3
  WHERE "userId" = $1;
`, [userId, points, dailyGather]);

/**
 * set clients info
 * @param userInfo the user's info
 * @returns {Promise<*>}
 */
const setClientInfo = async userInfo => poolQuery(`
  INSERT INTO "clientsTable" ("userId", "prefix")
  VALUES ($1, $2)
  ON CONFLICT("userId") DO NOTHING
  RETURNING *;
`, [userInfo.userId, userInfo.prefix]);

/**
 * gets client's info based off id
 * @param userId the user's id
 * @returns {Promise<*>}
 */
const getClientInfo = async userId => poolQuery(`
  SELECT *
  FROM "clientsTable"
  WHERE "userId" = $1;
`, [userId]);

/**
 * update the client's prefix
 * @param prefix
 * @param userId
 * @returns {Promise<*>}
 */
const updateClientPrefix = async (prefix, userId) => poolQuery(`
  UPDATE "clientsTable"
  SET prefix = $1
  WHERE "userId" = $2;
`, [prefix, userId]);

/**
 * used for tags
 * @param guildId the guild's id
 * @param userId the user's id
 * @returns {Promise<*>}
 */
const updateClientAllowGuild = async (guildId, userId) => poolQuery(`
  UPDATE "clientsTable"
  SET "allowGuild" = NOT "allowGuild",
  "allowGuildId" = $1 WHERE "userId" = $2;
`, [guildId, userId]);

/**
 * used for tags anyone, cross server, can use their tags.
 * @param userId the user's id
 * @returns {Promise<*>}
 */
const updateClientAllowAnyone = async userId => poolQuery(`
  UPDATE "clientsTable"
  SET "allowAnyone" = NOT "allowAnyone"
  WHERE "userId" = $1;
`, [userId]);

/**
 * pay respects
 * @param userId
 * @returns {Promise<*>}
 */
const respectsPaid = async userId => poolQuery(`
  UPDATE "clientsTable"
  SET "paidRespectsCount" = "paidRespectsCount" + 1
  WHERE "userId" = $1
  RETURNING "paidRespectsCount";
`, [userId]);

/**
 * gets the total respects paid
 * @returns {Promise<*>}
 */
const totalRespectsPaid = async () => poolQuery(`
  SELECT sum("paidRespectsCount")
  FROM "clientsTable";
`, []);


/**
 * buys pizza
 * @param id the user's id
 * @param amount the amount they purchased
 * @returns {Promise<*>}
 */
const buyPizza = async (id, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET pizza = pizza + $2
  WHERE "userId" = $1;
`, [id, amount]);

/**
 * buys cookie
 * @param id the user's id
 * @param amount the amount they purchased.
 * @returns {Promise<*>}
 */
const buyCookie = async (id, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET cookie = cookie + $2
  WHERE "userId" = $1;
`, [id, amount]);

/**
 * buy donuts
 * @param id the user's id
 * @param amount the amount they purchaed.
 * @returns {Promise<*>}
 */
const buyDonut = async (id, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET donut = donut + $2
  WHERE "userId" = $1;
`, [id, amount]);

/**
 * buys ramen
 * @param userId the user's id
 * @param amount the amount they purchased.
 * @returns {Promise<*>}
 */
const buyRamen = async (userId, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET ramen = ramen + $2
  WHERE "userId" = $1;
`, [userId, amount]);

/**
 * buys fuel
 * @param id the user's id
 * @param amount the amount they purchased
 * @returns {Promise<*>}
 */
const buyFuel = async (id, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET fuel = fuel + $2
  WHERE "userId" = $1;
`, [id, amount]);

/**
 * buys stones
 * @param id the user's id
 * @param stoneName the stone name
 * @returns {Promise<*>}
 */
const buyStones = async (id, stoneName) => poolQuery(`
  UPDATE "clientsTable"
  SET stones = array_append("clientsTable".stones, $2::TEXT)
  WHERE "userId" = $1;
`, [id, stoneName]);

/**
 * subtract (and add when using a negative number) the user's points
 * @param id the user's id
 * @param subtractPrice the price to subtract (or add if using negative number)
 * @returns {Promise<*>}
 */
const subtractClientPoints = async (id, subtractPrice) => poolQuery(`
  UPDATE "clientsTable"
  SET "bankPoints" = "bankPoints" - $2
  WHERE "userId" = $1;
`, [id, subtractPrice]);

/**
 * increments their correct guess
 * @param id the user's id.
 * @returns {Promise<*>}
 */
const incrementClientGuessCorrect = async id => poolQuery(`
  UPDATE "clientsTable"
  SET waifu_guess_correct = waifu_guess_correct + 1
  WHERE "userId" = $1;
`, [id]);

/**
 * increments their wrong guess
 * @param id the user's id.
 * @returns {Promise<*>}
 */
const incrementClientGuessWrong = async id => poolQuery(`
  UPDATE "clientsTable"
  SET waifu_guess_wrong = waifu_guess_wrong + 1
  WHERE "userId" = $1;
`, [id]);

/**
 * increments their correct guess for the series
 * @param id the user's id.
 * @returns {Promise<*>}
 */
const incrementClientGuessSeriesCorrect = async id => poolQuery(`
  UPDATE "clientsTable"
  SET series_guess_correct = series_guess_correct + 1
  WHERE "userId" = $1;
`, [id]);

/**
 * increments their wrong guess for the series
 * @param id the user's id.
 * @returns {Promise<*>}
 */
const incrementClientGuessSeriesWrong = async id => poolQuery(`
  UPDATE "clientsTable"
  SET series_guess_correct = series_guess_wrong + 1
  WHERE "userId" = $1;
`, [id]);

/**
 * toggles the user's unique rolls.
 * @param userID the user's id
 * @returns {Promise<*>}
 */
const toggleUserRollClaimed = async userID => poolQuery(`
  UPDATE "clientsTable"
  SET user_roll_claimed = NOT user_roll_claimed
  WHERE "userId" = $1;
`, [userID]);

/**
 * checks the user's gauntlet quest.
 * @param userID the user's id.
 * @returns {Promise<void>}
 */
const checkUserGauntletQuest = async userID => poolQuery(`
  SELECT "userId" as user_id, pats, owoify, achievement_aki AS aki, 
    achievement_reddit AS reddit, achievement_search_anime AS "animeSearch", sniped, gauntlet, (
      SELECT count(*) as hugs
      FROM clients_table_hugs
      WHERE user_id = $1
  ), (
    SELECT count(*) as tags
    FROM "clientsCommandsTable"
    WHERE "userId" = $1
  ), (
    SELECT count(*) AS "boughtWaifuCount"
    FROM cg_buy_waifu_table
    WHERE user_id = $1
  ), (
    SELECT length AS "playlistLength"
    FROM clients_playlists
    WHERE length > 0 AND user_id = $1
    ORDER BY length DESC
    LIMIT 1
  )

  FROM "clientsTable"
  WHERE "userId" = $1;
`, [userID]);

/**
 * sniped a waifu
 * @param userID the user's ID.
 * @returns {Promise<void>}
 */
const updateClientsSnipe = async userID => poolQuery(`
  UPDATE "clientsTable"
  SET sniped = TRUE
  WHERE "userId" = $1;
`, [userID]);

/**
 * added the pats
 * @param userID the user's ID.
 * @returns {Promise<void>}
 */
const updatePatsCount = async userID => poolQuery(`
  UPDATE "clientsTable"
  SET pats = pats + 1
  WHERE "userId" = $1
  RETURNING pats;
`, [userID]);

/**
 * added the pats
 * @param userID the user's ID.
 * @returns {Promise<void>}
 */
const updateOwOAchievement = async userID => poolQuery(`
  UPDATE "clientsTable"
  SET owoify = TRUE
  WHERE "userId" = $1;
`, [userID]);

/**
 * added the akinator achievement
 * @param userID the user's ID.
 * @returns {Promise<void>}
 */
const updateAkiAchievement = async userID => poolQuery(`
  UPDATE "clientsTable"
  SET achievement_aki = TRUE
  WHERE "userId" = $1;
`, [userID]);

/**
 * added the reddit achievement
 * @param userID the user's ID.
 * @returns {Promise<void>}
 */
const updateRedditAchievement = async userID => poolQuery(`
  UPDATE "clientsTable"
  SET achievement_reddit = TRUE
  WHERE "userId" = $1;
`, [userID]);

/**
 * added the anime search achievement
 * @param userID the user's ID.
 * @returns {Promise<void>}
 */
const updateAnimeSearchAchievement = async userID => poolQuery(`
  UPDATE "clientsTable"
  SET achievement_search_anime = TRUE
  WHERE "userId" = $1;
`, [userID]);


/**
 * used for reaction images.
 * @param userId the user's id.
 * @param gauntletPrice the price of the gauntlet.
 * @returns {Promise<*>}
 */
const clientBuyGauntlet = async (userId, gauntletPrice) => poolQuery(`
  UPDATE "clientsTable"
  SET gauntlet = TRUE, "bankPoints" = "bankPoints" - $2
  WHERE "userId" = $1;
`, [userId, gauntletPrice]);

/**
 * checks if the user has already sniped
 * @param userID the user's ID
 * @returns {Promise<void>}
 */
const checkSnipe = async (userID) => {
  const sniperQuery = await poolQuery(`
        SELECT sniped
        FROM "clientsTable"
        WHERE "userId" = $1;
    `, [userID]);

  if (sniperQuery.rowCount > 0 && sniperQuery.rows[0]) {
    return sniperQuery.rows[0].sniped;
  }

  return true;
};

module.exports = {
  updateClientAnimeReactions,
  toggleClientPlayFirst,
  addGameAndBankPoints,
  getTopPizzas,
  getTopServerPizzas,
  getTopStones,
  getTopServerStones,
  getTopServerRamen,
  getTopRamen,
  getTopServerFuels,
  getTopFuels,
  getTopServerCookies,
  getTopCookies,
  getTopServerDonuts,
  getTopDonuts,
  getTopServerPoints,
  addClientWaifuListURL,
  getTopBankPoints,
  setWaifuListTitle,
  getWaifuListTitleAndURL,
  setPokemonListTitle,
  getPokemonListTitle,
  setAmiiboListTitle,
  getAmiiboListTitle,
  updateClientBankPointsDaily,
  setClientInfo,
  getClientInfo,
  updateClientPrefix,
  updateClientAllowGuild,
  updateClientAllowAnyone,
  respectsPaid,
  totalRespectsPaid,
  buyPizza,
  buyCookie,
  buyDonut,
  buyRamen,
  buyFuel,
  buyStones,
  subtractClientPoints,
  incrementClientGuessCorrect,
  incrementClientGuessWrong,
  incrementClientGuessSeriesCorrect,
  incrementClientGuessSeriesWrong,
  toggleUserRollClaimed,
  checkUserGauntletQuest,
  updateClientsSnipe,
  updatePatsCount,
  updateOwOAchievement,
  updateAkiAchievement,
  updateRedditAchievement,
  updateAnimeSearchAchievement,
  clientBuyGauntlet,
  checkSnipe,
};
