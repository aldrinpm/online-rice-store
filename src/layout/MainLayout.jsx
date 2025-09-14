import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Link, Outlet } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import InventoryIcon from '@mui/icons-material/Inventory'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Header from './Header'
import Footer from './Footer'
import { useTheme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import { app } from '../config/firebase'
import useStore from '../config/store'

const drawerWidth = 240
const iconOnlyWidth = 72

const navItems = [
  { text: 'Home', to: '/', icon: <HomeIcon /> },
  { text: 'Admin', to: '/admin', icon: <AdminPanelSettingsIcon />, adminOnly: true },
  { text: 'Products', to: '/products', icon: <InventoryIcon /> },
  { text: 'Orders', to: '/orders', icon: <LocalShippingIcon /> },
  // { text: 'Profile', to: '/profile', icon: <AccountCircleIcon /> }
]

function MainLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const setIsAdmin = useStore(state => state.setIsAdmin)
  const isAdmin = useStore(state => state.isAdmin)

  // Query Firestore users where email matches logged-in user
  useEffect(() => {
    const auth = getAuth(app)
    const db = getFirestore(app)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const usersColRef = collection(db, 'users')
        const q = query(usersColRef, where('email', '==', user.email))
        const usersSnap = await getDocs(q)
        const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setIsAdmin(usersList.length > 0 && usersList[0].role === 'admin')
      } else {
        setIsAdmin(false)
      }
    })
    return () => unsubscribe()
  }, [setIsAdmin])

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List>
        {navItems
          .filter(item => !item.adminOnly || isAdmin)
          .map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.to}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                {!isMobile && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Paper
          elevation={1}
          sx={{
            width: { xs: iconOnlyWidth, sm: drawerWidth },
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            borderRadius: 0,
          }}
        >
          {drawerContent}
        </Paper>
        <Box component="main" sx={{ p: 3, flex: 1, minHeight: 0 }}>
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}

export default MainLayout