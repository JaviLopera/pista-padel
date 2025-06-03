import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';
import { BrowserRouter } from 'react-router-dom';

if (typeof document !== 'undefined') {
    // eslint-disable-next-line
    createRoot(document.getElementById('root') as HTMLElement).render(
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>,
    );
}
