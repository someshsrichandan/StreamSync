import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState(null);
  const hlsInstance = useRef(null);

  const minioBaseUrl = import.meta.env.VITE_MINIO_BASE_URL;

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/current-stream');
        const result = await res.json();

        if (!result.video || result.offset === undefined) {
          setError("Stream not available");
          return;
        }

        const manifestUrl = `${minioBaseUrl}/videos/${result.video}/240p/playlist.m3u8`;

        setVideoData({
          video: result.video,
          manifest: manifestUrl,
          offset: result.offset
        });
      } catch (err) {
        setError("Stream load error");
      }
    };

    fetchStream();
  }, [minioBaseUrl]);

  useEffect(() => {
    if (videoData?.manifest && Hls.isSupported()) {
      const video = videoRef.current;

      if (hlsInstance.current) {
        hlsInstance.current.destroy();
      }

      const hls = new Hls();
      hlsInstance.current = hls;

      hls.attachMedia(video);
      hls.loadSource(videoData.manifest);

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        video.currentTime = videoData.offset;
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = isMuted;
        video.play().catch(err => console.error('Autoplay failed', err));
      });

      return () => {
        hls.destroy();
        hlsInstance.current = null;
      };
    }
  }, [videoData]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  if (error) return <p style={styles.errorMessage}>⚠️ {error}</p>;
  if (!videoData) return <p style={styles.loadingMessage}>⏳ Waiting for stream...</p>;

  return (
    <div onContextMenu={(e) => e.preventDefault()} style={styles.container}>
      <h3 style={styles.title}>🎥 StreamSync Player</h3>
      <div style={styles.videoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          controls={false}
          width="720"
          style={styles.video}
        />
        <button 
          onClick={toggleMute}
          style={styles.muteButton}
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  },
  videoWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  video: {
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },
  muteButton: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.3s ease',
  },
  muteButtonHover: {
    background: 'rgba(0, 0, 0, 0.9)',
  },
  errorMessage: {
    color: 'red',
    fontSize: '18px',
    textAlign: 'center',
    marginTop: '20px',
  },
  loadingMessage: {
    color: '#666',
    fontSize: '18px',
    textAlign: 'center',
    marginTop: '20px',
  },
};