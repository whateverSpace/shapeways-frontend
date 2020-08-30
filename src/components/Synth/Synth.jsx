import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as mm from '@magenta/music';
import * as Tone from 'tone';
import styles from './Synth.css';
import makeNotesFromSegmentData from '../../utils/buildNoteSequence';
export default function Synth({ distForSynth, segForSynth, segHitState }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [segChange, setSegChange] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const [segHitsChange, setSegHitsChange] = useState([
    0,
    0,
    0,
    0,
    0,
    0,
  ]);
  const synth = useRef(null);
  const synth2 = useRef(null);
  const melodyRNN = useRef(null);
  const melodyVAE = useRef(null);
  const melodyPart = useRef(null);
  const melodyCore = useRef(null);
  const newPart = useRef(null);


  // if (distForSynth.current) Tone.Transport.bpm.value = distForSynth.current;
  if (distForSynth.current) Tone.Transport.bpm.value = 120;
  segHitState.forEach((segment, i) => {
    if (segment !== segHitsChange[i]) setSegHitsChange(segHitState);
  });
  // console.log(segHitState);

  useEffect(() => {
    synth.current = new Tone.PolySynth().toDestination();
    synth2.current = new Tone.PolySynth({
      oscillator: {
        type: 'sawtooth'
      },
      envelope: {
        attack: 0.1
      }
    }).toDestination();
    melodyRNN.current = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn');
    let melodyRnnLoaded = melodyRNN.current.initialize();


    melodyVAE.current = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords');
    let melodyVAELoaded = melodyVAE.current.initialize();
    // TRY DIFFERENT CHECKPOINTS
    makeNotesFromSegmentData(segHitsChange);
    rnnStart(melodyRnnLoaded, segHitsChange);
    generateMelodies(melodyVAELoaded, segHitsChange);
  }, []);

  useEffect(() => {

    if (melodyRNN.current.initialized) rnnStart(); // NEW MELODY BASED ON SEGMENTS
  }, [segChange]);

  const rnnStart = async (melodyRnnLoaded) => {
    if (melodyRnnLoaded) await melodyRnnLoaded;
    if (melodyPart.current) {
      melodyPart.current.clear();
    }
    let noteList = makeNotesFromSegmentData(segHitsChange);

    let seed = noteList;
    let steps = 16;
    let temperature = 1.1; // RANDOMNESS OF NOTES
    // let chordProgression = ['C', 'Am', 'G'];
    let result = await melodyRNN.current.continueSequence(
      seed,
      steps,
      temperature
    );
    // let result = await melodyRNN.current.continueSequence(seed, steps, temperature, chordProgress); // WORKS FOR chord_pitches_improv CHECKPOINT

    const melodyTest = result.notes.map((note) => {
      return [
        Tone.Time(note.quantizedStartStep / 4).toBarsBeatsSixteenths(),
        {
          note: Tone.Frequency(note.pitch, 'midi').toNote(),
          duration: Tone.Time(
            (note.quantizedEndStep - note.quantizedStartStep) / 4
          ).toNotation(),
        },
      ];
    });

    console.log(melodyTest);

    if (melodyPart.current) {
      melodyPart.current.clear();
      melodyTest.forEach((event) => {
        melodyPart.current.add(event[0], event[1]);
      });
    } else {
      melodyPart.current = new Tone.Part((time, value) => {
        synth.current.triggerAttackRelease(value.note, value.duration, time);
      }, melodyTest).start();
      melodyPart.current.mute = false;
      melodyPart.current.loop = true;
      melodyPart.current.loopStart = 0;
      melodyPart.current.loopEnd = '2m';
    }
    console.log('melodyPart:');
    console.log(melodyPart.current);
  };

  const generateMelodies = async(melodyVAELoaded, segHitsChange) => {
    if (melodyVAELoaded) await melodyVAELoaded;
    let noteList = makeNotesFromSegmentData(segHitsChange);

    let input = noteList;

    let z = await melodyVAE.current.encode([input], {
      chordProgression: ['D'],
    });

    let one = await melodyVAE.current.decode(z, 1.0, {
      chordProgression: ['D'],
    });
    let two = await melodyVAE.current.decode(z, 1.0, {
      chordProgression: ['A'],
    });
    let three = await melodyVAE.current.decode(z, 1.0, {
      chordProgression: ['Bm'],
    });
    let four = await melodyVAE.current.decode(z, 1.0, {
      chordProgression: ['G'],
    });

    melodyCore.current = new mm.sequences.concatenate(
      one.concat(two).concat(three).concat(four)
    );

    let leadPattern = [];
    newPart.current = new Tone.Part((time, note) => {
      // console.log(time);
      synth2.current.triggerAttackRelease(note, '2n', time);
    }, leadPattern).start();
    newPart.current.loop = true;
    newPart.current.loopStart = 0;
    newPart.current.loopEnd = '2m';

    newPart.current.clear();
    for (let note of melodyCore.current.notes) {
      newPart.current.at(
        { '16n': note.quantizedStartStep },
        Tone.Frequency(note.pitch, 'midi').toNote()
      );
    }
    newPart.current._events.forEach(event => {
      console.log(event.value);
    });
  };

  const startMusic = async () => {
    if (isPlaying) return;
    await Tone.start();
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopMusic = () => {
    if (!isPlaying) return;
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  return (
    <>
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
    </>
  );
}

Synth.propTypes = {
  distForSynth: PropTypes.object,
  segForSynth: PropTypes.array,
  segHitState: PropTypes.array
};
