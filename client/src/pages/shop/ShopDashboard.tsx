import { Grid, Card, CardContent, Typography, Chip, Button, Stack } from '@mui/material'

const products = [
  { name: 'Apples', stock: 12, expiry: '2025-08-01' },
  { name: 'Milk', stock: 2, expiry: '2025-03-05' },
  { name: 'Eggs', stock: 0, expiry: '2025-04-10' },
  { name: 'Bread', stock: 7, expiry: '2025-03-12' },
]

function stockColor(stock: number) {
  if (stock === 0) return 'error'
  if (stock < 5) return 'warning'
  return 'success'
}

export default function ShopDashboard() {
  return (
    <div>
      <Typography variant="h5" gutterBottom>My Stock</Typography>
      <Grid container spacing={2}>
        {products.map((p) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={p.name}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">{p.name}</Typography>
                  <Chip label={`${p.stock}`} color={stockColor(p.stock) as any} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Expiry: {p.expiry}</Typography>
                <Button variant="contained" size="small" sx={{ mt: 1 }} disabled={p.stock > 0}>Request Restock</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}


