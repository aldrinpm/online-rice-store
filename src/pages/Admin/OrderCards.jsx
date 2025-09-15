import React from 'react';
import { Grid, Card, CardContent, Typography, Box, FormControl, Select, MenuItem } from '@mui/material';
import { format } from 'date-fns';

const OrderCards = ({ filteredOrders, handleStatusChange }) => {
  if (!filteredOrders.length) {
    return (
      <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 3 }}>
        No orders found for the selected date range
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {filteredOrders.map((order) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
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
                Order #{order.id.substring(0, 8)}...
              </Typography>
              <Typography variant="subtitle2" color="primary">
                {order.customerName}
              </Typography>

              <Box mt={1}>
                <Typography variant="body2">
                  <strong>Product:</strong> {order.productName}
                </Typography>
                <Typography variant="body2">
                  <strong>Quantity:</strong> {order.quantity}
                </Typography>
                <Typography variant="body2">
                  <strong>Total:</strong> ₱
                  {order.totalPrice?.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Order Date:</strong>{' '}
                  {order.createdAt ? format(order.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'N/A'}
                </Typography>
              </Box>

              <Box mt={2}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={order.status || 'pending'}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Order status' }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default OrderCards;
