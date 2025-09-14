import React, { useState, useEffect } from 'react'
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material'
import { Add, Edit, Delete, Event } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, getDocs } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import ImageUploader from '../components/ImageUploader'

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: 24 }}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const initialProductFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: 'Premium'
}

const initialUserFormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  role: 'user'
}

const Admin = () => {
  const { currentUser, isAdmin, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [startDate, setStartDate] = useState(startOfDay(new Date()))
  const [endDate, setEndDate] = useState(endOfDay(new Date()))

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!isAdmin()) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Access Denied. You don't have permission to view this page.
        </Typography>
      </Box>
    )
  }
  const [tab, setTab] = useState(0)
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState(initialProductFormState)
  const [userFormData, setUserFormData] = useState(initialUserFormState)
  const [open, setOpen] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingUser, setEditingUser] = useState(false)
  const [editingDocPath, setEditingDocPath] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [announcement, setAnnouncement] = useState('');
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // Fetch announcement
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoadingAnnouncement(true);
        const q = collection(db, 'announcement');
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const announcementDoc = querySnapshot.docs[0].data();
          setAnnouncement(announcementDoc.message || '');
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load announcement',
          severity: 'error'
        });
      } finally {
        setLoadingAnnouncement(false);
      }
    };

    fetchAnnouncement();
  }, []);

  // Fetch products, users, and orders
  useEffect(() => {
    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({
        ...doc.data(),
        _docPath: doc.ref.path
      }))
      setProducts(productsList)
    })

    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        ...doc.data(),
        _docPath: doc.ref.path
      }))
      setUsers(usersList)
    })

    const ordersUnsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        _docPath: doc.ref.path
      }))
      setOrders(ordersList)
      filterOrdersByDate(ordersList, startDate, endDate)
    })

    return () => {
      productsUnsubscribe()
      usersUnsubscribe()
      ordersUnsubscribe && ordersUnsubscribe()
    }
  }, [startDate, endDate])

  const filterOrdersByDate = (ordersList, start, end) => {
    const filtered = ordersList.filter(order => {
      const orderDate = order.createdAt?.toDate() || new Date()
      return isWithinInterval(orderDate, {
        start: startOfDay(start),
        end: endOfDay(end)
      })
    })
    setFilteredOrders(filtered)
  }

  const handleDateChange = (type, date) => {
    if (type === 'start') {
      setStartDate(date)
    } else {
      setEndDate(date)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      })
      setSnackbar({
        open: true,
        message: `${orderId.substring(0, 8)}... status has been updated!`,
        severity: 'success'
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      setSnackbar({
        open: true,
        message: 'Failed to update order status',
        severity: 'error'
      })
    }
  }

  const handleChange = (event, newValue) => {
    setTab(newValue)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }))
  }

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category: formData.category,
        updatedAt: serverTimestamp(),
        ...(!editing && { 
          imageUrl: formData.imageUrl || '',
          createdAt: serverTimestamp() 
        })
      };
      
      // Only include imageUrl when editing if a new image was uploaded
      if (editing && formData.imageUrl) {
        productData.imageUrl = formData.imageUrl;
      }

      if (editing) {
        await updateDoc(doc(db, editingDocPath), productData)
      } else {
        await addDoc(collection(db, 'products'), productData)
      }

      handleClose()
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category
    })
    setEditingDocPath(product._docPath)
    setEditing(true)
    setOpen(true)
  }

  const handleDelete = async (docPath) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, docPath))
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const handleClose = () => {
    setOpen(false)
    setFormData(initialProductFormState)
    setEditing(false)
    setEditingDocPath(null)
  }

  const handleUserDialogClose = () => {
    setUserDialogOpen(false)
    setUserFormData(initialUserFormState)
    setEditingUser(false)
    setEditingDocPath(null)
  }

  const handleUserInputChange = (e) => {
    const { name, value } = e.target
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUserEdit = (user) => {
    setUserFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'customer'
    })
    setEditingDocPath(user._docPath)
    setEditingUser(true)
    setUserDialogOpen(true)
  }

  const handleUserDelete = async (docPath) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, docPath))
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const userData = {
        ...userFormData,
        updatedAt: serverTimestamp(),
        ...(!editingUser && { createdAt: serverTimestamp() })
      }

      if (editingUser) {
        await updateDoc(doc(db, editingDocPath), userData)
      } else {
        await addDoc(collection(db, 'users'), userData)
      }

      handleUserDialogClose()
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateAnnouncement = async () => {
    if (!announcement.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter an announcement message',
        severity: 'warning'
      });
      return;
    }

    try {
      setLoadingAnnouncement(true);
      // Get the first document in the collection
      const querySnapshot = await getDocs(collection(db, 'announcement'));
      let docRef;
      
      if (querySnapshot.empty) {
        // If no document exists, create a new one
        docRef = await addDoc(collection(db, 'announcement'), {
          message: announcement.trim(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update the existing document
        const docToUpdate = querySnapshot.docs[0];
        docRef = doc(db, 'announcement', docToUpdate.id);
        await updateDoc(docRef, {
          message: announcement.trim(),
          updatedAt: serverTimestamp()
        });
      }

      setSnackbar({
        open: true,
        message: 'Announcement updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update announcement',
        severity: 'error'
      });
    } finally {
      setLoadingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    try {
      setLoadingAnnouncement(true);
      // Get the first document in the collection
      const querySnapshot = await getDocs(collection(db, 'announcement'));
      
      if (!querySnapshot.empty) {
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(doc(db, 'announcement', docToDelete.id));
      }
      
      setAnnouncement('');
      setSnackbar({
        open: true,
        message: 'Announcement cleared successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setSnackbar({
        open: true,
        message: 'Failed to clear announcement',
        severity: 'error'
      });
    } finally {
      setLoadingAnnouncement(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Box sx={{ width: '100%' }}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 1,
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 700,
          letterSpacing: '1px',
          color: '#fff',
          textShadow: '0 0 10px #000',
        }}
      >
        Admin Dashboard
      </Typography>
    </Box>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleChange} aria-label="admin tabs">
            <Tab label="PRODUCTS" />
            <Tab label="ORDERS" />
            <Tab label="USERS" />
            <Tab label="ANNOUNCEMENT" />
          </Tabs>
        </Box>

        <TabPanel value={tab} index={0}>
          {/* Products tab content */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
            >
              Add Product
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Added</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._docPath || product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₱{product.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {product.createdAt?.toDate ? product.createdAt.toDate().toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {product.updatedAt?.toDate ? product.updatedAt.toDate().toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(product)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(product._docPath)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          {/* Orders tab content */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(date) => handleDateChange('start', date)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(date) => handleDateChange('end', date)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <Button
              variant="contained"
              startIcon={<Event />}
              onClick={() => {
                const today = new Date()
                setStartDate(startOfDay(today))
                setEndDate(endOfDay(today))
              }}
            >
              Today
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Status</TableCell>
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
                        {order.createdAt ? format(order.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" variant="outlined" fullWidth>
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="textSecondary">
                        No orders found for the selected date range
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          {/* Users tab content */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setUserFormData(initialUserFormState)
                setEditingUser(false)
                setUserDialogOpen(true)
              }}
            >
              Add User
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._docPath}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => {
                        setUserFormData({
                          name: user.name || '',
                          email: user.email || '',
                          phone: user.phone || '',
                          address: user.address || '',
                          role: user.role || 'user'
                        })
                        setEditingUser(true)
                        setEditingDocPath(user._docPath)
                        setUserDialogOpen(true)
                      }}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(user._docPath)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>Manage Announcement</Typography>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Announcement Message"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleUpdateAnnouncement}
                  disabled={loadingAnnouncement}
                >
                  {loadingAnnouncement ? <CircularProgress size={24} /> : 'Update'}
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleDeleteAnnouncement}
                  disabled={loadingAnnouncement || !announcement}
                >
                  {loadingAnnouncement ? <CircularProgress size={24} /> : 'Clear'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </TabPanel>

        {/* Add/Edit Product Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <ImageUploader onUpload={handleImageUpload} />
              </Box>
              <TextField
                margin="normal"
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                type="number"
                label="Price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: '0.01' }}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                type="number"
                label="Stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                SelectProps={{ native: true }}
                required
              >
                <option value="Premium">Premium</option>
                <option value="Regular">Regular</option>
                <option value="Special">Special</option>
              </TextField>

            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} disabled={uploading}>
                Cancel
              </Button>
              <Button type="submit" color="primary" variant="contained" disabled={uploading}>
                {uploading ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Add/Edit User Dialog */}
        <Dialog open={userDialogOpen} onClose={handleUserDialogClose} maxWidth="sm" fullWidth>
          <form onSubmit={handleUserSubmit}>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogContent>
              <TextField
                margin="normal"
                fullWidth
                label="Name"
                name="name"
                value={userFormData.name}
                onChange={handleUserInputChange}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userFormData.email}
                onChange={handleUserInputChange}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                label="Phone"
                name="phone"
                value={userFormData.phone}
                onChange={handleUserInputChange}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                multiline
                rows={2}
                label="Address"
                name="address"
                value={userFormData.address}
                onChange={handleUserInputChange}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                select
                label="Role"
                name="role"
                value={userFormData.role}
                onChange={handleUserInputChange}
                SelectProps={{ native: true }}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleUserDialogClose} disabled={uploading}>
                Cancel
              </Button>
              <Button type="submit" color="primary" variant="contained" disabled={uploading}>
                {uploading ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </LocalizationProvider>
    </Box>
  )
}

export default Admin