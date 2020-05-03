const { getClientInfo, setClientInfo, updateClientPrefix } = require('../../db/tables/clients/clients_table');
const { setRedisUserPrefix } = require('../../db/redis/prefix');

const initializeGetNewUser = async (id) => {
  const userQuery = await getClientInfo(id);
  if (userQuery && userQuery.length > 0 && userQuery[0]) return { status: 409, send: userQuery[0] };

  const setUserQuery = await setClientInfo(id);
  if (!setUserQuery || setUserQuery <= 0 || !setUserQuery[0]) return { status: 500, send: `Could not make a user with id: ${id}` };

  return { status: 201, send: setUserQuery[0] };
};

const setPrefix = async (userID, prefix) => {
  await setRedisUserPrefix(userID, prefix);
  await updateClientPrefix(userID, prefix);
};

const updateRedisUserPrefix = async (id, prefix) => {
  if (!id) return { status: 400, send: { error: 'id not found.' } };
  if (!prefix) return { status: 400, send: { error: 'prefix not found.' } };

  await setPrefix(id, prefix);
  return { status: 201, send: { id, prefix } };
};

module.exports = {
  initializeGetNewUser,
  updateRedisUserPrefix,
};
