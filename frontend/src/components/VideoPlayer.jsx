import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState(null);
  const hlsInstance = useRef(null);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const res1 = await fetch('http://localhost:3001/api/current-stream');
        const result1 = await res1.json();

        if (!result1.video || result1.offset === undefined) {
          setError("Stream not available");
          return;
        }

        const res2 = await fetch(`http://localhost:3001/api/manifest/${result1.video}?offset=${result1.offset}`);
        const result2 = await res2.json();

        setVideoData({
          video: result1.video,
          manifest: result2.manifest,
          offset: result2.offset
        });
      } catch (err) {
        setError("Stream load error");
      }
    };

    fetchStream();
  }, []);

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
    <div onContextMenu={e => e.preventDefault()}>
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
