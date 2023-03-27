import chokidar from 'chokidar';
import { BrowserWindow } from 'electron';
import fs from 'fs';
import ILabel from 'types/ILabel';
import mainEnv from './MainEnv';

const toPrint = (label: ILabel) => {
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
      }

      win.destroy();
    });
  });
};

class FileListenner {
  private watcher = chokidar.watch(mainEnv.getAssetPath('/zpl'), {
    ignored: /(^|[/\\])\../, // ignore dotfiles
    persistent: true,
  });

  public async active() {
    return this.watcher.on('add', (path) => {
      if (path.endsWith('.zpl')) {
        try {
          const wins = BrowserWindow.getAllWindows();

          if (wins.length === 0) return;

          const win = wins[0];
          const file = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
          const fileName = path.split('\\').pop();

          console.log(fileName);

          const label: ILabel = {
            fileName: fileName ?? 'Sem nome',
            zpl: file,
            img: '',
          };

          if (mainEnv.autoPrint) {
            toPrint(label);
            return;
          }

          if (win.isMinimized()) win.restore();
          win.show();
          win.focus();

          win.webContents.send('newFile', [label]);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }
}

export default new FileListenner();
