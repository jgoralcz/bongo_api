const route = require('express-promise-router')();

const { resetClaims } = require('../db/tables/clients_guilds/clients_guilds_table');
const {
  MAX_CLAIM_HOUR,
  MIN_CLAIM_HOUR,
  MAX_CLAIM_MINUTE,
  MIN_CLAIM_MINUTE,
} = require('../util/constants/guilds');

route.patch('/reset', async (req, res) => {
  const { hour, minute } = req.body;

  if (isNaN(hour) || isNaN(minute)) return res.status(400).send({ error: `The hour or the minute is not a number: hour=${hour}, minute=${minute}.` });
  if (hour > MAX_CLAIM_HOUR || hour < MIN_CLAIM_HOUR || minute > MAX_CLAIM_MINUTE || minute < MIN_CLAIM_MINUTE) return res.status(400).send({ error: `The hour or the minute is not valid. Hour must be between ${MIN_CLAIM_HOUR}-${MAX_CLAIM_HOUR} and minute between 0 and 60: hour=${hour}, minute=${minute}.` });

  await resetClaims(hour, minute);
  return res.status(204).send();
});

module.exports = route;
