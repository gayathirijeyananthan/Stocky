import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Box, Card, CardContent, Typography, Button, Stack, Chip, Alert, CircularProgress } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { getJson, postJson, patchJson } from '../../services/api'
import { useAuth } from '../../state/AuthContext'

type Row = { id: string; name: string; status: 'pending'|'active'|'inactive'; createdAt?: string }

export default function CompaniesManagement() {
  const { state } = useAuth()
  const token = state.accessToken
  const [rows, setRows] = useState<Row[]>([])
  const [selection, setSelection] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  async function load() {
    if (!token) return
    try {
      setError(null)
      setLoading(true)
      const res = await getJson<{ companies: Array<{ _id: string; name: string; status: Row['status']; createdAt?: string }> }>(
        '/companies',
        token
      )
      setRows(res.companies.map(c => ({ id: c._id, name: c.name, status: c.status, createdAt: c.createdAt })))
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch companies')
    } finally {
      setLoading(false)
    }
  }

  async function approveSelected() {
    if (!token || selection.length === 0) return
    await Promise.all(selection.map(id => postJson(`/companies/${id}/approve`, {}, token)))
    await load()
  }

  async function rejectSelected() {
    if (!token || selection.length === 0) return
    await Promise.all(selection.map(id => patchJson(`/companies/${id}/status`, { status: 'inactive' }, token)))
    await load()
  }

  useEffect(() => { load() }, [token])

  const columns: GridColDef<Row>[] = useMemo(() => [
    { field: 'name', headerName: 'Company', flex: 1, minWidth: 180 },
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
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
      valueGetter: (p: any) => (p.row?.createdAt ? new Date(p.row.createdAt).toLocaleString() : ''),
    },
  ], [])

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Companies</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="warning" disabled={selection.length === 0} onClick={rejectSelected}>Reject</Button>
          <Button variant="contained" disabled={selection.length === 0} onClick={approveSelected}>Approve</Button>
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', height: 300 }}>
              <Stack alignItems="center" spacing={2}>
                <CircularProgress />
                <Typography>Loading companies…</Typography>
              </Stack>
            </Box>
          ) : (
            <div style={{ height: 480, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={(m) => setSelection(m as string[])}
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


