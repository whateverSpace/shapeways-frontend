const {
  makeNotesFromSegmentData
} = require('./buildNoteSequence');

describe('tests for makeNotesFromSegmentData function', () => {
  it('should return no notes for 0 hits', () => {
    const hits = [0, 0, 0, 0, 0, 0];
    expect(makeNotesFromSegmentData(hits)).toEqual({ 'notes': [], 'quantizationInfo': { 'stepsPerQuarter': 4 }, 'totalQuantizedSteps': 0 });
  });

  it('should return a note for 1 hits', () => {
    const hits = [0, 1, 0, 0, 0, 0];
    expect(makeNotesFromSegmentData(hits)).toEqual({
      'notes': [{
        'pitch': 64,
        'quantizedEndStep': 1,
        'quantizedStartStep': 0,
      }],
      'quantizationInfo': { 'stepsPerQuarter': 4 }, 'totalQuantizedSteps': 1
    });
  });
  it('should return a double-duration note for 2 hits in one segment', () => {
    const hits = [0, 2, 0, 0, 0, 0];
    expect(makeNotesFromSegmentData(hits)).toEqual({
      'notes': [{
        'pitch': 64,
        'quantizedEndStep': 2,
        'quantizedStartStep': 0,
      }],
      'quantizationInfo': { 'stepsPerQuarter': 4 }, 'totalQuantizedSteps': 2
    });
  });
});
