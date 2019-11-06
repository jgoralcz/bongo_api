// /**
//  * subscriptions database
//  * @type {{run: module.exports.run}}
//  */
// module.exports = {
//
//     run: async function(bot, client) {
//         //subscribe table
//         await client.query(`
//         CREATE TABLE IF NOT EXISTS "subscriptions_table" (
//             id SERIAL PRIMARY KEY,
//             channel_id varchar(32) NOT NULL,
//             sub TEXT NOT NULL,
//             time SMALLINT NOT NULL DEFAULT 5,
//
//             guild_id varchar(32) NOT NULL REFERENCES "guildsTable" ON DELETE CASCADE ON UPDATE CASCADE,
//             UNIQUE (sub, guild_id)
//         )`);
//
//
//         //add into table the subscription
//         bot.upsertSubscription = async (channelId, guildId, subscription, timeInMinutes) => {
//             return await client.query(`
//             INSERT INTO subscriptions_table (channel_id, guild_id, sub, time)
//             VALUES ($1, $2, $3, $4)
//             ON CONFLICT(sub, guild_id) DO
//             UPDATE SET channel_id = $1, time = $4 WHERE subscriptions_table.guild_id = $2
//             `, [channelId, guildId, subscription, timeInMinutes]);
//         };
//
//         //remove from table the subscription
//         bot.unsubscribe = async (channelId, guildId, subscription) => {
//             return await client.query(`
//             DELETE
//             FROM subscriptions_table
//             WHERE channel_id = $1 AND guild_id = $2 AND sub = $3
//             `, [channelId, guildId, subscription]);
//         };
//
//         bot.guildSubscriptions = async (guildId) => {
//             return await client.query(`
//             SELECT *
//             FROM subscriptions_table
//             WHERE guild_id = $1
//             `, [guildId]);
//         };
//
//         bot.guildChannelSubscriptions = async (channelId, guildId) => {
//             return await client.query(`
//             SELECT *
//             FROM subscriptions_table
//             WHERE channel_id = $1 AND guild_id = $2
//             `, [channelId, guildId]);
//         };
//
//         //minutes
//         bot.getSubscriptionFromMinutes = async (minutes) => {
//             return await client.query(`
//             SELECT *
//             FROM subscriptions_table
//             WHERE ($1 % time) = 0
//             `, [minutes])
//         };
//
//     }
// };
