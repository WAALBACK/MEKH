
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './src/index.css';
import { setupNativeAuthListener } from './src/lib/nativeAuth';
import { initializeMemoryOptimization } from './src/lib/memoryOptimization';

// Initialize native deep link listener for OAuth + email confirmation (no-op on web)
setupNativeAuthListener();

// Initialize memory optimization
initializeMemoryOptimization();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
