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

    let numRects_A = 0;
    let rects_A = [];


    p.setup = () => {
      p.createCanvas(p.windowWidth / 2, p.windowHeight / 2, p.WEBGL);
      p.colorMode(p.HSB);
      p.rectMode(p.CENTER);

      sideWidth_A = p.width / 8;
      sideLength_A = p.width / 8;

      // sets number of shapes in relation to their size and the window size
      numTris_A = p.width/sideWidth_A;
      numRects_A = p.width/sideWidth_A;

      for (let i = 0; i < numRects_A; i++) {
        rects_A.push(new Rects(sideLength_A*0.5, sideWidth_A*0.5));
      }
      for (let i = 0; i < numTris_A; i++) {
        tris_A.push(new Tris(sideLength_A*0.5));
      }
    }; // end p.setup()


    p.draw = () => {

      if (p.keyIsPressed === true && p.key ==='q'){
        q = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='w'){
        w = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='e'){
        e = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='r'){
        r = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='t'){
        t = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='y'){
        y = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='u'){
        u = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='i'){
        i = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='o'){
        o = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='p'){
        p = 1;
      } 

      if (p.keyIsPressed === true && p.key ==='a'){
        a = 1;
        p.background(0);
      }
      if (p.keyIsPressed === true && p.key ==='s'){
        s = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='d'){
        d = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='f'){
        f = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='g'){
        g = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='h'){
        h = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='j'){
        j = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='k'){
        k = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='l'){
        l = 1;
      } 

      if (p.keyIsPressed === true && p.key ==='z'){
        z = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='c'){
        c = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='v'){
        v = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='b'){
        b = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='n'){
        n = 1;
      } 
      if (p.keyIsPressed === true && p.key ==='m'){
        m = 1;
      } 


      rotZ_sw_A = q;
      trnsX_sw_A = w;
      trnsY_sw_A = e;

      p.stroke(0);
      //p.rect(0,0,sideWidth_A,sideLength_A);
      //frame for window
      p.line(-p.width/2, -p.height/2, p.width/2, -p.height/2);
      p.line(-p.width/2, p.height/2, p.width/2, p.height/2);

      // drawing all the rectangles!!
      for (let i = 0; i < rects_A.length; i++){
        p.push();
        p.translate(-p.width*0.3,0); // moves to the left of window
        p.translate(10 * i,0 * i); // moves them more
        p.rotate(-p.radians(p.mouseX));

        rects_A[i].display();
        p.pop();
      }

      // drawing all the triangles!!
      for (let i = 0; i < tris_A.length; i++){
        p.push();
        p.translate(p.width*0.3,0); // moves to right of window
        p.translate(-10 * i,0 * i); // moves them more
        p.rotate(p.radians(p.mouseX));

        tris_A[i].display();
        p.pop();
      }


    }; // end p.draw()

    // do the classes below go in Sketch or outside?
    class Rects {
      constructor(sideLength, sideWidth) {
        this.len = sideLength;
        this.wid = sideWidth;
      }
    
      display() {
        p.rect(0, 0, 2*this.len, 2*this.wid);
      }
    } // end class Rects
    
    class Tris {
      constructor(sideLength) {
        this.side = sideLength;
      }
    
      display() {
        // fix center point
        p.triangle(
          0,
          -(p.sqrt(3) * this.side)*0.5,
          -p.cos(60) * this.side,
          (p.sqrt(3) * this.side)*0.5,
          p.cos(60) * this.side,
          (p.sqrt(3) * this.side)*0.5
        );
      } // end display()

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
