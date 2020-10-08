import React from 'react';
import PropTypes from 'prop-types';
import Play from './Play';
import Pause from './Pause';
export const PlayControl = ({ isPlaying, handlePlayClick, handlePauseClick }) => {
  return (
    <div>
      { isPlaying ?
        <Pause onClick={handlePlayClick} /> :
        <Play onClick={handlePauseClick} /> }
    </div>
  );
};
PlayControl.propTypes = {
  isPlaying: PropTypes.bool,
  handlePlayClick: PropTypes.func,
  handlePauseClick: PropTypes.func
};
export default PlayControl;
