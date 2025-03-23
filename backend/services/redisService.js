require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

redis.on('connect', () => console.log(' Redis connected'));
redis.on('error', (err) => console.error(' Redis error:', err));

module.exports = redis;
