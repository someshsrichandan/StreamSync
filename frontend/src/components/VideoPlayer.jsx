import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const hlsInstance = useRef(null); // persist HLS instance

  // Poll for stream status
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:3001/api/current-stream');
        const result = await res.json();

        if (result.video && result.offset !== undefined) {
          if (!videoData || videoData.video !== result.video) {
            // New stream started
            const res2 = await fetch(`http://localhost:3001/api/manifest/${result.video}?offset=${result.offset}`);
            const result2 = await res2.json();
            setVideoData({ manifest: result2.manifest, offset: result2.offset, video: result.video });
            setError(null);
            setLoading(false);
          }
        } else {
          // Stream has ended
          if (videoData) {
            setVideoData(null);
            setError("⛔ Stream has ended");
            setLoading(false);
            if (hlsInstance.current) {
              hlsInstance.current.destroy();
              hlsInstance.current = null;
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError("Stream fetch error.");
        setVideoData(null);
      }
    }, 1000);

    return () => clearInterval(poll);
  }, [videoData]);

  // Setup HLS player when new videoData arrives
  useEffect(() => {
    if (videoData?.manifest && Hls.isSupported()) {
      const video = videoRef.current;

      if (hlsInstance.current) {
        hlsInstance.current.destroy();
      }

      const hls = new Hls();
      hlsInstance.current = hls;

      hls.loadSource(videoData.manifest);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = videoData.offset;
        video.muted = true;
        video.play().catch(err => console.error('Autoplay failed:', err));
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

  if (loading) return <p>⏳ Waiting for stream...</p>;
  if (error) return <p style={{ color: 'red' }}>⚠️ {error}</p>;

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
