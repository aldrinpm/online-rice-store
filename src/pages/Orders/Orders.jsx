import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Box, 
  Typography, 
  TextField, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert,
  Stack,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CustomerOrderCards from './CustomerOrderCards';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to Date object if it exists
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        setOrders(ordersList);
        setFilteredOrders(ordersList);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      }
    };

    fetchOrders();
  }, []);

  // Validate date range and filter orders
  const applyDateFilter = () => {
    setError('');
    
    // Validate date range (not more than 5 months)
    const fiveMonthsAgo = subMonths(new Date(), 5);
    
    if (startDate > endDate) {
      setError('Start date cannot be after end date');
      return;
    }
    
    if (startDate < fiveMonthsAgo) {
      setError('Date range cannot exceed 5 months');
      return;
    }

    // Filter orders within the selected date range
    const filtered = orders.filter(order => {
      const orderDate = order.createdAt;
      return isWithinInterval(orderDate, {
        start: startDate,
        end: endDate
      });
    });

    setFilteredOrders(filtered);
  };

  // Handle date changes
  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate(subMonths(new Date(), 1));
    setEndDate(new Date());
    setFilteredOrders(orders);
    setError('');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Orders
        </Typography>
        
        {/* Date Range Filter */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter Orders by Date Range
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              maxDate={new Date()}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              maxDate={new Date()}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <Button 
              variant="contained" 
              onClick={applyDateFilter}
              sx={{ minWidth: '120px' }}
            >
              Apply Filter
            </Button>
            <Button 
              variant="outlined" 
              onClick={resetFilters}
              sx={{ minWidth: '120px' }}
            >
              Reset
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {isMobileView ? (
          <CustomerOrderCards filteredOrders={filteredOrders} />
        ) : (
          <Paper elevation={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell>Order Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.productName}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          ₱{order.totalPrice?.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </TableCell>
                        <TableCell>
                          {order.createdAt ? format(order.createdAt, 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: 'white',
                              backgroundColor: 
                                order.status === 'completed' 
                                  ? 'success.main' 
                                  : order.status === 'cancelled' 
                                  ? 'error.main' 
                                  : 'warning.main',
                              borderRadius: 1,
                              px: 1,
                              display: 'inline-block',
                              textTransform: 'capitalize'
                            }}
                          >
                            {order.status || 'pending'}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.notes || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          No orders found for the selected date range
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Orders;