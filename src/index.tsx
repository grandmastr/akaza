import {render, useSideEffect, useState} from './utils/render';
import {createElement} from './utils/dom';

const Akaza = {
  render, createElement,
};

const View = () => {
  const [count, setCount] = useState(0);

  useSideEffect(() => {
    console.log('My first ever effect, let\'s hope this works 🤞🏾');

    return () => {
      console.log('unmounting');
    };
  }, []);

  useSideEffect(() => {
    console.log('My second effect, let\'s hope this works 🤞🏾');

    return () => {
      console.log('unmounting 2');
    };
  }, [count]);

  return (
    <div id={'app'}>
      <p>Hello</p>
      <span>{count}</span>
      <button onClick={() => {
        console.log('button clicked');
        setCount((x: number) => x + 1);
      }}>
        +
      </button>
    </div>
  );
};

const root = document.getElementById('root')!;

render(<View/>, root);
