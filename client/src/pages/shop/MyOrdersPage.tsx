import { useEffect, useState } from 'react'
import { Box, Card, CardContent, Chip, Stack, Typography, Alert, CircularProgress, Divider } from '@mui/material'
import { useAuth } from '../../state/AuthContext'
import { getJson } from '../../services/api'

type Order = {
  _id: string
  status: 'pending'|'accepted'|'rejected'|'delivered'
  address: string
  contact?: string
  date?: string
  time?: string
  items: Array<{ name: string; quantity: number }>
  createdAt: string
  company?: { name?: string; address?: string; contact?: string }
}

export default function MyOrdersPage() {
  const { state } = useAuth()
  const token = state.accessToken
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) return
      try {
        setLoading(true)
        setError(null)
        const res = await getJson<{ orders: Order[] }>(`/orders/mine`, token)
        if (!mounted) return
        setOrders(res.orders)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load orders')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [token])

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>My Orders</Typography>
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
                <Stack spacing={1.5}>
                  {/* Header: Company + Status */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    <Stack spacing={0.3}>
                      <Typography variant="subtitle1" fontWeight={600}>{o.company?.name || 'Company'}</Typography>
                      <Typography variant="caption" color="text.secondary">{o.company?.address || 'No address'}</Typography>
                      {o.company?.contact && <Typography variant="caption" color="text.secondary">{o.company.contact}</Typography>}
                    </Stack>
                    <Chip size="small" label={o.status} color={o.status === 'delivered' ? 'success' : o.status === 'accepted' ? 'info' : o.status === 'pending' ? 'warning' : 'default'} />
                  </Stack>
                  <Divider />
                  {/* Content grid: Delivery (left) | Items (right) */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="overline" color="text.secondary">Delivery</Typography>
                      <Typography variant="body2">{o.address}</Typography>
                      {o.contact && <Typography variant="body2">Contact: {o.contact}</Typography>}
                      {(o.date || o.time) && (
                        <Typography variant="body2">Preferred: {[o.date, o.time].filter(Boolean).join(' ')}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">Placed: {new Date(o.createdAt).toLocaleString()}</Typography>
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography variant="overline" color="text.secondary">Items</Typography>
                      <Stack spacing={0.5}>
                        {o.items.map((i, idx) => (
                          <Stack key={`${o._id}-item-${idx}`} direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">{i.name}</Typography>
                            <Typography variant="body2" color="text.secondary">x{i.quantity}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}


