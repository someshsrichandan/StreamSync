const express = require('express');
const router = express.Router();
const { getCurrentVideo, getManifestURL } = require('../controllers/videoController');

router.get('/current-video', getCurrentVideo);
router.get('/manifest/:videoId', getManifestURL);

module.exports = router;