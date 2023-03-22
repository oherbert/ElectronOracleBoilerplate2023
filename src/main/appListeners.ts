import { ipcMain } from 'electron';
import IDbConfig from 'types/IDbConfig';
import querys from '../database/querys';
import execSql, { ping } from '../helpers/executaSQL';
import getDBConfig, { saveDBConfig, changeDBConfig } from '../config/database';
import mainEnv from './MainEnv';

const appListeners = () => {
  ipcMain.on('ping', async (event) => {
    const resp = await ping();
    event.reply('ping', resp);
  });

  ipcMain.on('randomId', async (event) => {
    try {
      const res = await execSql(querys.randomID);
      event.reply('randomId', res.rows);
    } catch (err: any) {
      console.log(err);

      event.reply('ipcException', err.message.toString());
    }
  });

  ipcMain.on('getConfig', async (event) => {
    const res = getDBConfig();
    event.reply('getConfig', res);
  });

  ipcMain.on(
    'changeDBConfig',
    async (event, param: keyof IDbConfig, value: string) => {
      const saveRes = changeDBConfig(param, value);
      mainEnv.reloadDBConfig = saveRes === 'saved';
      event.reply('changeDBConfig', saveRes);
    }
  );

  ipcMain.on('saveDBConfig', async (event, dbConfig: IDbConfig) => {
    const saveRes = saveDBConfig(dbConfig);
    mainEnv.reloadDBConfig = saveRes === 'saved';
    event.reply('saveDBConfig', saveRes);
  });

  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong} - 49`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  return ipcMain;
};

export default appListeners;
