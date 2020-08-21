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

    let sideWidth_A = 0;
    let sideLength_A = 0;

    let numTris_A = 0;
    let tris_A = [];

    let numRects_A = 0;
    let rects_A = [];

    let shapeNumber = 8;

    // let slider;

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
      }

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
      }

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
      }
    }

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
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth / 2, p.windowHeight / 2);

      video = p.createCapture(p.VIDEO);
      video.size(p.width, p.height);
      video.hide();

      poseNet = ml5.poseNet(video, modelReady);
      poseNet.on('pose', function (results) {
        poses = results;
      });

      // faceapi = ml5.faceApi(video, detection_options, modelReady);

      p.colorMode(p.HSB);
      p.rectMode(p.CENTER);

      // slider = p.createSlider(0, 255, 100);
      // slider.position(20, 20);

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

    function getDistance(pos1, pos2, pos3, pos4) {
      return Math.sqrt((pos1 - pos2) ** 2 + (pos3 - pos4) ** 2);
    }

    function modelReady() {
      console.log('model loaded');
    }

    // const modelReady = () => {
    //   console.log('ready!');
    //   console.log(faceapi);
    //   faceapi.detect(gotResults);
    // };

    // function gotResults(err, result) {
    //   if (err) {
    //     console.log(err);
    //     return;
    //   }
    //   // console.log(result);
    //   detections = result;

    //   // background(220);
    //   p.background(255);
    //   // p.image(video, 0, 0, p.width, p.height);
    //   p.fill(0);
    //   p.stroke(255);
    //   p.fill(30, 255, 255, 120);
    //   // p.translate(p.width, 0);
    //   // p.scale(-1, 1);

    //   if (detections) {
    //     if (detections.length > 0) {
    //       // console.log(detections)
    //       // drawBox(detections);
    //       drawLandmarks(detections);
    //     }
    //   }
    //   faceapi.detect(gotResults);
    // }

    // function drawLandmarks(detections) {
    //   p.noFill();
    //   p.stroke(161, 95, 251);
    //   p.strokeWeight(2);

    //   for (let i = 0; i < detections.length; i++) {
    //     const mouth = detections[i].parts.mouth;
    //     const nose = detections[i].parts.nose;
    //     const leftEye = detections[i].parts.leftEye;
    //     const rightEye = detections[i].parts.rightEye;
    //     const rightEyeBrow = detections[i].parts.rightEyeBrow;
    //     const leftEyeBrow = detections[i].parts.leftEyeBrow;

    //     drawPart(mouth, true);
    //     drawPart(nose, false);
    //     drawPart(leftEye, true);
    //     drawPart(leftEyeBrow, false);
    //     drawPart(rightEye, true);
    //     drawPart(rightEyeBrow, false);
    //   }
    // }

    // function drawPart(feature, closed) {
    //   p.beginShape();
    //   for (let i = 0; i < feature.length; i++) {
    //     const x = feature[i]._x;
    //     const y = feature[i]._y;
    //     p.vertex(x, y);
    //   }

    //   if (closed === true) {
    //     p.endShape(p.CLOSE);
    //   } else {
    //     p.endShape();
    //   }
    // }

    //     Id	Part
    // 0	nose
    // 1	leftEye
    // 2	rightEye
    // 3	leftEar
    // 4	rightEar
    // 5	leftShoulder
    // 6	rightShoulder
    // 7	leftElbow
    // 8	rightElbow
    // 9	leftWrist
    // 10	rightWrist
    // 11	leftHip
    // 12	rightHip
    // 13	leftKnee
    // 14	rightKnee
    // 15	leftAnkle
    // 16	rightAnkle

    p.draw = () => {
      // p.background(255);
      // p.image(video, 0, 0, p.width, p.height);

      //pose tracking illustration
      // console.log(poses);
      if (poses.length > 0) {
        this.setState({
          loading: false,
        });
        let pose = poses[0].pose;
        let right = pose['rightWrist'];
        // console.log(right);
        let left = pose['leftWrist'];
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

        let mappedNoseColor = p.map(nose.x, 35, 650, 0, 255, true);
        // // console.log(mappedNoseColor);
        let mappedThing = p.int(mappedNoseColor);
        p.background(mappedThing, mappedThing, mappedThing);

        //uncomment to see webcam image
        // p.push();
        // p.translate(p.width, 0);
        // p.scale(-1.0, 1.0);
        // p.image(video, 0, 0, p.width, p.height);
        // p.pop();

        // const sliderThing = slider.value();

        // console.log(nose.x);
        // p.background(255);

        // const distanceThing = getDistance(left, right) * 0.25;

        // p.noFill();
        // p.quad(
        //   right.x,
        //   right.y,
        //   right.x,
        //   right.y - getDistance(left, right),
        //   left.x,
        //   left.y - getDistance(left, right),
        //   left.x,
        //   left.y
        // );

        // console.log(getDistance(left, right) * 0.25);

        // p.fill(255, 0, 0);
        // p.ellipse(right.x, right.y, 20);

        // // p.fill(255, 0, 0);
        // p.ellipse(left.x, left.y, 20);
        // p.strokeWeight(2);
        // p.stroke(255);

        let distInPixels = getDistance(
          targetLeftX,
          targetRightX,
          targetLeftY,
          targetRightY
        );
        // console.log(distInPixels);
        // let mappedDistance = p.map(distInPixels, 30, 530, 0.0, 1.0, true);
        // console.log(targetLeftY);
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

        // console.log(mappedThing);

        // console.log(mappedThing);
        // console.log(distInPixels, mappedDistanceShapeScale);

        // if (p.key === 'a') {
        //   p.background(255);
        //   // p.noFill();
        // }
        // if (p.key === 's') {
        //   // p.background(0);
        // }

        p.stroke(0);
        //p.rect(0,0,sideWidth_A,sideLength_A);
        //frame for window
        // p.line(0, 0, p.width, 0);
        // p.line(0, p.height, p.width, p.height);

        // drawing all the rectangles!!
        p.push();
        p.translate(p.width * 0.5, p.height * 0.5);
        for (let i = 0; i < rects_A.length; i++) {
          p.push();
          p.translate(-p.width * 0.3, 0); // moves to the left of window
          p.translate(20 * i, 0 * i); // moves them more
          // p.rotate(-p.radians(p.mouseX));
          p.rotate(-p.radians(mappedDistanceShapeRotateLeft));

          // const mouseThing = p.mouseX;
          // console.log(mouseThing);
          p.scale(mappedDistanceShapeScale);

          rects_A[i].display();
          p.pop();
        }

        // drawing all the triangles!!
        for (let i = 0; i < tris_A.length; i++) {
          p.push();
          p.translate(p.width * 0.3, 0); // moves to right of window
          p.translate(-10 * i, 0 * i); // moves them more
          // p.rotate(p.radians(p.mouseX));
          p.rotate(-p.radians(mappedDistanceShapeRotateRight));
          p.scale(mappedDistanceShapeScale);

          tris_A[i].display();
          p.pop();
        }

        p.pop();

        p.push();

        p.translate(p.width, 0);
        p.scale(-1.0, 1.0);

        p.line(targetLeftX, targetLeftY, targetRightX, targetRightY);

        // p.fill(255, 0, 0);
        p.ellipse(nose.x, nose.y, 10);
        // p.ellipse(nose.x, nose.y, 150);
        p.ellipse(leftEye.x, leftEye.y, 20);
        p.ellipse(rightEye.x, rightEye.y, 20);
        p.push();
        p.fill(360, 255, 255);
        p.ellipse(leftEye.x, leftEye.y, 5);
        p.ellipse(rightEye.x, rightEye.y, 5);
        p.pop();
        // p.ellipse(leftEar.x, leftEar.y, 20);
        // p.ellipse(rightEar.x, rightEar.y, 20);
        p.ellipse(targetRightX, targetRightY, 20);

        // p.fill(255, 0, 0);
        p.ellipse(targetLeftX, targetLeftY, 20);

        p.pop();

        p.push();
        p.noStroke();

        segments[0] = new Segment(0, 0);

        segments[1] = new Segment(p.width / 3, 0);
        segments[2] = new Segment((p.width / 3) * 2, 0);
        segments[3] = new Segment(0, p.height / 2);
        segments[4] = new Segment(p.width / 3, p.height / 2);
        segments[5] = new Segment((p.width / 3) * 2, p.height / 2);
        p.pop();

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

        // };
        // end p.draw()
      }

      // if (detections) {
      //   // drawNumberedLandmarks(); // uncomment for debugging
      //   p.translate(p.width, 0);
      //   p.scale(-1.0, 1.0);
      //   p.fill(0);
      //   p.stroke(255);
      //   p.fill(30, 255, 255, 120);
      //   drawLandmarks(detections);
      // }
    };

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
        {this.state.loading && <h1>loading models...</h1>}
        <div className={styles.Sketch} ref={this.myRef}></div>
      </>
    );
  }
}
