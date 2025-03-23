const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const {
  adminLoginPage,
  adminDashboard,
  startStream,
  stopStream,
  uploadVideo,
  deleteVideo // ✅ Import the delete controller
} = require('../controllers/adminController');

router.use(fileUpload());

router.get('/login', adminLoginPage);
router.get('/', adminDashboard);
router.post('/start', startStream);
router.post('/stop', stopStream);
router.post('/upload', uploadVideo);
router.post('/delete', deleteVideo); // ✅ Add the delete route here

module.exports = router;
