import { useEffect, useMemo, useState } from 'react'
import { Box, Card, CardContent, Stack, Typography, Button, Chip, Alert, CircularProgress } from '@mui/material'
import { getJson, patchJson } from '../../services/api'
import { useAuth } from '../../state/AuthContext'

type Order = {
  _id: string
  status: 'pending'|'accepted'|'rejected'
  address: string
  contact?: string
  date?: string
  time?: string
  items: Array<{ productId: string; name: string; SKU?: string; price: number; quantity: number }>
  createdAt: string
}

export default function OrdersPage() {
  const { state } = useAuth()
  const token = state.accessToken
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const res = await getJson<{ orders: Order[] }>(`/orders`, token)
      setOrders(res.orders)
    } catch (e: any) {
      setError(e?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  async function setStatus(id: string, status: 'accepted'|'rejected') {
    if (!token) return
    await patchJson(`/orders/${id}/status`, { status }, token)
    await load()
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Orders</Typography>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No orders yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {orders.map(o => (
            <Card key={o._id}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Stack>
                    <Typography variant="subtitle1">{o.address}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(o.createdAt).toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Items: {o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={o.status} color={o.status === 'accepted' ? 'success' : o.status === 'pending' ? 'warning' : 'default'} />
                    <Button size="small" variant="contained" disabled={o.status !== 'pending'} onClick={() => void setStatus(o._id, 'accepted')}>Accept</Button>
                    <Button size="small" variant="outlined" color="warning" disabled={o.status !== 'pending'} onClick={() => void setStatus(o._id, 'rejected')}>Reject</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}


