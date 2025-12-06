import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

console.log('main.jsx loaded')

const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

console.log('App rendered')
