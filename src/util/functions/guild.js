const { getGuild, setupGuild, updatePrefix } = require('../../db/tables/guild_data/guild_data');
const { setRedisGuildPrefix } = require('../../db/redis/prefix');

const initializeGetNewGuild = async (id) => {
  const guilds = await getGuild(id);
  if (guilds && guilds.length > 0 && guilds[0]) return { status: 409, send: guilds[0] };

  const newGuild = await setupGuild(id);
  if (!newGuild || newGuild <= 0 || !newGuild[0]) return { status: 500, send: `Could not make a guild with id: ${id}` };

  return { status: 201, send: newGuild[0] };
};

const setPrefix = async (guildID, guildConfig) => {
  const { prefix: guildPrefix, prefixForAllEnable } = guildConfig;
  if (guildPrefix == null || prefixForAllEnable == null) return undefined;

  await setRedisGuildPrefix(guildID, { guildPrefix, prefixForAllEnable });
  await updatePrefix(guildID, guildPrefix, prefixForAllEnable);
  return { guildPrefix, prefixForAllEnable };
};

const updateRedisGuildPrefix = async (id, guildConfig) => {
  if (!id) return { status: 400, send: { error: 'id not found.' } };

  const { prefix, prefixForAllEnable } = guildConfig;
  if (prefix == null || prefixForAllEnable == null) return { status: 400, send: { error: 'prefix or prefixForAllEnable not found.' } };

  const { guildPrefix, prefixForAllEnable: all } = await setPrefix(id, { prefix, prefixForAllEnable });
  return { status: 201, send: { id, prefix: guildPrefix, prefixForAllEnable: all } };
};

module.exports = {
  initializeGetNewGuild,
  updateRedisGuildPrefix,
};
