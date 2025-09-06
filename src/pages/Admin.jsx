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
  CircularProgress
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
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

  // Fetch products and users
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

    return () => {
      productsUnsubscribe()
      usersUnsubscribe()
    }
  }, [])

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
        imageUrl: formData.imageUrl || '', // Include imageUrl, default to empty string if not set
        updatedAt: serverTimestamp(),
        ...(!editing && { createdAt: serverTimestamp() })
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

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Admin Dashboard</Typography>
      <Tabs value={tab} onChange={handleChange} aria-label="admin tabs">
        <Tab label="Products" />
        <Tab label="Users" />
      </Tabs>
      
      <TabPanel value={tab} index={0}>
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
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={() => setUserDialogOpen(true)}
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
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Added</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._docPath}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleUserEdit(user)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleUserDelete(user._docPath)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <ImageUploader onUpload={handleImageUpload}/>
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
    </Box>
  )
}

export default Admin