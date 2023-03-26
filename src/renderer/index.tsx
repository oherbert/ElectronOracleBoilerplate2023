import { createRoot } from 'react-dom/client';
import App from './App';
import { AppContext } from './context/AppContext';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <AppContext>
    <App />
  </AppContext>
);
