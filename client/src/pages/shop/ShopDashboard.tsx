import { Card, CardContent, Typography, Button, Stack, Box, Alert } from '@mui/material'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'
import { useEffect, useState } from 'react'
import { getJson } from '../../services/api'

export default function ShopDashboard() {
  const { state } = useAuth()
  if (state.user?.shopStatus && state.user.shopStatus !== 'active') {
    return <Navigate to="/shop/pending" replace />
  }
  const token = state.accessToken
  const [companies, setCompanies] = useState<Array<{ _id: string; name: string }>>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) return
      try {
        setLoadingCompanies(true)
        setError(null)
        const res = await getJson<{ companies: Array<{ _id: string; name: string }> }>(`/companies/public`, token)
        if (!mounted) return
        setCompanies(res.companies)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load companies')
      } finally {
        if (mounted) setLoadingCompanies(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [token])
  return (
    <div>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" gutterBottom>Available Companies</Typography>
        <Button variant="outlined" component={RouterLink} to="/profile">Profile</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {loadingCompanies ? (
          <Typography>Loading companies…</Typography>
        ) : companies.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No companies available yet.</Typography>
        ) : (
          companies.map((c) => (
            <Card key={c._id}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">{c.name}</Typography>
                  <Button size="small" variant="outlined" component={RouterLink} to={`/shop/companies/${c._id}`}>View</Button>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </div>
  )
}


