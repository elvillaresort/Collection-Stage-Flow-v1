import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const { createRoot } = ReactDOM;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);