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
      <Toolbar sx={{ 
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        width: '100%',
        px: 2
      }}>
        {/* Left spacer - keeps the title centered */}
        <Box />
        
        {/* Center Title */}
        <Typography 
          component="h1" 
          variant="h6" 
          sx={{ 
            textAlign: 'center',
            fontSize: { 
              xs: '1rem',
              sm: '1.1rem',
              md: '1.25rem'
            },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            px: 1,
            maxWidth: '100%',
            justifySelf: 'center'
          }}
        >
          Marvin Online Rice Store
        </Typography>
        
        {/* Right side content */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          gap: { xs: 1, sm: 2 },
          ml: 'auto',
          maxWidth: '100%'
        }}>
          {user && (
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 400,
                fontSize: { 
                  xs: '0.75rem',
                  sm: '0.85rem',
                  md: '0.95rem'
                },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: { xs: '80px', sm: '150px', md: '250px' },
                display: { xs: 'none', sm: 'block' } // Hide on extra small screens
              }}
            >
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