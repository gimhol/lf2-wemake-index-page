
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Loading } from './components/loading';
import Mask from './components/mask';
import { GlobalStore } from './GlobalStore';
import './init';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalStore.Provider fallback={<Loading loading big fixed />}>
      <Mask.Provider>
          <App />
      </Mask.Provider>
    </GlobalStore.Provider>
  </StrictMode>,
)




