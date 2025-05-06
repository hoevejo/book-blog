import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { UserProvider } from './context/UserContext';
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <App />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </UserProvider>
  </React.StrictMode>
);
