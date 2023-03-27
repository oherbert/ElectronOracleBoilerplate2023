import { ipcMain, BrowserWindow } from 'electron';
import ILabel from 'types/ILabel';
import fs from 'fs';
import getDBConfig from '../config/database';
import mainEnv from './MainEnv';
import trayApp from './TrayApp';

const options = {
  silent: false,
  color: false,
  landscape: false,
  pagesPerSheet: 1,
  collate: false,
  copies: 1,
};

const appListeners = () => {
  ipcMain.on('printer', (event, args) => {
    try {
      if (!Array.isArray(args) || args.length === 0 || !('zpl' in args[0]))
        throw new Error('Tipo de Argumento para impressão incorreto!');

      const label: ILabel = args[0] as ILabel;

      const win: BrowserWindow | null = new BrowserWindow({ show: false });

      if (win === null) {
        throw new Error('Não foi possível carregar a janela de impressão!');
      }

      console.log('\n \n printer \n \n');

      win.once('ready-to-show', () => win.hide());

      win.loadFile(mainEnv.getAssetPath(`/zpl/${label.fileName}`));
      win.webContents.on('did-finish-load', () => {
        win.webContents.print(options, (success, failureReason) => {
          console.log(success);

          if (!success) {
            if (
              failureReason === 'Print job canceled' ||
              failureReason === 'Print job failed'
            )
              event.reply('printer', ['canceled']);
            else event.reply('ipcException', failureReason);
          } else {
            console.log('success');

            event.reply('printer', ['success', label.fileName]);
          }

          win.close();
        });
      });
    } catch (err: any) {
      console.log(`${err}`);

      event.reply('ipcException', err.message.toString());
    }
  });

  ipcMain.on('changeAutoPrinter', async (event, args: unknown) => {
    if (
      Array.isArray(args) &&
      args.length === 1 &&
      typeof args[0] === 'boolean'
    )
      // eslint-disable-next-line prefer-destructuring
      mainEnv.autoPrint = args[0];
    if (mainEnv.autoPrint) trayApp.setRadioBtnTrue('impressaoAuto');
    else trayApp.setRadioBtnTrue('impressaoManual');
  });

  ipcMain.on('unlinkZpl', async (event, arg) => {
    console.log(`${arg} unlink back`);

    let resp = arg[0];

    if (Array.isArray(arg) && arg.length > 0) {
      try {
        fs.unlink(mainEnv.getAssetPath(`/zpl/${arg[0]}`), (e) =>
          console.log(e)
        );
      } catch (error: any) {
        resp = error.message;
        console.log(error);
      } finally {
        event.reply('unlinkZpl', resp);
      }
    }
  });

  ipcMain.on('getConfig', async (event) => {
    const res = getDBConfig();
    event.reply('getConfig', res);
  });

  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong} - 49`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  return ipcMain;
};

export default appListeners;
