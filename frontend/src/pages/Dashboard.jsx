import React, { useEffect, useState } from 'react';
import VideoPlayer from '../components/VideoPlayer';

function Dashboard() {
  const userId = localStorage.getItem('userId');
  const [streamingVideo, setStreamingVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    // Polling: check if stream has started or stopped
    const pollStream = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:3001/api/streaming');
        const data = await res.json();
        setStreamingVideo(data.video || null);
      } catch (err) {
        console.error("Error checking stream:", err);
      }
    }, 1000);

    return () => clearInterval(pollStream);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>👋 Welcome, {userId}</h2>
      <button onClick={handleLogout}>🚪 Logout</button>
      <hr />

      {streamingVideo ? (
        <>
          <h3>🎬 Now Streaming: <span style={{ color: '#1db954' }}>{streamingVideo}</span></h3>
          {!showPlayer ? (
            <button onClick={() => setShowPlayer(true)}>▶️ Watch</button>
          ) : (
            <VideoPlayer />
          )}
        </>
      ) : (
        <p style={{ color: 'gray' }}>No live stream right now. Please wait for the admin to start.</p>
      )}
    </div>
  );
}

export default Dashboard;
