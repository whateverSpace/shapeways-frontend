import * as Tone from 'tone';
export const makeNotesFromSegmentData = (hits) => {
  let delayProb = 0;
  let step = 0;
  let notes = [];
  hits.forEach((segment, i) => {
    let segmentNoteMap = ['C4', 'F4', 'G#4', 'C5', 'F5', 'G#5'];
    // let segmentNoteMap = ['G4', 'G#4', 'F#4', 'C4', 'D#4', 'F4'];
    if(segment > 0) {
      let dur = segment + (Math.random() < delayProb ? 1 : 0);
      notes.push({
        pitch: Tone.Frequency(segmentNoteMap[i]).toMidi(),
        quantizedStartStep: step,
        quantizedEndStep: step + dur
      });
      step += dur;
    }
  });
  return {
    totalQuantizedSteps: 3,
    quantizationInfo: {
      stepsPerQuarter: 1
    },
    notes
  };
};
