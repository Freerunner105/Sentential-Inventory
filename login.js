// pages/login.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Fade, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios';
import { useRouter } from 'next/router';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      setError('');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      router.push(response.data.role === 'Trustee' ? '/laundry' : '/inmates');
    } catch (err) {
      setError('Invalid username or password');
      console.error('Login error:', err);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F5F6F5',
      }}
    >
      <Fade in={true} timeout={500}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 2,
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <LockIcon sx={{ fontSize: 40, color: '#1A3C5A' }} />
          </Box>
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{ color: '#1A3C5A', fontWeight: 600 }}
          >
            Jail Inventory Login
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: '#666666', mb: 3 }}
          >
            Please enter your credentials to access the system
          </Typography>
          <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            onKeyPress={handleKeyPress}
          >
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              fullWidth
              sx={{
                py: 1.5,
                fontSize: '1rem',
                backgroundColor: '#1A3C5A',
                '&:hover': { backgroundColor: '#15324D' },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;