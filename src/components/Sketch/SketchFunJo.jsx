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
  const [segHitState, setSegHitState] = useState([0, 0, 0, 0, 0, 0]);

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

    let shapeGroup;

    // let mappedDistanceShapeScale;

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
    // let mappedDistanceWrists;

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

        this.mappedNoseColor = 0;
        this.mappedThing = 0;
      }

      display() {
        if (this.hitState.l > 0 || this.hitState.r > 0 || this.hitState.n > 0) {
          this.hit = true;
          this.alpha = p.lerp(this.alpha, 255, 0.3);
          p.push();
          p.translate((p.width / 6) * 5, p.height / 4);
          p.scale(-1.0, 1.0);
          // change mapped values to be ratio of canvas size
          mappedNoseColor = p.map(nose.x, 35, 650, 0, 255, true);
          mappedThing = p.int(mappedNoseColor);
          p.fill(mappedThing, mappedThing, mappedThing, 0.1);
          // p.fill(270, 30, 255, 0.1);

          p.rect(this.x, this.y, p.width / 3, p.height / 2);
          p.pop();
        } else {
          this.hit = false;
          this.alpha = p.lerp(this.alpha, 0, 0.1);
        }
      }

      // mappedNoseColor = p.map(nose.x, 35, 650, 0, 255, true);
      // mappedThing = p.int(mappedNoseColor);
      // p.background(mappedThing, mappedThing, mappedThing);

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

      // (hue, saturation, brightness, alpha)
      // (0-360, 0-255, 0-255, 0-1)
      p.colorMode(p.HSB);

      // places the origin at the center of each rectangle instead of top left corner
      p.rectMode(p.CENTER);

      // initializes the group of shapes
      // (number of shapes, min number, max number, side length, min length,max length)
      shapeGroup = new ShapeGroup(5, 50, 5, 30, 30, 200);

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
    };

    function getDistance(pos1, pos2) {
      return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }

    function modelReady() {
      console.log('model loaded');
    }

    function jitter() {
      let val = p.random(-0.5, 0.5);
      return val;
    }

    p.draw = () => {
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

        // mappedNoseColor = p.map(nose.x, 35, 650, 0, 255, true);
        // mappedThing = p.int(mappedNoseColor);
        // p.background(mappedThing, mappedThing, mappedThing);

        //uncomment to see webcam image
        // p.push();
        // p.translate(p.width, 0);
        // p.scale(-1.0, 1.0);
        // p.image(video, 0, 0, p.width, p.height);
        // p.pop();

        // mappedDistanceShapeScale = p.map(
        //   distInPixels,
        //   30.0,
        //   530.0,
        //   10.0,
        //   100.0,
        //   true
        // );

        // can redraw background as black or white
        if (p.keyIsPressed === true && p.key === 'a') {
          p.background(0);
        }
        if (p.keyIsPressed === true && p.key === 's') {
          p.background(255);
        }

        p.push();
        p.translate(p.width, 0);
        p.scale(-1.0, 1.0);
        p.push();
        // drawing out appendages
        p.line(targetLeft.x, targetLeft.y, targetRight.x, targetRight.y);
        p.ellipse(nose.x, nose.y, 10);
        p.fill(0, 0, 255, 0.3);
        p.ellipse(leftEye.x, leftEye.y, 20);
        p.ellipse(rightEye.x, rightEye.y, 20);
        p.push();
        p.fill(360, 255, 255);
        p.ellipse(leftEye.x, leftEye.y, 5);
        p.ellipse(rightEye.x, rightEye.y, 5);
        p.pop();

        //shape stuff
        p.push();
        // p.translate(p.width, 0);
        // p.scale(-1.0, 1.0);

        // this p.translate determines the position of the first shape
        // probably use the x and y coordinates for one of the wrists here?
        // p.translate(p.mouseX, p.mouseY); // start point for the shapes
        p.translate(targetLeft.x, targetLeft.y);
        // p.scale(-1.0, 1.0);

        // .spread() chooses the end point for the group of shapes
        // probably us the x and y coordinates for the other wrist here?
        // shapeGroup.spread(p.mouseX - p.width / 2, p.mouseY - p.height / 2); // end point for the shapes
        shapeGroup.spread(
          targetLeft.x,
          targetLeft.y,
          targetRight.x,
          targetRight.y
        );

        // .fillColorSingle lets you:
        //   choose a color for the fill of all the shapes
        //   choose if the color will cycle through the spectrum or not
        //   choose the rate of the cycle (i.e. 5ish=fast, 100ish=slow)
        // (hue value(0-360), cycle / or don't, rate)
        //if (p.keyIsPressed === true && p.key === 'q')
        // if it's set fast, you may have performance problems
        shapeGroup.fillColorSingle(100, true, 50);
        //}

        // .strokeColorSingle lets you:
        //   choose a color for the stroke of all the shapes
        //   choose if the color will cycle through the spectrum or not
        //   choose the rate of the cycle (i.e. 5ish=fast, 100ish=slow)
        // (hue value (0-360), cycle / or don't, rate)
        //if (p.keyIsPressed === true && p.key === 'w') {
        shapeGroup.strokeColorSingle(30, false, 5);
        //}

        // .rotateEach will make each shape rotate around it's own center
        // p.millis()) uses the computers clock for timing
        // /5 = faster, /100 =  slower
        // if (p.keyIsPressed === true && p.key === 'e') {
        //  shapeGroup.rotateEach(p.millis() / 30);
        // }
        //shapeGroup.rotateEach(p.millis() / 30);

        // .rotateGroup() will makethe group of shapes rotate as one unit
        // p.millis()) uses the computers clock for timing
        // /5 = faster, /100 =  slower
        //if (p.keyIsPressed === true && p.key === 'r') {
        //  shapeGroup.rotateGroup(p.millis() / 50);
        //}
        if (
          targetLeft.x > 5 * (p.width / 12) &&
          targetLeft.x < 7 * (p.width / 12)
        ) {
          shapeGroup.rotateGroup(1);
          // console.log('cool');
        }
        if (
          targetRight.x > 5 * (p.width / 12) &&
          targetRight.x < 7 * (p.width / 12)
        ) {
          shapeGroup.rotateGroup(-1);
          // console.log('cool');
        }

        //  .addShapes() will add a shape to the total every x milliseconds?
        //if (p.keyIsPressed === true && p.key === 't') {
        //  shapeGroup.addShapes(2000);
        //}
        if (p.abs(targetLeft.x - targetRight.x) > p.width / 3) {
          shapeGroup.addShapes(500);
        }

        // .removeShapes() will remove a shape from the total every x milliseconds?
        //if (p.keyIsPressed === true && p.key === 'y') {
        //  shapeGroup.removeShapes(1000);
        //}
        if (p.abs(targetLeft.x - targetRight.x) < p.width / 3) {
          shapeGroup.removeShapes(250);
        }

        // .growY will make the rects grow in the y-direction
        // rate 5ish = fast, 100ish = slow
        // if (p.keyIsPressed === true && p.key === 'u') {
        //   shapeGroup.growY(75, 200);
        // }
        if (targetLeft.y < p.height / 2) {
          shapeGroup.growY(35, 200);
        }

        // .shrinkY will makethe rects shrink in the y-direction
        // rate 5ish = fast, 100ish = slow
        //if (p.keyIsPressed === true && p.key === 'p') {
        //  shapeGroup.shrinkY(75, 30);
        //}
        if (targetLeft.y > p.height / 2) {
          shapeGroup.shrinkY(35, 30);
        }

        // .growX will make the rects grow in the x-direction
        // rate 5ish = fast, 100ish = slow
        //if (p.keyIsPressed === true && p.key === 'i') {
        //  shapeGroup.growX(75), 200;
        // }
        if (targetRight.y < p.height / 2) {
          shapeGroup.growX(35, 200);
        }

        // .shrinkX will make the rects shrink in the x-direction
        // rate 5ish = fast, 100ish = slow
        //if (p.keyIsPressed === true && p.key === 'o') {
        //  shapeGroup.shrinkX(75, 30);
        //}
        if (targetRight.y > p.height / 2) {
          shapeGroup.shrinkX(35, 30);
        }

        // .sizeGradient determines if the shapes will be all the same size
        // or an array from large to small
        ///  if (p.keyIsPressed === true && p.key === 'l') {
        //   shapeGroup.sizeGradient(true);
        // } else {
        //   shapeGroup.sizeGradient(false);
        // }

        if (p.abs(targetLeft.y - targetRight.y) > p.height / 2) {
          shapeGroup.sizeGradient(true);
        } else {
          shapeGroup.sizeGradient(false);
        }

        //  .onBeatGrow will make the shapes grow and shrink from one size to another
        // onBeatGrow(pixel difference in size, length of interval in ms, portion of intervale with larger shapes)
        if (p.keyIsPressed === true && p.key === 'k') {
          shapeGroup.onBeatGrow(100, 2000, 10);
        }

        // .display() draws all of the shapes and their various modifications
        shapeGroup.display();

        // this ends the p.push() and p.pop() pair that surround all of the shapes
        p.pop();
        p.pop();

        //segment stuff
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
          seg.counter = seg.hitState.l + seg.hitState.r + seg.hitState.n;
          // console.log(`Segment ${i} has ${seg.counter} hits.`);
          mappedNoseColor = p.map(nose.x, 35, 650, 0, 255, true);
          mappedThing = p.int(mappedNoseColor);
          p.fill(mappedThing, mappedThing, mappedThing);
          seg.display();
        }

        // p.background(mappedThing, mappedThing, mappedThing);
        distInPixels = Math.floor(getDistance(targetLeft, targetRight));
        distance.x = Math.floor(targetLeft.x - targetRight.x);
        distance.y = Math.floor(Math.abs(targetLeft.y - targetRight.y));
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
          if (segment !== segments[i].counter) {
            return segments[i].counter;
          } else return segment;
        });
        // this.setState({ segForSynth: segChange });
        setSegHitState(segHitStateChange);

        //lines for segments
        p.stroke(50);
        p.line(p.width / 3, 0, p.width / 3, p.height);
        p.line((p.width / 3) * 2, 0, (p.width / 3) * 2, p.height);
        p.line(0, p.height / 2, p.width, p.height / 2);
        // end draw
      }
    };
    // here is the entire class for ShapeGroup
    // the shape is currently a rectangle
    // but could be changed in the future
    class ShapeGroup {
      // constructor houses variables for object inputs, other details
      constructor(
        shapesNumber,
        shapesNumberMax,
        shapesNumberMin,
        shapeSize,
        shapeSizeMin,
        shapeSizeMax
      ) {
        this.len = shapeSize;
        this.wid = shapeSize;
        this.sizeMax = shapeSizeMax;
        this.sizeMin = shapeSizeMin;
        this.numberOfShapes = shapesNumber;
        this.numberMax = shapesNumberMax;
        this.numberMin = shapesNumberMin;

        // for .spread
        this.spreadAmountX = 0;
        this.spreadAmountY = 0;

        // for .rotateEach
        this.rotateEachTruth = false;
        this.rotateEachRate = 0;

        // for .rotateGroup
        this.rotateGroupTruth = false;
        this.rotateGroupRate = 0;

        // for color shit
        this.fillColorHue = 0;
        this.fillColorRate = 0;
        this.strokeColorHue = 0;
        this.strokeColorRate = 0;
        this.fillColorSingleTruth = false;
        this.fillColorSpectrumTruth = false;
        this.strokeColorSingleTruth = false;
        this.strokeColorSpectrumTruth = false;
        this.fillAlphaAmount = 1;
        //this.fillSaturationAmount = 255;

        // for onBeatGrow
        this.onBeatGrowTruth = false;
        this.onBeatGrowModifier = 0;
        this.sizeGradientAmount = 0;

        // counter fro rotateGroup
        this.rotateGroupCounter = 0;

        // variables for left and right wrist locations
        this.leftX = 0;
        this.leftY = 0;
        this.rightX = 0;
        this.rightY = 0;
      } // end constructor

      // dipslays the group of shapes and their various modifications
      display() {
        for (let i = 0; i < this.numberOfShapes; i++) {
          p.fill(this.fillColorHue, 255, 255, 0.6);
          p.stroke(this.strokeColorHue, 255, 255, 0.6);

          p.push();

          if (
            this.rotateEachTruth === true &&
            this.rotateGroupTruth === false
          ) {
            p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
            p.rotate(this.rotateEachRate);
            //p.rect(i*5,i*5,this.len, this.wid);
            p.rect(
              0,
              0,
              this.wid + this.onBeatGrowModifier - i * this.sizeGradientAmount,
              this.len + this.onBeatGrowModifier - i * this.sizeGradientAmount
            );
          }

          if (
            this.rotateGroupTruth === true &&
            this.rotateEachTruth === false
          ) {
            p.push();
            p.translate(
              -(this.leftX - this.rightX) / 2,
              -(this.leftY - this.rightY) / 2
            );
            p.push();
            p.rotate(this.rotateGroupRate); // rotates group together nicely-ish
            p.rect(
              (i - this.numberOfShapes / 2) * this.spreadAmountX,
              (i - this.numberOfShapes / 2) * this.spreadAmountY,
              this.wid + this.onBeatGrowModifier - i * this.sizeGradientAmount,
              this.len + this.onBeatGrowModifier - i * this.sizeGradientAmount
            );
            p.pop();
            p.pop();
          }

          if (
            this.rotateEachTruth === false &&
            this.rotateGroupTruth === false
          ) {
            //(this.rotateEachTruth === true && this.rotateGroupTruth === false)
            p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
            p.rect(
              0,
              0,
              this.wid + this.onBeatGrowModifier - i * this.sizeGradientAmount,
              this.len + this.onBeatGrowModifier - i * this.sizeGradientAmount
            );
          }
          if (this.rotateEachTruth === true && this.rotateGroupTruth === true) {
            p.rotate(this.rotateGroupRate);
            p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
            p.rotate(this.rotateEachRate);
            p.rect(
              0,
              0,
              this.wid + this.onBeatGrowModifier - i * this.sizeGradientAmount,
              this.len + this.onBeatGrowModifier - i * this.sizeGradientAmount
            );
          }
          p.pop();
        } // end for loop
      } // end display()

      // takes end point of shape group and spreads the shapes out accordingly
      // spread(endPointX, endPointY) {
      //   this.spreadAmountX = endPointX / this.numberOfShapes;
      //   this.spreadAmountY = endPointY / this.numberOfShapes;
      // } // end spread()

      spread(startX, startY, endX, endY) {
        this.spreadTruth = true;
        this.leftX = startX;
        this.leftY = startY;
        this.rightX = endX;
        this.rightY = endY;
        this.spreadAmountX = (endX - startX) / (this.numberOfShapes - 1);
        this.spreadAmountY = (endY - startY) / (this.numberOfShapes - 1);
      }

      // each shape will rotate on it's own z-axis
      rotateEach(rate) {
        this.rotateEachTruth = true;
        this.rotateEachRate = p.radians(rate);
      }

      // the shapes will rotate as a group on the z-axis
      rotateGroup(rate) {
        this.rotateGroupTruth = true;
        this.rotateGroupCounter += rate;
        if (this.rotateGroupCounter > 360) {
          this.rotateGroupCounter = 0;
        }
        this.rotateGroupRate = p.radians(this.rotateGroupCounter);
      }

      // adds a shape to the group however often
      addShapes(rate) {
        if (this.numberOfShapes < this.numberMax) {
          this.numberOfShapes += p.deltaTime / rate;
        }
      }

      // removes a shape from the group every so often
      removeShapes(rate) {
        if (this.numberOfShapes > this.numberMin) {
          this.numberOfShapes -= p.deltaTime / rate;
        }
      }

      // grows the shape on the x-axis
      growX(rate, max) {
        if (this.wid < max) {
          this.wid += p.deltaTime / rate;
        }
      }

      // grows the shape on the y-axis
      growY(rate, max) {
        if (this.len < max) {
          this.len += p.deltaTime / rate;
        }
      }

      // shrinks the shape on the x-axis
      shrinkX(rate, min) {
        if (this.wid > min) {
          this.wid -= p.deltaTime / rate;
        }
      }

      // shrinksthe shape on the y-axis
      shrinkY(rate, min) {
        if (this.len > min) {
          this.len -= p.deltaTime / rate;
        }
      }

      //  makes the shapes different sizes
      sizeGradient(truth) {
        this.sizeGradientTruth = truth;
        if (this.sizeGradientTruth === true) {
          this.sizeGradientAmount = this.wid / this.numberOfShapes;
        }
        if (this.sizeGradientTruth === false) {
          this.sizeGradientAmount = 0;
        }
        // console.log(this.sizeGradientAmount);
      }

      // changes fill color of shapes
      // also can cycle through the spectrum
      // rate = 10(faster cycle), 1000(slow cycle)
      fillColorSingle(hue, cycle, rate) {
        this.fillColorSingleTruth = true;
        if (cycle === false) {
          this.fillColorHue = hue;
        }
        // find a way to set hue color as initial color, otherwise always starts red
        if (cycle === true) {
          //this.fillColorHue += rate+hue;
          this.fillColorHue += p.deltaTime / rate;
          if (this.fillColorHue > 360) {
            this.fillColorHue = 0;
          }
        }
      }

      // changes stroke color of the shapes
      // also can cycle through the spectrum
      // rate = 10(faster cycle), 1000(slow cycle)
      strokeColorSingle(hue, cycle, rate) {
        this.strokeColorSingleTruth = true;
        if (cycle === false) {
          this.strokeColorHue = hue;
        }
        // find a way to set hue color as initial color, otherwise always starts red
        if (cycle === true) {
          //this.fillColorHue += rate+hue;
          this.strokeColorHue += p.deltaTime / rate;
          if (this.strokeColorHue > 360) {
            this.strokeColorHue = 0;
          }
        }
      }

      // modifies the size of the shapes depending on
      onBeatGrow(modifierAmount, lengthOfInterval, lengthOfBeat) {
        this.onBeatGrowTruth = true;
        if (p.millis() % lengthOfInterval < lengthOfInterval / lengthOfBeat) {
          this.onBeatGrowModifier = modifierAmount;
        } else {
          this.onBeatGrowModifier = 0;
        }
      }
    } // end class shapeGroup
  }; // end Sketch = (p)

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
        <Synth distForSynth={distForSynth} segHitState={segHitState} />
      </section>
    </>
  );
};

export default Sketch;
