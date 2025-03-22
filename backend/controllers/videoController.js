const redis = require('../services/redisService');
const { findCurrentVideo } = require('../utils/findCurrentVideo');


const GLOBAL_START = new Date(); 

exports.getCurrentVideo = async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const now = new Date();
    const secondsElapsed = Math.floor((now - GLOBAL_START) / 1000);

    const data = await redis.get(`user:${userId}:playlist`);
    if (!data) {
      return res.status(404).json({ error: 'User not found or playlist not set' });
    }

    const playlist = JSON.parse(data);
    const current = findCurrentVideo(playlist, secondsElapsed);

    if (!current) {
      return res.status(200).json({ message: 'Playlist ended' });
    }

    return res.json(current);
  } catch (err) {
    console.error(' Error in getCurrentVideo:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ GET /api/manifest/:videoId?offset=123
exports.getManifestURL = (req, res) => {
  const videoId = req.params.videoId;
  const offset = req.query.offset;

  if (!videoId || offset === undefined) {
    return res.status(400).json({ error: 'Missing videoId or offset' });
  }

  // You can later generate a dynamic m3u8 if needed
  const manifestUrl = `http://localhost:3001/videos/${videoId}/240p/playlist.m3u8?start=${offset}`;
  res.json({ manifest: manifestUrl });
};
