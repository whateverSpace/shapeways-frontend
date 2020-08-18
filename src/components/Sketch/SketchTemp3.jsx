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
    let faceapi;
    let video;
    let detections;

    let numShapes = 100;

    let numTets = numShapes;
    let tetras = [];

    let numCubes = numShapes;
    let sideLength = 0;

    let rotXcwSwA = 0;
    let rotYcwSwA = 0;
    let rotZcwSwA = 0;
    let rotXccwSwA = 0;
    let rotYccwSwA = 0;
    let rotZccwSwA = 0;

    let rotXcwRtA = 0;
    let rotYcwRtA = 0;
    let rotZcwRtA = 0;
    let rotXccwRtA = 0;
    let rotYccwRtA = 0;
    let rotZccwRtA = 0;

    let rotXcwSpU = 0.001;
    let rotXcwSpD = 0.002;
    let rotYcwSpU = 0.001;
    let rotYcwSpD = 0.002;
    let rotZcwSpU = 0.001;
    let rotZcwSpD = 0.002;
    let rotXccwSpU = 0.001;
    let rotXccwSpD = 0.002;
    let rotYccwSpU = 0.001;
    let rotYccwSpD = 0.002;
    let rotZccwSpU = 0.001;
    let rotZccwSpD = 0.002;

    let trnsXposSwA = 0;
    let trnsXnegSwA = 0;
    let trnsYposSwA = 0;
    let trnsYnegSwA = 0;
    let trnsZposSwA = 0;
    let trnsZnegSwA = 0;
    let trnsXdistA = 0;
    let trnsYdistA = 0;
    let trnsZdistA = 0;
    let trnsXposSpU = 0.05;
    let trnsXposSpD = 0.1;
    let trnsXnegSpU = 0.05;
    let trnsXnegSpD = 0.1;
    let trnsYposSpU = 0.05;
    let trnsYposSpD = 0.1;
    let trnsYnegSpU = 0.05;
    let trnsYnegSpD = 0.1;
    let trnsZposSpU = 0.05;
    let trnsZposSpD = 0.01;
    let trnsZnegSpU = 0.005;
    let trnsZnegSpD = 0.01;

    let q = 0;
    let w = 0;
    let e = 0;
    let r = 0;
    let t = 0;
    let y = 0;
    let u = 0;
    let i = 0;
    let o = 0;
    let p = 0;

    let Q = 0;
    let W = 0;
    let E = 0;
    let R = 0;
    let T = 0;
    let Y = 0;
    let U = 0;
    let I = 0;
    let O = 0;
    let P = 0;

    let a = 0;
    let s = 0;
    let d = 0;
    let f = 0;
    let g = 0;
    let h = 0;
    let j = 0;
    let k = 0;
    let l = 0;

    let A = 0;
    let S = 0;
    let D = 0;
    let F = 0;
    let G = 0;
    let H = 0;
    let J = 0;
    let K = 0;
    let L = 0;

    let z = 0;
    let x = 0;
    let c = 0;
    let v = 0;
    let b = 0;
    let n = 0;
    let m = 0;

    let Z = 0;
    let X = 0;
    let C = 0;
    let V = 0;
    let B = 0;
    let N = 0;
    let M = 0;

    let up = 0;
    let down = 0;
    let left = 0;
    let right = 0;

    let space = 0;

    // by default all options are set to true
    const detection_options = {
      withLandmarks: true,
      withDescriptors: true,
    };

    p.setup = () => {
      p.createCanvas(p.windowWidth / 2, p.windowHeight / 2, p.WEBGL);
      p.colorMode(p.HSB);

      sideLength = p.windowWidth / 6;

      // load up your video
      video = p.createCapture(p.VIDEO);
      video.size(p.width, p.height);
      video.hide(); // Hide the video element, and just show the canvas
      faceapi = ml5.faceApi(video, detection_options, modelReady);
      p.textAlign(p.RIGHT);

      for (let i = 0; i < numTets; i++) {
        tetras.push(new Tetrahedron(sideLength));
      }
    };

    const modelReady = () => {
      console.log('ready!');
      console.log(faceapi);
      faceapi.detect(gotResults);

      this.setState({
        loading: false,
      });
    };

    function gotResults(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      // console.log(result);
      detections = result;

      // background(220);
      p.background(255);
      // p.image(video, 0, 0, p.width, p.height);
      p.fill(0);
      p.stroke(255);
      p.fill(30, 255, 255, 120);
      // p.translate(p.width, 0);
      // p.scale(-1, 1);

      if (detections) {
        if (detections.length > 0) {
          // console.log(detections)
          // drawBox(detections);
          drawLandmarks(detections);
        }
      }
      faceapi.detect(gotResults);

      trnsXposSwA = f;
      trnsXnegSwA = s;
      trnsYposSwA = c; // down
      trnsYnegSwA = e; // up

      rotXcwSwA = q;
      rotXccwSwA = w;
      rotYcwSwA = z;
      rotYccwSwA = x;
      rotZcwSwA = r;
      rotZccwSwA = v;

      // TRANSLATION
      if (trnsXposSwA != 0) {
        trnsXdistA += trnsXposSpU;
      }
      if (trnsXnegSwA != 0) {
        trnsXdistA -= trnsXnegSpU;
      }
      if (trnsXposSwA === 0 && trnsXnegSwA === 0) {
        if (trnsXdistA > 0) {
          trnsXdistA -= trnsXposSpD;
        }
        if (trnsXdistA < 0) {
          trnsXdistA += trnsXnegSpD;
        }
      }

      if (trnsYposSwA != 0) {
        trnsYdistA += trnsYposSpU;
      }
      if (trnsYnegSwA != 0) {
        trnsYdistA -= trnsYnegSpU;
      }
      if (trnsYposSwA === 0 && trnsYnegSwA === 0) {
        if (trnsYdistA > 0) {
          trnsYdistA -= trnsYposSpD;
        }
        if (trnsYdistA < 0) {
          trnsYdistA += trnsYnegSpD;
        }
      }

      // ROTATION CCW
      if (rotXcwSwA != 0) {
        rotXcwRtA += rotXcwSpU;
      }
      if (rotXcwSwA === 0) {
        rotXcwRtA -= rotXcwSpD;
        if (rotXcwRtA < 0) {
          rotXcwRtA = 0;
        }
      }
      if (rotYcwSwA != 0) {
        rotYcwRtA += rotYcwSpU;
      }
      if (rotYcwSwA === 0) {
        rotYcwRtA -= rotYcwSpD;
        if (rotYcwRtA < 0) {
          rotYcwRtA = 0;
        }
      }
      if (rotZcwSwA != 0) {
        rotZcwRtA += rotZcwSpU;
      }
      if (rotZcwSwA === 0) {
        rotZcwRtA -= rotZcwSpD;
        if (rotZcwRtA < 0) {
          rotZcwRtA = 0;
        }
      }

      // ROTATE CCW
      if (rotXccwSwA != 0) {
        rotXccwRtA += rotXccwSpU;
      }
      if (rotXccwSwA == 0) {
        rotXccwRtA -= rotXccwSpD;
        if (rotXccwRtA < 0) {
          rotXccwRtA = 0;
        }
      }
      if (rotYccwSwA != 0) {
        rotYccwRtA += rotYccwSpU;
      }
      if (rotYccwSwA == 0) {
        rotYccwRtA -= rotYccwSpD;
        if (rotYccwRtA < 0) {
          rotYccwRtA = 0;
        }
      }
      if (rotZccwSwA != 0) {
        rotZccwRtA += rotZccwSpU;
      }
      if (rotZccwSwA == 0) {
        rotZccwRtA -= rotZccwSpD;
        if (rotZccwRtA < 0) {
          rotZccwRtA = 0;
        }
      }

      //for (let i = 0; i < numCubes; i ++){
      for (let i = 0; i < tetras.length; i++) {
        p.push();

        //translate(mouseX,mouseY);
        p.rotateX(rotXcwRtA * (i + 1));
        p.rotateX(rotXccwRtA * (-i + 1));
        p.rotateY(rotYcwRtA * (i + 1));
        p.rotateY(rotYccwRtA * (-i + 1));
        p.rotateZ(rotZcwRtA * (i + 1));
        p.rotateZ(rotZccwRtA * (-i + 1));
        p.translate(trnsXdistA * i, 0, 0);
        p.translate(0, trnsYdistA * i, 0);
        // rotateY(radians(rotYcwRtA*(i+1)));
        // rotateZ(radians(rotZcwRtA*(i+1)));
        //rect(0,0,sideLength,sideLength);
        //	box(sideLength);

        //putting a lone tetraheron in this for loop will create a large
        // number of them, but they move very slowly, as all calculations
        // are being done on each one everytime. now i shall make an array
        // of tetrahedrons.
        //tetrahed.display();

        tetras[i].display();

        p.pop();
      }
    }

    function keyTyped() {
      // lowercase
      if (p.key === 'q') {
        q = 1;
      }
      if (p.key === 'w') {
        w = 1;
      }
      if (p.key === 'e') {
        e = 1;
      }
      if (p.key === 'r') {
        r = 1;
      }
      if (p.key === 't') {
        t = 1;
      }
      if (p.key === 'y') {
        y = 1;
      }
      if (p.key === 'u') {
        u = 1;
      }
      if (p.key === 'i') {
        i = 1;
      }
      if (p.key === 'o') {
        o = 1;
      }
      if (p.key === 'p') {
        p = 1;
      }
      if (p.key === 'a') {
        a = 1;
      }
      if (p.key === 's') {
        s = 1;
      }
      if (p.key === 'd') {
        d = 1;
      }
      if (p.key === 'f') {
        f = 1;
      }
      if (p.key === 'g') {
        g = 1;
      }
      if (p.key === 'h') {
        h = 1;
      }
      if (p.key === 'j') {
        j = 1;
      }
      if (p.key === 'k') {
        k = 1;
      }
      if (p.key === 'l') {
        l = 1;
      }
      if (p.key === 'z') {
        z = 1;
      }
      if (p.key === 'x') {
        x = 1;
      }
      if (p.key === 'c') {
        c = 1;
      }
      if (p.key === 'v') {
        v = 1;
      }
      if (p.key === 'b') {
        b = 1;
      }
      if (p.key === 'n') {
        n = 1;
      }
      if (p.key === 'm') {
        m = 1;
      }
      //uppercase
      if (p.key === 'Q') {
        Q = 1;
      }
      if (p.key === 'W') {
        W = 1;
      }
      if (p.key === 'E') {
        E = 1;
      }
      if (p.key === 'R') {
        R = 1;
      }
      if (p.key === 'T') {
        T = 1;
      }
      if (p.key === 'Y') {
        Y = 1;
      }
      if (p.key === 'U') {
        U = 1;
      }
      if (p.key === 'I') {
        I = 1;
      }
      if (p.key === 'O') {
        O = 1;
      }
      if (p.key === 'P') {
        P = 1;
      }
      if (p.key === 'A') {
        A = 1;
      }
      if (p.key === 'S') {
        S = 1;
      }
      if (p.key === 'D') {
        D = 1;
      }
      if (p.key === 'F') {
        F = 1;
      }
      if (p.key === 'G') {
        G = 1;
      }
      if (p.key === 'H') {
        H = 1;
      }
      if (p.key === 'J') {
        J = 1;
      }
      if (p.key === 'K') {
        K = 1;
      }
      if (p.key === 'L') {
        L = 1;
      }
      if (p.key === 'Z') {
        Z = 1;
      }
      if (p.key === 'X') {
        X = 1;
      }
      if (p.key === 'C') {
        C = 1;
      }
      if (p.key === 'V') {
        V = 1;
      }
      if (p.key === 'B') {
        B = 1;
      }
      if (p.key === 'N') {
        N = 1;
      }
      if (p.key === 'M') {
        M = 1;
      }
      return false;
    }

    function keyPressed() {
      if (p.keyCode === p.LEFT_ARROW) {
        //rotXcwSwA += 1;
        left += 1;
      }
      if (p.keyCode === p.RIGHT_ARROW) {
        //rotXccwSwA += 1;
        right += 1;
      }
      if (p.keyCode === p.UP_ARROW) {
        //rotYcwSwA += 1;
        up = +1;
      }
      if (p.keyCode === p.DOWN_ARROW) {
        //rotYccwSwA +=1;
        down += 1;
      }

      return false;
    }

    function keyReleased() {
      if (p.keyCode === p.LEFT_ARROW) {
        //rotXcwSwA -= 1;
        left -= 1;
      }
      if (p.keyCode === p.RIGHT_ARROW) {
        //rotXccwSwA -= 1;
        right -= 1;
      }
      if (p.keyCode === p.UP_ARROW) {
        //rotYcwSwA -= 1;
        up -= 1;
      }
      if (p.keyCode === p.DOWN_ARROW) {
        //rotYccwSwA -=1;
        down -= 1;
      }

      // lowercase
      if (p.key === 'q') {
        q = 0;
      }
      if (p.key === 'w') {
        w = 0;
      }
      if (p.key === 'e') {
        e = 0;
      }
      if (p.key === 'r') {
        r = 0;
      }
      if (p.key === 't') {
        t = 0;
      }
      if (p.key === 'y') {
        y = 0;
      }
      if (p.key === 'u') {
        u = 0;
      }
      if (p.key === 'i') {
        i = 0;
      }
      if (p.key === 'o') {
        o = 0;
      }
      // if (p.key === 'p') {
      //   p = 0;
      // }
      if (p.key === 'a') {
        a = 0;
      }
      if (p.key === 's') {
        s = 0;
      }
      if (p.key === 'd') {
        d = 0;
      }
      if (p.key === 'f') {
        f = 0;
      }
      if (p.key === 'g') {
        g = 0;
      }
      if (p.key === 'h') {
        h = 0;
      }
      if (p.key === 'j') {
        j = 0;
      }
      if (p.key === 'k') {
        k = 0;
      }
      if (p.key === 'l') {
        l = 0;
      }
      if (p.key === 'z') {
        z = 0;
      }
      if (p.key === 'x') {
        x = 0;
      }
      if (p.key === 'c') {
        c = 0;
      }
      if (p.key === 'v') {
        v = 0;
      }
      if (p.key === 'b') {
        b = 0;
      }
      if (p.key === 'n') {
        n = 0;
      }
      if (p.key === 'm') {
        m = 0;
      }
      //uppercase
      if (p.key === 'Q') {
        Q = 0;
      }
      if (p.key === 'W') {
        W = 0;
      }
      if (p.key === 'E') {
        E = 0;
      }
      if (p.key === 'R') {
        R = 0;
      }
      if (p.key === 'T') {
        T = 0;
      }
      if (p.key === 'Y') {
        Y = 0;
      }
      if (p.key === 'U') {
        U = 0;
      }
      if (p.key === 'I') {
        I = 0;
      }
      if (p.key === 'O') {
        O = 0;
      }
      if (p.key === 'P') {
        P = 0;
      }
      if (p.key === 'A') {
        A = 0;
      }
      if (p.key === 'S') {
        S = 0;
      }
      if (p.key === 'D') {
        D = 0;
      }
      if (p.key === 'F') {
        F = 0;
      }
      if (p.key === 'G') {
        G = 0;
      }
      if (p.key === 'H') {
        H = 0;
      }
      if (p.key === 'J') {
        J = 0;
      }
      if (p.key === 'K') {
        K = 0;
      }
      if (p.key === 'L') {
        L = 0;
      }
      if (p.key === 'Z') {
        Z = 0;
      }
      if (p.key === 'X') {
        X = 0;
      }
      if (p.key === 'C') {
        C = 0;
      }
      if (p.key === 'V') {
        V = 0;
      }
      if (p.key === 'B') {
        B = 0;
      }
      if (p.key === 'N') {
        N = 0;
      }
      if (p.key === 'M') {
        M = 0;
      }

      return false;
    }

    class Tetrahedron {
      constructor(sideLength) {
        this.s = sideLength;
        this.ss = sideLength; // for scale method
        this.x = 0.577 * this.s;
        this.r = 0.204 * this.s;
        this.R = 0.612 * this.s;
        this.d = 0.408 * this.s;
        // this.x = (1./3.)*sqrt(3)*this.s;
        // this.r = (1./12.)*sqrt(6)*this.s;
        // this.R = 0.25*sqrt(6)*this.s;
        // this.d = (1./6.)*sqrt(6)*this.s;
        this.vertex1 = p.createVector(this.x, 0, -this.r);
        this.vertex2 = p.createVector(-this.d, this.s * 0.5, -this.r);
        this.vertex3 = p.createVector(-this.d, -this.s * 0.5, -this.r);
        this.vertex4 = p.createVector(0, 0, this.R);
      }

      display() {
        p.beginShape();
        p.vertex(this.vertex1.x, this.vertex1.y, this.vertex1.z); // 1
        p.vertex(this.vertex2.x, this.vertex2.y, this.vertex2.z); // 2
        p.vertex(this.vertex3.x, this.vertex3.y, this.vertex3.z); // 3
        p.vertex(this.vertex1.x, this.vertex1.y, this.vertex1.z); // 1
        p.vertex(this.vertex4.x, this.vertex4.y, this.vertex4.z); // 4
        p.vertex(this.vertex2.x, this.vertex2.y, this.vertex2.z); // 2
        p.vertex(this.vertex3.x, this.vertex3.y, this.vertex3.z); // 3
        p.vertex(this.vertex4.x, this.vertex4.y, this.vertex4.z); // 4
        p.endShape(p.CLOSE);
      }
    }

    // function drawBox(detections) {
    //   for (let i = 0; i < detections.length; i++) {
    //     const alignedRect = detections[i].alignedRect;
    //     const x = alignedRect._box._x;
    //     const y = alignedRect._box._y;
    //     const boxWidth = alignedRect._box._width;
    //     const boxHeight = alignedRect._box._height;

    //     p.noFill();
    //     p.stroke(161, 95, 251);
    //     p.strokeWeight(2);
    //     p.rect(x, y, boxWidth, boxHeight);
    //   }
    // }

    function drawLandmarks(detections) {
      p.noFill();
      p.stroke(161, 95, 251);
      p.strokeWeight(2);

      for (let i = 0; i < detections.length; i++) {
        const mouth = detections[i].parts.mouth;
        const nose = detections[i].parts.nose;
        const leftEye = detections[i].parts.leftEye;
        const rightEye = detections[i].parts.rightEye;
        const rightEyeBrow = detections[i].parts.rightEyeBrow;
        const leftEyeBrow = detections[i].parts.leftEyeBrow;

        drawPart(mouth, true);
        drawPart(nose, false);
        drawPart(leftEye, true);
        drawPart(leftEyeBrow, false);
        drawPart(rightEye, true);
        drawPart(rightEyeBrow, false);
      }
    }

    function drawPart(feature, closed) {
      p.beginShape();
      for (let i = 0; i < feature.length; i++) {
        const x = feature[i]._x;
        const y = feature[i]._y;
        p.vertex(x, y);
      }

      if (closed === true) {
        p.endShape(p.CLOSE);
      } else {
        p.endShape();
      }
    }
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return (
      <>
        {this.state.loading && <h1>loading model...</h1>}
        <div className={styles.Sketch} ref={this.myRef}></div>
      </>
    );
  }
}
