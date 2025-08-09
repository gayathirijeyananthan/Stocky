import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Card, CardContent, Chip, Stack, Typography, Alert, Button } from '@mui/material'
import { useAuth } from '../../state/AuthContext'
import { useCart } from '../../state/CartContext'
import { Snackbar } from '@mui/material'
import { getJson } from '../../services/api'

type Company = { _id: string; name: string; address?: string; contact?: string; status: 'pending'|'active'|'inactive' }
type Product = { _id: string; name: string; SKU: string; price: number; warehouseStock: number; expiryDate?: string }

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state } = useAuth()
  const token = state.accessToken
  const { addToCart } = useCart()
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })
  const [company, setCompany] = useState<Company | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token || !id) return
      try {
        setLoading(true)
        setError(null)
        const res = await getJson<{ company: Company }>(`/companies/${id}/public`, token)
        if (!mounted) return
        setCompany(res.company)
        const prod = await getJson<{ products: Product[] }>(`/companies/${id}/products/public`, token)
        if (!mounted) return
        setProducts(prod.products)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load company')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [token, id])

  if (loading) return <Typography>Loading…</Typography>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!company) return <Typography>Company not found.</Typography>

  return (
    <>
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <div>
              <Typography variant="h5">{company.name}</Typography>
              <Typography variant="body2" color="text.secondary">{company.address || 'No address'}</Typography>
              <Typography variant="body2" color="text.secondary">{company.contact || 'No contact'}</Typography>
            </div>
            <Chip size="small" label={company.status} color={company.status === 'active' ? 'success' : company.status === 'pending' ? 'warning' : 'default'} />
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 1 }}>Products</Typography>
      {products.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No products to show.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {products.map(p => (
            <Card key={p._id}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">{p.name}</Typography>
                  <Typography variant="body2" color="text.secondary">SKU: {p.SKU}</Typography>
                  <Typography variant="body2" color="text.secondary">Price: ${p.price}</Typography>
                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => {
                      const res = addToCart({ productId: p._id, name: p.name, price: p.price, SKU: p.SKU, companyId: company?._id })
                      setSnack({ open: true, message: res.added ? 'Added to cart' : 'Item already in cart', severity: res.added ? 'success' : 'error' })
                    }}>Add to Cart</Button>
                    <Button size="small" variant="contained" disabled={p.warehouseStock <= 0}>Order</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
    <Snackbar
      open={snack.open}
      autoHideDuration={2000}
      onClose={() => setSnack({ open: false, message: '', severity: 'success' })}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity={snack.severity}
        icon={false}
        variant="filled"
        sx={{
          px: 1.5,
          py: 0.5,
          fontSize: 14,
          bgcolor: snack.severity === 'success' ? 'success.main' : 'error.main',
          color: 'common.white',
        }}
      >
        {snack.message}
      </Alert>
    </Snackbar>
    </>
  )
}


