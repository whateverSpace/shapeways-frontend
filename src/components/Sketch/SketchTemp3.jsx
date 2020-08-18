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

    // by default all options are set to true
    const detection_options = {
      withLandmarks: true,
      withDescriptors: true,
    };

    p.setup = () => {
      p.createCanvas(p.windowWidth / 2, p.windowHeight / 2);

      // load up your video
      video = p.createCapture(p.VIDEO);
      video.size(p.width, p.height);
      video.hide(); // Hide the video element, and just show the canvas
      faceapi = ml5.faceApi(video, detection_options, modelReady);
      p.textAlign(p.RIGHT);
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
      if (detections) {
        if (detections.length > 0) {
          // console.log(detections)
          // drawBox(detections);
          drawLandmarks(detections);
        }
      }
      faceapi.detect(gotResults);
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
      // p.translate(p.width, 0);
      // p.scale(-1, 1);
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
