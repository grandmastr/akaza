import { createElement, render, useSideEffect, useState } from './akaza';

const Akaza = {
  render,
  createElement,
};

const View = () => {
  const [message, setMessage] = useState('');

  useSideEffect(() => {
    console.log("My first ever effect, let's hope this works 🤞🏾");

    return () => {
      console.log('unmounting');
    };
  }, []);

  useSideEffect(() => {
    console.log("My second effect, let's hope this works 🤞🏾");

    return () => {
      console.log('unmounting 2');
    };
  }, [message]);

  return (
    <div id={'app'}>
      <p>Hello</p>
      <input type="text" onChange={({ target }) => setMessage(target.value)} />
      <span>here's a quick message: {message}</span>
    </div>
  );
};

const root = document.getElementById('root')!;

render(<View />, root);
