import { ipcMain, BrowserWindow } from 'electron';
import ILabel from 'types/ILabel';
import getDBConfig from '../config/database';
import mainEnv from './MainEnv';
import trayApp from './TrayApp';

// const options = {
//   silent: false,
//   color: false,
//   landscape: false,
//   pagesPerSheet: 1,
//   collate: false,
//   copies: 1,
// };

const appListeners = () => {
  ipcMain.on('printer', async (event, args) => {
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
      win.webContents.on('did-finish-load', async () => {
        let options = {
          silent: false,
          color: false,
          landscape: false,
          pagesPerSheet: 1,
          collate: false,
          copies: 1,
          deviceName: '',
        };

        if (mainEnv.autoPrint) {
          // Finding Default Printer name
          const printersInfo = await win.webContents.getPrintersAsync();
          const printer = printersInfo.filter((p) => p.isDefault === true)[0];

          // console.log(printer);
          options = {
            silent: true,
            deviceName: printer.name,
            color: false,
            landscape: false,
            pagesPerSheet: 1,
            collate: false,
            copies: 1,
          };
        }

        win?.webContents.print(options, (success, failureReason) => {
          if (!success) {
            console.log(failureReason);
            if (
              failureReason === 'Print job canceled' ||
              failureReason === 'Print job failed'
            )
              event.reply('printer', ['canceled']);
            else event.reply('ipcException', failureReason);
          } else event.reply('printer', ['success', label.fileName]);

          win.destroy();
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
