import { ipcMain, BrowserWindow } from 'electron';
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
  ipcMain.on('printer', async (event) => {
    try {
      const win: BrowserWindow | null = new BrowserWindow({ show: false });

      if (win === null) {
        throw new Error('Não foi possível carregar a janela de impressão!');
      }

      console.log('\n \n printer \n \n');
      console.log(mainEnv.getAssetPath('/zpl/et colchão.zpl'));

      win.once('ready-to-show', () => win.hide());

      win.loadFile(mainEnv.getAssetPath('/zpl/et colchão.zpl'));
      win.webContents.on('did-finish-load', async () => {
        // Finding Default Printer name
        // const printersInfo = await win.webContents.getPrintersAsync();
        // const printer = printersInfo.filter((p) => p.isDefault === true)[0];

        // console.log(printer);
        // const options = {
        //   silent: true,
        //   deviceName: printer.name,
        //   pageSize: { height: 301000, width: 50000 },
        // };

        win?.webContents.print(options, (success, failureReason) => {
          if (!success) {
            console.log(failureReason);
            if (failureReason === 'Print job canceled')
              event.reply('printer', ['canceled']);
            else event.reply('ipcException', failureReason);
          } else event.reply('printer', ['success']);
        });
      });

      /*
      win?.webContents.print(options, (success, failureReason) => {
        if (!success) console.log(failureReason);

        console.log('Print Initiated');
      });
*/
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
