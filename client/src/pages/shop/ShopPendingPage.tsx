import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { useAuth } from '../../state/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ShopPendingPage() {
  const { state, refreshMe } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function poll() {
      if (!mounted) return
      const user = await refreshMe()
      if (user.role === 'SHOP_OWNER' && user.shopStatus === 'active') {
        navigate('/shop', { replace: true })
      } else if (mounted) {
        setTimeout(poll, 3000)
      }
    }
    void poll()
    return () => { mounted = false }
  }, [refreshMe, navigate])

  return (
    <Box>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Awaiting approval</Typography>
            <Typography variant="body2" color="text.secondary">
              Your shop account is pending approval by an administrator. You'll be redirected to your dashboard once approved.
            </Typography>
            <Alert severity="info">We'll check your status every few seconds automatically.</Alert>
            <Button variant="outlined" onClick={() => void refreshMe()}>Refresh now</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}


