const express = require('express');
const path = require('path');
const videoRoutes = require('./routes/videoRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const streamRoutes = require('./routes/streamRoutes');

const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/api', videoRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/streaming', streamRoutes);


app.listen(3001, () => console.log('Server running at http://localhost:3001'));