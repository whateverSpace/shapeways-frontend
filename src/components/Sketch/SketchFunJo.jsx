import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import ml5 from 'ml5';
// import RectsGroup from '../Shapes/Shapes';
// import Rects from '../Shapes/Shapes';
// import Segment from '../Shapes/Shapes';
import Synth from '../Synth/Synth';
import styles from './Sketch.css';

const Sketch = () => {
  const myRef = useRef(null);
  const myP5 = useRef(null);
  const distForSynth = useRef(null);
  const [loading, setLoading] = useState(true);
  const [segForSynth, setSegForSynth] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [segHitState, setSegHitState] = useState([
    0,
    0,
    0,
    0,
    0,
    0,
  ]);

  const sketchStuff = (p) => {
    let video;
    let poseNet;
    let poses = [];

    let targetRight = { x: 0, y: 0 };
    let targetLeft = { x: 0, y: 0 };
    let scoreRight;
    let scoreLeft;
    let scoreThreshold = 0.2;
    let lerpRate = 0.1; // lerpRate between 0 and 1 determines the easing amount

    let segments = [];

    let groupTest;
    let numShapesStart = 10;
    // let numShapesMin = 10;
    // let numShapesMax = 30;
    let sideLengthStart = 20;
    // let sideLengthMin = 20;
    // let sideLengthMax = 100;

    let mappedDistanceShapeScale;

    let pose;
    let right;
    let left;
    let nose;
    let leftEye;
    let rightEye;

    let mappedNoseColor;
    let mappedThing;
    let distInPixels;
    let distance = { x: 0, y: 0 };
    let mappedDistanceWrists;

    // Begin Segment class

    class Segment {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = p.width / 3;
        this.h = p.height / 2;
        this.hit = false;
        this.hitState = { l: 0, r: 0, n: 0 };
        this.counter = 0;
        this.alpha = 0;
      }

      display() {
        if (this.hitState.l > 0 || this.hitState.r > 0 || this.hitState.n > 0) {
          this.hit = true;
          this.alpha = p.lerp(this.alpha, 255, 0.3);
          p.push();
          p.translate((p.width / 6) * 5, p.height / 4);
          p.scale(-1.0, 1.0);
          p.fill(270, 255, 255, 0.3);
          p.rect(this.x, this.y, p.width / 3, p.height / 2);
          p.pop();
        } else {
          this.hit = false;
          this.alpha = p.lerp(this.alpha, 0, 0.1);
        }
      }

      checkCollision(targetL, targetR, targetN) {
        this.hitState.l = collision(
          targetL.x,
          targetL.y,
          5,
          this.x,
          this.y,
          this.w,
          this.h
        );
        this.hitState.r = collision(
          targetR.x,
          targetR.y,
          5,
          this.x,
          this.y,
          this.w,
          this.h
        );
        this.hitState.n = collision(
          targetN.x,
          targetN.y,
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
        return 1;
      }
      return 0;
    }

    // P5 Sketch

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

      groupTest = new RectsGroup(
        p,
        sideLengthStart,
        sideLengthStart,
        targetLeft.x,
        targetLeft.y,
        mappedDistanceShapeScale
      );
      groupTest.initialize(numShapesStart);
    };

    // end p.setup()

    function getDistance(pos1, pos2) {
      return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }

    function modelReady() {
      console.log('model loaded');
    }

    function jitter () {
      let val = p.random(-0.5, 0.5);
      return val;
    }

    p.draw = () => {
      // p.background(0);

      // p.fill(255);
      // p.ellipse(0, 0, 200, 200);
      if (poses.length > 0) {
        setLoading(false);

        pose = poses[0].pose;
        right = pose['rightWrist'];
        left = pose['leftWrist'];
        nose = pose['nose'];
        leftEye = pose['leftEye'];
        rightEye = pose['rightEye'];
        scoreRight = poses[0].pose.keypoints[10].score;
        scoreLeft = poses[0].pose.keypoints[9].score;

        mappedNoseColor = p.map(nose.x, 35, 650, 0, 255, true);
        mappedThing = p.int(mappedNoseColor);
        p.background(mappedThing, mappedThing, mappedThing);

        //uncomment to see webcam image
        // p.push();
        // p.translate(p.width, 0);
        // p.scale(-1.0, 1.0);
        // p.image(video, 0, 0, p.width, p.height);
        // p.pop();

        mappedDistanceShapeScale = p.map(
          distInPixels,
          30.0,
          530.0,
          10.0,
          100.0,
          true
        );

        p.stroke(0);
        p.push();

        p.push();
        groupTest.spread(targetLeft.x, targetLeft.y, targetRight.x, targetRight.y);

        p.pop();

        // key pressed land
        if (p.key === 'a') {
          p.background(0);
        }
        if (p.key === 's') {
          p.background(255);
        }

        if (p.mouseIsPressed && p.mouseButton === p.LEFT) {
          groupTest.spread(0, 0, p.mouseX, p.mouseY);
        }

        // on or off, can smooth out transition between on/off later
        if (p.key === 'q') {
          groupTest.sizeGradient();
        }

        if (p.key === 'w') {
          groupTest.addShapes();
        }

        if (p.key === 'e') {
          groupTest.removeShapes();
        }

        if (p.key === 'r') {
          groupTest.rotateEach(p.radians(p.frameCount));
        } else {
          groupTest.rotateEach(0);
        }

        if (p.key === 't') {
          groupTest.rotateAll(p.radians(p.frameCount * 0.01));
        } else {
          groupTest.rotateAll(0);
        }

        if (p.key === 'y') {
          groupTest.growAll(1);
        }

        if (p.key === 'u') {
          groupTest.shrinkAll(1);
        }

        if (p.key === 'i') {
          groupTest.fillColor(120, 0.5);
        }

        if (p.key === 'o') {
          groupTest.strokeColor(220, 1);
        }

        groupTest.display();
        p.pop();

        p.push();
        p.translate(p.width, 0);
        p.scale(-1.0, 1.0);
        // drawing out appendages
        p.line(targetLeft.x, targetLeft.y, targetRight.x, targetRight.y);
        p.ellipse(nose.x, nose.y, 10);
        p.ellipse(leftEye.x, leftEye.y, 20);
        p.ellipse(rightEye.x, rightEye.y, 20);
        p.push();
        p.fill(360, 255, 255);
        p.ellipse(leftEye.x, leftEye.y, 5);
        p.ellipse(rightEye.x, rightEye.y, 5);
        p.pop();

        if (scoreRight > scoreThreshold) {
          targetRight.x = p.lerp(targetRight.x, right.x, lerpRate);
          targetRight.y = p.lerp(targetRight.y, right.y, lerpRate);
          p.fill(0, 255, 255);
          p.ellipse(targetRight.x, targetRight.y, 20);
        } else {
          targetRight.x += jitter();
          targetRight.y += jitter();
          p.fill(0, 0, 100);
          p.ellipse(targetRight.x, targetRight.y, 20);
        }

        if (scoreLeft > scoreThreshold) {
          targetLeft.x = p.lerp(targetLeft.x, left.x, lerpRate);
          targetLeft.y = p.lerp(targetLeft.y, left.y, lerpRate);
          p.fill(0, 255, 255);
          p.ellipse(targetLeft.x, targetLeft.y, 20);
        } else {
          targetLeft.x += jitter();
          targetLeft.y += jitter();
          p.fill(0, 0, 100);
          p.ellipse(targetLeft.x, targetLeft.y, 20);
        }
        p.pop();

        for (let i = 0; i < segments.length; i++) {
          let seg = segments[i];
          seg.checkCollision(targetLeft, targetRight, nose);
          seg.counter = (seg.hitState.l + seg.hitState.r + seg.hitState.n);
          console.log(`Segment ${i} has ${seg.counter} hits.`);
          seg.display();
        }

        distInPixels = Math.floor(getDistance(targetLeft, targetRight));
        distance.x = Math.floor(targetLeft.x - targetRight.x);
        distance.y = Math.floor(Math.abs(targetLeft.y - targetRight.y));
        mappedDistanceWrists = p.map(distInPixels, 0, p.width, 0.0, 1.0, true);

        console.log(`Distance between wrists at x-axis: ${distance.x}`);
        console.log(`Distance between wrists at y-axis: ${distance.y}`);
        console.log(`Mapped (0-1) distance between wrists: ${mappedDistanceWrists}`);

        distForSynth.current = distInPixels;

        // if (segments[2].hit == true) {
        //   groupTest.addShapes();
        // }

        // if (segments[0].hit == true) {
        //   groupTest.removeShapes();
        // }

        const segChange = segForSynth.map((segment, i) => {
          if (segment !== segments[i].hit) {
            return segments[i].hit;
          } else return segment;
        });
        // this.setState({ segForSynth: segChange });
        setSegForSynth(segChange);


        const segHitStateChange = segHitState.map((segment, i) => {
          if (segment !== segments[i].hit) {
            return segments[i].hit;
          } else return segment;
        });
        // this.setState({ segForSynth: segChange });
        setSegHitState(segHitStateChange);

        p.stroke(50);
        p.line(p.width / 3, 0, p.width / 3, p.height);
        p.line((p.width / 3) * 2, 0, (p.width / 3) * 2, p.height);
        p.line(0, p.height / 2, p.width, p.height / 2);
        // end draw
      }
    };
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
          p.translate(p.width, 0);
          p.scale(-1, 1);
          // p.rotate(-p.radians(mappedDistanceShapeRotateLeft));
          p.rotate(i * this.rotateAllAmount);
          p.push();
          p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
          // p.rotate(0);
          p.rotate(this.rotateEachAmount);
          // p.rotate(-p.radians(mappedDistanceShapeRotateLeft));

          //console.log(this.rotateEachAmount);

          p.rect(
            targetLeft.x,
            targetLeft.y,
            mappedDistanceShapeScale,
            mappedDistanceShapeScale
          );
          p.pop();
          p.pop();
        }
      } // end display()

      initialize(amount) {
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
  };

  useEffect(() => {
    myP5.current = new p5(sketchStuff, myRef.current);
  }, []);

  return (
    <>
      <section>
        {loading && <h1 className={styles.loading}>loading models...</h1>}
        <div className={styles.box}>
          <div ref={myRef}></div>
        </div>
        <Synth distForSynth={distForSynth} segForSynth={segForSynth} segHitState={segHitState}/>
      </section>
    </>
  );
};

export default Sketch;
