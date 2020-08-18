import React, { Component } from 'react';
import p5 from 'p5';
import ml5 from 'ml5';
import styles from './Sketch.css';

export default class Sketch extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    let video;
    let poseNet;
    let poses = [];

    p.setup = () => {
      // p.createCanvas(p.windowWidth / 2, p.windowHeight / 2);
      p.createCanvas(640, 480);

      video = p.createCapture(p.VIDEO);
      video.size(p.width, p.height);

      poseNet = ml5.poseNet(video, modelReady);
      poseNet.on('pose', function (results) {
        poses = results;
      });
      video.hide();
    };

    // p.mousePressed = () => {
    //   console.log(JSON.stringify(poses));
    // };

    function getDistance(pos1, pos2) {
      return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }

    function modelReady() {
      console.log('model loaded');
    }

    p.draw = () => {
      p.image(video, 0, 0, p.width, p.height);
      p.strokeWeight(2);
      p.stroke(255);

      // if (poses.length > 0) {
      //   let pose = poses[0].pose;

      //   // Create a pink ellipse for the nose
      //   p.fill(213, 0, 143);
      //   let nose = pose['nose'];
      //   p.ellipse(nose.x, nose.y, 20, 20);

      //   // Create a yellow ellipse for the right eye
      //   p.fill(255, 215, 0);
      //   let rightEye = pose['rightEye'];
      //   p.ellipse(rightEye.x, rightEye.y, 20, 20);

      //   // Create a yellow ellipse for the right eye
      //   p.fill(255, 215, 0);
      //   let leftEye = pose['leftEye'];
      //   p.ellipse(leftEye.x, leftEye.y, 20, 20);
      // }

      if (poses.length > 0) {
        let pose = poses[0].pose;
        let right = pose['rightWrist'];
        let left = pose['leftWrist'];

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

        p.fill(255, 0, 0);
        p.ellipse(right.x, right.y, 20);

        p.fill(255, 0, 0);
        p.ellipse(left.x, left.y, 20);
      }
    };
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
