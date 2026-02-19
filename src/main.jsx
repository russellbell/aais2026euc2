import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import App from './App.jsx'
import { VaultProvider } from './context/VaultContext.jsx'
import { awsConfig } from './config/aws-config.js'
import './index.css'

// Configure Amplify
Amplify.configure(awsConfig)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <VaultProvider>
      <App />
    </VaultProvider>
  </React.StrictMode>,
)
