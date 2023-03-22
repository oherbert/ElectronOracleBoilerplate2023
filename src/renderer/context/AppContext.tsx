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

  // Chanel que recebe erros do backend
  window.electron.ipcRenderer.on('ipcException', (msg) => {
    dispatch({
      type: 'exceptionMsg',
      payload: msg,
    });
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
