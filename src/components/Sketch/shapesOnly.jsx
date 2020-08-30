import React, { Component } from 'react';

import p5 from 'p5';

//import ml5 from 'ml5';

import styles from './Sketch.css';

export default class Sketch extends Component {

    state = { loading: true };

    constructor(props) {

        super(props);

        this.myRef = React.createRef();

    }

    Sketch = (p) => {

        let groupTest;
        let numShapesStart = 10;
        let numShapesMin = 10;
        let numShapesMax = 300;
        let sideLengthStart = 20;
        let sideLengthMin = 20;
        let sideLengthMax = 100;

        let counter = 0;
        let counterMax = 100;


        p.setup = () => {

            p.createCanvas(p.windowWidth / 2, p.windowHeight / 2);

            p.colorMode(p.HSB);

            p.rectMode(p.CENTER);

            groupTest = new RectsGroup(sideLengthStart, sideLengthStart);
            groupTest.intitialize(numShapesStart);

        } // end setup()

        p.draw = () => {

            p.ellipse(0, p.height / 2, 10, 10);

            p.push();

            if (p.keyIsPressed === true && p.key === 'a') {
                p.background(0);
            }
            if (p.keyIsPressed === true && p.key === 's') {
                p.background(255);
            }
            p.background(255);


            groupTest.spread(p.mouseX-100, p.mouseY-100, p.mouseX, p.mouseY)
            //groupTest.spread(0,0,p.mouseX-100, p.mouseY-100, p.mouseX, p.mouseY)
            // if (p.mouseButton === p.LEFT) {
            //     // groupTest.spread(0, 0, p.mouseX, p.mouseY);
            //     groupTest.spread(0, -100, p.width, 60);
            //     // groupTest.spread(targetLeftX, targetLeftY, targetRightX, targetRightY);
            // }


            // on or off, can smooth out transition between on/off later
            if (p.keyIsPressed === true && p.key === 'q') {
                groupTest.sizeGradient();
            }

            if (p.keyIsPressed === true && p.key === 'w') {
                groupTest.addShapes(numShapesMax);
            }

            if (p.keyIsPressed === true && p.key === 'e') {
                groupTest.removeShapes(numShapesMin);
            }

            if (p.keyIsPressed === true && p.key === 'r') {
                groupTest.rotateEach(p.radians(p.frameCount));
            }

            if (p.keyIsPressed === true && p.key === 't') {
                groupTest.rotateAll(p.radians(p.frameCount * 0.01));
            } else {
                groupTest.rotateAll(0);
            }

            if (p.keyIsPressed === true && p.key === 'y') {
                groupTest.growAll(1, sideLengthMax, sideLengthMax);
            }

            if (p.keyIsPressed === true && p.key === 'u') {
                groupTest.shrinkAll(1, sideLengthMin, sideLengthMin);
            }

            if (p.keyIsPressed === true && p.key === 'i') {
                groupTest.fillColor(120, .5);
            }

            if (p.keyIsPressed === true && p.key === 'o') {
                groupTest.strokeColor(220, 1);
            }

            if (p.keyIsPressed === true && p.key === 'l') {
                groupTest.everyOther(true);
            }

            if (p.keyIsPressed === true && p.key === 'k') {
                groupTest.everyOther(true);
            }

            if (p.keyIsPressed === true && p.key === 'j') {
                //groupTest.addRemoveShapes(100,numShapesMax,numShapesMin);


                if (counter < counterMax) {
                    if (groupTest.length < numShapesMax) {
                        groupTest.addShapes(numShapesMax);
                    }
                    if (groupTest.length > numShapesMin) {
                        groupTest.removeShapes();
                    }

                    counter++;
                } else {
                    counter = counterMax
                }



            }


            groupTest.display();
            p.pop();


        } // end draw()

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

                // for everyOther() method
                this.everyOther = false;


            } // end constructor

            display() {
                for (let i = 0; i < this.allRects.length; i++) { // i<this.numb

                    // p.rotate(i * this.rotateAllAmount);

                   // if (this.everyOther === false) {
                        p.push();
                        p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
                        p.rotate(this.rotateEachAmount);
                        // this.allRects[i].display();
                        p.rect(0, 0, this.wid - (i * this.sizeChange), this.len - (i * this.sizeChange));
                        p.pop();
                   // }
                    // if (this.everyOther === true) {
                    //     p.push();
                    //     if (i % 2 === 1) {
                    //         p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
                    //         p.rotate(this.rotateEachAmount);
                    //         // this.allRects[i].display();
                    //         p.rect(0, 0, this.wid - (i * this.sizeChange), this.len - (i * this.sizeChange));
                    //     } else {
                    //         p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
                    //         p.rotate(this.rotateEachAmount);
                    //         // this.allRects[i].display();
                    //         p.rect(0, 0, this.wid + (i * this.sizeChange), this.len + (i * this.sizeChange));
                    //     }
                     //   p.pop();
                    //}

                }
            } // end display()

            intitialize(amount) {
                for (let i = 0; i < amount; i++) {
                    this.allRects.push(new Rects(this.wid, this.len));
                }
            }

            growAll(speed, maxWid, maxLen) {
                this.growAllTruth = true;
                if (this.wid < maxWid) {
                    this.wid += speed;
                }
                if (this.len < maxLen) {
                    this.len += speed;
                }

            }

            shrinkAll(speed, minWid, minLen) {
                this.shrinkAllTruth = true;

                if (this.wid > minWid) {
                    this.wid -= speed;
                }
                if (this.len > minLen) {
                    this.len -= speed;
                }

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

            addShapes(maxShapes) {

                if (this.allRects.length < maxShapes) {
                    this.allRects.push(new Rects(this.wid, this.len));
                }
                //console.log(allRects.length);
            }

            removeShapes(minShapes) {
                if (this.allRects.length > minShapes) {
                    this.allRects.pop(new Rects(this.wid, this.len));
                }
            }

            fillColor(hue, alpha) {
                p.fill(hue, 255, 255, alpha);
            }

            strokeColor(hue, alpha) {
                p.stroke(hue, 255, 255, alpha);
            }

            everyOther(input) {
                this.everyOther = input;
            }

            addRemoveShapes(counter, maxShapes, minShapes) {
                for (let i = 0; i < counter; i++) {
                    if (this.allRects.length < maxShapes) {
                        this.allRects.push(new Rects(this.wid, this.len));
                    }
                    if (this.allRects.length > minShapes) {
                        this.allRects.pop(new Rects(this.wid, this.len));
                    }
                }
                console.log(this.allRects.length);


            }




        } // end class RectsGroup()

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




    }

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
} // end Sketch