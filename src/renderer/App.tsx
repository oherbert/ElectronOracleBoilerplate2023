import React, { useContext, useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Space, Switch, Menu } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Buffer } from 'buffer';
import ILabel from 'types/ILabel';
import type { MenuProps } from 'antd';
import noImage from './no-image';
import './App.css';
import { Context } from './context/AppContext';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

function PrinterManager() {
  const {
    ipcRenderer: { sendMessage, on },
    autoPrinter,
    dispatch,
    newFile,
    printer,
  } = useContext(Context);

  const [labels, setLabels] = useState<ILabel[]>([]);
  const [selected, setSelected] = useState<null | number>(null);

  const onClickToPrint = () => {
    if (labels.length > 0 && selected !== null)
      sendMessage('printer', [labels[selected]]);
  };

  const onClickDelete = () => {
    if (labels.length > 0 && selected !== null) {
      console.log('unlink');

      sendMessage('unlinkZpl', [labels[selected].fileName]);
      on('unlinkZpl', (res) => {
        console.log('remove front');

        const newLabels = labels.filter((f) => f.fileName !== res);
        setLabels([...newLabels]);

        if (newLabels.length > 0) setSelected(newLabels.length - 1);
        else setSelected(null);
      });
    }
  };

  const onSwitchAutoClick = () => {
    dispatch({ type: 'autoPrinter', payload: !autoPrinter });
    sendMessage('changeAutoPrinter', [!autoPrinter]);
  };

  const onMenuClick: MenuProps['onClick'] = (e) => {
    setSelected(+e.key);
  };

  useEffect(() => {
    if (!printer) return;

    const newLabels = labels.filter((f) => f.fileName !== printer);

    setLabels([...newLabels]);

    sendMessage('unlinkZpl', [printer]);
    dispatch({ type: 'printer', payload: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printer]);

  useEffect(() => {
    if (!newFile) return;

    const newLabels = labels.filter((f) => f.fileName !== newFile.fileName);

    setLabels([...newLabels, newFile]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFile]);

  useEffect(() => {
    const noImageLabel = labels.find((l) => l.zpl.length > 0 && !l.img);

    if (noImageLabel) {
      if (autoPrinter) {
        setSelected(labels.length - 1);
        onClickToPrint();
        return;
      }

      axios({
        method: 'post',
        url: 'http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/',
        data: { file: noImageLabel.zpl },
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        // eslint-disable-next-line promise/always-return
        .then((resp) => {
          const base64 = Buffer.from(resp.data, 'binary').toString('base64');
          noImageLabel.img = base64;

          const newLabels = labels.filter(
            (f) => f.fileName !== noImageLabel.fileName
          );

          setLabels([...newLabels, noImageLabel]);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (labels.length > 0 && selected !== labels.length)
      setSelected(labels.length - 1);
    else if (labels.length === 0 && selected !== null) setSelected(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels]);

  const items: MenuProps['items'] = [
    getItem(
      'Fila de impressão',
      'grp',
      null,
      labels.map((l, idx) => getItem(l.fileName, idx)),
      'group'
    ),
  ];

  return (
    <form id="main">
      <h1>Gerenciador de Impressão ZPL</h1>

      <div>
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
            <span style={{ paddingLeft: '0.5rem' }}>
              Impressão automática? (Utiliza a improssora padrão do sistema)
            </span>
          </span>
        </Space>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxHeight: '20vh',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Menu
            onClick={onMenuClick}
            style={{ width: '70vw', marginTop: '1rem' }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={items}
          />
        </div>
        <div>
          <button
            type="button"
            style={{ height: '7vh', width: '21vw', marginLeft: '2vw' }}
            onClick={onClickToPrint}
          >
            <span role="img" aria-label="Imprimir">
              🖨
            </span>
            Imprimir
          </button>
          <button
            type="button"
            style={{
              height: '7vh',
              width: '21vw',
              marginLeft: '2vw',
              marginTop: '2vw',
            }}
            onClick={onClickDelete}
          >
            <span role="img" aria-label="Excluir">
              🧹
            </span>
            Excluir
          </button>
        </div>
      </div>

      <div className="container-labels">
        <h3>
          {' '}
          Visualizador de ZPL Web (API de terceiros: http://labelary.com/){' '}
        </h3>
        {labels &&
        selected !== null &&
        labels.length > 0 &&
        labels[selected] &&
        'img' in labels[selected] &&
        labels[selected].img ? (
          <img
            className="zlp-img"
            src={`data:image/png;base64,${labels[selected].img}`}
            alt="label"
            key={`label-${labels[selected].fileName}`}
          />
        ) : (
          <img
            className="zlp-img"
            src={`data:image/png;base64,${noImage}`}
            alt="label"
            key="label-no-Image"
          />
        )}
      </div>
    </form>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrinterManager />} />
      </Routes>
    </Router>
  );
}
