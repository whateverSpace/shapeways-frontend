import React, { Component } from 'react';
import p5 from 'p5';
import styles from './Sketch.css';

export default class Sketch extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    let sideWidth_A = 0;
    let sideLength_A = 0;

    let numTris_A = 0;
    let tris_A = [];

    let numRects_A = 0;
    let rects_A = [];

    p.setup = () => {
      p.createCanvas(p.windowWidth / 2, p.windowHeight / 2, p.WEBGL);
      p.colorMode(p.HSB);
      p.rectMode(p.CENTER);

      sideWidth_A = p.width / 8;
      sideLength_A = p.width / 8;

      // sets number of shapes in relation to their size and the window size
      numTris_A = p.width / sideWidth_A;
      numRects_A = p.width / sideWidth_A;

      for (let i = 0; i < numRects_A; i++) {
        rects_A.push(new Rects(sideLength_A * 0.5, sideWidth_A * 0.5));
      }
      for (let i = 0; i < numTris_A; i++) {
        tris_A.push(new Tris(sideLength_A * 0.5));
      }
    }; // end p.setup()

    p.draw = () => {
      if (p.key === 'a') {
        p.background(0);
      }
      if (p.key === 's') {
        p.background(255);
      }

      p.stroke(0);
      //p.rect(0,0,sideWidth_A,sideLength_A);
      //frame for window
      p.line(-p.width / 2, -p.height / 2, p.width / 2, -p.height / 2);
      p.line(-p.width / 2, p.height / 2, p.width / 2, p.height / 2);

      // drawing all the rectangles!!
      for (let i = 0; i < rects_A.length; i++) {
        p.push();
        p.translate(-p.width * 0.3, 0); // moves to the left of window
        p.translate(20 * i, 0 * i); // moves them more
        p.rotate(-p.radians(p.mouseX));

        rects_A[i].display();
        p.pop();
      }

      // drawing all the triangles!!
      for (let i = 0; i < tris_A.length; i++) {
        p.push();
        p.translate(p.width * 0.3, 0); // moves to right of window
        p.translate(-10 * i, 0 * i); // moves them more
        p.rotate(p.radians(p.mouseX));

        tris_A[i].display();
        p.pop();
      }
    }; // end p.draw()

    // do the classes below go in Sketch or outside?
    class Rects {
      constructor(sideLength, sideWidth) {
        this.len = sideLength;
        this.wid = sideWidth;
      }

      display() {
        p.rect(0, 0, 2 * this.len, 2 * this.wid);
      }
    } // end class Rects

    class Tris {
      constructor(sideLength) {
        this.side = sideLength;
      }

      display() {
        // fix center point
        p.triangle(
          0,
          -(p.sqrt(3) * this.side) * 0.5,
          -p.cos(60) * this.side,
          p.sqrt(3) * this.side * 0.5,
          p.cos(60) * this.side,
          p.sqrt(3) * this.side * 0.5
        );
      } // end display()
    } // end class Tris

    // do the classes above go in Sketch or outside?
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
