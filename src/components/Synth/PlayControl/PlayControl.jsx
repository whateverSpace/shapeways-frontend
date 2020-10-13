import React from 'react';
import PropTypes from 'prop-types';
import styles from './PlayControl.css';
import { GiSpeakerOff, GiSpeaker } from 'react-icons/gi';

export const PlayControl = ({ isPlaying, onClick }) => {

  const Pause = ({ onClick }) => {
    return (
      <label>Pause
        <GiSpeakerOff onClick={onClick} />
      </label>
    );
  };

  const Play = ({ onClick }) => {
    return (
      <>
        <label>Play
          <GiSpeaker onClick={onClick} />
        </label>

      </>
    );
  };

  const Toggler = ({ onClick }) => {
    if (isPlaying) return (<Play onClick={onClick} />);
    else return (<Pause onClick={onClick} />);
  };

  return (
    <section className={styles.PlayControl}>
      <Toggler onClick={onClick} />
    </section>
  );
};

PlayControl.propTypes = {
  isPlaying: PropTypes.bool,
  onClick: PropTypes.func,
};
export default PlayControl;
