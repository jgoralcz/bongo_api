// module.exports = {
//     /**
//      * run for the guilds friends table
//      * @param bot the discord bot
//      * @param client the database client
//      * @returns {Promise<void>}
//      */
//     run: async function(bot, client) {
//         await client.query(`
//         CREATE TABLE IF NOT EXISTS "clientsGuildsFriendsTable" (
//             user_id varchar(32) NOT NULL,
//             guild_id varchar(32) NOT NULL,
//             friend_id varchar(32) NOT NULL
//
//             UNIQUE (user_id, guild_id, friend_id)
//         )`);
//     }
// };