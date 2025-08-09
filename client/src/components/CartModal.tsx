import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, CardContent, IconButton, Stack, Typography, TextField, Snackbar, Alert } from '@mui/material'
import { useState } from 'react'
import OrderDialog from './OrderDialog'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import { useCart } from '../state/CartContext'
import { useAuth } from '../state/AuthContext'
import { postJson } from '../services/api'

export default function CartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, totalItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const { state } = useAuth()
  const token = state.accessToken
  const totalPrice = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>(() => ({ open: false, msg: '' }))
  const [orderOpen, setOrderOpen] = useState(false)
  const companyId = items[0]?.companyId

  return (
    <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>My Cart ({totalItems})</DialogTitle>
      <DialogContent dividers>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Your cart is empty.</Typography>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {items.map(it => (
              <Card key={it.productId} variant="outlined">
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
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={clearCart} disabled={items.length === 0} color="inherit">Clear</Button>
        <Button onClick={onClose} color="inherit">Close</Button>
        <Button variant="contained" disabled={items.length === 0} onClick={() => setOrderOpen(true)}>Order</Button>
      </DialogActions>
    </Dialog>
    <OrderDialog
      open={orderOpen}
      onClose={() => setOrderOpen(false)}
      onSubmit={async (payload) => {
        try {
          const body = {
            companyId,
            items: items.map(it => ({ productId: it.productId, quantity: it.quantity })),
            ...payload,
          }
          await postJson('/orders', body, token)
          setOrderOpen(false)
          clearCart()
        } catch (e) {
          setSnack({ open: true, msg: 'Failed to submit order' })
        }
      }}
    />
    <Snackbar
      open={snack.open}
      autoHideDuration={2000}
      onClose={() => setSnack({ open: false, msg: '' })}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="success" variant="filled" icon={false} sx={{ px: 1.5, py: 0.5, fontSize: 14 }}>
        Order placed. Check your email.
      </Alert>
    </Snackbar>
    </>
  )
}


