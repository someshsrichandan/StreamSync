const redis = require('./services/redisService');

const playlist = [
  { video: 'video1', end_time: 999999 } // long enough for testing
];

(async () => {
  await redis.set("user:user123:playlist", JSON.stringify(playlist));
  console.log(" Playlist seeded");
  process.exit();
})();
