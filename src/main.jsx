// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Import BrowserRouter
import AppWrapper from './App' // Import the AppWrapper (which now contains AuthProvider and Routes)
import './index.css'

// Wrap the AppWrapper with BrowserRouter at the very root
// AppWrapper should contain AuthProvider and Routes
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* BrowserRouter is the absolute root */}
      <AppWrapper /> {/* AppWrapper contains AuthProvider and Routes */}
    </BrowserRouter>
  </React.StrictMode>,
)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.error("SW failed", err));
  });
}