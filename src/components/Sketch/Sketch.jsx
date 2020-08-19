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

    p.setup = () => {
      p.createCanvas(640, 480);
      capture = p.createCapture(p.VIDEO);
      capture.size = (p.width, p.height);

      poseNet = ml5.poseNet(capture, modelReady);
      poseNet.on('pose', function(results) {
        poses = results;
      });
      capture.hide();
    }

    p.mousePressed = () => {
      console.log(JSON.stringify(poses));
    }
    
    function getDistance(pos1, pos2) {
      return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }

    function modelReady(){
      console.log('model loaded');
    }

    p.draw = () => {
      p.image(capture, 0, 0, p.width, p.height);
      p.strokeWeight(2);
      p.stroke(255);

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