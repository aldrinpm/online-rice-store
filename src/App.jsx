import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import MainLayout from './layout/MainLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

const theme = createTheme({
  palette: { mode: 'light' },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' }
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App
