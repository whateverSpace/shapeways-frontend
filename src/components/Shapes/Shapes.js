// import React from 'react';
// import Sketch { p } from '../Sketch/Sketch';
// import p5 as p from 'p5';

export class Rects {
  constructor(p, sideLength, sideWidth) {
    this.p = p;
    this.len = sideLength;
    this.wid = sideWidth;
  }

  display() {
    this.p.rect(0, 0, 2 * this.wid, 2 * this.len);
  }

  inscribeEllipse() {
    this.p.ellipse(0, 0, 2 * this.wid, 2 * this.len);
  }
} // end class Rects

export default class RectsGroup extends Rects {
  constructor(
    p,
    sideWidth,
    sideLength,
    targetLeftX,
    targetLeftY,
    mappedDistanceShapeScale
  ) {
    super();
    this.p = p;
    this.wid = sideWidth;
    this.len = sideLength;
    this.targetLeftX = targetLeftX;
    this.targetLeftY = targetLeftY;
    this.mappedDistanceShapeScale = mappedDistanceShapeScale;

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
      this.p.push();
      this.p.translate(this.p.width, 0);
      this.p.scale(-1, 1);
      // this.p.rotate(-this.p.radians(mappedDistanceShapeRotateLeft));
      this.p.rotate(i * this.rotateAllAmount);
      this.p.push();
      this.p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
      this.p.rotate(this.rotateEachAmount);
      // this.p.rotate(-this.p.radians(mappedDistanceShapeRotateLeft));

      // console.log(this.rotateEachAmount);

      this.p.rect(
        this.targetLeftX,
        this.targetLeftY,
        this.mappedDistanceShapeScale,
        this.mappedDistanceShapeScale
      );
      this.p.pop();
      this.p.pop();
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
    this.p.fill(hue, 255, 255, alpha);
  }

  strokeColor(hue, alpha) {
    this.p.stroke(hue, 255, 255, alpha);
  }
} // end class RectsGroup()

export class Segment {
  constructor(p, x, y) {
    this.x = x;
    this.y = y;
    this.w = p.width / 3;
    this.h = p.height / 2;
    this.hit = false;
    this.alpha = 0;
    this.p = p;
  }

  display() {
    if (this.hit) {
      this.alpha = this.p.lerp(this.alpha, 255, 0.3);
      this.p.push();
      this.p.translate((this.p.width / 6) * 5, this.p.height / 4);
      this.p.scale(-1.0, 1.0);
      this.p.fill(270, 255, 255, 0.3);
      this.p.rect(this.x, this.y, this.p.width / 3, this.p.height / 2);
      this.p.pop();
    } else {
      this.alpha = this.p.lerp(this.alpha, 0, 0.1);
    }
  }

  checkCollision(target) {
    this.hit = collision(target.x, target.y, 5, this.x, this.y, this.w, this.h);
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
