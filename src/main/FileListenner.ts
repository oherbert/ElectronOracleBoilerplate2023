import chokidar from 'chokidar';
import { BrowserWindow } from 'electron';
import fs from 'fs';
import mainEnv from './MainEnv';

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

          if (!mainEnv.autoPrint) {
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
          }

          console.log(path);

          win.webContents.send('newFile', [file]);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }
}

export default new FileListenner();
