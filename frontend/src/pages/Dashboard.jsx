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
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.welcomeMessage}>👋 Welcome, {userId}</h2>
        <button style={styles.logoutButton} onClick={handleLogout}>🚪 Logout</button>
      </div>
      <hr style={styles.divider} />

      {streamingVideo ? (
        <div style={styles.streamingSection}>
          <h3 style={styles.streamingTitle}>
            🎬 Now Streaming: <span style={styles.streamingVideoName}>{streamingVideo}</span>
          </h3>
          {!showPlayer ? (
            <button style={styles.watchButton} onClick={() => setShowPlayer(true)}>▶️ Watch</button>
          ) : (
            <VideoPlayer />
          )}
        </div>
      ) : (
        <p style={styles.waitingMessage}>⏳ No live stream. Waiting for admin to start...</p>
      )}
    </div>
  );
}

export default Dashboard;

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  welcomeMessage: {
    fontSize: '24px',
    color: '#333',
    margin: '0',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#ff4d4d',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  logoutButtonHover: {
    backgroundColor: '#ff1a1a',
  },
  divider: {
    border: '0',
    height: '1px',
    background: '#ddd',
    margin: '20px 0',
  },
  streamingSection: {
    textAlign: 'center',
    marginTop: '20px',
  },
  streamingTitle: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '20px',
  },
  streamingVideoName: {
    color: '#1db954',
    fontWeight: 'bold',
  },
  watchButton: {
    padding: '10px 20px',
    backgroundColor: '#1db954',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  watchButtonHover: {
    backgroundColor: '#1ed760',
  },
  waitingMessage: {
    textAlign: 'center',
    color: 'gray',
    fontSize: '18px',
    marginTop: '20px',
  },
};