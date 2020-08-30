import * as Tone from 'tone';
export const makeNotesFromSegmentData = (hits) => {
  let delayProb = 0;
  let step = 0;
  let notes = [];
  hits.forEach((segment, i) => {
    let segmentNoteMap = ['A4', 'D4', 'F#4', 'A3', 'D3', 'F#3'];
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
