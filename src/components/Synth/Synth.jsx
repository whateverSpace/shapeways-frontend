import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as mm from '@magenta/music';
import * as Tone from 'tone';

export default function Synth({ distForSynth }) {
  const [isPlaying, setIsPlaying] = useState(false);
  // const [melodyPatern, setMelodyPatern] = useState([]);
  const synth = useRef(null);
  const melodyRNN = useRef(null);
  const melodyPart = useRef(null);

  if (distForSynth.current) Tone.Transport.bpm.value = distForSynth.current;
  
  useEffect(() => {
    synth.current = new Tone.FMSynth().toDestination();
    melodyRNN.current = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv');
    let melodyRnnLoaded = melodyRNN.current.initialize();
    rnnStart(melodyRnnLoaded);
  }, []);

  const rnnStart = async(melodyRnnLoaded) => {
    if (melodyRnnLoaded) await melodyRnnLoaded;
    if (melodyPart.current) melodyPart.current.dispose();

    let seed = {
      notes: [
        { pitch: Tone.Frequency('C3').toMidi(), quantizedStartStep: 0, quantizedEndStep: 4 }
      ],
      totalQuantizedSteps: 4,
      quantizationInfo: { stepsPerQuarter: 4 }
    };
    let steps = 16;
    let temperature = 1.2;
    let chordProgression = ['C', 'Am', 'G'];
    let result = await melodyRNN.current.continueSequence(seed, steps, temperature, chordProgression);

    const melodyTest = result.notes.map(note => {
      return [Tone.Time(note.quantizedStartStep / 4).toBarsBeatsSixteenths(), { note: Tone.Frequency(note.pitch, 'midi').toNote(), durration: Tone.Time(((note.quantizedEndStep - note.quantizedStartStep) / 4)).toNotation() }];
    });

    melodyPart.current = new Tone.Part((time, value) => {
      synth.current.triggerAttackRelease(value.note, value.durration, time);
    }, melodyTest).start(); 
    melodyPart.current.mute = false;
    melodyPart.current.loop = true;
    melodyPart.current.loopStart = 0;
    melodyPart.current.loopEnd = '2m';
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
    <div>
      <button onClick={() => startMusic()}>Start</button>
      <button onClick={() => stopMusic()}>Stop</button>
      <button onClick={() => rnnStart()}>Change Melody</button>
    </div>
  );
}

Synth.propTypes = {
  distForSynth: PropTypes.object
};
