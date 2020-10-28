import React from 'react';

import Toggle from './Toggle';
import useDarkMode from 'use-dark-mode';
import styles from './DarkModeToggle.css';
export const DarkModeToggle = () => {
  const darkMode = useDarkMode(false);

  return (
    <div className={styles.darkModeToggle}>
      <button type="button" onClick={darkMode.disable}>
        ☀
      </button>
      <Toggle checked={darkMode.value} onChange={darkMode.toggle} />
      <button type="button" onClick={darkMode.enable}>
        ☾
      </button>
    </div>
  );
};
