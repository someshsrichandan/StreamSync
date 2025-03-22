import React from 'react';
import VideoPlayer from './components/VideoPlayer';

function App() {
  return (
    <div>
      <h2>StreamSync Local</h2>
      <VideoPlayer userId="user123" />
    </div>
  );
}

export default App;