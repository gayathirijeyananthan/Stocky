import { useEffect, useState } from 'react'
import { Box, Card, CardContent, Tab, Tabs, Typography, Button, Stack, Badge, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { postJson } from '../../services/api'
import { getJson } from '../../services/api'
import { useAuth } from '../../state/AuthContext'

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export default function CompanyDashboard() {
  const [value, setValue] = useState(0)
  const { state } = useAuth()
  const token = state.accessToken
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'active' | 'unknown'>('unknown')
  const [loading, setLoading] = useState(true)
  const [openProduct, setOpenProduct] = useState(false)
  const [productForm, setProductForm] = useState({ name: '', SKU: '', price: '', warehouseStock: '' })

  useEffect(() => {
    let mounted = true
    async function fetchCompany() {
      try {
        setLoading(true)
        const res = await getJson<{ company: { status: 'pending'|'active'|'inactive' } | null }>(
          '/companies/me',
          token
        )
        if (!mounted) return
        if (!res.company) {
          setApprovalStatus('pending')
        } else {
          setApprovalStatus(res.company.status === 'active' ? 'active' : 'pending')
        }
      } catch {
        if (mounted) setApprovalStatus('pending')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchCompany()
    const interval = setInterval(fetchCompany, 6000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [token])
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '50vh' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Checking approval status…</Typography>
        </Stack>
      </Box>
    )
  }

  if (approvalStatus !== 'active') {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Your company is awaiting Super Admin approval. This page will update automatically.
        </Alert>
        <Card>
          <CardContent>
            <Typography variant="h6">Pending Approval</Typography>
            <Typography color="text.secondary">Once approved, your full dashboard will appear here.</Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Company Dashboard</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setOpenProduct(true)}>New Product</Button>
          <Button variant="outlined">New Store</Button>
        </Stack>
      </Stack>
      <Tabs value={value} onChange={(_e, v) => setValue(v)} aria-label="company tabs" variant="scrollable" allowScrollButtonsMobile>
        <Tab label="Stores" id="tab-0" />
        <Tab label="Products" id="tab-1" />
        <Tab label="Deliveries" id="tab-2" />
        <Tab label={<Badge color="error" badgeContent={3}>Shop Requests</Badge>} id="tab-3" />
        <Tab label={<Badge color="warning" badgeContent={5}>Restock Requests</Badge>} id="tab-4" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Card><CardContent><Typography>Stores table (sortable, filterable)</Typography></CardContent></Card>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Card><CardContent><Typography>Products table with stock and expiry</Typography></CardContent></Card>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Card><CardContent><Typography>Deliveries list and create modal</Typography></CardContent></Card>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Card><CardContent><Typography>Shop access requests</Typography></CardContent></Card>
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Card><CardContent><Typography>Restock requests</Typography></CardContent></Card>
      </TabPanel>
      <Dialog open={openProduct} onClose={() => setOpenProduct(false)}>
        <DialogTitle>New Product</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1, width: { xs: 280, sm: 420 } }}>
            <TextField label="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            <TextField label="SKU" value={productForm.SKU} onChange={(e) => setProductForm({ ...productForm, SKU: e.target.value })} required />
            <Stack direction="row" spacing={2}>
              <TextField label="Price" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
              <TextField label="Warehouse Stock" type="number" value={productForm.warehouseStock} onChange={(e) => setProductForm({ ...productForm, warehouseStock: e.target.value })} required />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProduct(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            try {
              await createProduct(token, productForm)
              setOpenProduct(false)
              setProductForm({ name: '', SKU: '', price: '', warehouseStock: '' })
              setValue(1)
            } catch (e) {
              // could show snackbar
            }
          }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

async function createProduct(token: string | undefined, form: { name: string; SKU: string; price: string; warehouseStock: string }) {
  if (!token) throw new Error('Not authenticated')
  const payload = {
    name: form.name,
    SKU: form.SKU,
    price: Number(form.price),
    warehouseStock: Number(form.warehouseStock),
  }
  return postJson('/products', payload, token)
}


