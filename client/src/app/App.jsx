import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './app.routes'
import { useAuth } from '../features/auth/hooks/useAuth'


const App = () => {
  const auth = useAuth();
  useEffect(() => {
    auth.handleGetMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
   <RouterProvider router={router} />
  )
}

export default App