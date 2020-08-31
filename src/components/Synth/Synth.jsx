import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as mm from '@magenta/music';
import * as Tone from 'tone';
import styles from './Synth.css';
import { makeNotesFromSegmentData } from '../../utils/buildNoteSequence';
export default function Synth({ distForSynth, segHitState }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const [segHitsChange, setSegHitsChange] = useState([0, 0, 0, 0, 0, 0]);
  const synth = useRef(null);
  const synth2 = useRef(null);
  const melodyRNN = useRef(null);
  const melodyVAE = useRef(null);
  const melodyPart = useRef(null);
  const melodyCore = useRef(null);
  const newPart = useRef(null);

  if(distForSynth.current) Tone.Transport.bpm.value = 120;
  segHitState.forEach((segment, i) => {
    if(segment !== segHitsChange[i]) setSegHitsChange(segHitState);
  });

  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    synth2.current = new Tone.PolySynth(Tone.FMSynth).toDestination();
    melodyRNN.current = new mm.MusicRNN(
      'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn'
    );
    let melodyRnnLoaded = melodyRNN.current.initialize();

    melodyVAE.current = new mm.MusicVAE(
      'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords'
    );
    let melodyVAELoaded = melodyVAE.current.initialize();

    rnnStart(melodyRnnLoaded, segHitsChange);
    generateMelodies(melodyVAELoaded, segHitsChange);
  }, []);

  useEffect(() => {
    if(melodyRNN.current.initialized) rnnStart(null, segHitsChange); // NEW MELODY BASED ON SEGMENTS
    if(melodyVAE.current.initialized) generateMelodies(null, segHitsChange); // NEW MELODY BASED ON SEGMENTS
  }, [segHitsChange]);

  const rnnStart = async (melodyRnnLoaded, segHitsChange) => {
    if(melodyRnnLoaded) await melodyRnnLoaded;
    if(melodyPart.current) {
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

    if(melodyPart.current) {
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

    melodyPart.current._events.forEach((event) => {
      console.log(event.value);
    });
  };

  const generateMelodies = async (melodyVAELoaded, segHitsChange) => {
    if(melodyVAELoaded) await melodyVAELoaded;
    if(newPart.current) {
      newPart.current.clear();
    }
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

    const newPattern = melodyCore.current.notes.map((note) => {
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

    if(newPart.current) {
      newPart.current.clear();
      newPattern.forEach((event) => {
        newPart.current.add(event[0], event[1]);
      });
    } else {
      newPart.current = new Tone.Part((time, value) => {
        synth2.current.triggerAttackRelease(value.note, value.duration, time);
      }, newPattern).start();
      newPart.current.loop = true;
      newPart.current.loopStart = 0;
      newPart.current.loopEnd = '2m';
    }

    newPart.current._events.forEach((event) => {
      console.log(event.value);
    });
  };

  const startMusic = async () => {
    if(isPlaying) return;
    await Tone.start();
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopMusic = () => {
    if(!isPlaying) return;
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  return (
    <>
      <div className={styles.controls}>
        <button onClick={() => startMusic()}>Start</button>
        <button onClick={() => stopMusic()}>Stop</button>
        <button
          onClick={() => {
            rnnStart(null, segHitsChange);
            generateMelodies(null, segHitsChange);
          }}
        >
          Change Melody
        </button>
      </div>

    </>
  );
}

Synth.propTypes = {
  distForSynth: PropTypes.object,
  segForSynth: PropTypes.array,
  segHitState: PropTypes.array,
};
