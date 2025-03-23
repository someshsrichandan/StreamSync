const path = require('path');
const os = require('os');
const fs = require('fs');
const redis = require('../services/redisService');
const { exec } = require('child_process');
const {
  minioClient,
  BUCKET,
  uploadToMinIO,
  listVideoFolders,
  deleteVideoFolder
} = require('../services/minioService');

require('dotenv').config();

function sanitizeName(name) {
  return name.replace(/[^\w\- ]/g, '').replace(/\s+/g, '_');
}

exports.adminLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
};

exports.adminDashboard = async (req, res) => {
  if (!req.headers.cookie?.includes('auth=admin')) return res.redirect('/admin/login');

  const streaming = await redis.get('streaming');
  const videoList = await listVideoFolders();

  // Remove stale Redis entries
  const redisKeys = await redis.keys('video:*');
  for (const key of redisKeys) {
    const name = key.replace('video:', '');
    if (!videoList.includes(name)) await redis.del(key);
  }

  res.send(`
    <h1 style="font-family: Arial, sans-serif">🎬 Admin Dashboard</h1>
    <p><strong>Now Streaming:</strong> ${streaming || 'None'}</p>

    <form action="/admin/upload" method="POST" enctype="multipart/form-data" style="margin-bottom: 20px;">
      <input type="file" name="video" required />
      <button style="padding: 6px 10px;">Upload</button>
    </form>

    <ul style="list-style: none; padding: 0;">
      ${videoList.map(name => `
        <li style="margin-bottom: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
          🎞️ <strong>${name}</strong>
          <form method="POST" action="/admin/start" style="display:inline;">
            <input type="hidden" name="video" value="${name}" />
            <button style="margin-left: 10px;">Start</button>
          </form>
          <form method="POST" action="/admin/stop" style="display:inline;">
            <button style="margin-left: 5px;">Stop</button>
          </form>
          <form method="POST" action="/admin/delete" style="display:inline;">
            <input type="hidden" name="video" value="${name}" />
            <button style="margin-left: 5px; background-color: red; color: white;">Delete</button>
          </form>
        </li>`).join('')}
    </ul>
  `);
};

exports.startStream = async (req, res) => {
  const video = req.body.video;
  const now = Date.now();
  await redis.set('streaming', video);
  await redis.set('stream_start', now);
  res.redirect('/admin');
};

exports.stopStream = async (req, res) => {
  await redis.del('streaming');
  await redis.del('stream_start');
  res.redirect('/admin');
};

exports.uploadVideo = async (req, res) => {
  const file = req.files.video;
  const originalName = path.parse(file.name).name;
  const videoName = sanitizeName(originalName);

  const tempDir = path.join(os.tmpdir(), `${videoName}_240p`);
  const inputPath = path.join(os.tmpdir(), `${videoName}.mp4`);
  const outputPath = path.join(tempDir, 'playlist.m3u8');

  try {
    await file.mv(inputPath);
    fs.mkdirSync(tempDir, { recursive: true });

    const ffmpegCmd = `ffmpeg -i "${inputPath}" -profile:v baseline -level 3.0 -s 426x240 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputPath}"`;

    exec(ffmpegCmd, async (err) => {
      if (err) {
        console.error('FFmpeg error:', err);
        return res.status(500).send('FFmpeg failed.');
      }

      const segments = fs.readdirSync(tempDir);
      for (const filename of segments) {
        const localPath = path.join(tempDir, filename);
        const objectKey = `videos/${videoName}/240p/${filename}`;
        const contentType = filename.endsWith('.m3u8')
          ? 'application/vnd.apple.mpegurl'
          : 'video/MP2T';

        await uploadToMinIO(objectKey, localPath, contentType);
      }

      await redis.set(`video:${videoName}`, JSON.stringify({ createdAt: Date.now() }));

      fs.rmSync(tempDir, { recursive: true, force: true });
      fs.unlinkSync(inputPath);

      res.redirect('/admin');
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).send('Upload or FFmpeg process failed.');
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = req.body.video;
    if (!video) return res.status(400).send('Missing video name');

    // List all objects inside the video's folder
    const objectsToDelete = [];
    const stream = minioClient.listObjectsV2(BUCKET, `videos/${video}/`, true);

    for await (const obj of stream) {
      objectsToDelete.push(obj.name);
    }

    if (objectsToDelete.length > 0) {
      // Actually delete the objects from MinIO
      await minioClient.removeObjects(BUCKET, objectsToDelete);
      console.log(`🗑️ Deleted ${objectsToDelete.length} objects for video: ${video}`);
    } else {
      console.log(`⚠️ No objects found in MinIO for video: ${video}`);
    }

    // Clean from Redis too
    await redis.del(`video:${video}`);
    const currentStream = await redis.get('streaming');
    if (currentStream === video) {
      await redis.del('streaming');
      await redis.del('stream_start');
    }

    res.redirect('/admin');
  } catch (err) {
    console.error('❌ Error deleting video:', err);
    res.status(500).send('Error deleting video');
  }
};

