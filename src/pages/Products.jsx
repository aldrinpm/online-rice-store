import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  CardActionArea,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HideImageIcon from '@mui/icons-material/HideImage';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [orderData, setOrderData] = useState({
    address: '',
    contactNumber: '',
    customerName: '',
    notes: '',
    quantity: 1,
    productId: '',
    productName: '',
    totalPrice: 0
  });

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

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setOrderData({
      ...orderData,
      productId: product.id,
      productName: product.name,
      totalPrice: product.price
    });
    setOpenOrderDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenOrderDialog(false);
    setOrderData({
      address: '',
      contactNumber: '',
      customerName: '',
      notes: '',
      quantity: 1,
      productId: '',
      productName: '',
      totalPrice: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value,
      totalPrice: name === 'quantity' && selectedProduct ? (parseInt(value) || 1) * selectedProduct.price : prev.totalPrice
    }));
  };

  const handlePlaceOrder = async () => {
    try {
      if (!orderData.customerName || !orderData.contactNumber || !orderData.address) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        return;
      }

      const orderRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'pending',
        createdAt: new Date()
      });

      setSnackbar({
        open: true,
        message: 'Order has been placed successfully!',
        severity: 'success'
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Error placing order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to place order. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={openOrderDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Place Order - {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              required
              name="customerName"
              label="Full Name"
              value={orderData.customerName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              required
              name="contactNumber"
              label="Contact Number"
              value={orderData.contactNumber}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              required
              name="address"
              label="Delivery Address"
              value={orderData.address}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              value={orderData.quantity}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 1 }}
            />
            <TextField
              name="notes"
              label="Special Instructions (Optional)"
              value={orderData.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total: ₱{orderData.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handlePlaceOrder} 
            variant="contained" 
            color="primary"
            disabled={!orderData.customerName || !orderData.contactNumber || !orderData.address}
          >
            Place Order
          </Button>
        </DialogActions>
      </Dialog>
      <Box >
        <Typography variant="h4" component="h1" gutterBottom>
          Our Products
        </Typography>
        
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',}}>
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
                    <HideImageIcon sx={{ fontSize: 80, color: 'action.active', mb: 2 }} />
                  )}
                  <CardContent sx={{ width: '100%', p: 0 }}>
                    <Typography gutterBottom variant="h6" component="h2" align="center" sx={{ m: 0 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 0 }}>
                      {product.category}
                    </Typography>
                    <Typography variant="body2" paragraph align="center" sx={{ mb: 0, minHeight: '40px' }}>
                      {product.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="body3" color="primary" sx={{ px: 1 }}>
                      ₱{product.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleOrderClick(product)}
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