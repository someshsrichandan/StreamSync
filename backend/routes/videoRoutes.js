const express = require('express');
const router = express.Router();
const {
  getCurrentStream,
  getManifestURL,
  streamStatusSSE
} = require('../controllers/videoController');

router.get('/current-stream', getCurrentStream);
router.get('/manifest/:videoId', getManifestURL);
router.get('/stream-status-sse', streamStatusSSE);

module.exports = router;
