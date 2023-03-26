import { useContext, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Space, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import icon from '../../assets/icon.svg';
import './App.css';
import { Context } from './context/AppContext';

function Hello() {
  const {
    ipcRenderer: { on, sendMessage },
    autoPrinter,
    dispatch,
  } = useContext(Context);

  const [zpl, setZpl] = useState<string[]>([]);

  on('printer', (args) => {
    console.log(args);
    // setRandom({ ...(args as object) });
  });

  on('newFile', (args) => {
    if (Array.isArray(args) && args.length > 0) {
      setZpl([...zpl, ...args]);
    }
    console.log(args);
  });

  const onButtonClick = () => sendMessage('printer');
  const onSwitchAutoClick = () => {
    dispatch({ type: 'autoPrinter', payload: !autoPrinter });
    sendMessage('changeAutoPrinter', [!autoPrinter]);
  };

  return (
    <form id="main">
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>

      {/* <MDCSwitch
        type="checkbox"
        checked={autoPrinter}
        value="Impressão automática? (Utiliza a improssora padrão)"
      /> */}
      <Space direction="vertical">
        <span>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
            checked={autoPrinter}
            onClick={onSwitchAutoClick}
            title="Altera padrão de impressão"
          />
          <span>
            Impressão automática? (Utiliza a improssora padrão do sistema)
          </span>
        </span>
      </Space>

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
      <div>{zpl.length > 0 && JSON.stringify(zpl)}</div>
    </form>
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
