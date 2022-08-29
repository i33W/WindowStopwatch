import React, { useState, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

const Hello = () => {
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
};

const StopWatch = () => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const increment = useRef(null);

  const handleStart = () => {
    setIsActive(!isActive);
    if (!isActive) {
      increment.current = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 10);
    } else {
      clearInterval(increment.current);
    }
  };

  const handleReset = () => {
    clearInterval(increment.current);
    setIsActive(false);
    setTimer(0);
  };

  const formatTime = () => {
    const getSeconds = `0${timer % 60}`.slice(-2);
    const minutes = `${Math.floor(timer / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);

    return `${getHours}:${getMinutes}.${getSeconds}`;
  };

  return (
    <div>
      <div>{formatTime()}</div>
      <div onClick={handleStart}>
        <div style={{ fontSize: 30 }}>{!isActive ? 'Start' : 'Stop'}</div>
      </div>
      <div onClick={handleReset}>
        <div style={{ fontSize: 30 }}>Reset</div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StopWatch />} />
      </Routes>
    </Router>
  );
}
