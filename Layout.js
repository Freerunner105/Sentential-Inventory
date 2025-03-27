// components/Layout.js
import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Button, Drawer, List, ListItem, ListItemButton, ListItemText, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/router';

const Layout = ({ children, user }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = user
    ? [
        ...(user.role !== 'Trustee' ? [{ text: 'Inmates', path: '/inmates' }] : []),
        ...(user.role !== 'Trustee' ? [{ text: 'Inventory', path: '/inventory' }] : []),
        { text: 'Laundry', path: '/laundry' },
        ...(user.role !== 'Trustee' ? [{ text: 'Release', path: '/release' }] : []),
        ...(user.role === 'Admin' ? [{ text: 'Settings', path: '/settings' }] : []),
      ]
    : [];

  const drawerContent = (
    <Box
      sx={{ width: 250, bgcolor: 'primary.main', height: '100%', color: 'primary.contrastText' }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => router.push(item.path)}>
              <ListItemText primary={item.text} primaryTypographyProps={{ sx: { color: 'primary.contrastText', fontWeight: 500 } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Jail Inventory System
          </Typography>
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Box sx={{ mt: 4, py: 2, bgcolor: 'primary.main', color: 'primary.contrastText', textAlign: 'center' }}>
        <Container>
          <Typography variant="body2">
            © {new Date().getFullYear()} Jail Inventory System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;