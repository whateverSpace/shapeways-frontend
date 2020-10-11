import {useState} from 'react';
import useEventListener from '@use-it/event-listener';

const useMouseClick = () => {
  let [toggled, setToggled] = useState(0);

  useEventListener('click', (toggled) => {
    setToggled(!toggled);
  });
  return toggled;
};
export default useMouseClick;
