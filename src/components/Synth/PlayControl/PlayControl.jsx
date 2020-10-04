import { React, useState } from 'react';
import { ReactDOM } from 'react-dom';
const PlayControl = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  function handlePlayClick() {
    setIsPlaying(true);
  }

  function handlePauseClick(){
    setIsPlaying(false);
  }

  let button;

  if (isPlaying) {
    button = <PauseButton onClick={handlePauseClick} />;
  } else {
    button = <PlayButton onClick={handlePlayClick} />;
  }

  return (
    <div>
      <Greeting isPlaying={isPlaying} />
      {button}
    </div>
  );
};

function PlayingGreeting(props) {
  return <h1>Playing</h1>;
}

function PausedGreeting(props) {
  return <h1>Paused</h1>;
}

function Greeting(props) {
  const isPlaying = props.isPlaying;
  if (isPlaying) {
    return <PlayingGreeting />;
  }
  return <PausedGreeting />;
}

function PlayButton(props) {
  return (
    <button onClick={props.onClick}>
        Play
    </button>
  );
}
function PauseButton(props) {
  return (
    <button onClick={props.onClick}>
        Pause
    </button>
  );
}

ReactDOM.render(
  <PlayControl />,
  document.getElementById('root')
);
export default PlayControl;
