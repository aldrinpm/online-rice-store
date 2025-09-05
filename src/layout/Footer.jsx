import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

function Footer() {
  const theme = useTheme()
  return (
    <Box
      component="footer"
      sx={{
        p: 2,
        textAlign: 'center',
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}
    >
      <Typography variant="body2">© 2025 Marvin Online Rice Store</Typography>
    </Box>
  )
}

export default Footer