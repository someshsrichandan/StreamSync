const fs = require('fs');
const path = require('path');
const redis = require('../services/redisService');
const { exec } = require('child_process');

exports.adminLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
};

exports.adminDashboard = async (req, res) => {
  if (!req.headers.cookie?.includes('auth=admin')) return res.redirect('/admin/login');

  const folders = fs.readdirSync(path.join(__dirname, '../videos'));
  const streaming = await redis.get('streaming');

  res.send(`
    <h1>Admin Dashboard</h1>
    <p>Currently streaming: <strong>${streaming || 'None'}</strong></p>
    <form action="/admin/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="video" required />
      <button type="submit">Upload</button>
    </form>
    <ul>
      ${folders.map(name => `
        <li>
          ${name}
          <form method="POST" action="/admin/start" style="display:inline;">
            <input type="hidden" name="video" value="${name}" />
            <button>Start</button>
          </form>
          <form method="POST" action="/admin/stop" style="display:inline;">
            <button>Stop</button>
          </form>
        </li>
      `).join('')}
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
  const videoName = path.parse(file.name).name;
  const outputPath = path.join(__dirname, `../videos/${videoName}/240p`);
  fs.mkdirSync(outputPath, { recursive: true });

  const inputPath = path.join(__dirname, `../uploads/${file.name}`);
  await file.mv(inputPath);

  const command = `ffmpeg -i "${inputPath}" -profile:v baseline -level 3.0 -s 426x240 -start_number 0 -hls_time 10 -hls_list_size 5 -hls_flags delete_segments -f hls "${outputPath}/playlist.m3u8"`;

  exec(command, async (err) => {
    if (err) return res.status(500).send('FFmpeg error');
    await redis.set(`video:${videoName}`, JSON.stringify({ createdAt: Date.now() }));
    fs.unlinkSync(inputPath);
    res.redirect('/admin');
  });
};
