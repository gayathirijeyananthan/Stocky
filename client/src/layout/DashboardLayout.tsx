import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Typography, Badge, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Tooltip } from '@mui/material'
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
import { useAuth } from '../state/AuthContext'
import { useUI } from '../state/UIContext'

const drawerWidth = 260

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const { state, logout } = useAuth()
  const { notificationsCount, darkMode, toggleDarkMode } = useUI()

  const role = state.user?.role

  const items = (
    role === 'SUPER_ADMIN'
      ? [
          { to: '/admin', icon: <DashboardIcon />, label: 'Overview' },
          { to: '/admin/companies', icon: <BusinessIcon />, label: 'Companies' },
          { to: '/admin/users', icon: <AssignmentIndIcon />, label: 'Users' },
        ]
      : role === 'COMPANY_ADMIN'
      ? [
          { to: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
          { to: '/stores', icon: <StoreIcon />, label: 'Stores' },
          { to: '/products', icon: <InventoryIcon />, label: 'Products' },
          { to: '/deliveries', icon: <LocalShippingIcon />, label: 'Deliveries' },
          { to: '/requests', icon: <AssignmentIndIcon />, label: 'Shop Requests' },
          { to: '/restocks', icon: <PlaylistAddCheckIcon />, label: 'Restock Requests' },
        ]
      : [
          { to: '/shop', icon: <DashboardIcon />, label: 'My Dashboard' },
          { to: '/shop/companies', icon: <BusinessIcon />, label: 'Companies' },
          { to: '/shop/stock', icon: <InventoryIcon />, label: 'My Stock' },
        ]
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" color="inherit" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setOpen(true)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
            Stocky
          </Typography>
          <Tooltip title={darkMode ? 'Switch to light' : 'Switch to dark'}>
            <IconButton color="inherit" onClick={toggleDarkMode} aria-label="toggle theme" sx={{ mr: 1 }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
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
            <ListItemButton key={item.to} component={NavLink} to={item.to}>
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
              <ListItemButton key={item.to} component={NavLink} to={item.to}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: `${drawerWidth}px` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}


