export const buildNoteSequence = (seed) => {
  let step = 0;
  let delayProb = 0.3;
  let notes = seed.map(n => {
    let dur = 1 + (Math.random() < delayProb ? 1 : 0);
    let note = {
      pitch: n.note,
      quantizedStartStep: step,
      quantizedEndStep: step + dur
    };
    step += dur;
    return note;
  });
  return {
    totalQuantizedSteps: _.last(notes).quantizedEndStep,
    quantizationInfo: {
      stepsPerQuarter: 1
    },
    notes
  };
};
