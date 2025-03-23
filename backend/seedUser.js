const redis = require('./services/redisService');
(async () => {
  await redis.set('user:admin:password', 'admin123');
  await redis.set('user:user123:password', 'user123');
  console.log('Users seeded');
  process.exit();
})();
