import React from 'react';
import PropTypes from 'prop-types';

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

Pause.propTypes = {
  onClick: PropTypes.func.isRequired,
};
export default Pause;
