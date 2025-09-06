import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Badge,
  AppBar,
  Toolbar,
  CardActionArea,
  CardActions
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FastfoodIcon from '@mui/icons-material/Fastfood';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const orderProduct = (product) => {
    setOrderCount(prev => prev + 1);
    // Here you would typically add the order to a database
    console.log('Ordered:', product.name);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      <AppBar position="fixed" color="default" elevation={1} sx={{ mb: 4, zIndex: 1200 }}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <IconButton color="inherit" sx={{ position: 'relative' }}>
            <Badge badgeContent={orderCount} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 10, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Our Products
        </Typography>
        
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  {product.imageUrl ? (
                    <Box 
                      component="img"
                      src={product.imageUrl}
                      alt={product.name}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 2
                      }}
                    />
                  ) : (
                    <FastfoodIcon sx={{ fontSize: 80, color: 'action.active', mb: 2 }} />
                  )}
                  <CardContent sx={{ width: '100%', p: 0 }}>
                    <Typography gutterBottom variant="h6" component="h2" align="center">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                      {product.category}
                    </Typography>
                    <Typography variant="body2" paragraph align="center" sx={{ mb: 2, minHeight: '40px' }}>
                      {product.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h6" color="primary">
                      ₱{product.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => orderProduct(product)}
                      size="small"
                      startIcon={<ShoppingCartIcon />}
                    >
                      Order
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>


    </Container>
  );
};

export default Products;