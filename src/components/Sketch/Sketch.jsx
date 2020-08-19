import React, { Component } from 'react';
import p5 from 'p5';
import ml5 from 'ml5';
import styles from './Sketch.css';

export default class Sketch extends Component {
  state = { loading: true };
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    let video;
    let poseNet;
    let poses = [];

    let sideWidth_A = 0;
    let sideLength_A = 0;

    let numTris_A = 0;
    let tris_A = [];

    let numRects_A = 0;
    let rects_A = [];

    let shapeNumber = 8;

    let slider;

    p.setup = () => {
      p.createCanvas(p.windowWidth / 2, p.windowHeight / 2);

      video = p.createCapture(p.VIDEO);
      video.size(p.width, p.height);
      video.hide();

      poseNet = ml5.poseNet(video, modelReady);
      poseNet.on('pose', function (results) {
        poses = results;
      });

      p.colorMode(p.HSB);
      p.rectMode(p.CENTER);

      slider = p.createSlider(0, 255, 100);
      slider.position(20, 20);

      sideWidth_A = p.width / shapeNumber;
      sideLength_A = p.width / shapeNumber;

      // sets number of shapes in relation to their size and the window size
      numTris_A = p.width / sideWidth_A;
      numRects_A = p.width / sideWidth_A;

      for (let i = 0; i < numRects_A; i++) {
        rects_A.push(new Rects(sideLength_A, sideWidth_A));
      }
      for (let i = 0; i < numTris_A; i++) {
        tris_A.push(new Tris(sideLength_A / (2 / p.sqrt(2))));
      }
    }; // end p.setup()

    function getDistance(pos1, pos2) {
      return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }

    function modelReady() {
      console.log('model loaded');
    }

    p.draw = () => {
      // p.background(255);
      // p.image(video, 0, 0, p.width, p.height);

      //pose tracking illustration
      if (poses.length > 0) {
        let pose = poses[0].pose;
        let right = pose['rightWrist'];
        // console.log(right);
        let left = pose['leftWrist'];

        const sliderThing = slider.value();
        p.background(right.x, left.x, sliderThing);
        // const distanceThing = getDistance(left, right) * 0.25;

        p.noFill();
        p.quad(
          right.x,
          right.y,
          right.x,
          right.y - getDistance(left, right),
          left.x,
          left.y - getDistance(left, right),
          left.x,
          left.y
        );

        // console.log(getDistance(left, right) * 0.25);

        // p.fill(255, 0, 0);
        p.ellipse(right.x, right.y, 20);

        // p.fill(255, 0, 0);
        p.ellipse(left.x, left.y, 20);
        p.strokeWeight(2);
        p.stroke(255);

        if (p.key === 'a') {
          p.background(255);
          // p.noFill();
        }
        if (p.key === 's') {
          // p.background(0);
        }

        p.stroke(0);
        //p.rect(0,0,sideWidth_A,sideLength_A);
        //frame for window
        p.line(0, 0, p.width, 0);
        p.line(0, p.height, p.width, p.height);

        // drawing all the rectangles!!
        p.push();
        p.translate(p.width * 0.5, p.height * 0.5);
        for (let i = 0; i < rects_A.length; i++) {
          p.push();
          p.translate(-p.width * 0.3, 0); // moves to the left of window
          p.translate(20 * i, 0 * i); // moves them more
          p.rotate(-p.radians(p.mouseX));
          // p.scale(distanceThing - 50);

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

        p.pop();
      }

      // p.image(video, -500, -215, p.width, p.height);
      // };
    }; // end p.draw()

    // do the classes below go in Sketch or outside?
    class Rects {
      constructor(sideLength, sideWidth) {
        this.len = sideLength;
        this.wid = sideWidth;
      }

      display() {
        p.rect(0, 0, 2 * this.wid, 2 * this.len);
      }

      inscribeEllipse() {
        p.ellipse(0, 0, 2 * this.wid, 2 * this.len);
      }
    } // end class Rects

    class Tris {
      constructor(radiusLength) {
        this.radius = radiusLength;
      }

      display() {
        // fix center point
        p.triangle(
          0,
          this.radius * 2,
          -this.radius * p.sqrt(3),
          -this.radius,
          this.radius * p.sqrt(3),
          -this.radius
        );
      } // end display()

      inscribeEllipse() {
        p.ellipse(0, 0, this.radius * 2, this.radius * 2);
      }
    } // end class Tris
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
