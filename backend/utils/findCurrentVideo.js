exports.findCurrentVideo = (playlist, secondsElapsed) => {
  let timePassed = 0;

  for (const item of playlist) {
    if (secondsElapsed < timePassed + item.end_time) {
      return {
        video: item.video,
        offset: secondsElapsed - timePassed
      };
    }
    timePassed += item.end_time;
  }

  return null; // Playlist ended
};
