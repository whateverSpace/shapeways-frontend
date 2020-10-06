import { React, useState } from 'react';
import Play from './Play';
import Pause from './Pause';

const PlayControl = (props) => {





  return (
    <>
      { props.isPlaying ?
        <Pause onClick={props.handlePlayClick} /> :
        <Play onClick={props.handlePauseClick} /> }
    </>
  );
};


export default PlayControl;
