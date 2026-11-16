import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';
const node = document.getElementById('root');
if (!node) throw new Error('Root mount node not found');
createRoot(node).render(<StrictMode><App /></StrictMode>);
