/* eslint-disable new-cap */
import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import * as mm from '@magenta/music';
import * as Tone from 'tone';

import {
  makeNotesFromSegmentData,
  makeVAENotesFromSegmentData,
} from '../../utils/buildNoteSequence';


export default function Synth({
  isPlaying,
  distForSynth,
  segHitState
}) {
  const [segHitsChange, setSegHitsChange] = useState([0, 0, 0, 0, 0, 0]);

  const synth = useRef(null);
  const synth2 = useRef(null);
  const melodyRNN = useRef(null);
  const melodyVAE = useRef(null);
  const melodyRNNPart = useRef(null);
  const melodyCore = useRef(null);
  const newVAEPart = useRef(null);


  if (distForSynth.current) Tone.Transport.bpm.value = 100;
  segHitState.forEach((segment, i) => {
    if (segment !== segHitsChange[i]) setSegHitsChange(segHitState);
  });

  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth);
    synth2.current = new Tone.PolySynth(Tone.FMSynth);

    const filter = new Tone.Filter(600, 'highpass');
    const pingPong = new Tone.PingPongDelay('16n', 0.3);
    const reverb1 = new Tone.Reverb();
    const reverb2 = new Tone.Reverb();
    const vol = new Tone.Volume(0).toDestination();
    const vol2 = new Tone.Volume(0).toDestination();

    synth.current.connect(pingPong);
    pingPong.connect(reverb1);
    reverb1.connect(vol);

    synth2.current.connect(filter);
    filter.connect(reverb2);
    reverb2.connect(vol2);

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
    if (!isPlaying) {
      startMusic();
    }
    else {
      stopMusic();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (melodyRNN.current.initialized) rnnMelodyStart(null, segHitsChange); // NEW MELODY BASED ON SEGMENTS
    if (melodyVAE.current.initialized) vaeStart(null, segHitsChange); // NEW MELODY BASED ON SEGMENTS
  }, [segHitsChange]);

  const rnnMelodyStart = async (melodyRNNLoaded, segHitsChange) => {
    if (melodyRNNLoaded) await melodyRNNLoaded;
    if (melodyRNNPart.current) {
      melodyRNNPart.current.clear();
    }
    let noteList = makeNotesFromSegmentData(segHitsChange);

    let seed = noteList;
    let steps = 32;
    let temperature = 1.0;
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

    if (melodyRNNPart.current) {
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
  };

  const vaeStart = async (melodyVAELoaded, segHitsChange) => {
    if (melodyVAELoaded) await melodyVAELoaded;
    if (newVAEPart.current) {
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

    if (newVAEPart.current) {
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

  };


  const startMusic = async () => {
    await Tone.start();
    Tone.Transport.start();
    console.log('music started');
    return true;
  };

  const stopMusic = () => {
    Tone.Transport.stop();
    console.log('music stopped');
    return false;
  };

  return (
    <>
    </>
  );
}

Synth.propTypes = {
  isPlaying: PropTypes.bool,
  distForSynth: PropTypes.object,
  segHitState: PropTypes.array.isRequired,
};
