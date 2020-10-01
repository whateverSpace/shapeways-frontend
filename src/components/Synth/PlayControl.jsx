import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PlayControl = () => {

  const [isPlaying, setIsPlaying] = useState(false);
  useEventListener('click', (e) => {
    if (isPlaying) {
      stopMusic();
      setIsPlaying(false);
    }
    else if (!isPlaying) {
      startMusic();
      setIsPlaying(true);
    }
    return isPlaying;
  });
};
