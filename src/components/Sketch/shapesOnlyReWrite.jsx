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

            p.rectMode(p.CENTER); // try not use this??

            shapeGroup = new ShapeGroup(5, 200, 5, 200, 20, 150);

        } // end p.setup()

        p.draw = () => {

            //p.background(255);

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
            //   choose the rate of the color cycle (in color units per frame)
            // (hue value(0-360), cyle / or don't, amount of color per frame
            shapeGroup.fillColorSingle(100, false, .1);

            // .strokeColorSingle lets you:
            //   choose a color for the stroke of all the shapes
            //   choose if the color will cycle through the spectrum or not
            //   choose the rate of the color cycle (in color units per frame)
            // (hue value (0-360), cyle / or don't, amount of color per frame
            shapeGroup.strokeColorSingle(300, true, .5);

            // .rotateEach will make each shape rotate around it's own center
            // p.millis() uses the computers clock for timing.. 
            // definitely good to divide it by something, 30 is kinda slow, 3 would be super fast
            //shapeGroup.rotateEach(p.millis() / 30);

            // FIX THIS ONE
            //shapeGroup.rotateGroup(p.millis() / 30);

            //  .addShapes() will add a shape to the total at this rate per frame
            //shapeGroup.addShapes(.01);

            // .removeShapes() will remove a shape from teh total at this rate per frame
            //shapeGroup.removeShapes(0.05);

            // .growY will make the rects grow in the y-direction
            // parameter is the rate of change per frame
            //shapeGroup.growY(1);

            // .growX will make the rects grow in the x-direction
            // parameter is the rate of change per frame
            //shapeGroup.growX(1);

            // .shrinkX will make the rects shrink in the x-direction
            // parameter is the rate of change per frame
            //shapeGroup.shrinkX(1);

            // .shrinkY will makethe rects shrink in the y-direction
            // parameter is the rate of change per frame
            shapeGroup.shrinkY(1);


            // .sizeGradient determines if the shapes will be all the same size
            // or an array from large to small
            //shapeGroup.sizeGradient(true);


            //  .onBeatGrow will make the shapes grow and shrink from one size to another
            // regularly over time
            shapeGroup.onBeatGrow(20, 100, 2);

            // .display() draws all of the shapes and their various modifications
            shapeGroup.display();

            // this ends the p.push() and p.pop() pair that surround all of the shapes
            p.pop();


            // console.log(p.frameCount);

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

                    if ((this.rotateEachTruth === true && this.rotateGroupTruth === true) ||
                        (this.rotateEachTruth === false && this.rotateGroupTruth === false)) { //(this.rotateEachTruth === true && this.rotateGroupTruth === false)
                        p.translate(i * this.spreadAmountX, i * this.spreadAmountY);
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
            rotateEach(degressPerFrame) {
                this.rotateEachTruth = true;
                this.rotateEachRate = p.radians(degressPerFrame);
            }

            // the shapes will rotate as a group on the z-axis
            rotateGroup(degreesPerFrame) {
                this.rotateGroupTruth = true;
                this.rotateGroupRate = p.radians(degreesPerFrame);
            }

            // adds a shape to the group every so often
            addShapes(ratePerFrame) {
                if (this.numberOfShapes < this.numberMax) {
                    this.numberOfShapes += ratePerFrame;
                }
            }

            // removes a shape from the group every so often
            removeShapes(rate) {
                if (this.numberOfShapes > this.numberMin) {
                    this.numberOfShapes -= rate;
                }
            }

            // grows the shape on the x-axis
            growX(rate) {
                if (this.wid < this.sizeMax) {
                    this.wid += rate;
                }
            }

            // grows the shape on the y-axis
            growY(rate) {
                if (this.len < this.sizeMax) {
                    this.len += rate;
                }
            }

            // shrinks the shape on the x-axis
            shrinkX(rate) {
                if (this.wid > this.sizeMin) {
                    this.wid -= rate;
                }
            }

            // shrinksthe shape on the y-axis
            shrinkY(rate) {
                if (this.len > this.sizeMin) {
                    this.len -= rate;
                }
            }

            //  makes the shapes different sizes
            sizeGradient(truth) {
                this.sizeGradientTruth = truth;
                this.sizeGradientAmount = this.wid / this.numberOfShapes;
            }

            // makes the fill color of the shapes what you desire
            // also can cylce through the spectrum at a desired rate of units per frame
            fillColorSingle(hue, cycle, rate) {
                this.fillColorSingleTruth = true;
                if (cycle === false) {
                    this.fillColorHue = hue;
                }
                // find a way to set hue color as initial color, otherwise always starts red
                if (cycle === true) {
                    //this.fillColorHue += rate+hue;
                    this.fillColorHue += rate;
                    if (this.fillColorHue > 360) {
                        this.fillColorHue = 0;
                    }
                }
            }

            // makesthe stroke color of the shapes what you desire
            // also can cycle through the spectrum at a desired rate of unites per fram
            strokeColorSingle(hue, cycle, rate) {
                this.strokeColorSingleTruth = true;
                if (cycle === false) {
                    this.strokeColorHue = hue;
                }
                // find a way to set hue color as initial color, otherwise always starts red
                if (cycle === true) {
                    //this.fillColorHue += rate+hue;
                    this.strokeColorHue += rate;
                    if (this.strokeColorHue > 360) {
                        this.strokeColorHue = 0;
                    }
                }
            }

            // modifies the size of the shapes depending on !!!!!!!!!!!!!!!!
            onBeatGrow(modifierAmount, timing, ratio) {
                this.onBeatGrowTruth = true;
                if (p.frameCount % timing < timing / ratio) {
                    this.onBeatGrowModifier = modifierAmount;
                } else {
                    this.onBeatGrowModifier = 0;
                }
                //console.log(this.onBeatGrowModifier);
                //console.log(modifierAmount);
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