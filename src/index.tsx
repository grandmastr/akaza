import {
  createContext,
  createElement,
  render,
  useRef,
  useSideEffect,
  useState,
} from './akaza';

const Akaza = {
  render,
  createElement,
};

const View = () => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>();

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

  const focusInput = (event: Event) => {
    event.preventDefault();

    inputRef.current?.focus();
  };

  return (
    <div id={'app'}>
      <p>Hello</p>
      <input
        type="text"
        onChange={({ target }) => setMessage(target.value)}
        ref={inputRef}
      />
      <span>here's a quick message: {message}</span>
      <button onClick={focusInput}>focus on input</button>
    </div>
  );
};

const Theme = createContext<'light' | 'dark'>('light');

function App() {
  return (
    <Theme.Provider value={'light'}>
      <View />
    </Theme.Provider>
  );
}

const root = document.getElementById('root')!;

render(<View />, root);
