const redis = require('../services/redisService');

// ✅ GET /api/current-stream → { video, offset }
exports.getCurrentStream = async (req, res) => {
  try {
    const video = await redis.get('streaming');
    const streamStart = await redis.get('stream_start');

    if (!video || !streamStart) {
      return res.status(200).json({ message: 'Stream not started' });
    }

    const now = Date.now();
    const secondsElapsed = Math.floor((now - parseInt(streamStart)) / 1000);

    return res.json({ video, offset: secondsElapsed });
  } catch (err) {
    console.error('Error in getCurrentStream:', err);
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

  const manifestUrl = `http://localhost:3001/videos/${videoId}/240p/playlist.m3u8`;
  res.json({ manifest: manifestUrl, offset: Number(offset) });
};
