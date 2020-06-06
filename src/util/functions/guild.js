const { getGuild, setupGuild, updatePrefix } = require('../../db/tables/guild_data/guild_data');

const initializeGetNewGuild = async (id) => {
  const guilds = await getGuild(id);
  if (guilds && guilds.length > 0 && guilds[0]) return { status: 409, send: guilds[0] };

  const newGuild = await setupGuild(id);
  if (!newGuild || newGuild <= 0 || !newGuild[0]) return { status: 500, send: `Could not make a guild with id: ${id}` };

  return { status: 201, send: newGuild[0] };
};

const updateGuildPrefix = async (id, guildConfig) => {
  if (!id) return { status: 400, send: { error: 'id not found.' } };

  const { prefix, prefixForAllEnable } = guildConfig;
  if (prefix == null || prefixForAllEnable == null) return { status: 400, send: { error: 'prefix or prefixForAllEnable not found.' } };

  await updatePrefix(id, prefix, prefixForAllEnable);
  return { status: 201, send: { id, prefix, prefixForAllEnable } };
};

module.exports = {
  initializeGetNewGuild,
  updateGuildPrefix,
};
