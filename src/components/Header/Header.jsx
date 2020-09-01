import React from 'react';
import styles from './Header.css';

const Header = () => {
  return (
    <>
      <section className={styles.Header}>
        <ul id={styles.MiniLeftNav}>
          <li>
            <a className={styles.navtext} href="#">
              <h1>shapeways</h1>
              <span>
                press the space bar to start music, use your wrists in different
                segments to trigger sounds <br /> / move shapes, bring them
                together, put them apart, leave them in the middle, experiment!
                <br />
                background color in segments are changed by nose position.
                <br /> best experienced 3-6 feet from webcam and on a machine
                with a good GPU / CPU.
              </span>
            </a>
          </li>
        </ul>
      </section>
    </>
  );
};

export default Header;
