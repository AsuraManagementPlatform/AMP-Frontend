import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './config/i18n.ts'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(<App />)
