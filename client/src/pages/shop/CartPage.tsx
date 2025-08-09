import { Box, Button, Card, CardContent, IconButton, Stack, Typography, TextField, Snackbar, Alert } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import { useCart } from '../../state/CartContext'

export default function CartPage() {
  const { items, totalItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const totalPrice = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string }>(() => ({ open: false, msg: '' }))

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
        <Typography variant="h5">My Cart</Typography>
        <Typography variant="body2" color="text.secondary">{totalItems} items</Typography>
      </Stack>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Your cart is empty.</Typography>
      ) : (
        <Stack spacing={2}>
          {items.map(it => (
            <Card key={it.productId}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                  <Stack>
                    <Typography variant="subtitle1">{it.name}</Typography>
                    {it.SKU && <Typography variant="caption" color="text.secondary">SKU: {it.SKU}</Typography>}
                    <Typography variant="body2" color="text.secondary">${it.price.toFixed(2)} each</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton size="small" onClick={() => updateQuantity(it.productId, it.quantity - 1)} aria-label="decrement">
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      type="number"
                      size="small"
                      value={it.quantity}
                      onChange={(e) => {
                        const raw = e.target.value
                        const parsed = Number.parseInt(raw || '0', 10)
                        const next = Number.isFinite(parsed) ? parsed : 0
                        if (next < 50) {
                          setSnack({ open: true, msg: 'Please add quantity above 50' })
                        }
                        updateQuantity(it.productId, next)
                      }}
                      inputProps={{ min: 50, style: { width: 56, textAlign: 'center' } }}
                    />
                    <IconButton size="small" onClick={() => updateQuantity(it.productId, it.quantity + 1)} aria-label="increment">
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => removeFromCart(it.productId)} aria-label="remove">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Typography fontWeight={600}>${(it.price * it.quantity).toFixed(2)}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Typography variant="h6">Total: ${totalPrice.toFixed(2)}</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => clearCart()}>Clear</Button>
              <Button variant="contained" color="primary">Order</Button>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Box>
    <Snackbar
      open={snack.open}
      autoHideDuration={2000}
      onClose={() => setSnack({ open: false, msg: '' })}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="error" variant="filled" icon={false} sx={{ px: 1.5, py: 0.5, fontSize: 14 }}>
        {snack.msg}
      </Alert>
    </Snackbar>
  )
}


