import { IAction, IGlobalState } from 'types/IGlobalState';

const globalState: IGlobalState = {
  dispatch: (action: IAction | IAction[]) =>
    // eslint-disable-next-line no-console
    console.log(`Override dispatch on globalState ${action}`),
  exceptionMsg: '',
  ipcRenderer: window.electron.ipcRenderer,
  autoPrinter: false,
  newFile: null,
};

export default globalState;
