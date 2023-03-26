import { Menu, app, BrowserWindow } from 'electron';
import mainEnv from './MainEnv';

export type trayButton = 'impressaoAuto' | 'impressaoManual' | 'fechar';

const getContextMenu = () =>
  Menu.buildFromTemplate([
    {
      label: 'Impressão Auto',
      commandId: 1,
      type: 'radio',
      id: 'impressaoAuto',
      click: () => {
        const win = BrowserWindow.getAllWindows()[0];
        mainEnv.autoPrint = true;

        win?.webContents.send('changeAutoPrinter', [true]);
      },
    },
    {
      label: 'Impressão Manual',
      commandId: 2,
      id: 'impressaoManual',
      type: 'radio',
      click: () => {
        const win = BrowserWindow.getAllWindows()[0];
        mainEnv.autoPrint = false;

        win?.webContents.send('changeAutoPrinter', [false]);
      },
    },
    {
      label: 'Fechar',
      commandId: 3,
      id: 'fechar',
      type: 'normal',
      click: () => {
        mainEnv.isQuitting = true;
        app.quit();
      },
    },
  ]);

export default getContextMenu;
