import { Box, Typography, Paper } from '@mui/material'
import homeBg from '../assets/home-bg.jpg'
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

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

const announcementStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '800px',
  margin: '40px auto',
  textAlign: 'center',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
};

const announcementTitleStyle = {
  color: '#d32f2f',
  marginBottom: '10px',
  fontWeight: 'bold',
  fontSize: '1.5rem'
};

const announcementContentStyle = {
  color: '#333',
  fontSize: '1.1rem',
  lineHeight: '1.6'
};

const Home = () => {
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const q = collection(db, 'announcement');
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const announcementDoc = querySnapshot.docs[0].data();
          setAnnouncement(announcementDoc.message || '');
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, []);
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
      <Typography sx={{ pl: 4, pt: 2, fontSize: '1.2rem', fontWeight: 400, mb: 4 }} style={subHeaderShadow}>Your one-stop shop for all your rice needs.</Typography>

      {/* Announcement Section */}
      {!loading && announcement && (
        <Paper elevation={3} sx={announcementStyle}>
          <Typography variant="h5" style={announcementTitleStyle}>
            📢 Announcement
          </Typography>
          <Typography style={announcementContentStyle}>
            {announcement}
          </Typography>
        </Paper>
      )}

      <Box sx={{ position: 'absolute', bottom: 80, right: 30, textAlign: 'right' }}>
        <Typography variant="h4" style={contactShadow}>Contact #: 09771372343</Typography>
        <Typography variant='h4' style={nameShadow}>Contact Name: Marvin Congreso</Typography>
      </Box>
    </Box>
  );
}

export default Home