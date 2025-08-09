import { Card, CardContent, Typography, Stack, Button, Box } from '@mui/material'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from 'recharts'

const data = [
  { name: 'Mon', companies: 2, shops: 8 },
  { name: 'Tue', companies: 3, shops: 12 },
  { name: 'Wed', companies: 4, shops: 16 },
  { name: 'Thu', companies: 3, shops: 14 },
  { name: 'Fri', companies: 5, shops: 20 },
]

export default function SuperAdminDashboard() {
  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
        <Typography variant="h5">Super Admin Dashboard</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">Companies</Button>
          <Button variant="outlined">Shops</Button>
          <Button variant="outlined">Products</Button>
          <Button variant="outlined">Payments</Button>
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
          <Typography variant="h4">768</Typography>
        </CardContent></Card>
        <Card sx={{ borderRadius: 3 }}><CardContent>
          <Typography variant="subtitle2" color="text.secondary">Pending Approvals</Typography>
          <Typography variant="h4">12</Typography>
        </CardContent></Card>
      </Box>

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


