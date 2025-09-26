import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AlertProvider } from './components/Context/AlertContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AlertProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AlertProvider>
);