# shapeways

[Shapeways](https://shapeways.netlify.app/) is many things. A gesture-based music generator and art generator. An interactive graffiti wall that explores new ideas and technologies in music and user interface. Audiovisual compositions made possible by machine learning. Interactive installation art for the home. Exploration of new forms of expression and interaction. Shapeways is many things, but perhaps the best summary would be a multimedia sandbox at the bleeding edge of art and technology.

## Controls

Once the models have loaded, press space to start the musical accompaniment.
Press space to toggle between playing and paused music. Everything else can be controlled without touching your computer, using your webcam.

You will see green dots onscreen where Shapeways thinks your wrists are, and other dots representing your eye and nose location. Shapeways divides what the camera sees into six segments in a three by two grid. This grid, and the location of your wrists and nose within it, can be used to influence the neural net generated melodies played by the two instruments, as well as several visual aspects of the experience.

- Use your wrists in different segments to trigger sounds and move shapes.
- Bring them together, spread them apart, leave them in the middle, experiment!
- The background color that slowly fills in segments is changed by the segment your nose is in.
- For best results, stand 3-6 feet from webcam in a well-lit room.

## How it works
Shapeways uses ml5's PoseNet machine learning model to track your wrists and heads, and maps them to one of the six segments of the screen. Various calculations are made and passed to both the visual and musical components. On the musical side, "performance seeds" are generated. These seeds are made up of notes whose pitch and durations are defined by calculations relating to your wrist and head location relative to those six segments of the screen.

Those musical performance seeds are then sent in API calls to Magenta.js MusicVAE and MusicRNN checkpoints. The Magenta API responds with several bars of musical performance data inspired by the seeds. These responses are used to create unpredictable but musically related short melodic loops, which are played over two different Tone synths, routed through Tone.js filters and finally to the audio output. These short loops are played until the camera detects a head or hand in a different segment of the screen. In that case, a new seed is crafted with the new values, and new melody and counterpart are created.

On the visual side, P5.js is used to dynamically control the rendering and manipulation of glowing 3d boxes that leave ghost trail artifacts behind as they move and change. Various motions with your wrists cause the boxes to rotate, change color, spawn and destroy copies, change dimensions, and more. Your nose's location changes the color of the background that slowly fills parts of the screen.

The end result is a melodic audiovisual experience that responds to your movements and gestures with melodic and visual strokes inspired by your changes.

## How we built it
We built our app using React components to isolate concerns, efficiently handle state management and respond to changes in tracking. We used ml5 PoseNet to track pose information, and MagentaJS for generating music using machine learning.

## Challenges we ran into
Above all else, I would say one of the biggest challenges was figuring out how to do everything we wanted using only the camera tracking data for input. It took a lot of calculation, creative coding and experimentation to dynamically generate music seeds that produced the quality of generated music we were looking for. Once we were happy with the generated music, figuring out how to create the right amount of variety and repetition based on your movements or lack thereof was quite challenging, or at least it took a lot of trial and error.

## Accomplishments that we're proud of
We had an ambitious and fairly abstract vision for the project, but we did a great job of communicating and collaborating to ensure a smooth chain from camera input to audiovisual output. Getting all of the cutting-edge technologies to play nicely together took no small amount of work.

## What we learned
We learned a lot about machine learning, music theory, React, ml5, Magenta.js, finding creative ways to translate data into synaesthetic experiences, and creative engineering of fluid, interactive, and semi-intelligent dynamically generated art.

## What's next for shapeways
We have many plans. We already set up functions to change keys and melodies, but didn't implement gestures to trigger those changes. We're also planning to add sensor-influenced and constantly changing low end drone noises to the sonic experience. And we'd like to have the effects chain parameters change as tracking data changes, not just the synths themselves.
