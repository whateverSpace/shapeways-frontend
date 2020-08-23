import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as mm from '@magenta/music';
import * as Tone from 'tone';

export default function Synth({ distForSynth }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [melodyPatern, setMelodyPatern] = useState([]);
  const synth = useRef(null);
  const melodyRNN = useRef(null);
  const melodyPart = useRef(null);
  Tone.Transport.bpm.value = distForSynth.current;
  
  useEffect(() => {
    synth.current = new Tone.FMSynth().toDestination();
    melodyRNN.current = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv');
    Tone.start();
    let melodyRnnLoaded = melodyRNN.current.initialize();
    rnnStart(melodyRnnLoaded);
  }, []);

  const rnnStart = async(melodyRnnLoaded) => {
    if (melodyRnnLoaded) await melodyRnnLoaded;
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
      return [Tone.Time(note.quantizedStartStep / 4).toBarsBeatsSixteenths(), Tone.Frequency(note.pitch, 'midi').toNote(), Tone.Time(((note.quantizedEndStep - note.quantizedStartStep) / 4)).toNotation()];
    });
    setMelodyPatern(melodyTest);
  };

  const startMusic = () => {
    if (isPlaying) return;
    Tone.start();
    melodyPart.current = new Tone.Part((time, note, durr) => {
      synth.current.triggerAttackRelease(note, durr, time);
    }, melodyPatern).start();
    melodyPart.current.mute = false;
    melodyPart.current.loop = true;
    melodyPart.current.loopStart = 0;
    melodyPart.current.loopEnd = '2m';
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopMusic = () => {    
    if (!isPlaying) return;  
    melodyPart.current.dispose();
    rnnStart();
    melodyPart.current = new Tone.Part((time, note, durr) => {
      synth.current.triggerAttackRelease(note, durr, time);
    }, melodyPatern).start();
    // Tone.Transport.stop();
    setIsPlaying(false);
  };


  return (
    <div>
      <button onClick={() => startMusic()}>Start</button>
      <button onClick={() => stopMusic()}>Stop</button>
    </div>
  );
}

Synth.propTypes = {
  distForSynth: PropTypes.object
};
