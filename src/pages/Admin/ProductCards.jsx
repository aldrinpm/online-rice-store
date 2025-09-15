import { Grid, Card, CardContent, Typography, IconButton, Box, CardActions } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const ProductCards = ({ products, handleEdit, handleDelete }) => {
  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product._docPath || product.id}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: 3, 
              transition: 'transform 0.2s ease-in-out', 
              '&:hover': { transform: 'scale(1.02)', boxShadow: 6 }
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>

              <Box mt={1}>
                <Typography variant="subtitle2" color="primary">
                  Category: {product.category}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  ₱{product.price?.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Typography>
                <Typography variant="body2">Stock: {product.stock}</Typography>
                <Typography variant="caption" display="block">
                  Added: {product.createdAt?.toDate ? product.createdAt.toDate().toLocaleString() : 'N/A'}
                </Typography>
                <Typography variant="caption" display="block">
                  Updated: {product.updatedAt?.toDate ? product.updatedAt.toDate().toLocaleString() : 'N/A'}
                </Typography>
              </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton onClick={() => handleEdit(product)} color="primary">
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDelete(product._docPath)} color="error">
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductCards;
