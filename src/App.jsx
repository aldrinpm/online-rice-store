import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext'
import MainLayout from './layout/MainLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import Orders from './pages/Orders/Orders'
import Profile from './pages/Profile'
import Admin from './pages/Admin/Admin'

const theme = createTheme({
  palette: { mode: 'light' },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' }
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
            <Route 
              path="admin/*" 
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
