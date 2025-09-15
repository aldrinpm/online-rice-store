import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { format } from 'date-fns';

const CustomerOrderCards = ({ filteredOrders }) => {
  if (!filteredOrders.length) {
    return (
      <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 3 }}>
        No orders found for the selected date range
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {filteredOrders.map((order) => {
        // Choose status color
        const statusColor =
          order.status === 'completed'
            ? 'success'
            : order.status === 'cancelled'
            ? 'error'
            : 'warning';

        return (
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
                {/* Order ID */}
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Order #{order.id.substring(0, 8)}...
                </Typography>

                {/* Customer */}
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {order.customerName}
                </Typography>

                {/* Product Info */}
                <Box mb={1}>
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
                </Box>

                {/* Order Date */}
                <Typography variant="caption" display="block" gutterBottom>
                  <strong>Order Date:</strong>{' '}
                  {order.createdAt ? format(order.createdAt, 'MMM dd, yyyy HH:mm') : 'N/A'}
                </Typography>

                {/* Status */}
                <Box mb={1}>
                  <Chip
                    label={order.status || 'pending'}
                    color={statusColor}
                    size="small"
                    sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                  />
                </Box>

                {/* Notes */}
                <Typography variant="body2" color="text.secondary">
                  <strong>Notes:</strong> {order.notes || '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CustomerOrderCards;
