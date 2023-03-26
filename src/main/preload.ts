// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'ipcException'
  | 'getConfing'
  | 'printer'
  | 'newFile'
  | 'changeAutoPrinter';

let listeners: Channels[] = [];

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, args?: unknown[]) {
      // console.log('send Message');

      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      if (listeners.includes(channel)) return;

      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      listeners.push(channel);

      // eslint-disable-next-line consistent-return
      return () => {
        ipcRenderer.removeListener(channel, subscription);
        // remove listenner
        listeners = listeners.filter((listener) => listener !== channel);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
