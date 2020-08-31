import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as mm from '@magenta/music';
import * as Tone from 'tone';
import styles from './Synth.css';
import { makeNotesFromSegmentData, makeVAENotesFromSegmentData } from '../../utils/buildNoteSequence';
export default function Synth({ distForSynth, segHitState, distance }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const [segHitsChange, setSegHitsChange] = useState([0, 0, 0, 0, 0, 0]);
  const [distanceChange, setDistanceChange] = useState({ x: 0, y:0, wrists:0 });
  const synth = useRef(null);
  const synth2 = useRef(null);
  const eCello = useRef(null);
  const bass = useRef(null);
  const windy = useRef(null);
  const melodyRNN = useRef(null);
  const melodyVAE = useRef(null);
  const melodyRNNPart = useRef(null);
  const melodyCore = useRef(null);
  const newVAEPart = useRef(null);

  if(distForSynth.current) Tone.Transport.bpm.value = 100;
  segHitState.forEach((segment, i) => {
    if(segment !== segHitsChange[i]) setSegHitsChange(segHitState);
  });

  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth);
    synth2.current = new Tone.PolySynth(Tone.FMSynth);
    //
    // synth.current = new Tone.AMSynth({
    //   'harmonicity': 2,
    //   'oscillator': {
    //     'type': 'amsine2',
    //     'modulationType' : 'sine',
    //     'harmonicity': 1.01
    //   },
    //   'envelope': {
    //     'attack': 0.006,
    //     'decay': 4,
    //     'sustain': 0.04,
    //     'release': 1.2
    //   },
    //   'modulation' : {
    //     'volume' : 13,
    //     'type': 'amsine2',
    //     'modulationType' : 'sine',
    //     'harmonicity': 12
    //   },
    //   'modulationEnvelope' : {
    //     'attack': 0.006,
    //     'decay': 0.2,
    //     'sustain': 0.2,
    //     'release': 0.4
    //   }
    // });
    // let synth2Voice = new Tone.Synth();
    // synth2.current = new Tone.PolySynth({
    //   'portamento': 0.01,
    //   'oscillator': {
    //     'type': 'sawtooth'
    //   },
    //   'filter': {
    //     'Q': 2,
    //     'type': 'lowpass',
    //     'rolloff': -24
    //   },
    //   'envelope': {
    //     'attack': 0.1,
    //     'decay': 0.1,
    //     'sustain': 0.6,
    //     'release': 0.5
    //   },
    //   'filterEnvelope': {
    //     'attack': 0.05,
    //     'decay': 0.8,
    //     'sustain': 0.4,
    //     'release': 1.5,
    //     'baseFrequency': 2000,
    //     'octaves': 1.5
    //   }
    // });

    eCello.current = new Tone.FMSynth({
      'harmonicity': 3.01,
      'modulationIndex': 14,
      'oscillator': {
        'type': 'triangle'
      },
      'envelope': {
        'attack': 0.2,
        'decay': 0.3,
        'sustain': 0.1,
        'release': 1.2
      },
      'modulation' : {
        'type': 'square'
      },
      'modulationEnvelope' : {
        'attack': 0.01,
        'decay': 0.5,
        'sustain': 0.2,
        'release': 0.1
      }
    }).toDestination();

    bass.current = new Tone.Synth({
      'oscillator': {
        'type': 'sine'
      },
      'envelope': {
        'attack': 0.001,
        'decay': 0.1,
        'sustain': 0.1,
        'release': 1.2
      }
    });

    windy.current = new Tone.Synth({
      'oscillator': {
        'type': 'square'
      },
      'filter': {
        'Q': 2,
        'type': 'lowpass',
        'rolloff': -12
      },
      'envelope': {
        'attack': 0.005,
        'decay': 3,
        'sustain': 0,
        'release': 0.45
      },
      'filterEnvelope': {
        'attack': 0.001,
        'decay': 0.32,
        'sustain': 0.9,
        'release': 3,
        'baseFrequency': 700,
        'octaves': 2.3
      }

    });




    const vol = new Tone.Volume(0).toDestination();
    const vol2 = new Tone.Volume(-30).toDestination();
    const feedbackDelay = new Tone.FeedbackDelay(0.125, 0.5);
    const filter = new Tone.Filter(600, 'highpass');
    const pingPong = new Tone.PingPongDelay('16n', 0.3);



    synth.current.connect(pingPong);
    pingPong.connect(vol);


    synth2.current.connect(vol2);
    filter.connect(vol2);

    melodyRNN.current = new mm.MusicRNN(
      'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn'
    );
    let melodyRNNLoaded = melodyRNN.current.initialize();

    melodyVAE.current = new mm.MusicVAE(
      'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords'
    );
    let melodyVAELoaded = melodyVAE.current.initialize();

    rnnMelodyStart(melodyRNNLoaded, segHitsChange);
    vaeStart(melodyVAELoaded, segHitsChange);
  }, []);

  useEffect(() => {
    if(melodyRNN.current.initialized) rnnMelodyStart(null, segHitsChange); // NEW MELODY BASED ON SEGMENTS
    if(melodyVAE.current.initialized) vaeStart(null, segHitsChange); // NEW MELODY BASED ON SEGMENTS
  }, [segHitsChange]);

  const rnnMelodyStart = async (melodyRNNLoaded, segHitsChange) => {
    if(melodyRNNLoaded) await melodyRNNLoaded;
    if(melodyRNNPart.current) {
      melodyRNNPart.current.clear();
    }
    let noteList = makeNotesFromSegmentData(segHitsChange);

    let seed = noteList;
    let steps = 32;
    let temperature = 1.0; // RANDOMNESS OF NOTES
    // let chordProgression = ['C', 'Am', 'G'];
    let result = await melodyRNN.current.continueSequence(
      seed,
      steps,
      temperature
    );
    const melodyRNNTest = result.notes.map((note) => {
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

    if(melodyRNNPart.current) {
      melodyRNNPart.current.clear();
      melodyRNNTest.forEach((event) => {
        melodyRNNPart.current.add(event[0], event[1]);
      });
    } else {
      melodyRNNPart.current = new Tone.Part((time, value) => {
        synth.current.triggerAttackRelease(value.note, value.duration, time);
      }, melodyRNNTest).start();
      melodyRNNPart.current.mute = false;
      melodyRNNPart.current.loop = true;
      melodyRNNPart.current.loopStart = 0;
      melodyRNNPart.current.loopEnd = '2m';
    }

    melodyRNNPart.current._events.forEach((event) => {
      console.log(event.value);
    });
  };

  const vaeStart = async (melodyVAELoaded, segHitsChange) => {
    if(melodyVAELoaded) await melodyVAELoaded;
    if(newVAEPart.current) {
      newVAEPart.current.clear();
    }
    let noteList = makeVAENotesFromSegmentData(segHitsChange);
    let input = noteList;

    let z = await melodyVAE.current.encode([input], {
      chordProgression: ['C'],
    });

    let one = await melodyVAE.current.decode(z, 1.0, {
      chordProgression: ['C'],
    });
    let two = await melodyVAE.current.decode(z, 1.0, {
      chordProgression: ['E'],
    });
    let three = await melodyVAE.current.decode(z, 1.0, {
      chordProgression: ['G'],
    });
    let four = await melodyVAE.current.decode(z, 1.0, {
      chordProgression: ['C'],
    });

    melodyCore.current = new mm.sequences.concatenate(
      one.concat(two).concat(three).concat(four)
    );

    const newPattern = melodyCore.current.notes.map((note) => {
      return [
        Tone.Time(note.quantizedStartStep / 8).toBarsBeatsSixteenths(),
        {
          note: Tone.Frequency(note.pitch, 'midi').toNote(),
          duration: Tone.Time(
            (note.quantizedEndStep - note.quantizedStartStep) / 8
          ).toNotation(),
        },
      ];
    });

    if(newVAEPart.current) {
      newVAEPart.current.clear();
      newPattern.forEach((event) => {
        newVAEPart.current.add(event[0], event[1]);
      });
    } else {
      newVAEPart.current = new Tone.Part((time, value) => {
        synth2.current.triggerAttackRelease(value.note, value.duration, time);
      }, newPattern).start();
      newVAEPart.current.loop = true;
      newVAEPart.current.loopStart = 0;
      newVAEPart.current.loopEnd = '4m';
    }

    newVAEPart.current._events.forEach((event) => {
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
      </div>
      <div className={styles.controls}>
        x:{distance.x} y:{distance.y} wrists:{distance.wrists}
      </div>
    </>
  );
}

Synth.propTypes = {
  distForSynth: PropTypes.object,
  segHitState: PropTypes.array.isRequired,
  distance: PropTypes.object
};
