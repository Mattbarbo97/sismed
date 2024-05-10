import React from 'react';
import { createRoot } from 'react-dom/client'; // Importa createRoot de react-dom/client
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Captura o elemento do DOM onde o React será renderizado
const container = document.getElementById('root');

// Utiliza createRoot para criar uma raiz para o container
const root = createRoot(container); 

// Utiliza o método render da raiz para renderizar o App
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Pode manter o reportWebVitals se estiver usando para medir performance
reportWebVitals();
