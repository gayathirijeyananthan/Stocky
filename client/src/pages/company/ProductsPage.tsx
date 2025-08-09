import { useEffect, useState } from 'react'
import { Box, Card, CardContent, Typography, Stack, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { getJson, postJson, patchJson } from '../../services/api'
import { useAuth } from '../../state/AuthContext'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

type Product = {
  id: string
  name: string
  SKU: string
  price: number
  warehouseStock: number
  expiryDate?: string
  createdAt?: string
}

export default function ProductsPage() {
  const { state } = useAuth()
  const token = state.accessToken
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', SKU: '', price: '', warehouseStock: '', expiryDate: '' })
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', SKU: '', price: '', warehouseStock: '', expiryDate: '' })
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')

  useEffect(() => {
    void loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function loadProducts() {
    if (!token) return
    try {
      setError(null)
      setLoading(true)
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
      setError(e?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  async function onCreate() {
    if (!token) return
    try {
      const payload = {
        name: form.name,
        SKU: form.SKU,
        price: Number(form.price),
        warehouseStock: Number(form.warehouseStock),
        expiryDate: form.expiryDate || undefined,
      }
      await postJson('/products', payload, token)
      setOpen(false)
      setForm({ name: '', SKU: '', price: '', warehouseStock: '', expiryDate: '' })
      await loadProducts()
    } catch (e) {
      // Could surface error in a snackbar; keep simple for now
    }
  }

  function onEditClick(row: Product) {
    setEditId(row.id)
    setEditForm({
      name: row.name,
      SKU: row.SKU,
      price: String(row.price ?? ''),
      warehouseStock: String(row.warehouseStock ?? ''),
      expiryDate: row.expiryDate ? row.expiryDate.slice(0, 10) : '',
    })
    setEditOpen(true)
  }

  async function onEditSave() {
    if (!token || !editId) return
    try {
      const payload = {
        name: editForm.name,
        SKU: editForm.SKU,
        price: Number(editForm.price),
        warehouseStock: Number(editForm.warehouseStock),
        expiryDate: editForm.expiryDate || undefined,
      }
      await patchJson(`/products/${editId}`, payload, token)
      setEditOpen(false)
      setEditId(null)
      await loadProducts()
    } catch (e) {
      // optional: surface error
    }
  }

  async function onDelete(row: Product) {
    if (!token) return
    try {
      await fetch(`${(import.meta as any).env?.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1' : '/api/v1')}/products/${row.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      await loadProducts()
    } catch (e) {
      // optional: surface error
    }
  }

  const visibleProducts = (products || []).filter((p) => {
    const matchesSearch = [p.name, p.SKU].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
    const matchesStock = stockFilter === 'all'
      ? true
      : stockFilter === 'low'
      ? (p.warehouseStock ?? 0) > 0 && (p.warehouseStock ?? 0) < 5
      : (p.warehouseStock ?? 0) === 0
    return matchesSearch && matchesStock
  })

  return (
    <Box className="container-fluid px-0" sx={{ ml: '-2px' }}>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-2 gap-2">
        <h5 className="mb-0 fw-semibold">Products</h5>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>New Product</button>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card className="shadow-sm" sx={{ borderRadius: 2 }}>
        <CardContent className="p-3">
          <div className="row g-2 align-items-center mb-2">
            <div className="col-12 col-md-6 col-lg-4">
              <input className="form-control" placeholder="Search by name or SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-12 col-md-4 col-lg-3 ms-auto">
              <FormControl fullWidth size="small">
                <InputLabel id="stock-filter-label">Inventory</InputLabel>
                <Select labelId="stock-filter-label" label="Inventory" value={stockFilter} onChange={(e) => setStockFilter(e.target.value as any)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="low">Low stock (&lt; 5)</MenuItem>
                  <MenuItem value="out">Out of stock</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          <div style={{ height: 520, width: '100%' }}>
            <DataGrid
              rows={visibleProducts}
              loading={loading}
              columns={productColumns(onEditClick, onDelete)}
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
              }}
              density="compact"
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                  outline: 'none',
                },
                borderRadius: 2,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>New Product</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1, width: { xs: 280, sm: 420 } }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="SKU" value={form.SKU} onChange={(e) => setForm({ ...form, SKU: e.target.value })} required />
            <Stack direction="row" spacing={2}>
              <TextField label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <TextField label="Warehouse Stock" type="number" value={form.warehouseStock} onChange={(e) => setForm({ ...form, warehouseStock: e.target.value })} required />
            </Stack>
            <TextField label="Expiry Date" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1, width: { xs: 280, sm: 420 } }}>
            <TextField label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            <TextField label="SKU" value={editForm.SKU} onChange={(e) => setEditForm({ ...editForm, SKU: e.target.value })} required />
            <Stack direction="row" spacing={2}>
              <TextField label="Price" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
              <TextField label="Warehouse Stock" type="number" value={editForm.warehouseStock} onChange={(e) => setEditForm({ ...editForm, warehouseStock: e.target.value })} required />
            </Stack>
            <TextField label="Expiry Date" type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function productColumns(onEdit: (row: Product) => void, onDeleteRow: (row: Product) => Promise<void> | void): GridColDef[] {
  return [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'SKU', headerName: 'SKU', width: 140 },
    { field: 'price', headerName: 'Price', width: 120, valueFormatter: (p: any) => `$${Number((p?.value as number) ?? 0).toFixed(2)}` },
    { field: 'warehouseStock', headerName: 'Stock', width: 120 },
    { field: 'expiryDate', headerName: 'Expiry', width: 160, valueFormatter: (p: any) => (p?.value ? new Date(p.value as string).toLocaleDateString() : '') },
    { field: 'createdAt', headerName: 'Created', width: 180, valueFormatter: (p: any) => (p?.value ? new Date(p.value as string).toLocaleString() : '') },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 120,
      renderCell: (params: GridRenderCellParams<any, Product>) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(params.row)}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDeleteRow(params.row)}><DeleteIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]
}


