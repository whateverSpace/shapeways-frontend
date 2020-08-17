import React, { Component } from 'react';
import p5 from 'p5';

export default class Sketch extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    let x = 100;
    let y = 100;
    p.setup = () => {
      p.createCanvas(200, 200);
    };

    p.draw = () => {
      p.background(255, 255, 200, 100);
      p.fill(255);
      p.rect(x, y, 50, 50);
    };
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return <div ref={this.myRef}></div>;
  }
}
