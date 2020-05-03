const Redis = require('ioredis');

const { redis } = require('../../../config.json');

const redisClient = new Redis(redis);

module.exports = redisClient;
