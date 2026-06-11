import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import ReactDOM from 'react-dom/client';
import React from 'react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);

// esto mide performance aunque realmente aqui no se esta enviando nada a ningun lado y antes este archivo tenia otro proposito
reportWebVitals();
