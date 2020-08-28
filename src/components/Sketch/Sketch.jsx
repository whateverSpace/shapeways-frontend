import React, { Component } from 'react';
import p5 from 'p5';
import ml5 from 'ml5';
import styles from './Sketch.css';
// import RectsGroup from '../Shapes/Shapes';

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

    let targetRightX = 0; // Target variables used to smooth movement of points
    let targetRightY = 0; // These may be consolidated to a list or table later
    let targetLeftX = 0;
    let targetLeftY = 0;
    let lerpRate = 0.2; // lerpRate between 0 and 1 determines the easement

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
        targetLeftX,
        targetLeftY,
        mappedDistanceShapeScale
      );
      groupTest.initialize(numShapesStart);
    }; // end p.setup()

    function getDistance(pos1, pos2, pos3, pos4) {
      return Math.sqrt((pos1 - pos2) ** 2 + (pos3 - pos4) ** 2);
    }

    function modelReady() {
      console.log('model loaded');
    }

    p.draw = () => {
      if (poses.length > 0) {
        this.setState({
          loading: false,
        });

        pose = poses[0].pose;
        right = pose['rightWrist'];
        left = pose['leftWrist'];
        nose = pose['nose'];
        leftEye = pose['leftEye'];
        rightEye = pose['rightEye'];
        targetRightX = p.lerp(targetRightX, right.x, lerpRate);
        targetRightY = p.lerp(targetRightY, right.y, lerpRate);
        targetLeftX = p.lerp(targetLeftX, left.x, lerpRate);
        targetLeftY = p.lerp(targetLeftY, left.y, lerpRate);

        mappedNoseColor = p.map(nose.x, 35, 650, 0, 255, true);
        // // console.log(mappedNoseColor);
        mappedThing = p.int(mappedNoseColor);
        p.background(mappedThing, mappedThing, mappedThing);

        //uncomment to see webcam image
        // p.push();
        // p.translate(p.width, 0);
        // p.scale(-1.0, 1.0);
        // p.image(video, 0, 0, p.width, p.height);
        // p.pop();

        distInPixels = getDistance(
          targetLeftX,
          targetRightX,
          targetLeftY,
          targetRightY
        );

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
        groupTest.spread(targetLeftX, targetLeftY, targetRightX, targetRightY);

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

        if (p.keyIsPressed === true && p.key === 'r') {
          groupTest.rotateEach(p.radians(p.frameCount));
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
        p.line(targetLeftX, targetLeftY, targetRightX, targetRightY);
        p.ellipse(nose.x, nose.y, 10);
        p.ellipse(leftEye.x, leftEye.y, 20);
        p.ellipse(rightEye.x, rightEye.y, 20);
        p.push();
        p.fill(360, 255, 255);
        p.ellipse(leftEye.x, leftEye.y, 5);
        p.ellipse(rightEye.x, rightEye.y, 5);
        p.pop();
        p.ellipse(targetRightX, targetRightY, 20);
        p.ellipse(targetLeftX, targetLeftY, 20);
        p.pop();

        for (let i = 0; i < segments.length; i++) {
          segments[i].checkCollision(left);
          if (segments[i].hit == false) {
            segments[i].checkCollision(right);
          }
          segments[i].display();
        }

        if (segments[2].hit == true) {
          groupTest.addShapes();
        }

        if (segments[0].hit == true) {
          groupTest.removeShapes();
        }

        p.stroke(50);
        p.line(p.width / 3, 0, p.width / 3, p.height);
        p.line((p.width / 3) * 2, 0, (p.width / 3) * 2, p.height);
        p.line(0, p.height / 2, p.width, p.height / 2);
        // end draw
      }
    };

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
          p.translate(p.width, 0);
          p.scale(-1, 1);
          // p.rotate(-p.radians(mappedDistanceShapeRotateLeft));
          p.rotate(i * this.rotateAllAmount);
          p.push();
          p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
          p.rotate(this.rotateEachAmount);
          // p.rotate(-p.radians(mappedDistanceShapeRotateLeft));

          // console.log(this.rotateEachAmount);

          p.rect(
            targetLeftX,
            targetLeftY,
            mappedDistanceShapeScale,
            mappedDistanceShapeScale
          );
          p.pop();
          p.pop();
        }
      } // end display()

      // display(){
      //   for (let i = 0; i < this.allRects.length; i++){ // i<this.numb
      //     p.push();
      //     p.rotate(i*this.rotateAllAmount);
      //     p.push();
      //       p.translate(i*this.spreadAmountX,i*this.spreadAmountY);
      //       p.rotate(this.rotateEachAmount);
      //       this.allRects[i].display();
      //       //p.rect(0, 0, this.wid -  (i * this.sizeChange), this.len - (i * this.sizeChange));
      //     p.pop();
      //     p.pop();
      //     }
      // } // end display()

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

    // class Tris {
    //   constructor(radiusLength) {
    //     this.radius = radiusLength;
    //   }

    //   display() {
    //     // fix center point
    //     p.triangle(
    //       0,
    //       this.radius * 2,
    //       -this.radius * p.sqrt(3),
    //       -this.radius,
    //       this.radius * p.sqrt(3),
    //       -this.radius
    //     );
    //   } // end display()

    //   inscribeEllipse() {
    //     p.ellipse(0, 0, this.radius * 2, this.radius * 2);
    //   }
    // } // end class Tris
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return (
      <section>
        {this.state.loading && (
          <h1 className={styles.loading}>loading models...</h1>
        )}
        <div className={styles.box}>
          <div ref={this.myRef}></div>
        </div>
      </section>
    );
  }
}
