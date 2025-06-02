import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';

if (typeof document !== 'undefined') {
    // eslint-disable-next-line
    createRoot(document.getElementById('root') as HTMLElement).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
}
