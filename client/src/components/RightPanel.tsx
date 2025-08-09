import { useMemo } from 'react'
import { Box, Card, CardContent, Typography, Stack, Avatar, Divider } from '@mui/material'

type OnlineUser = { name: string; id: string }

function generateMonthDays(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startDay = first.getDay() // 0 Sun .. 6 Sat
  const totalDays = last.getDate()
  const days: Array<{ day: number | null }> = []
  for (let i = 0; i < startDay; i += 1) days.push({ day: null })
  for (let d = 1; d <= totalDays; d += 1) days.push({ day: d })
  // pad to complete weeks (42 cells)
  while (days.length % 7 !== 0) days.push({ day: null })
  return { days, monthLabel: date.toLocaleString(undefined, { month: 'long', year: 'numeric' }) }
}

export default function RightPanel() {
  const { days, monthLabel } = useMemo(() => generateMonthDays(), [])
  const users: OnlineUser[] = [
    { name: 'Maren Maureen', id: '1094882001' },
    { name: 'Jenniffer Jane', id: '1094672000' },
    { name: 'Ryan Herwinds', id: '1094320003' },
    { name: 'Kierra Culhane', id: '1094622002' },
  ]

  return (
    <Stack spacing={2} sx={{ position: { md: 'sticky' as const }, top: { md: 88 }, pb: 2 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">{monthLabel}</Typography>
          <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {['S','M','T','W','T','F','S'].map((d) => (
              <Box key={d} sx={{ textAlign: 'center', fontSize: 12, color: 'text.secondary' }}>{d}</Box>
            ))}
            {days.map((d, i) => (
              <Box
                key={i}
                sx={{
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 1.5,
                  bgcolor: d.day === new Date().getDate() ? 'primary.main' : 'transparent',
                  color: d.day === new Date().getDate() ? 'primary.contrastText' : 'text.primary',
                }}
              >
                {d.day ?? ''}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1">Online Users</Typography>
            <Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer' }}>See all</Typography>
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <Stack spacing={1.25}>
            {users.map((u) => (
              <Stack key={u.id} direction="row" alignItems="center" spacing={1.25}>
                <Avatar sx={{ width: 32, height: 32 }}>{u.name[0]}</Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{u.id}</Typography>
                </Box>
                <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}


