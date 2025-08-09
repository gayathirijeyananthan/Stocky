import { useEffect, useRef, useState } from 'react'
import { Box, Card, CardContent, Tab, Tabs, Typography, Button, Stack, Badge, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
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
  const approvalStatusRef = useRef<'pending' | 'active' | 'unknown'>(approvalStatus)
  const [loading, setLoading] = useState(true)
  const [openProduct, setOpenProduct] = useState(false)
  const [productForm, setProductForm] = useState({ name: '', SKU: '', price: '', warehouseStock: '' })
  const [products, setProducts] = useState<Array<{ id: string; name: string; SKU: string; price: number; warehouseStock: number; expiryDate?: string; createdAt?: string }>>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let interval: number | undefined
    // track only via ref to avoid repeated renders

    async function fetchCompany(showSpinner: boolean) {
      try {
        if (showSpinner) setLoading(true)
        const res = await getJson<{ company: { status: 'pending'|'active'|'inactive' } | null }>(
          '/companies/me',
          token
        )
        if (!mounted) return
        const newStatus: 'pending' | 'active' = res.company && res.company.status === 'active' ? 'active' : 'pending'
        if (approvalStatusRef.current !== newStatus) {
          approvalStatusRef.current = newStatus
          setApprovalStatus(newStatus)
        }
        // Stop polling once approved
        if (newStatus === 'active' && interval != null) {
          clearInterval(interval)
          interval = undefined
        }
      } catch {
        if (mounted && approvalStatusRef.current !== 'pending') {
          approvalStatusRef.current = 'pending'
          setApprovalStatus('pending')
        }
      } finally {
        if (mounted && showSpinner) setLoading(false)
      }
    }

    // Initial fetch with spinner only when status unknown (first mount)
    void fetchCompany(approvalStatusRef.current === 'unknown')
    // Poll silently until approved
    interval = window.setInterval(() => void fetchCompany(false), 6000)

    return () => {
      mounted = false
      if (interval != null) clearInterval(interval)
    }
  }, [token])

  // Load products once company is active
  useEffect(() => {
    if (approvalStatus !== 'active' || !token) return
    void loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalStatus, token])

  async function loadProducts() {
    if (!token) return
    try {
      setProductsError(null)
      setProductsLoading(true)
      const res = await getJson<{ products: Array<{ _id: string; name: string; SKU: string; price: number; warehouseStock: number; expiryDate?: string; createdAt?: string }> }>(
        '/products',
        token
      )
      setProducts(
        res.products.map((p) => ({
          id: p._id,
          name: p.name,
          SKU: p.SKU,
          price: p.price,
          warehouseStock: p.warehouseStock,
          expiryDate: p.expiryDate,
          createdAt: p.createdAt,
        }))
      )
    } catch (e: any) {
      setProductsError(e?.message || 'Failed to load products')
    } finally {
      setProductsLoading(false)
    }
  }
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
      <Tabs value={value} onChange={(_e, v) => setValue(v)} aria-label="company tabs" variant="scrollable" allowScrollButtonsMobile sx={{ bgcolor: 'white', borderRadius: 2, px: 1 }}>
        <Tab label="Stores" id="tab-0" />
        <Tab label="Products" id="tab-1" />
        <Tab label="Deliveries" id="tab-2" />
        <Tab label={<Badge color="error" badgeContent={3}>Shop Requests</Badge>} id="tab-3" />
        <Tab label={<Badge color="warning" badgeContent={5}>Restock Requests</Badge>} id="tab-4" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}><CardContent><Typography>Stores table (sortable, filterable)</Typography></CardContent></Card>
      </TabPanel>
      <TabPanel value={value} index={1}>
        {productsError && <Alert severity="error" sx={{ mb: 2 }}>{productsError}</Alert>}
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          <CardContent>
            <div style={{ height: 480, width: '100%' }}>
              <DataGrid
                rows={products}
                loading={productsLoading}
                columns={productColumns}
                pageSizeOptions={[5, 10, 20]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              />
            </div>
          </CardContent>
        </Card>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}><CardContent><Typography>Deliveries list and create modal</Typography></CardContent></Card>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}><CardContent><Typography>Shop access requests</Typography></CardContent></Card>
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}><CardContent><Typography>Restock requests</Typography></CardContent></Card>
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
              await loadProducts()
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

const productColumns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
  { field: 'SKU', headerName: 'SKU', width: 140 },
  { field: 'price', headerName: 'Price', width: 120, valueFormatter: (p: any) => `$${Number((p?.value as number) ?? 0).toFixed(2)}` },
  { field: 'warehouseStock', headerName: 'Stock', width: 120 },
  { field: 'expiryDate', headerName: 'Expiry', width: 160, valueGetter: (p: any) => (p.row?.expiryDate ? new Date(p.row.expiryDate).toLocaleDateString() : '') },
  { field: 'createdAt', headerName: 'Created', width: 180, valueGetter: (p: any) => (p.row?.createdAt ? new Date(p.row.createdAt).toLocaleString() : '') },
]


