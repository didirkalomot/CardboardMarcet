import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux' 
import { store } from './store/store'  
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 3. Оборачиваем App в Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)