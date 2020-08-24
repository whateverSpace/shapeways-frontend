import React from 'react';

export class Rects {
  constructor(sideLength, sideWidth) {
    this.len = sideLength;
    this.wid = sideWidth;
  }

  display(p) {
    p.rect(0, 0, 2 * this.wid, 2 * this.len);
  }

  inscribeEllipse(p) {
    p.ellipse(0, 0, 2 * this.wid, 2 * this.len);
  }
} // end class Rects

export default class RectsGroup extends React.Component {
  constructor(sideWidth, sideLength) {
    super();
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

  display(p) {
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
