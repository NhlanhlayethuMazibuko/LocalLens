import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { APIProvider } from '@vis.gl/react-google-maps';
import App from './App.jsx';
import { GOOGLE_KEY, USE_GOOGLE } from './lib/config.js';
import './index.css';

const app = <App />;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {USE_GOOGLE ? (
      <APIProvider apiKey={GOOGLE_KEY} language="en">
        {app}
      </APIProvider>
    ) : (
      app
    )}
  </StrictMode>,
);
