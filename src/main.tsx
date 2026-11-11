import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/components.css'
import './styles/sections.css'
import App from './App.tsx'
import { site } from './config/site'

document.title = site.brand.seoTitle

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
