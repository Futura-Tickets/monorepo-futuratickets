import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

// STATE
import GlobalStateProvider from './GlobalStateProvider/GlobalStateProvider';


// COMPONENTS
import App from './App';
import FuturaTickets from './FuturaTickets';

// STYLES
import './index.scss';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <GlobalStateProvider>
      <BrowserRouter basename={process.env.REACT_APP_BASENAME || '/'}>
        <FuturaTickets>
          <App/>
        </FuturaTickets>
      </BrowserRouter>
    </GlobalStateProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
