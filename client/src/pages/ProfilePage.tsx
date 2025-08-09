import { useEffect, useState } from 'react'
import { Box, Card, CardContent, TextField, Button, Stack, Typography, Alert } from '@mui/material'
import { useAuth } from '../state/AuthContext'
import { getJson, type Role } from '../services/api'

type MeResponse = { user: { id: string; email: string; role: Role } }

export default function ProfilePage() {
  const { state, updateProfile, refreshMe } = useAuth()
  const token = state.accessToken
  const [form, setForm] = useState({ email: '', role: '' as Role, password: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setError(null)
        const res = await getJson<MeResponse>('/auth/me', token)
        if (!mounted) return
        setForm({ email: res.user.email, role: res.user.role, password: '' })
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [token])

  async function onSave() {
    if (!token) return
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const payload: { email?: string; password?: string } = {}
      if (form.email) payload.email = form.email
      if (form.password) payload.password = form.password
      const updated = await updateProfile(payload)
      await refreshMe()
      setForm((prev) => ({ ...prev, email: updated.email, role: updated.role, password: '' }))
      setSuccess('Profile updated')
    } catch (e: any) {
      setError(e?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Typography>Loading…</Typography>

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>My Profile</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Card>
        <CardContent>
          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="New Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField label="Role" value={form.role} disabled />
            <Button variant="contained" onClick={onSave} disabled={saving}>Save</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}


