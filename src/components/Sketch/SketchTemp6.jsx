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

    // let faceapi;

    // let detections;

    let targetRightX = 0; // Target variables used to smooth movement of points

    let targetRightY = 0; // These may be consolidated to a list or table later

    let targetLeftX = 0;

    let targetLeftY = 0;

    let lerpRate = 0.2; // lerpRate between 0 and 1 determines the easement

    let segments = [];

    // let sideWidth_A = 0;

    // let sideLength_A = 0;

    // let numTris_A = 0;

    // let tris_A = [];

    // let numRects_A = 0;

    // let rects_A = [];

    // let shapeNumber = 8;

    let groupTest;
    let numShapesStart = 10;
    let numShapesMin = 10;
    let numShapesMax = 30;
    let sideLengthStart = 20;
    let sideLengthMin = 20;
    let sideLengthMax = 100;

    // const detection_options = {

    //   withLandmarks: true,

    //   withDescriptors: true,

    // };

    class Segment {
      constructor(x, y) {
        this.x = x;

        this.y = y;

        this.w = p.width / 3;

        this.h = p.height / 2;

        this.hit = false;

        this.alpha = 0;
      } // end constructor()

      display() {
        if (this.hit) {
          this.alpha = p.lerp(this.alpha, 255, 0.3);

          p.push();

          p.translate((p.width / 6) * 5, p.height / 4);

          p.scale(-1.0, 1.0);

          p.fill(270, 255, 255, 0.3);

          p.rect(this.x, this.y, p.width / 3, p.height / 2);

          p.pop();
        } else {
          this.alpha = p.lerp(this.alpha, 0, 0.1);

          // p.translate(p.width, 0);

          // p.scale(-1.0, 1.0);

          // p.fill(255, 0, 0, this.alpha);

          // p.rect(this.x, this.y, p.width / 2, p.height);
        }
      } // end display()

      checkCollision(target) {
        this.hit = collision(
          target.x,

          target.y,

          5,

          this.x,

          this.y,

          this.w,

          this.h
        );
      } // end checkCollision()
    } // end class Segment

    function collision(targetX, targetY, radius, segX, segY, segW, segH) {
      let testX = targetX;

      let testY = targetY;

      if (targetX < segX) {
        testX = segX;
      } else if (targetX > segX + segW) {
        testX = segX + segW;
      }

      if (targetY < segY) {
        testY = segY;
      } else if (targetY > segY + segH) {
        testY = segY + segH;
      }

      let distX = targetX - testX;

      let distY = targetY - testY;

      let distance = Math.sqrt(distX * distX + distY * distY);

      if (distance <= radius) {
        return true;
      }

      return false;
    } // end function collision()

    function getDistance(pos1, pos2, pos3, pos4) {
      return Math.sqrt((pos1 - pos2) ** 2 + (pos3 - pos4) ** 2);
    } //  end function getDistance()

    function modelReady() {
      console.log('model loaded');
    } // end function modelReady()

    p.setup = () => {
      p.createCanvas(p.windowWidth / 2, p.windowHeight / 2);

      p.colorMode(p.HSB);

      p.rectMode(p.CENTER);

      segments[0] = new Segment(0, 0);

      segments[1] = new Segment(p.width / 3, 0);

      segments[2] = new Segment((p.width / 3) * 2, 0);

      segments[3] = new Segment(0, p.height / 2);

      segments[4] = new Segment(p.width / 3, p.height / 2);

      segments[5] = new Segment((p.width / 3) * 2, p.height / 2);

      video = p.createCapture(p.VIDEO);

      video.size(p.width, p.height);

      video.hide();

      poseNet = ml5.poseNet(video, modelReady);

      poseNet.on('pose', function (results) {
        poses = results;
      });

      // faceapi = ml5.faceApi(video, detection_options, modelReady);

      groupTest = new RectsGroup(sideLengthStart, sideLengthStart);
      groupTest.intitialize(numShapesStart);

      // sets number of shapes in relation to their size and the window size

      // sideWidth_A = p.width / shapeNumber;

      // sideLength_A = p.width / shapeNumber;

      // numTris_A = p.width / sideWidth_A;

      // numRects_A = p.width / sideWidth_A;

      // for (let i = 0; i < numRects_A; i++) {

      //   rects_A.push(new Rects(sideLength_A, sideWidth_A));

      // }

      // for (let i = 0; i < numTris_A; i++) {

      //   tris_A.push(new Tris(sideLength_A / (2 / p.sqrt(2))));

      // }
    }; // end p.setup()

    p.draw = () => {
      // p.background(255);

      //pose tracking illustration

      // console.log(poses);

      if (poses.length > 0) {
        this.setState({
          loading: false,
        });

        let pose = poses[0].pose;

        let right = pose['rightShoulder'];

        // console.log(right);

        let left = pose['leftShoulder'];

        let nose = pose['nose'];

        let leftEye = pose['leftEye'];

        let rightEye = pose['rightEye'];

        // let leftEar = pose['leftEar'];

        // let rightEar = pose['rightEar'];

        // console.log(nose);

        targetRightX = p.lerp(targetRightX, right.x, lerpRate);

        targetRightY = p.lerp(targetRightY, right.y, lerpRate);

        targetLeftX = p.lerp(targetLeftX, left.x, lerpRate);

        targetLeftY = p.lerp(targetLeftY, left.y, lerpRate);

        //(un)comment to see webcam image

        // p.push();

        // p.translate(p.width, 0);

        // p.scale(-1.0, 1.0);

        // p.image(video, 0, 0, p.width, p.height);

        // p.pop();

        let distInPixels = getDistance(
          targetLeftX,

          targetRightX,

          targetLeftY,

          targetRightY
        );

        // console.log(distInPixels);

        let mappedDistanceShapeScale = p.map(
          distInPixels,

          30.0,

          530.0,

          0.0,

          2.0,

          true
        );

        let mappedDistanceShapeRotateLeft = p.map(
          targetLeftY,

          50,

          450,

          0.0,

          700.0,

          true
        );

        let mappedDistanceShapeRotateRight = p.map(
          targetRightY,

          50,

          450,

          0.0,

          700.0,

          true
        );

        p.stroke(0);

        // // drawing all the rectangles!!

        // p.push();

        // p.translate(p.width * 0.5, p.height * 0.5);

        // for (let i = 0; i < rects_A.length; i++) {

        //   p.push();

        //   p.translate(-p.width * 0.3, 0); // moves to the left of window

        //   p.translate(20 * i, 0 * i); // moves them more

        //   // p.rotate(-p.radians(p.mouseX));

        //   p.rotate(-p.radians(mappedDistanceShapeRotateLeft));

        //   // const mouseThing = p.mouseX;

        //   // console.log(mouseThing);

        //   p.scale(mappedDistanceShapeScale);

        //   rects_A[i].display();

        //   p.pop();

        // }

        // // drawing all the triangles!!

        // for (let i = 0; i < tris_A.length; i++) {

        //   p.push();

        //   p.translate(p.width * 0.3, 0); // moves to right of window

        //   p.translate(-10 * i, 0 * i); // moves them more

        //   // p.rotate(p.radians(p.mouseX));

        //   p.rotate(-p.radians(mappedDistanceShapeRotateRight));

        //   p.scale(mappedDistanceShapeScale);

        //   tris_A[i].display();

        //   p.pop();

        // }

        // p.pop();

        p.push();

        p.translate(p.width, 0);

        p.scale(-1.0, 1.0);

        p.line(targetLeftX, targetLeftY, targetRightX, targetRightY);

        // p.fill(255, 0, 0);

        p.ellipse(nose.x, nose.y, 20);

        // p.ellipse(nose.x, nose.y, 150);

        p.ellipse(leftEye.x, leftEye.y, 20);

        p.ellipse(rightEye.x, rightEye.y, 20);

        p.ellipse(leftEye.x, leftEye.y, 10);

        p.ellipse(rightEye.x, rightEye.y, 10);

        // p.ellipse(leftEar.x, leftEar.y, 20);

        // p.ellipse(rightEar.x, rightEar.y, 20);

        p.ellipse(targetRightX, targetRightY, 20);

        // p.fill(255, 0, 0);

        p.ellipse(targetLeftX, targetLeftY, 20);

        p.pop();

        p.push();

        for (let i = 0; i < segments.length; i++) {
          segments[i].checkCollision(left);

          if (segments[i].hit == false) {
            segments[i].checkCollision(right);
          }

          segments[i].display();
        }

        p.stroke(50);

        p.line(p.width / 3, 0, p.width / 3, p.height);

        p.line((p.width / 3) * 2, 0, (p.width / 3) * 2, p.height);

        p.line(0, p.height / 2, p.width, p.height / 2);
      } // end if(poses.length > 0) SHOULD ALL THIS STUFF BE IN THIS LOOP???

      p.push();
      // p.translate(p.width/2, p.height/2);

      // p.translate(40,40);

      if (p.keyIsPressed === true && p.key === 'a') {
        p.background(0);
      }
      if (p.keyIsPressed === true && p.key === 's') {
        p.background(255);
      }

      if (p.mouseIsPressed && p.mouseButton === p.LEFT) {
        groupTest.spread(0, 0, p.mouseX, p.mouseY);
        // groupTest.spread(targetLeftX, targetLeftY, targetRightX, targetRightY);
      }

      // on or off, can smooth out transition between on/off later
      if (p.keyIsPressed === true && p.key === 'q') {
        groupTest.sizeGradient();
      }

      if (p.keyIsPressed === true && p.key === 'w') {
        groupTest.addShapes();
      }

      if (p.keyIsPressed === true && p.key === 'e') {
        groupTest.removeShapes();
      }

      if (p.keyIsPressed === true && p.key === 'r') {
        groupTest.rotateEach(p.radians(p.frameCount));
      }

      if (p.keyIsPressed === true && p.key === 't') {
        groupTest.rotateAll(p.radians(p.frameCount * 0.01));
      } else {
        groupTest.rotateAll(0);
      }

      if (p.keyIsPressed === true && p.key === 'y') {
        groupTest.growAll(1);
      }

      if (p.keyIsPressed === true && p.key === 'u') {
        groupTest.shrinkAll(1);
      }

      if (p.keyIsPressed === true && p.key === 'i') {
        groupTest.fillColor(120, 0.5);
      }

      if (p.keyIsPressed === true && p.key === 'o') {
        groupTest.strokeColor(220, 1);
      }

      groupTest.display();
      p.pop();
    }; // end draw()

    // function drawNumberedLandmarks() {

    //   if (detections) {

    //     p.textSize(12);

    //     p.fill(200);

    //     for (let formIdx = 0; formIdx < detections.length; formIdx++) {

    //       let landmarks = detections[formIdx].landmarks._positions;

    //       for (

    //         let landmarkIdx = 0;

    //         landmarkIdx < landmarks.length;

    //         landmarkIdx++

    //       ) {

    //         p.text(

    //           landmarkIdx,

    //           p.width - landmarks[landmarkIdx]._x,

    //           landmarks[landmarkIdx]._y

    //         );

    //       }

    //     }

    //   }

    // }

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

    class RectsGroup {
      constructor(sideWidth, sideLength) {
        this.wid = sideWidth;
        this.len = sideLength;

        //this.numb = numRects; // may end up deleting
        // needs to integrate size gradient
        this.allRects = [];

        // for sizeGradient() method
        this.sizeGradientTruth = false;
        this.sizeChange = 0;

        // for rotateEach() method
        this.rotateEachTruth = false;
        this.rotateEachAmount = 0;

        // for rotateAll() method
        this.rotateAllTruth = false;
        this.rotateAllAmount = 0;

        // for spread() method
        this.spreadTruth = false;
        this.spreadAmountX = 0;
        this.spreadAmountY = 0;

        // for growAll() method
        this.growAllTruth = false;

        // for shrinkAll() method
        this.shrinkAllTruth = false;
      } // end constructor

      display() {
        for (let i = 0; i < this.allRects.length; i++) {
          // i<this.numb
          p.push();
          p.rotate(i * this.rotateAllAmount);
          p.push();
          p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
          p.rotate(this.rotateEachAmount);
          // this.allRects[i].display();
          p.rect(
            0,
            0,
            this.wid - i * this.sizeChange,
            this.len - i * this.sizeChange
          );
          p.pop();
          p.pop();
        }
      } // end display()

      intitialize(amount) {
        for (let i = 0; i < amount; i++) {
          this.allRects.push(new Rects(this.wid, this.len));
        }
      }

      growAll(speed) {
        this.growAllTruth = true;
        this.wid += speed;
        this.len += speed;
      }

      shrinkAll(speed) {
        this.shrinkAllTruth = true;
        this.wid -= speed;
        this.len -= speed;
      }

      spread(startX, startY, endX, endY) {
        this.spreadTruth = true;
        this.spreadAmountX = (endX - startX) / this.allRects.length;
        this.spreadAmountY = (endY - startY) / this.allRects.length;
      }

      rotateEach(amount) {
        this.rotateEachTruth = true;
        this.rotateEachAmount = amount;
      }

      rotateAll(amount) {
        this.rotateAllTruth = true;
        this.rotateAllAmount = amount;
      }

      sizeGradient() {
        this.sizeGradientTruth = true;
        this.sizeChange = this.allRects.length / this.wid;
      }

      addShapes() {
        this.allRects.push(new Rects(this.wid, this.len));
        //console.log(allRects.length);
      }

      removeShapes() {
        this.allRects.pop(new Rects(this.wid, this.len));
      }

      fillColor(hue, alpha) {
        p.fill(hue, 255, 255, alpha);
      }

      strokeColor(hue, alpha) {
        p.stroke(hue, 255, 255, alpha);
      }
    } // end class RectsGroup()
  }; // end Sketch

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return (
      <>
        {this.state.loading && <h1>loading models...</h1>}

        <div className={styles.Sketch} ref={this.myRef}></div>
      </>
    );
  }
} // end export default class sketch

// this class is not currently  being used
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

//     Face Id Parts

// 0    nose

// 1    leftEye

// 2    rightEye

// 3    leftEar

// 4    rightEar

// 5    leftShoulder

// 6    rightShoulder

// 7    leftElbow

// 8    rightElbow

// 9    leftWrist

// 10   rightWrist

// 11   leftHip

// 12   rightHip

// 13   leftKnee

// 14   rightKnee

// 15   leftAnkle

// 16   rightAnkle
