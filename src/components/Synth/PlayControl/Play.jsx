import React from 'react';
import PropTypes from 'prop-types';

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

Play.propTypes = {
  onClick: PropTypes.func.isRequired,
};
export default Play;
