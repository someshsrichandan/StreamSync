const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const {
  adminLoginPage,
  adminDashboard,
  startStream,
  stopStream,
  uploadVideo
} = require('../controllers/adminController');

router.use(fileUpload());
router.get('/login', adminLoginPage);
router.get('/', adminDashboard);
router.post('/start', startStream);
router.post('/stop', stopStream);
router.post('/upload', uploadVideo);

module.exports = router;