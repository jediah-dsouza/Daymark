import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { AppProvider } from './state/AppProvider';
import '@fontsource-variable/newsreader';
import '@fontsource-variable/dm-sans';
import './styles/tokens.css';
import './styles/global.css';
import './styles/primitives.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
);
