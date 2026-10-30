import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { DemoUserProvider } from './DemoUserProvider'
import './i18n'
import './styles/theme.css'
import './index.css'

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <DemoUserProvider><App /></DemoUserProvider>
  </React.StrictMode>
)
