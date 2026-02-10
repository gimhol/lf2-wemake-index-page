
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from "react-router-dom";
import { GlobalValue } from './GlobalStore';
import { Paths } from './Paths';
import './init';
import Toast from './gimd/Toast';
const router = createHashRouter(Paths.Routes);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalValue.Provider>
      <Toast.Provider>
        <RouterProvider router={router} />
      </Toast.Provider>
    </GlobalValue.Provider>
  </StrictMode>,
)




