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

  if (error) return <p style={{ color: 'red' }}>⚠️ {error}</p>;
  if (!videoData) return <p>⏳ Waiting for stream...</p>;

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      <h3>🎥 StreamSync Player</h3>
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          controls={false}
          width="720"
          style={{ cursor: 'pointer' }}
        />
        <button 
          onClick={toggleMute}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            padding: '8px',
            cursor: 'pointer'
          }}
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
