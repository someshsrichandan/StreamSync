const redis = require('../services/redisService');

exports.getStreaming = async (req, res) => {
  const video = await redis.get('streaming'); // Single key to store current streaming video
  if (!video) return res.json({ video: null });
  res.json({ video });
};
