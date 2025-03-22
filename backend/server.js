const express = require('express');
const path = require('path');
const videoRoutes = require('./routes/videoRoutes');
const cors = require('cors'); 


const app = express();
app.use(cors());  

app.use(express.json());
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/api', videoRoutes);

app.listen(3001, () => console.log(' Backend running at http://localhost:3001'));

