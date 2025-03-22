exports.findCurrentVideo = (playlist, currentTime) => {
    let prevEnd = 0;
    for (const item of playlist) {
      if (currentTime < item.end_time) {
        return {
          video: item.video,
          offset: currentTime - prevEnd
        };
      }
      prevEnd = item.end_time;
    }
    return null;
  };