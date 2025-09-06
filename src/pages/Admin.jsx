import React, { useState } from 'react'
import { Tabs, Tab, Box, Typography } from '@mui/material'

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: 24 }}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const Admin = () => {
  const [tab, setTab] = useState(0)

  const handleChange = (event, newValue) => {
    setTab(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Admin Dashboard</Typography>
      <Tabs value={tab} onChange={handleChange} aria-label="admin tabs">
        <Tab label="Products" />
        <Tab label="Users" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        {/* Products content goes here */}
        <Typography>Products management coming soon...</Typography>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        {/* Users content goes here */}
        <Typography>Users management coming soon...</Typography>
      </TabPanel>
    </Box>
  )
}

export default Admin