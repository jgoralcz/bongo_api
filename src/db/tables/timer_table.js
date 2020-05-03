// /**
//  * subscriptions database
//  * @type {{run: module.exports.run}}
//  */
// module.exports = {
//
//     run: async function(bot, client) {
//         await client.query(`
//         CREATE TABLE IF NOT EXISTS "timerTable" (
//             id SERIAL PRIMARY KEY,
//             "channelId" varchar(32),
//             "time" timestamp NOT NULL,
//             "userId" varchar(32) REFERENCES "clientsTable",
//             "note" TEXT
//         )`);
//
//         bot.removeTimerChannel = async (channelId) => {
//             return await client.query(`
//             DELETE FROM "timerTable"
//             WHERE "channelId" = $1`
//                 , [channelId])
//         };
//
//         bot.getUserTimers = async (userId) => {
//             return await client.query(`
//             SELECT *
//             FROM "timerTable"
//             WHERE "userId" = $1`,
//                 [userId]);
//         };
//
//         bot.setTimerInfo = async (userId, channelId, time, note) => {
//             return await client.query(`
//             INSERT INTO "timerTable" ("userId", "channelId", "time", "note")
//             VALUES ($1, $2, $3, $4)`,
//                 [userId, channelId, time, note]);
//         };
//
//         bot.getTimerInfo = async (time) => {
//             return await client.query(`
//             SELECT *
//             FROM "timerTable" WHERE "time" <= $1`,
//                 [time]);
//         };
//
//         bot.removeTimerInfo = async (time) => {
//             return await client.query(`
//             DELETE FROM
//             "timerTable" WHERE time <= $1`,
//                 [time]);
//         };
//     }
// };
