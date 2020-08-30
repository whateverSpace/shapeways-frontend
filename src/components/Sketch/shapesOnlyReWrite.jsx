import React, { Component } from 'react';

import p5 from 'p5';

//import ml5 from 'ml5';

import styles from './Sketch.css';

export default class Sketch extends Component {

    state = { loading: true };

    constructor(props) {

        super(props);

        this.myRef = React.createRef();

    } // end constructor(props)

    Sketch = (p) => {

        let shapeGroup;

        p.setup = () => {
            p.createCanvas(p.windowWidth / 2, p.windowHeight / 2);

            //p.noCursor();

            // (hue, saturation, brightness, alpha)
            // (0-360, 0-255, 0-255, 0-1)
            p.colorMode(p.HSB);

            // places the origin at the center of each rectangle instead of top left corner
            p.rectMode(p.CENTER);

            // initializes the group of shapes
            // (number of shapes, min number, max number, side length, min length,max length)
            shapeGroup = new ShapeGroup(5, 50, 5, 20, 20, 150);

        } // end p.setup()

        p.draw = () => {

            // can redraw background as black or white
            if (p.keyIsPressed === true && p.key === 'a') {
                p.background(0);
            }
            if (p.keyIsPressed === true && p.key === 's') {
                p.background(255);
            }

            // the following is where all of the different methods for the gropu of shapes
            // are called. there are descriptions of each method.
            // i have not added any controls from inputs like keys or whatever

            // surround the shape drawing with p.push() and p.pull()
            // this keeps things relative to the proper
            p.push();

            // this p.translate determines the position of the first shape
            // probably use the x and y coordinates for one of the wrists here?
            p.translate(p.mouseX, p.mouseY); // start point for the shapes

            // .spread() chooses the end point for the group of shapess
            // probably us the x and y coordinates for the other wrist here?
            shapeGroup.spread(p.mouseX - (p.width / 2), p.mouseY - (p.height / 2)); // end point for the shapes

            // .fillColorSingle lets you:
            //   choose a color for the fill of all the shapes
            //   choose if the color will cycle through the spectrum or not
            //   choose the rate of the cycle (i.e. 5ish=fast, 100ish=slow)
            // (hue value(0-360), cyle / or don't, rate)
            //if (p.keyIsPressed === true && p.key === 'q') {
                shapeGroup.fillColorSingle(100, true, 50);
            //}

            // .strokeColorSingle lets you:
            //   choose a color for the stroke of all the shapes
            //   choose if the color will cycle through the spectrum or not
            //   choose the rate of the cycle (i.e. 5ish=fast, 100ish=slow)
            // (hue value (0-360), cyle / or don't, rate)
            //if (p.keyIsPressed === true && p.key === 'w') {
                shapeGroup.strokeColorSingle(30, false, 5);
            //}

            // .rotateEach will make each shape rotate around it's own center
            // p.millis()) uses the computers clock for timing
            // /5 = faster, /100 =  slower
            if (p.keyIsPressed === true && p.key === 'e') {
                shapeGroup.rotateEach(p.millis() / 30);
            }

            // .rotateGroup() will makethe group of shapes rotate as one unit
            // p.millis()) uses the computers clock for timing
            // /5 = faster, /100 =  slower
            if (p.keyIsPressed === true && p.key === 'r') {
                shapeGroup.rotateGroup(p.millis() / 50);
            }

            //  .addShapes() will add a shape to the total every x milliseconds?
            if (p.keyIsPressed === true && p.key === 't') {
                shapeGroup.addShapes(2000);
            }

            // .removeShapes() will remove a shape from the total every x milliseconds?
            if (p.keyIsPressed === true && p.key === 'y') {
                shapeGroup.removeShapes(1000);
            }

            // .growY will make the rects grow in the y-direction
            // rate 5ish = fast, 100ish = slow
            if (p.keyIsPressed === true && p.key === 'u') {
                shapeGroup.growY(75);
            }

            // .growX will make the rects grow in the x-direction
            // rate 5ish = fast, 100ish = slow
            if (p.keyIsPressed === true && p.key === 'i') {
                shapeGroup.growX(75);
            }

            // .shrinkX will make the rects shrink in the x-direction
            // rate 5ish = fast, 100ish = slow
            if (p.keyIsPressed === true && p.key === 'o') {
                shapeGroup.shrinkX(75);
            }

            // .shrinkY will makethe rects shrink in the y-direction
            // rate 5ish = fast, 100ish = slow
            if (p.keyIsPressed === true && p.key === 'p') {
                shapeGroup.shrinkY(75);
            }


            // .sizeGradient determines if the shapes will be all the same size
            // or an array from large to small
            if (p.keyIsPressed === true && p.key === 'l') {
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

        } // end p.draw()

        // here is the entire class for ShapeGroup
        // the shape is currently a rectangle
        // but could be changed in the future
        class ShapeGroup {

            // constructor houses variables for object inputs, other details
            constructor(shapesNumber, shapesNumberMax, shapesNumberMin,
                shapeSize, shapeSizeMin, shapeSizeMax) {
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
                this.fillAlphaAmount = 1.;
                //this.fillSaturationAmount = 255;

                // for onBeatGrow
                this.onBeatGrowTruth = false;
                this.onBeatGrowModifier = 0;
                this.sizeGradientAmount = 0;

            } // end constructor

            // dipslays the group of shapes and their various modifications
            display() {
                for (let i = 0; i < this.numberOfShapes; i++) {
                    p.fill(this.fillColorHue, 255, 255, .3);
                    p.stroke(this.strokeColorHue, 255, 255, .6);

                    p.push();

                    if (this.rotateEachTruth === true && this.rotateGroupTruth === false) {
                        p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
                        p.rotate(this.rotateEachRate);
                        //p.rect(i*5,i*5,this.len, this.wid);
                        p.rect(0, 0,
                            this.wid + this.onBeatGrowModifier - (i * this.sizeGradientAmount),
                            this.len + this.onBeatGrowModifier - (i * this.sizeGradientAmount));
                    }

                    if (this.rotateGroupTruth === true && this.rotateEachTruth === false) {
                        p.rotate(this.rotateGroupRate); // rotates group together nicely-ish
                        p.rect((i * this.spreadAmountX), (i * this.spreadAmountY),
                            this.wid + this.onBeatGrowModifier - (i * this.sizeGradientAmount),
                            this.len + this.onBeatGrowModifier - (i * this.sizeGradientAmount));
                    }

                    if (this.rotateEachTruth === false && this.rotateGroupTruth === false) { //(this.rotateEachTruth === true && this.rotateGroupTruth === false)
                        p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
                        p.rect(0, 0,
                            this.wid + this.onBeatGrowModifier - (i * this.sizeGradientAmount),
                            this.len + this.onBeatGrowModifier - (i * this.sizeGradientAmount));
                    }
                    if (this.rotateEachTruth === true && this.rotateGroupTruth === true){
                        p.rotate(this.rotateGroupRate);
                        p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
                        p.rotate(this.rotateEachRate);
                        p.rect(0, 0,
                            this.wid + this.onBeatGrowModifier - (i * this.sizeGradientAmount),
                            this.len + this.onBeatGrowModifier - (i * this.sizeGradientAmount));
                    }
                    p.pop();
                } // end for loop

            } // end display()

            // takes end point of shape group and spreads the shapes out accordingly
            spread(endPointX, endPointY) {
                this.spreadAmountX = (endPointX) / this.numberOfShapes;
                this.spreadAmountY = (endPointY) / this.numberOfShapes;
            } // end spread()

            // each shape will rotate on it's own z-axis
            rotateEach(rate) {
                this.rotateEachTruth = true;
                this.rotateEachRate = p.radians((rate));
            }

            // the shapes will rotate as a group on the z-axis
            rotateGroup(rate) {
                this.rotateGroupTruth = true;
                this.rotateGroupRate = p.radians((rate));
            }

            // adds a shape to the group however often
            addShapes(rate) {
                if (this.numberOfShapes < this.numberMax) {
                    this.numberOfShapes += (p.deltaTime / rate);
                }
            }

            // removes a shape from the group every so often
            removeShapes(rate) {
                if (this.numberOfShapes > this.numberMin) {
                    this.numberOfShapes -= (p.deltaTime / rate);
                }
            }

            // grows the shape on the x-axis
            growX(rate) {
                if (this.wid < this.sizeMax) {
                    this.wid += (p.deltaTime / rate);
                }
            }

            // grows the shape on the y-axis
            growY(rate) {
                if (this.len < this.sizeMax) {
                    this.len += (p.deltaTime / rate);
                }
            }

            // shrinks the shape on the x-axis
            shrinkX(rate) {
                if (this.wid > this.sizeMin) {
                    this.wid -= (p.deltaTime / rate);
                }
            }

            // shrinksthe shape on the y-axis
            shrinkY(rate) {
                if (this.len > this.sizeMin) {
                    this.len -= (p.deltaTime / rate);
                }
            }

            //  makes the shapes different sizes
            sizeGradient(truth) {
                this.sizeGradientTruth = truth;
                if (this.sizeGradientTruth === true){
                    this.sizeGradientAmount = this.wid / this.numberOfShapes;

                }
                if (this.sizeGradientTruth === false){
                    this.sizeGradientAmount = 0;
                } 
                console.log(this.sizeGradientAmount);

            }

            // changes fill color of shapes
            // also can cycle through the spectrum 
            // rate = 10(faster cycle), 1000(slow cylce)
            fillColorSingle(hue, cycle, rate) {
                this.fillColorSingleTruth = true;
                if (cycle === false) {
                    this.fillColorHue = hue;
                }
                // find a way to set hue color as initial color, otherwise always starts red
                if (cycle === true) {
                    //this.fillColorHue += rate+hue;
                    this.fillColorHue += (p.deltaTime / rate);
                    if (this.fillColorHue > 360) {
                        this.fillColorHue = 0;
                    }
                }
            }

            // changes stroke color of the shapes
            // also can cycle through the spectrum 
            // rate = 10(faster cycle), 1000(slow cylce)
            strokeColorSingle(hue, cycle, rate) {
                this.strokeColorSingleTruth = true;
                if (cycle === false) {
                    this.strokeColorHue = hue;
                }
                // find a way to set hue color as initial color, otherwise always starts red
                if (cycle === true) {
                    //this.fillColorHue += rate+hue;
                    this.strokeColorHue += (p.deltaTime / rate);
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

            strokeColorSpectrum() {
                this.strokeColorSpectrumTruth = true;

            }

            fillColorSpectrum(rate) {
                this.fillColorSpectrumTruth = true;

            }


        } // end class shapeGroup

    } // end Sketch = (p)


    componentDidMount() {

        this.myP5 = new p5(this.Sketch, this.myRef.current);

    } // end componentDidMount()

    render() {

        return (

            <>

                {this.state.loading && <h1>loading models...</h1>}

                <div className={styles.Sketch} ref={this.myRef}></div>

            </>

        );

    } // end render()


} // end export default class Sketch