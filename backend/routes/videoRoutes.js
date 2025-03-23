const express = require('express');
const router = express.Router();
const {
  getCurrentStream,
  getManifestURL
} = require('../controllers/videoController');  // ✅ file path and names must match

router.get('/current-stream', getCurrentStream);
router.get('/manifest/:videoId', getManifestURL);

module.exports = router;
