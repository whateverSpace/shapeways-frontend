import React, { Component } from 'react';
import p5 from 'p5';
import styles from './Sketch.css';

export default class Sketch extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    p.setup = () => {};

    p.draw = () => {};
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return (
      <>
        <div className={styles.Sketch} ref={this.myRef}></div>
      </>
    );
  }
}
