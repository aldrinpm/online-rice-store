import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'
import { app } from '../config/firebase'

function Header() {
  const [user, setUser] = useState(null)
  const auth = getAuth(app)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [auth])

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/') // Redirect to home page after successful logout
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <AppBar position="static" color="primary" elevation={1} sx={{ boxShadow: 0 }}>
      <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
        <Box sx={{ position: 'absolute', left: 16 }} />
        <Typography component="h1" variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
          Marvin Online Rice Store
        </Typography>
        <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Typography variant="body1" sx={{ fontWeight: 400 }}>
              Welcome {user.displayName}
            </Typography>
          )}
          {user ? (
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="contained" color="secondary" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header