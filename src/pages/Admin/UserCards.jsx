import React from 'react';
import { Grid, Card, CardContent, Typography, IconButton, CardActions, Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const UserCards = ({ users, setUserFormData, setEditingUser, setEditingDocPath, setUserDialogOpen, handleDelete }) => {
  return (
    <Grid container spacing={3}>
      {users.map((user) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={user._docPath}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Box mt={1}>
                <Typography variant="subtitle2" color="primary">
                  Role: {user.role}
                </Typography>
              </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton
                color="primary"
                onClick={() => {
                  setUserFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    role: user.role || 'user',
                  });
                  setEditingUser(true);
                  setEditingDocPath(user._docPath);
                  setUserDialogOpen(true);
                }}
              >
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={() => handleDelete(user._docPath)}>
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default UserCards;
