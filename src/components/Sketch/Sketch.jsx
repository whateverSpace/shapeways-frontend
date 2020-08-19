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
    let capture;
    let poseNet;
    let poses = [];
    let targetRightX = 0; // Target variables used to smooth movement of points
    let targetRightY = 0; // These may be consolidated to a list or table later
    let targetLeftX = 0;
    let targetLeftY = 0;
    let lerpRate = 0.2;   // lerpRate between 0 and 1 determines the easement
                          // where 0 is slowest to reach target and 1 is fastest

    p.setup = () => {
      p.createCanvas(640, 480);
      capture = p.createCapture(p.VIDEO);
      capture.size = (p.width, p.height);
      capture.hide();

      poseNet = ml5.poseNet(capture, modelReady);
      poseNet.on('pose', function(results) {
        poses = results;
      });
    }

    function getDistance (pos1, pos2, pos3, pos4) {
      return Math.sqrt((pos1 - pos2) ** 2 + (pos3 - pos4) ** 2);
    }

    function modelReady () {
      console.log('model loaded');
    }

    p.draw = () => {

      if (poses.length > 0) {   // Draw loop using PoseNet features needs to be in this if statement
        let pose = poses[0].pose;
        let right = pose['rightWrist'];
        let left = pose['leftWrist'];
        targetRightX = p.lerp(targetRightX, right.x, lerpRate);
        targetRightY = p.lerp(targetRightY, right.y, lerpRate);
        targetLeftX = p.lerp(targetLeftX, left.x, lerpRate);
        targetLeftY = p.lerp(targetLeftY, left.y, lerpRate);
          
        p.image(capture, 0, 0, p.width, p.height);
        p.strokeWeight(2);
        p.stroke(255);

        p.line(targetLeftX, targetLeftY, targetRightX, targetRightY);
        
        p.fill(255, 0, 0);
        p.ellipse(targetRightX, targetRightY, 20);

        p.fill(255, 0, 0);
        p.ellipse(targetLeftX, targetLeftY, 20);

        // Gets distance in pixels and mapped from 0 to 1 between wrist points 
        let distInPixels = getDistance(targetLeftX, targetRightX, targetLeftY, targetRightY);
        let mappedDistance = p.map(distInPixels, 0, 640, 0.0, 1.0, true);
        console.log(distInPixels, mappedDistance);
      }
    }
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