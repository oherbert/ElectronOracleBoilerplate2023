import { Menu, nativeImage, Tray, BrowserWindow } from 'electron';
import { trayButton } from './trayMenu';

type TrayChannel = 'click';
// | 'right-click'
// | 'mouse-up'
// | 'mouse-move'
// | 'mouse-leave'
// | 'mouse-enter'
// | 'mouse-down'
// | 'drop-text'
// | 'drop-files'
// | 'drop'
// | 'drag-enter'
// | 'drag-end'
// | 'double-click'
// | 'balloon-closed'
// | 'balloon-click'
// | 'balloon-show';

class TrayApp {
  private tray: Tray | null;

  public contextMenu: Menu | null;

  public icon: string;

  public title: string;

  public tip: string;

  public win: BrowserWindow | null;

  public constructor() {
    this.tray = null;
    this.win = null;
    this.contextMenu = null;
    this.icon = '';
    this.title = '';
    this.tip = '';
  }

  public startTray() {
    const icon = nativeImage.createFromPath(this.icon);
    this.tray = new Tray(icon);
    this.tray.setTitle(this.title);
    this.tray.setToolTip(this.tip);
    // Call this again for Linux because we modified the context menu
    this.tray.setContextMenu(this.contextMenu);
  }

  public setRadioBtnTrue(item: trayButton) {
    const pos = this.contextMenu?.items
      .map((itn, idx) => (itn.id === item && itn.type === 'radio' ? idx : -1))
      .filter((value) => value > -1);

    if (pos && pos.length > 0 && this.contextMenu)
      this.contextMenu.items[pos[0]].checked = true;
  }

  public on(channel: TrayChannel, func: any) {
    this.tray?.on(channel, (_event: any, ...args: any[]) => func(...args));
  }

  public once(channel: TrayChannel, func: any) {
    this.tray?.on(channel, (_event: any, ...args: any[]) => func(...args));
  }
}

export default new TrayApp();
