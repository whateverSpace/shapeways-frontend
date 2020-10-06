import { React } from 'react';
import PropTypes from 'prop-types';
import Play from './Play';
import Pause from './Pause';
export const PlayControl = (props) => {

  return (
    <>
      { props.isPlaying ?
        <Pause onClick={props.handlePlayClick} /> :
        <Play onClick={props.handlePauseClick} /> }
    </>
  );
};
export default PlayControl;
PlayControl.propTypes = {
  isPlaying: PropTypes.bool,
  handlePlayClick: PropTypes.func,
  handlePauseClick: PropTypes.func
};
