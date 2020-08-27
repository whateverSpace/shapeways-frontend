import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as mm from '@magenta/music';
import * as Tone from 'tone';

export default function Synth({ distForSynth, segForSynth }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [segChange, setSegChange] = useState([false, false, false, false, false, false]);
  const synth = useRef(null);
  const melodyRNN = useRef(null);
  const melodyVAE = useRef(null);
  const melodyPart = useRef(null);

  if (distForSynth.current) Tone.Transport.bpm.value = distForSynth.current;
  segForSynth.forEach((segment, i) => {
    if (segment !== segChange[i]) setSegChange(segForSynth);
  });

  useEffect(() => {
    synth.current = new Tone.PolySynth().toDestination();
    melodyRNN.current = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn');
    let melodyRnnLoaded = melodyRNN.current.initialize();

    melodyVAE.current = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords');
    let melodyVAELoaded = melodyVAE.current.initialize();
    // TRY DIFFERENT CHECKPOINTS

    rnnStart(melodyRnnLoaded);
  }, []);

  useEffect(() => {
    // if (melodyRNN.current.initialized) rnnStart(); // NEW MELODY BASED ON SEGMENTS
  }, [segChange]);

  const rnnStart = async(melodyRnnLoaded) => {
    if (melodyRnnLoaded) await melodyRnnLoaded;
    if (melodyPart.current) {
      melodyPart.current.clear();
    }

    let seed = {
      notes: [
        { pitch: Tone.Frequency('C4').toMidi(), quantizedStartStep: 0, quantizedEndStep: 4 },
        { pitch: Tone.Frequency('E4').toMidi(), quantizedStartStep: 5, quantizedEndStep: 8 },
        { pitch: Tone.Frequency('G4').toMidi(), quantizedStartStep: 9, quantizedEndStep: 12 }
      ],
      totalQuantizedSteps: 4,
      quantizationInfo: { stepsPerQuarter: 4 }
    };
    let steps = 16;
    let temperature = 0.7; // RANDOMNESS OF NOTES
    // let chordProgression = ['C', 'Am', 'G'];
    let result = await melodyRNN.current.continueSequence(seed, steps, temperature);
    // let result = await melodyRNN.current.continueSequence(seed, steps, temperature, chordProgress); // WORKS FOR chord_pitches_improv CHECKPOINT

    const melodyTest = result.notes.map(note => {
      return [Tone.Time(note.quantizedStartStep / 4).toBarsBeatsSixteenths(), { note: Tone.Frequency(note.pitch, 'midi').toNote(), duration: Tone.Time(((note.quantizedEndStep - note.quantizedStartStep) / 4)).toNotation() }];
    });

    console.log(melodyTest);

    if (melodyPart.current) {
      melodyPart.current.clear();
      melodyTest.forEach(event => {
        console.log(event);
        melodyPart.current.add(event[0], event[1]);
      });
    }
    else {
      melodyPart.current = new Tone.Part((time, value) => {
        synth.current.triggerAttackRelease(value.note, value.duration, time);
      }, melodyTest).start();
      melodyPart.current.mute = false;
      melodyPart.current.loop = true;
      melodyPart.current.loopStart = 0;
      melodyPart.current.loopEnd = '2m';
    }
    console.log(melodyPart.current);


  };




  const generateMelodies = async() => {
    let input = {
      notes: [],
      totalQuantizedSteps: 32,
      quantizationInfo: { stepsPerQuarter: 4 }
    };
    let pattern = sequencer.matrix.pattern;
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col]) {
          input.notes.push({
            quantizedStartStep: col,
            quantizedEndStep: col + 2,
            pitch: Tone.Frequency(sequencerRows[row]).toMidi()
          });
        }
      }
    }
    console.log(input);

    let z = await melodyVAE.current.encode([input], { chordProgression: ['C#m7'] });

    let one = await melodyVAE.current.decode(z, 1.0, { chordProgression: ['C#m7'] });
    let two = await melodyVAE.current.decode(z, 1.0, { chordProgression: ['F#m'] });
    let three = await melodyVAE.current.decode(z, 1.0, { chordProgression: ['A'] });
    let four = await melodyVAE.current.decode(z, 1.0, { chordProgression: ['C#m7'] });

    let all = mm.core.sequences.concatenate(
      one
        .concat(two)
        .concat(three)
        .concat(four)
    );

    melodyVAE.current.clear();
    for (let note of all.notes) {
      melodyVAE.current.at(
        { '16n': note.quantizedStartStep },
        Tone.Frequency(note.pitch, 'midi').toNote()
      );
    }
    console.log(one, two, three, four);
  };

  const startMusic = async () => {
    if (isPlaying) return;
    await Tone.start();
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopMusic = () => {
    if (!isPlaying) return;
    console.log('stopping');
    Tone.Transport.stop();
    setIsPlaying(false);
  };


  return (
    <div className={styles.controls}>
    <button onClick={() => startMusic()}>Start</button>
    <button onClick={() => stopMusic()}>Stop</button>
    <button onClick={() => rnnStart()}>Change Melody</button>
  </div>

  <div className={styles.controls}>
    <div>distance:{`${distForSynth.current}`}</div>
  </div>
  <div className={styles.controls}>
    <div>segments:{`${segForSynth}`}</div>
  </div>
  );
}

Synth.propTypes = {
  distForSynth: PropTypes.object,
  segForSynth: PropTypes.array
};
