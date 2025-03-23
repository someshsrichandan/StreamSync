import React, { useEffect, useState } from 'react';
import VideoPlayer from '../components/VideoPlayer';

function Dashboard() {
  const userId = localStorage.getItem('userId');
  const [streamingVideo, setStreamingVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/api/stream-status-sse');

    eventSource.onmessage = (event) => {
      const { video } = JSON.parse(event.data);
      setStreamingVideo(video || null);
    };

    eventSource.onerror = () => {
      console.warn('SSE connection closed');
      eventSource.close();
    };

    return () => eventSource.close();
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
        <p style={{ color: 'gray' }}>⏳ No live stream. Waiting for admin to start...</p>
      )}
    </div>
  );
}

export default Dashboard;
