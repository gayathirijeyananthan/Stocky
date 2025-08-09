import { Card, CardContent, Typography, Stack, Button, Box, Chip, Divider } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from 'recharts'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../state/AuthContext'
import { getJson } from '../../services/api'

const data = [
  { name: 'Mon', companies: 2, shops: 8 },
  { name: 'Tue', companies: 3, shops: 12 },
  { name: 'Wed', companies: 4, shops: 16 },
  { name: 'Thu', companies: 3, shops: 14 },
  { name: 'Fri', companies: 5, shops: 20 },
]

type ShopRow = { id: string; name: string; status: 'pending'|'active'|'inactive'; createdAt?: string; ownerEmail?: string }

export default function SuperAdminDashboard() {
  const { state } = useAuth()
  const token = state.accessToken
  const [shops, setShops] = useState<ShopRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) return
      try {
        setLoading(true)
        setError(null)
        const res = await getJson<{ shops: ShopRow[] }>(`/shops`, token)
        if (!mounted) return
        setShops(res.shops)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load shops')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [token])

  const totalShops = shops.length
  const pendingShops = useMemo(() => shops.filter(s => s.status === 'pending').length, [shops])

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
        <Typography variant="h5">Super Admin Dashboard</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">Companies</Button>
          <Button variant="outlined" component={RouterLink} to="/admin/shops">Shops</Button>
          <Button variant="outlined">Products</Button>
          <Button variant="outlined">Payments</Button>
          <Button variant="contained" component={RouterLink} to="/profile">Profile</Button>
        </Stack>
      </Stack>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
        mb: 2,
      }}>
        <Card sx={{ borderRadius: 3 }}><CardContent>
          <Typography variant="subtitle2" color="text.secondary">Total Companies</Typography>
          <Typography variant="h4">128</Typography>
        </CardContent></Card>
        <Card sx={{ borderRadius: 3 }}><CardContent>
          <Typography variant="subtitle2" color="text.secondary">Total Shops</Typography>
          <Typography variant="h4">{loading ? '…' : totalShops}</Typography>
        </CardContent></Card>
        <Card sx={{ borderRadius: 3 }}><CardContent>
          <Typography variant="subtitle2" color="text.secondary">Pending Approvals</Typography>
          <Typography variant="h4">{loading ? '…' : pendingShops}</Typography>
        </CardContent></Card>
      </Box>

      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">Recent Shops</Typography>
            <Button size="small" component={RouterLink} to="/admin/shops">Manage</Button>
          </Stack>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Stack divider={<Divider flexItem />}>
              {(loading ? [] : shops.slice(0, 5)).map(s => (
                <Stack key={s.id} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ py: 1 }}>
                  <Stack spacing={0.5}>
                    <Typography>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.ownerEmail || '—'}</Typography>
                  </Stack>
                  <Chip size="small" label={s.status} color={s.status === 'active' ? 'success' : s.status === 'pending' ? 'warning' : 'default'} />
                </Stack>
              ))}
              {!loading && shops.length === 0 && (
                <Typography variant="body2" color="text.secondary">No shops yet.</Typography>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Platform Growth</Typography>
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RTooltip />
                <Line type="monotone" dataKey="companies" stroke="#1976d2" strokeWidth={2} />
                <Line type="monotone" dataKey="shops" stroke="#2e7d32" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}


