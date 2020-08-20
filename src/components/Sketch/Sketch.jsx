import React, { Component } from 'react';
import p5 from 'p5';
import styles from './Sketch.css';

export default class Sketch extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {

    let q = 0;
    let w = 0;
    let e = 0;
    let r = 0;
    let t = 0;
    let y = 0;
    let u = 0;
    let i = 0;
    let o = 0;
    // let p = 0;

    let a = 0;
    let s = 0;
    let d = 0;
    let f = 0;
    let g = 0;
    let h = 0;
    let j = 0;
    let k = 0;
    let l = 0;

    let z = 0;
    let x = 0;
    let c = 0;
    let v = 0;
    let b = 0;
    let n = 0;
    let m = 0;

    let up = 0;
    let down = 0;
    let left = 0;
    let right = 0;

    let space = 0;


    let rotZ_sw_A = 0;
    let rotZ_dist_A = 0;
    let rotZ_spY_A = 0;
    let rotZ_spD_A = 0;

    let trnsX_sw_A = 0;
    let trnsY_sw_A = 0;
    let trnsX_dist_A = 0;
    let trnsY_dist_A = 0;
    let trnsX_spU_A = 0;
    let trnsX_spD_A = 0;
    let trnsY_spU_A = 0;
    let trnsY_spD_A = 0;

    let sideWidth_A = 0;
    let sideLength_A = 0;

    let numTris_A = 0;
    let tris_A = [];

    let numRects_A = 20;
    let rects_A = [];

    let groupTest;

    p.setup = () => {
      p.createCanvas(p.windowWidth / 2, p.windowHeight / 2);
      p.colorMode(p.HSB);
      p.rectMode(p.CENTER);

      sideWidth_A = p.width / 20;
      sideLength_A = p.width / 20;

      // sets number of shapes in relation to their size and the window size
      numTris_A = p.width/sideWidth_A;
      numRects_A = p.width/sideWidth_A;

      for (let i = 0; i < numRects_A; i++) {
        rects_A.push(new Rects(sideLength_A, sideWidth_A));
      }
      for (let i = 0; i < numTris_A; i++) {
        tris_A.push(new Tris(sideLength_A/(2/p.sqrt(2))));
      }

      groupTest = new RectsGroup(20,20);
      groupTest.intitialize(10);
    }; // end p.setup()


    p.draw = () => {




      if (p.keyIsPressed === true && p.key ==='a'){
        a = 1;
        p.background(0);
      }
      if (p.keyIsPressed === true && p.key ==='s'){
        s = 1;
        p.background(255);
      } 


      rotZ_sw_A = q;
      trnsX_sw_A = w;
      trnsY_sw_A = e;

      p.stroke(0);
      //p.rect(0,0,sideWidth_A,sideLength_A);
      //frame for window
      p.line(0, 0, p.width, 0);
      p.line(0, p.height, p.width, p.height);


      // begin drawing all the shapes
      p.push();
      p.translate(p.width*0.5, p.height*0.5);
      // drawing all the rectangles!!
      for (let i = 0; i < rects_A.length; i++){
        p.push();
     // p.translate(-p.width*0.3,0); // moves to the left of window
        p.translate(sideWidth_A,0); // moves to the left of window
       // p.translate(10 * i,0 * i); // moves them more
        p.rotate(-p.radians(p.mouseX));

        rects_A[i].display();
      //  rects_A[i].inscribeEllipse();
        p.pop();
      }

      // drawing all the triangles!!
      for (let i = 0; i < tris_A.length; i++){
        p.push();
      //  p.translate(p.width*0.3,0); // moves to right of window
        p.translate(-sideWidth_A,0); // moves to right of window
      //  p.translate(-10 * i,0 * i); // moves them more
        p.rotate(p.radians(p.mouseX));

        tris_A[i].display();
      //  tris_A[i].inscribeEllipse();
        p.pop();
      }

      p.pop();
      // end drawing all the shapes 

      p.push();
     // p.translate(40,40);
     // groupTest.addShapes();

      //groupTest.removeShapes();
      groupTest.spread(0,0,p.mouseX,p.mouseY);
     // groupTest.sizeGradient();
      groupTest.rotateEach(p.radians(p.frameCount));
     // groupTest.rotateAll(p.radians(45));
      groupTest.display();
      p.pop();
    }; // end p.draw()

    class RectsGroup{
      constructor(sideWidth, sideLength){

        this.wid = sideWidth;
        this.len = sideLength;

        //this.numb = numRects; // may end up deleting
        // needs to integrate size gradient
        this.allRects = [];

        // for sizeGradient() method
        this.sizeTruth = false;
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


      } // end constructor

      display(){
        for (let i = 0; i < this.allRects.length; i++){ // i<this.numb
          p.push();
          p.rotate(i*this.rotateAllAmount);
          p.push();
            p.translate(i*this.spreadAmountX,i*this.spreadAmountY);
            p.rotate(this.rotateEachAmount);
            this.allRects[i].display();
            //p.rect(0, 0, this.wid -  (i * this.sizeChange), this.len - (i * this.sizeChange));
          p.pop();
          p.pop();
          }
      } // end display()

      intitialize(amount){
        for (let i = 0; i < amount; i++){
          this.allRects.push(new Rects(this.wid,this.len));
        }
      }

      spread(startX, startY, endX, endY){
        this.spreadTruth = true;
        this.spreadAmountX = (endX-startX)/this.allRects.length;
        this.spreadAmountY = (endY-startY)/this.allRects.length;

      }

      rotateEach(amount){
        this.rotateEachTruth = true;
        this.rotateEachAmount = amount;
      }
      
      rotateAll(amount){
        this.rotateAllTruth = true;
        this.rotateAllAmount = amount;
      }

      sizeGradient(){
        this.sizeTruth = true;
        this.sizeChange = this.numb/this.wid;
      }

      addShapes(){
          this.allRects.push(new Rects(this.wid,this.len));

      }

      removeShapes(){
        this.allRects.pop(new Rects(this.wid,this.len));
      }

    } // end class RectsGroup()


    // do the classes below go in Sketch or outside?
    class Rects {
      constructor(sideLength, sideWidth) {
        this.len = sideLength;
        this.wid = sideWidth;
      }
    
      display() {
        p.rect(0, 0, 2*this.wid, 2*this.len);
      }

      inscribeEllipse(){
       p.ellipse(0,0,2*this.wid, 2*this.len)
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

      inscribeEllipse(){
        p.ellipse(0,0,this.radius * 2,this.radius * 2);
      }

    } // end class Tris

    

    // do the classes above go in Sketch or outside?

    
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return (
      <>
        <div className={styles.Sketch} ref={this.myRef}></div>
        <h1>whateverrrr</h1>
      </>
    );
  }
}
