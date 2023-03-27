import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import Swal from 'sweetalert2';
import { IGlobalState } from 'types/IGlobalState';
import globalState from './globalState';
import reducer from './reducer';

interface IContextApp {
  children: ReactNode | ReactNode[];
}

export const Context = createContext<IGlobalState>(globalState);

export function AppContext({ children }: IContextApp) {
  const [state, dispatch] = useReducer(reducer, globalState);

  useEffect(() => {
    let autoPrinter = localStorage.getItem('autoPrinter');
    if (!autoPrinter) {
      autoPrinter = 'true';
      localStorage.setItem('autoPrinter', autoPrinter);
    }

    console.log(autoPrinter);

    globalState.ipcRenderer.sendMessage('changeAutoPrinter', [autoPrinter]);
    dispatch({ type: 'autoPrinter', payload: autoPrinter === `true` });
  }, []);

  globalState.ipcRenderer.on('changeAutoPrinter', (msg) => {
    if (Array.isArray(msg) && typeof msg[0] === 'boolean') {
      localStorage.setItem('autoPrinter', `${msg[0]}`);
      dispatch({ type: 'autoPrinter', payload: msg[0] });
    }
  });

  globalState.ipcRenderer.on('printer', (args) => {
    console.log(args);
    if (Array.isArray(args) && args.length > 1) {
      console.log(args[1]);
      dispatch({ type: 'printer', payload: args[1] });
    }
  });

  // Chanel que recebe erros do backend
  globalState.ipcRenderer.on('ipcException', (msg) => {
    dispatch({
      type: 'exceptionMsg',
      payload: msg,
    });
  });

  globalState.ipcRenderer.on('newFile', (args) => {
    console.log(args);

    if (Array.isArray(args) && args.length > 0) {
      dispatch({ type: 'newFile', payload: args[0] });
    }
  });

  useEffect(() => {
    if (!state.exceptionMsg) return;
    Swal.fire('Erro', state.exceptionMsg, 'error');
    // dispatch({ type: 'exceptionMsg', payload: '' });
  }, [state.exceptionMsg]);

  const contextValues = useMemo(
    () => ({
      ...state,
      dispatch,
    }),
    [state]
  );

  return (
    // <ThemeProvider theme={state.userTheme === 'light' ? lightTheme : darkTheme}>
    //   <GlobalStyles />
    // </ThemeProvider>
    <Context.Provider value={contextValues}>
      {Array.isArray(children) ? children.map((child) => child) : children}
    </Context.Provider>
  );
}
