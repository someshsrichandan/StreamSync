import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ userId }) => {
  const videoRef = useRef();
  const [videoData, setVideoData] = useState({ manifest: null, offset: 0 });
  const playbackStartTime = useRef(null);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay

  // Fetch manifest and offset
  useEffect(() => {
    async function loadManifest() {
      try {
        const res1 = await fetch(`http://localhost:3001/api/current-video?user_id=${userId}`);
        const result1 = await res1.json();

        if (!result1.video || result1.offset === undefined) {
          console.error("Invalid data from backend", result1);
          return;
        }

        const res2 = await fetch(`http://localhost:3001/api/manifest/${result1.video}?offset=${result1.offset}`);
        const result2 = await res2.json();
        setVideoData({ manifest: result2.manifest, offset: result1.offset });
      } catch (err) {
        console.error("Failed to fetch manifest", err);
      }
    }

    loadManifest();
  }, [userId]);

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // Initialize HLS and setup seeking prevention
  useEffect(() => {
    if (videoData.manifest && Hls.isSupported()) {
      const hls = new Hls();
      let video = videoRef.current;
      
      hls.loadSource(videoData.manifest);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        playbackStartTime.current = Date.now() - videoData.offset * 1000;
        video.currentTime = videoData.offset;
        
        // Autoplay with muted audio
        video.muted = true;
        video.play().catch(err => console.error('Autoplay failed:', err));
      });

      // Prevent seeking
      const preventSeek = (e) => {
        const expectedTime = (Date.now() - playbackStartTime.current) / 1000;
        if (Math.abs(video.currentTime - expectedTime) > 1) {
          video.currentTime = expectedTime;
        }
      };

      video.addEventListener('seeking', preventSeek);
      video.addEventListener('timeupdate', preventSeek);

      return () => {
        hls.destroy();
        video.removeEventListener('seeking', preventSeek);
        video.removeEventListener('timeupdate', preventSeek);
      };
    }
  }, [videoData]);

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