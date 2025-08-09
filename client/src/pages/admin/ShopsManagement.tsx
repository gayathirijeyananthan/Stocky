import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Box, Card, CardContent, Typography, Button, Stack, Chip, Alert, CircularProgress } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { getJson, patchJson } from '../../services/api'
import { useAuth } from '../../state/AuthContext'

type Row = { id: string; name: string; address?: string; contact?: string; ownerEmail?: string; status: 'pending'|'active'|'inactive'; createdAt?: string }

export default function ShopsManagement() {
  const { state } = useAuth()
  const token = state.accessToken
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

  async function load() {
    if (!token) return
    try {
      setError(null)
      setLoading(true)
      const res = await getJson<{ shops: Array<Row> }>(
        '/shops',
        token
      )
      setRows(res.shops)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch shops')
    } finally {
      setLoading(false)
    }
  }

  // Batch actions removed; actions are available per row

  async function setRowStatus(id: string, status: Row['status']) {
    if (!token) return
    setUpdatingIds(prev => new Set(prev).add(id))
    try {
      await patchJson(`/shops/${id}/status`, { status }, token)
      setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)))
    } catch (e) {
      // no-op, error will be shown on next load if needed
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  useEffect(() => { load() }, [token])

  const columns: GridColDef<Row>[] = useMemo(() => [
    { field: 'name', headerName: 'Shop', flex: 1, minWidth: 180 },
    { field: 'ownerEmail', headerName: 'Owner', flex: 1, minWidth: 200 },
    { field: 'address', headerName: 'Address', flex: 1, minWidth: 220 },
    { field: 'contact', headerName: 'Contact', width: 160 },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: (params: GridRenderCellParams<Row, Row['status']>) => {
        const status = params.row.status
        const color = status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'default'
        return <Chip size="small" color={color as any} label={status} />
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Row>) => {
        const { id, status } = params.row
        const isUpdating = updatingIds.has(id)
        const approved = status === 'active'
        const rejected = status === 'inactive'
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={approved ? 'outlined' : 'contained'}
              color="success"
              disabled={isUpdating || approved}
              onClick={() => void setRowStatus(id, 'active')}
            >
              {approved ? 'Approved' : 'Approve'}
            </Button>
            <Button
              size="small"
              variant={rejected ? 'outlined' : 'contained'}
              color="warning"
              disabled={isUpdating || rejected}
              onClick={() => void setRowStatus(id, 'inactive')}
            >
              {rejected ? 'Rejected' : 'Reject'}
            </Button>
          </Stack>
        )
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
      valueGetter: (p: any) => (p.row?.createdAt ? new Date(p.row.createdAt).toLocaleString() : ''),
    },
  ], [updatingIds])

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Shops</Typography>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', height: 300 }}>
              <Stack alignItems="center" spacing={2}>
                <CircularProgress />
                <Typography>Loading shops…</Typography>
              </Stack>
            </Box>
          ) : (
            <div style={{ height: 480, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 20]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}


