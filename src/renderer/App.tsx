import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

function Hello() {
  const [random, setRandom] = useState<null | object>();

  window.electron.ipcRenderer.on('randomId', (args) => {
    setRandom({ ...(args as object) });
  });

  const onButtonClick = () =>
    window.electron.ipcRenderer.sendMessage('randomId');

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <button type="button">
          <span role="img" aria-label="books">
            📚
          </span>
          Read our docs
        </button>

        <button type="button" onClick={onButtonClick}>
          <span role="img" aria-label="folded hands">
            🙏
          </span>
          Donate
        </button>
      </div>
      <div>{random && JSON.stringify(random)}</div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
