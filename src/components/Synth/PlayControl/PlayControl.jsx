import React from 'react';
import PropTypes from 'prop-types';
import styles from './PlayControl.css';
import { GiSpeakerOff, GiSpeaker } from 'react-icons/gi';

export const PlayControl = ({ isPlaying, onClick }) => {

  const Pause = ({ onClick }) => {
    return (
      <>
        <GiSpeakerOff onClick={onClick} />
      </>
    );
  };

  const Play = ({ onClick }) => {
    return (
      <>
        <GiSpeaker onClick={onClick} />
      </>
    );
  };

  const PlayPauseToggler = ({ onClick }) => {
    /*
    Toggles between returning the Play and Pause functions when clicked.
    Updates return based on the state of isPlaying (which changes outside this component as well)
    */
    if (isPlaying) return (<Play onClick={onClick} />);
    else return (<Pause onClick={onClick} />);
  };

  return (
    <section className={styles.PlayControl}>
      <PlayPauseToggler onClick={onClick} />
    </section>
  );
};

PlayControl.propTypes = {
  isPlaying: PropTypes.bool,
  onClick: PropTypes.func,
};
export default PlayControl;
