const Minio = require('minio');
require('dotenv').config();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET;

// Upload file
async function uploadToMinIO(objectKey, filePath, contentType) {
  await minioClient.fPutObject(BUCKET, objectKey, filePath, { 'Content-Type': contentType });
}

// List all videos that have playlist.m3u8
async function listVideoFolders() {
  return new Promise((resolve, reject) => {
    const folders = new Set();
    const stream = minioClient.listObjectsV2(BUCKET, 'videos/', true);

    stream.on('data', obj => {
      const match = obj.name.match(/^videos\/([^/]+)\/240p\/playlist\.m3u8$/);
      if (match) folders.add(match[1]);
    });

    stream.on('end', () => resolve(Array.from(folders)));
    stream.on('error', reject);
  });
}

// Delete full video folder
async function deleteVideoFolder(videoName) {
  const toDelete = [];

  return new Promise((resolve, reject) => {
    const stream = minioClient.listObjectsV2(BUCKET, `videos/${videoName}/`, true);

    stream.on('data', obj => toDelete.push(obj.name));
    stream.on('end', async () => {
      if (toDelete.length > 0) {
        await minioClient.removeObjects(BUCKET, toDelete);
        resolve(true);
      } else {
        resolve(false);
      }
    });

    stream.on('error', reject);
  });
}

module.exports = {
  minioClient,
  BUCKET,
  uploadToMinIO,
  listVideoFolders,
  deleteVideoFolder
};
