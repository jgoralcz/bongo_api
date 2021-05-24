const { poolQuery } = require('../../index');

const updateClientAnimeReactions = async (userId, boolValue) => poolQuery(`
  UPDATE "clientsTable"
  SET anime_reactions = $2
  WHERE "userId" = $1
  RETURNING anime_reactions AS "updatedBool";
`, [userId, boolValue]);

const updateClientPlayFirst = async (userId, boolValue) => poolQuery(`
  UPDATE "clientsTable"
  SET play_first = $2
  WHERE "userId" = $1
  RETURNING play_first AS "updatedBool";
`, [userId, boolValue]);

const updateClientRollClaimed = async (userID, boolValue) => poolQuery(`
  UPDATE "clientsTable"
  SET user_roll_claimed = $2
  WHERE "userId" = $1
  RETURNING user_roll_claimed AS "updatedBool";
`, [userID, boolValue]);

const updateClientWesternRolls = async (userID, boolValue) => poolQuery(`
  UPDATE "clientsTable"
  SET roll_western = $2
  WHERE "userId" = $1
    AND ($2 != FALSE OR roll_anime != FALSE)
  RETURNING roll_western AS "updatedBool";
`, [userID, boolValue]);

const updateClientAnimeRolls = async (userID, boolValue) => poolQuery(`
  UPDATE "clientsTable"
  SET roll_anime = $2
  WHERE "userId" = $1
    AND ($2 != FALSE OR roll_western != FALSE)
  RETURNING roll_anime AS "updatedBool";
`, [userID, boolValue]);

const updateClientGameRolls = async (userID, boolValue) => poolQuery(`
  UPDATE "clientsTable"
  SET roll_game = $2
  WHERE "userId" = $1
  RETURNING roll_game AS "updatedBool";
`, [userID, boolValue]);

const updateClientCroppedImages = async (userID, boolValue) => poolQuery(`
  UPDATE "clientsTable"
  SET cropped_images = $2
  WHERE "userId" = $1
  RETURNING cropped_images AS "updatedBool";
`, [userID, boolValue]);

const updateGuildCustomCommandUsage = async (guildID, userID, boolValue) => poolQuery(`
  UPDATE "clientsTable"
  SET "allowGuildId" = $1, "allowGuild" = $3
  WHERE "userId" = $2
  RETURNING "allowGuild" AS "updatedBool";
`, [guildID, userID, boolValue]);

const updateUniversalCustomCommandsUsage = async (userID, boolValue) => poolQuery(`
  UPDATE "clientsTable"
  SET "allowAnyone" = $2
  WHERE "userId" = $1
  RETURNING "allowAnyone" AS "updatedBool";
`, [userID, boolValue]);

const updateUserUnlockEmbedColor = async (userID, bool) => poolQuery(`
  UPDATE "clientsTable"
  SET unlock_color = $2
  WHERE "userId" = $1
  RETURNING unlock_color AS "updatedBool";
`, [userID, bool]);

const updateUserUseMyImage = async (userID, bool) => poolQuery(`
  UPDATE "clientsTable"
  SET use_my_image = $2
  WHERE "userId" = $1
  RETURNING use_my_image AS "updatedBool";
`, [userID, bool]);

const addGameAndBankPoints = async (userId, points) => poolQuery(`
  UPDATE "clientsTable"
  SET "bankPoints" = 
    CASE WHEN game_points < 20000
        THEN "bankPoints" + $2
        ELSE "bankPoints"
    END,
  game_points = 
    CASE WHEN game_points < 20000
        THEN game_points + $2
        ELSE 20001
    END
  WHERE "userId" = $1
  RETURNING game_points AS points;
`, [userId, points]);

const getTopPizzas = async () => poolQuery(`
  SELECT "userId", pizza AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);

const getTopServerPizzas = async (guildId) => poolQuery(`
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

const getTopStones = async () => poolQuery(`
  SELECT "userId", stones AS top
  FROM "clientsTable"
  WHERE stones IS NOT NULL AND array_length(stones, 1) > 0
  ORDER BY array_length(stones, 1) DESC
  LIMIT 20;
`, []);

const getTopServerStones = async (guildId) => poolQuery(`
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

const getTopServerRamen = async (guildId) => poolQuery(`
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

const getTopRamen = async () => poolQuery(`
  SELECT "userId", ramen AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);

const getTopServerFuels = async (guildId) => poolQuery(`
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

const getTopFuels = async () => poolQuery(`
  SELECT "userId", fuel AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);

const getTopServerCookies = async (guildId) => poolQuery(`
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

const getTopCookies = async () => poolQuery(`
  SELECT "userId", cookie AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20
`, []);

const getTopServerDonuts = async (guildId) => poolQuery(`
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

const getTopDonuts = async () => poolQuery(`
  SELECT "userId", donut AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);

const getTopServerPoints = async (guildId) => poolQuery(`
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

const addClientWaifuListURL = async (userID, url) => poolQuery(`
  UPDATE "clientsTable"
  SET waifu_list_url = $2
  WHERE "userId" = $1;
`, [userID, url]);

const getTopBankPoints = async () => poolQuery(`
  SELECT "userId", "bankPoints" AS top
  FROM "clientsTable"
  ORDER BY top DESC
  LIMIT 20;
`, []);

const setWaifuListTitle = async (userId, title) => poolQuery(`
  UPDATE "clientsTable"
  SET waifu_list_title = $2
  WHERE "userId" = $1;
`, [userId, title]);

const getWaifuListTitleAndURL = async (userId) => poolQuery(`
  SELECT waifu_list_title, waifu_list_url
  FROM "clientsTable"
  WHERE "userId" = $1;
`, [userId]);

const setPokemonListTitle = async (userId, title) => poolQuery(`
  UPDATE "clientsTable"
  SET pokemon_list_title = $2
  WHERE "userId" = $1;
`, [userId, title]);

const getPokemonListTitle = async (userId) => poolQuery(`
  SELECT pokemon_list_title
  FROM "clientsTable"
  WHERE "userId" = $1;
`, [userId]);

const updateClientBankPointsDaily = async (userId, points, dailyGather) => poolQuery(`
  UPDATE "clientsTable"
  SET "bankPoints" = "bankPoints" + $2, daily_gather = $3
  WHERE "userId" = $1;
`, [userId, points, dailyGather]);

const setClientInfo = async (userID) => poolQuery(`
  INSERT INTO "clientsTable" ("userId")
  VALUES ($1)
  ON CONFLICT("userId") DO NOTHING
  RETURNING *;
`, [userID]);

const getClientInfo = async (userId) => poolQuery(`
  SELECT *
  FROM "clientsTable"
  WHERE "userId" = $1;
`, [userId]);

const updateClientPrefix = async (userID, prefix) => poolQuery(`
  UPDATE "clientsTable"
  SET prefix = $2
  WHERE "userId" = $1;
`, [userID, prefix]);

const respectsPaid = async (userId) => poolQuery(`
  UPDATE "clientsTable"
  SET "paidRespectsCount" = "paidRespectsCount" + 1
  WHERE "userId" = $1
  RETURNING "paidRespectsCount";
`, [userId]);

const totalRespectsPaid = async () => poolQuery(`
  SELECT sum("paidRespectsCount")
  FROM "clientsTable";
`, []);

const buyPizza = async (id, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET pizza = pizza + $2
  WHERE "userId" = $1;
`, [id, amount]);

const buyCookie = async (id, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET cookie = cookie + $2
  WHERE "userId" = $1;
`, [id, amount]);

const buyDonut = async (id, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET donut = donut + $2
  WHERE "userId" = $1;
`, [id, amount]);

const buyRamen = async (userId, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET ramen = ramen + $2
  WHERE "userId" = $1;
`, [userId, amount]);

const buyFuel = async (id, amount) => poolQuery(`
  UPDATE "clientsTable"
  SET fuel = fuel + $2
  WHERE "userId" = $1;
`, [id, amount]);

const buyStones = async (id, stoneName) => poolQuery(`
  UPDATE "clientsTable"
  SET stones = array_append("clientsTable".stones, $2::TEXT)
  WHERE "userId" = $1;
`, [id, stoneName]);

const subtractClientPoints = async (id, subtractPrice) => poolQuery(`
  UPDATE "clientsTable"
  SET "bankPoints" = "bankPoints" - $2
  WHERE "userId" = $1;
`, [id, subtractPrice]);

const incrementClientGuessCorrect = async (id) => poolQuery(`
  UPDATE "clientsTable"
  SET waifu_guess_correct = waifu_guess_correct + 1
  WHERE "userId" = $1;
`, [id]);

const incrementClientGuessWrong = async (id) => poolQuery(`
  UPDATE "clientsTable"
  SET waifu_guess_wrong = waifu_guess_wrong + 1
  WHERE "userId" = $1;
`, [id]);

const incrementClientGuessSeriesCorrect = async (id) => poolQuery(`
  UPDATE "clientsTable"
  SET series_guess_correct = series_guess_correct + 1
  WHERE "userId" = $1;
`, [id]);

const incrementClientGuessSeriesWrong = async (id) => poolQuery(`
  UPDATE "clientsTable"
  SET series_guess_correct = series_guess_wrong + 1
  WHERE "userId" = $1;
`, [id]);

const checkUserGauntletQuest = async (userID) => poolQuery(`
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

const updateClientsSnipe = async (userID, bool) => poolQuery(`
  UPDATE "clientsTable"
  SET sniped = $2
  WHERE "userId" = $1;
`, [userID, bool]);

const updatePatsCount = async (userID) => poolQuery(`
  UPDATE "clientsTable"
  SET pats = pats + 1
  WHERE "userId" = $1
  RETURNING pats;
`, [userID]);

const updateOwOAchievement = async (userID) => poolQuery(`
  UPDATE "clientsTable"
  SET owoify = TRUE
  WHERE "userId" = $1;
`, [userID]);

const updateAkiAchievement = async (userID) => poolQuery(`
  UPDATE "clientsTable"
  SET achievement_aki = TRUE
  WHERE "userId" = $1;
`, [userID]);

const updateRedditAchievement = async (userID) => poolQuery(`
  UPDATE "clientsTable"
  SET achievement_reddit = TRUE
  WHERE "userId" = $1;
`, [userID]);

const updateUserEmbedColor = async (userID, color) => poolQuery(`
  UPDATE "clientsTable"
  SET embed_color = $2
  WHERE "userId" = $1;
`, [userID, color]);

const updateAnimeSearchAchievement = async (userID) => poolQuery(`
  UPDATE "clientsTable"
  SET achievement_search_anime = TRUE
  WHERE "userId" = $1;
`, [userID]);

const clientBuyGauntlet = async (userId, gauntletPrice) => poolQuery(`
  UPDATE "clientsTable"
  SET gauntlet = TRUE, "bankPoints" = "bankPoints" - $2
  WHERE "userId" = $1;
`, [userId, gauntletPrice]);

const checkSnipe = async (userID) => poolQuery(`
  SELECT sniped
  FROM "clientsTable"
  WHERE "userId" = $1;
`, [userID]);

const updateUserBankPointsAndRollsVote = async (userID, points) => poolQuery(`
  UPDATE "clientsTable" 
  SET "bankPoints" = "bankPoints" + $2, vote_date = NOW(), bank_rolls = bank_rolls + 1,
  streak_vote_date = NOW() + INTERVAL '2 days', vote_enabled = TRUE,
  streak_vote = streak_vote + 1
  WHERE "userId" = $1
  RETURNING *;
`, [userID, points]);

const resetAllClientDaily = async () => poolQuery(`
  BEGIN;
  
  UPDATE "clientsTable"
  SET game_points = 0
  WHERE game_points > 0;
  
  UPDATE "clientsTable"
  SET daily = NULL
  WHERE daily IS NOT NULL;
  
  UPDATE state
  SET respects_paid_today = 0;
  
  COMMIT;
`, []);

const updateClientDaily = async (userId, used, date, additionalPoints) => poolQuery(`
  UPDATE "clientsTable"
  SET daily = $2, streak = streak + 1, streak_date = $3,
  "bankPoints" = 
    CASE WHEN (streak + 1) >= 30
      THEN "bankPoints" + 3000 + 125 * 30 + $4
      ELSE "bankPoints" + 3000 + 125 * (streak + 1) + $4
    END
  WHERE "userId" = $1
  RETURNING "bankPoints", streak;
`, [userId, used, date, additionalPoints]);

const clearVoteStreaks = async () => poolQuery(`
  UPDATE "clientsTable"
  SET streak_vote = 0, streak_vote_date = NULL
  WHERE streak_vote_date <= NOW();
`, []);

const removeRandomStone = async (userID) => poolQuery(`
  UPDATE "clientsTable"
  SET stones = array_remove(
    (
      SELECT stones
      FROM "clientsTable"
      WHERE "userId" = $1
    ), 
    
    (
      SELECT *
      FROM (      
        SELECT unnest(stones)
        FROM "clientsTable"
        WHERE "userId" = $1
      ) t
      ORDER BY random()
      LIMIT 1
    )
  )
  WHERE "userId" = $1
  RETURNING stones;
`, [userID]);

module.exports = {
  updateClientDaily,
  updateClientAnimeReactions,
  updateClientPlayFirst,
  updateClientRollClaimed,
  updateClientWesternRolls,
  updateClientGameRolls,
  updateClientCroppedImages,
  updateGuildCustomCommandUsage,
  updateUniversalCustomCommandsUsage,
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
  updateClientBankPointsDaily,
  setClientInfo,
  getClientInfo,
  updateClientPrefix,
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
  checkUserGauntletQuest,
  updateClientsSnipe,
  updatePatsCount,
  updateOwOAchievement,
  updateAkiAchievement,
  updateRedditAchievement,
  updateAnimeSearchAchievement,
  clientBuyGauntlet,
  checkSnipe,
  updateUserBankPointsAndRollsVote,
  resetAllClientDaily,
  clearVoteStreaks,
  removeRandomStone,
  updateClientAnimeRolls,
  updateUserEmbedColor,
  updateUserUnlockEmbedColor,
  updateUserUseMyImage,
};
