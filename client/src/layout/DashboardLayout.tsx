import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Typography, Badge, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Tooltip, Container, Stack, Avatar } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import StoreIcon from '@mui/icons-material/Store'
import InventoryIcon from '@mui/icons-material/Inventory'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import BusinessIcon from '@mui/icons-material/Business'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import PersonIcon from '@mui/icons-material/Person'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useAuth } from '../state/AuthContext'
import RightPanel from '../components/RightPanel'
import { useUI } from '../state/UIContext'
import { useCart } from '../state/CartContext'
import CartModal from '../components/CartModal'

const drawerWidth = 260
const sidebarGapPx = 3

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const { state, logout } = useAuth()
  const { notificationsCount, darkMode, toggleDarkMode } = useUI()
  const { uniqueCount } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  const role = state.user?.role
  const shopStatus = state.user?.shopStatus

  const items = (
    role === 'SUPER_ADMIN'
      ? [
          { to: '/admin', icon: <DashboardIcon />, label: 'Overview' },
          { to: '/admin/companies', icon: <BusinessIcon />, label: 'Companies' },
          { to: '/admin/shops', icon: <StoreIcon />, label: 'Shops' },
          { to: '/admin/users', icon: <AssignmentIndIcon />, label: 'Users' },
          { to: '/profile', icon: <PersonIcon />, label: 'Profile' },
        ]
      : role === 'COMPANY_ADMIN'
      ? [
          { to: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
          { to: '/stores', icon: <StoreIcon />, label: 'Stores' },
          { to: '/products', icon: <InventoryIcon />, label: 'Products' },
          { to: '/deliveries', icon: <LocalShippingIcon />, label: 'Deliveries' },
          { to: '/requests', icon: <AssignmentIndIcon />, label: 'Orders' },
          { to: '/restocks', icon: <PlaylistAddCheckIcon />, label: 'Restock Requests' },
          { to: '/profile', icon: <PersonIcon />, label: 'Profile' },
        ]
      : (
        shopStatus === 'active'
          ? [
              { to: '/shop', icon: <DashboardIcon />, label: 'My Dashboard' },
              { to: '/shop/companies', icon: <BusinessIcon />, label: 'Companies' },
              { to: '/shop/stock', icon: <InventoryIcon />, label: 'My Stock' },
              { to: '/shop/orders', icon: <AssignmentIndIcon />, label: 'Orders' },
              { to: '/profile', icon: <PersonIcon />, label: 'Profile' },
            ]
          : [
              { to: '/shop/pending', icon: <DashboardIcon />, label: 'Awaiting Approval' },
              { to: '/profile', icon: <PersonIcon />, label: 'Profile' },
            ]
      )
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)' }}>
      <AppBar position="fixed" color="inherit" sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setOpen(true)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
              Stocky
            </Typography>
          </Stack>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>{state.user?.email?.[0]?.toUpperCase() || 'U'}</Avatar>
          <Tooltip title={darkMode ? 'Switch to light' : 'Switch to dark'}>
            <IconButton color="inherit" onClick={toggleDarkMode} aria-label="toggle theme" sx={{ mr: 1 }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          {role === 'SHOP_OWNER' && shopStatus === 'active' && (
            <Tooltip title="Cart">
              <IconButton onClick={() => setCartOpen(true)} color="inherit" aria-label="cart" sx={{ mr: 1 }}>
                <Badge badgeContent={uniqueCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          <IconButton color="inherit" aria-label="notifications">
            <Badge badgeContent={notificationsCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={logout} aria-label="logout">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Permanent drawer on md+ */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        <Toolbar />
        <Divider />
        <List>
          {items.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: '0 6px 16px rgba(25,118,210,0.25)',
                  '& .MuiListItemIcon-root, & .MuiListItemText-primary': { color: 'inherit' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Temporary drawer on mobile */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ width: drawerWidth }} role="presentation" onClick={() => setOpen(false)}>
          <Toolbar />
          <Divider />
          <List>
            {items.map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  '&.active': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    boxShadow: '0 6px 16px rgba(25,118,210,0.25)',
                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': { color: 'inherit' },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, ml: { md: `${drawerWidth + sidebarGapPx}px` } }}>
        <Toolbar />
        <Container maxWidth="xl" disableGutters sx={{ py: 2, pl: { md: `${sidebarGapPx}px` } }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems="flex-start">
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <Outlet />
            </Box>
            <Box sx={{ width: { lg: 320 }, flexShrink: 0, display: { xs: 'none', lg: 'block' } }}>
              <RightPanel />
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}


