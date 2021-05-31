/* eslint-disable import/no-dynamic-require */
const route = require('express-promise-router')();

const { Webhook } = require('@top-gg/sdk');
const log4js = require('log4js');
const { getClientInfo, updateUserBankPointsAndRollsVote } = require('../db/tables/clients/clients_table');
const { initializeGetNewUser } = require('../util/functions/user');

const { messengerAPI } = require('../services/axios');
const { api, config } = require('../util/constants/paths');

const { streakAmount, maxStreak } = require(config);
const { dbl } = require(api);

const logger = log4js.getLogger();
logger.level = 'info';

const wh = new Webhook(dbl.pass);

route.post('/webhook', wh.listener(async (vote) => {
  if (!vote || !vote.user) {
    throw new Error(`invalid vote, ${vote}`);
  }

  let points = (vote.isWeekend) ? 10000 : 5000;

  try {
    // create new user if not found
    let data;
    const userQuery = await getClientInfo(vote.user);
    if (!userQuery || userQuery.length <= 0 || !userQuery[0]) {
      const { status, send } = await initializeGetNewUser(vote.user);
      if (status !== 201) {
        throw new Error(`could not create user, ${vote.user}`);
      }
      data = send;
    } else {
      [data] = userQuery;
    }

    const {
      streak_vote: streakVote,
      patron,
    } = data;

    const streak = (streakVote || 0) + 1;
    points += patron ? 15000 : 0;
    points += streak > 10 ? streakAmount * maxStreak : streakAmount * (streak - 1);

    await updateUserBankPointsAndRollsVote(vote.user, points);

    if (streak < 20) {
      logger.info(`${vote.user} has received ${points} points, stored +1 roll reset, and is on a ${streak} day voting streak.`);
      return;
    }

    await messengerAPI.post('/votes', { userID: vote.user, streak, points });
  } catch (error) {
    logger.error(error);
  }
}));

module.exports = route;
