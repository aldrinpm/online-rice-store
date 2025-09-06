import { Box, Typography } from '@mui/material'
import homeBg from '../assets/home-bg.jpg'

const headerShadow = {
  textShadow: '2px 2px 8px #fff, 0 0 4px #fff, 2px 2px 0 #fff, 4px 4px 0 #fff',
  color: '#222',
}

const subHeaderShadow = {
  textShadow: '10px 10px 8px #000000, 0 0 2px #000000', 
  color: '#ffffff',
}

const contactShadow = {
  textShadow: '2px 2px 8px #000, 0 0 8px #000, 2px 2px 0 #000, 4px 4px 0 #000',
  color: '#fff',
  margin: 0,
  textAlign: 'right',
}

const nameShadow = {
  textShadow: '2px 2px 8px #000, 0 0 8px #000, 2px 2px 0 #000, 4px 4px 0 #000',
  color: '#fff',
  margin: 0,
  textAlign: 'right',
}

const Home = () => {
  return (
    <Box
      component="div"
      sx={{
        minHeight: '100%',
        backgroundImage: `url(${homeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
      }}
    >
      <Typography sx={{ pl: 4, pt: 4, fontSize: '2rem', fontWeight: 600 }} style={headerShadow}>Welcome to the Online Rice Store!</Typography>
      <Typography sx={{ pl: 4, pt: 2, fontSize: '1.2rem', fontWeight: 400 }} style={subHeaderShadow}>Your one-stop shop for all your rice needs.</Typography>

      <Box sx={{ position: 'absolute', bottom: 80, right: 30, textAlign: 'right' }}>
        <Typography variant="h4" style={contactShadow}>Contact #: 09771372343</Typography>
        <Typography variant='h4' style={nameShadow}>Contact Name: Marvin Congreso</Typography>
      </Box>
    </Box>
  );
}

export default Home