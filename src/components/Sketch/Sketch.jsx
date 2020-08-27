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
    let targetRight = {x: 0, y: 0}; // Target variables used to smooth movement of points
    let targetLeft = {x: 0, y: 0};
    let lerpRate = 0.1;   // lerpRate between 0 and 1 determines the easing where 0 is slowest to reach target and 1 is fastest
    let segments = [];
    
    let distInPixels;
    let distX;
    let distY;
    let mappedDistance;

    class Segment {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = p.width/3;
        this.h = p.height/2;
        this.hitLeft = false;
        this.hitRight = false;
        this.alpha = 0;
      }

      display() {
        if (this.hitLeft || this.hitRight) {
          this.alpha = p.lerp(this.alpha, 255, 0.3)
          p.fill(255, 0, 255, this.alpha);
          p.rect(this.x, this.y, p.width/3, p.height/2);
        } else {
          this.alpha = p.lerp(this.alpha, 0, 0.1)
          p.fill(255, 0, 0, this.alpha);
          p.rect(this.x, this.y, p.width/3, p.height/2);
        }
      }

      checkCollision(targetL, targetR) {
        this.hitLeft = collision(targetL.x, targetL.y, 5, this.x, this.y, this.w, this.h)
        this.hitRight = collision(targetR.x, targetR.y, 5, this.x, this.y, this.w, this.h)
      }
    }

    function collision(targetX, targetY, radius, segX, segY, segW, segH) {
      let testX = targetX;
      let testY = targetY;

      if (targetX < segX) {testX = segX}
      else if (targetX > segX+segW) {testX = segX + segW}

      if (targetY < segY) {testY = segY}
      else if (targetY > segY+segH) {testY = segY + segH}

      let distX = targetX - testX;
      let distY = targetY - testY;
      let distance = Math.sqrt((distX*distX) + (distY * distY));

      if (distance <= radius) {
        return true;
      }
      return false;
    }
    
    function getDistance (pos1, pos2) {
      return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }

    function modelReady () {
      console.log('model loaded');
    }

    function jitter () {
      let val = p.random(-1, 1);
      return val;
    }

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

    p.draw = () => {
      
      if (poses.length > 0) {   // Draw loop using PoseNet features needs to be in this if statement
        let pose = poses[0].pose;
        let right = pose['rightWrist'];
        let left = pose['leftWrist'];
        let scoreRight = poses[0].pose.keypoints[10].score;
        let scoreLeft = poses[0].pose.keypoints[9].score;

        /*
        // Mirror the camera output: 
        p.translate(p.width, 0);
        p.scale(-1.0, 1.0);
        */

        p.image(capture, 0, 0, p.width, p.height);
        p.noStroke();

        segments[0] = new Segment(0, 0);
        segments[1] = new Segment(p.width/3, 0);
        segments[2] = new Segment(p.width/3 * 2, 0);
        segments[3] = new Segment(0, p.height/2);
        segments[4] = new Segment(p.width/3, p.height/2);
        segments[5] = new Segment(p.width/3 * 2, p.height/2);
        
        for (let i = 0; i < segments.length; i++) {
          segments[i].checkCollision(targetLeft, targetRight)
          if (segments[i].hitLeft && segments[i].hitRight) {
            console.log('Hand clap.')
          } else if (segments[i].hitLeft) {
            console.log(`Segment ${i} hit by left.`)
          } else if (segments[i].hitRight) { 
            console.log(`Segment ${i} hit by right.`)
          }
          segments[i].display();
        }
        
        p.stroke(50);
        p.line(p.width/3, 0, p.width/3, p.height);
        p.line(p.width/3 *2, 0, p.width/3 * 2, p.height);
        p.line(0, p.height/2, p.width, p.height/2); 

        p.stroke(255);
        p.strokeWeight(2);
        p.line(targetLeft.x, targetLeft.y, targetRight.x, targetRight.y);

        if (scoreRight > 0.3 ) {
          targetRight.x = p.lerp(targetRight.x, right.x, lerpRate);
          targetRight.y = p.lerp(targetRight.y, right.y, lerpRate);
          p.fill(255, 0, 0);
          p.ellipse(targetRight.x, targetRight.y, 20);
        } else {
          targetRight.x += jitter()
          targetRight.y += jitter()
          p.fill(50);
          p.ellipse(targetRight.x, targetRight.y, 20);
        }

        if (scoreLeft > 0.3) { 
          targetLeft.x = p.lerp(targetLeft.x, left.x, lerpRate);
          targetLeft.y = p.lerp(targetLeft.y, left.y, lerpRate);
          p.fill(255, 0, 0);
          p.ellipse(targetLeft.x, targetLeft.y, 20);
        } else {
          targetLeft.x += jitter()
          targetLeft.y += jitter()
          p.fill(50);
          p.ellipse(targetLeft.x, targetLeft.y, 20);
        }

        // Data streams

        // Gets distance in pixels and mapped from 0 to 1 between wrist points 
        distInPixels = Math.floor(getDistance(targetLeft, targetRight));
        distX = Math.floor(targetLeft.x - targetRight.x);
        distY = Math.floor(Math.abs(targetLeft.y - targetRight.y));
        mappedDistance = p.map(distInPixels, 0, p.width, 0.0, 1.0, true);

        console.log(`Distance between wrists at x-axis: ${distX}`)
        console.log(`Distance between wrists at y-axis: ${distY}`)
        console.log(`Total distance between wrists: ${distInPixels}`)
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