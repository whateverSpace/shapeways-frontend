const makeNotesFromSegmentData = (segForSynth) => {
  let delayProb = 0.4;
  let step = 0;
  let dur = 1 + (Math.random() < delayProb ? 1 : 0);
  let notes = segForSynth.map((segment, i) => {
    let segmentNoteMap = ['A4', 'D4', 'F#4', 'A3', 'D3', 'F#3'];
    while(segment) {
      let note = {
        pitch: Tone.Frequency(segmentNoteMap[i]).toMidi(),
        quantizedStartStep: step,
        quantizedEndStep: step + dur
      };
      step += dur;
      segment--;
      return note;
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

export default makeNotesFromSegmentData;
