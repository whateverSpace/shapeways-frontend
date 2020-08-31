import * as Tone from 'tone';
import scales from './scaleMap.js';
export const makeNotesFromSegmentData = (hits) => {
  let delayProb = 0;
  let step = 0;
  let notes = [];
  hits.forEach((segment, i) => {
    let segmentNoteMap = scales.Cm;
    // let segmentNoteMap = ['G4', 'G#4', 'F#4', 'C4', 'D#4', 'F4'];
    if(segment > 0) {
      let dur = segment;
      notes.push({
        pitch: Tone.Frequency(segmentNoteMap[i]).toMidi(),
        quantizedStartStep: step,
        quantizedEndStep: step + dur
      });
      step += dur;
    }
  });

  return {
    totalQuantizedSteps: step,
    quantizationInfo: {
      stepsPerQuarter: 4
    },
    notes
  };
};

export const makeVAENotesFromSegmentData = (hits) => {
  let delayProb = 0;
  let step = 0;
  let notes = [];
  hits.forEach((segment, i) => {
    let segmentNoteMap = scales.Cm;
    // let segmentNoteMap = ['G4', 'G#4', 'F#4', 'C4', 'D#4', 'F4'];
    if(segment > 0) {
      let dur = 2;
      notes.push({
        pitch: Tone.Frequency(segmentNoteMap[i]).toMidi(),
        quantizedStartStep: step,
        quantizedEndStep: step + dur * 2
      });
      step += dur;
    }

  });
  hits.forEach((segment, i) => {
    let segmentNoteMap = scales.Cm;
    // let segmentNoteMap = ['G4', 'G#4', 'F#4', 'C4', 'D#4', 'F4'];
    if(segment > 0) {
      let dur = 2;
      notes.push({
        pitch: Tone.Frequency(segmentNoteMap[i]).toMidi(),
        quantizedStartStep: step,
        quantizedEndStep: step + dur * 2
      });
      step += dur;
    }
  });
  return {
    totalQuantizedSteps: 32,
    quantizationInfo: {
      stepsPerQuarter: 4
    },
    notes
  };
};

export const makeChordsFromHits = (hits) => {
  let segmentNoteMap = scales.Cm;
  // let segmentNoteMap = ['G4', 'G#4', 'F#4', 'C4', 'D#4', 'F4'];
  let dur = 4;
  let step = 0;
  let notes = [];
  hits.forEach((segment, i) => {
    let segmentNoteMap = scales.Cm;
    // let segmentNoteMap = ['G4', 'G#4', 'F#4', 'C4', 'D#4', 'F4'];
    if(segment > 0) {

      notes.push({
        pitch: Tone.Frequency(segmentNoteMap[i]).toMidi(),
        quantizedStartStep: step,
        quantizedEndStep: step + dur
      });
    }
    step += dur;
  });
  return {
    totalQuantizedSteps: 32,
    quantizationInfo: {
      stepsPerQuarter: 4
    },
    notes
  };
};
