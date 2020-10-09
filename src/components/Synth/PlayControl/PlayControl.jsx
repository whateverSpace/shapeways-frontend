import React from 'react';
import PropTypes from 'prop-types';
import Play from './Play';
import Pause from './Pause';
import styles from './PlayControl.css';
export const PlayControl = ({ isPlaying, onClick }) => {

  const Pause = ({ onClick }) => {
    return (
      <>
        <label>Pause
          <svg className="button" viewBox="0 0 60 60" onClick={onClick}>
            <polygon points="0,0 15,0 15,60 0,60" />
            <polygon points="25,0 40,0 40,60 25,60" />
          </svg>
        </label>
      </>
    );
  };

  const Play = ({ onClick }) => {
    return (
      <>
        <label>Play
          <svg className="button" viewBox="0 0 60 60" onClick={onClick}>
            <polygon points="0,0 50,30 0,60" />
          </svg>
        </label>

      </>
    );
  };

  const Toggler = ({ onClick }) => {
    if (isPlaying) return (<Play onClick={onClick}/>);
    else return (<Pause onClick={onClick}/>);
  };

  return (
    <Toggler onClick={onClick} />
  );
};

PlayControl.propTypes = {
  isPlaying: PropTypes.bool,
  onClick: PropTypes.func,
};
export default PlayControl;
