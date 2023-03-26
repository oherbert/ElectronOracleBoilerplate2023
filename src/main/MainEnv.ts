import { app } from 'electron';
import path from 'path';

class MainEnv {
  public isQuitting: boolean;

  public autoPrint: boolean = false;

  private RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  constructor() {
    this.isQuitting = false;
  }

  public getAssetPath(...paths: string[]): string {
    return path.join(this.RESOURCES_PATH, ...paths);
  }
}

export default new MainEnv();
