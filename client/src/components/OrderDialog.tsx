import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography } from '@mui/material'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: {
    address: string
    contact?: string
    date?: string
    time?: string
    latitude?: number
    longitude?: number
    notes?: string
  }) => void
}

export default function OrderDialog({ open, onClose, onSubmit }: Props) {
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function useCurrentLocation() {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude))
        setLongitude(String(pos.coords.longitude))
      },
      () => setError('Failed to get location'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!address.trim()) {
      setError('Delivery address is required')
      return
    }
    setSaving(true)
    try {
      onSubmit({
        address: address.trim(),
        contact: contact.trim() || undefined,
        date: date || undefined,
        time: time || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        notes: notes.trim() || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Order details</DialogTitle>
      <DialogContent dividers>
        <form id="order-form" onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <TextField label="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} required fullWidth />
            <TextField label="Contact number" value={contact} onChange={(e) => setContact(e.target.value)} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Preferred date" type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Preferred time" type="time" value={time} onChange={(e) => setTime(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
              <TextField label="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} fullWidth />
              <TextField label="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} fullWidth />
              <Button variant="outlined" onClick={useCurrentLocation}>Use current</Button>
            </Stack>
            <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={3} fullWidth />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button type="submit" form="order-form" variant="contained" disabled={saving}>Submit order</Button>
      </DialogActions>
    </Dialog>
  )
}


