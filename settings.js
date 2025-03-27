// pages/settings.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Alert, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const Settings = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Staff', first_name: '', last_name: '', email: '' });
  const [fees, setFees] = useState([]);
  const [newFee, setNewFee] = useState({ name: '', amount: '', inmate_id: '', item_barcodes: '', notes: '' });
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    if (tabValue === 0) fetchUsers();
    else if (tabValue === 1) fetchFees();
  }, [tabValue]);

  const fetchUsers = () => {
    axios.get('http://localhost:5000/settings/users')
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Error fetching users:', err);
        setAlertMessage({ type: 'error', text: 'Failed to fetch users!' });
      });
  };

  const fetchFees = () => {
    axios.get('http://localhost:5000/settings/fees')
      .then(res => setFees(res.data))
      .catch(err => {
        console.error('Error fetching fees:', err);
        setAlertMessage({ type: 'error', text: 'Failed to fetch fees!' });
      });
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.first_name || !newUser.last_name) {
      setAlertMessage({ type: 'error', text: 'Username, Password, First Name, and Last Name are required!' });
      return;
    }
    axios.post('http://localhost:5000/settings/users', newUser)
      .then(res => {
        setUsers([...users, res.data]);
        setNewUser({ username: '', password: '', role: 'Staff', first_name: '', last_name: '', email: '' });
        setAlertMessage({ type: 'success', text: 'User added successfully!' });
      })
      .catch(err => {
        console.error('Error adding user:', err);
        setAlertMessage({ type: 'error', text: err.response?.data?.error || 'Failed to add user!' });
      });
  };

  const handleAddFee = () => {
    if (!newFee.name || !newFee.amount) {
      setAlertMessage({ type: 'error', text: 'Name and Amount are required!' });
      return;
    }
    axios.post('http://localhost:5000/settings/fees', newFee)
      .then(res => {
        setFees([...fees, res.data]);
        setNewFee({ name: '', amount: '', inmate_id: '', item_barcodes: '', notes: '' });
        setAlertMessage({ type: 'success', text: 'Fee added successfully!' });
      })
      .catch(err => {
        console.error('Error adding fee:', err);
        setAlertMessage({ type: 'error', text: 'Failed to add fee!' });
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">Settings</Typography>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="User Management" />
        <Tab label="Fee Management" />
      </Tabs>

      {alertMessage && (
        <Alert severity={alertMessage.type} onClose={() => setAlertMessage(null)} sx={{ mb: 2 }}>
          {alertMessage.text}
        </Alert>
      )}

      {tabValue === 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Users</Typography>
          <Table sx={{ mb: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#F0F4F8' } }}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.first_name}</TableCell>
                  <TableCell>{user.last_name}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="h6" gutterBottom>Add New User</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                variant="outlined"
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
              />
              <TextField
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                variant="outlined"
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                variant="outlined"
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
              />
              <TextField
                label="Last Name"
                value={newUser.last_name}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                variant="outlined"
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
              />
            </Box>
            <TextField
              label="Email (optional)"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
            />
            <RadioGroup
              row
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <FormControlLabel value="Admin" control={<Radio />} label="Admin" />
              <FormControlLabel value="Staff" control={<Radio />} label="Staff" />
              <FormControlLabel value="Trustee" control={<Radio />} label="Trustee" />
            </RadioGroup>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddUser}
              startIcon={<AddIcon />}
              sx={{ py: 1.5 }}
            >
              Add User
            </Button>
          </Box>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Fees</Typography>
          <Table sx={{ mb: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Inmate</TableCell>
                <TableCell>Item Barcodes</TableCell>
                <TableCell>Date Applied</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id} sx={{ '&:hover': { backgroundColor: '#F0F4F8' } }}>
                  <TableCell>{fee.id}</TableCell>
                  <TableCell>{fee.name}</TableCell>
                  <TableCell>${fee.amount.toFixed(2)}</TableCell>
                  <TableCell>{fee.inmate_name || 'N/A'} ({fee.inmate_id || 'N/A'})</TableCell>
                  <TableCell>{fee.item_barcodes || 'N/A'}</TableCell>
                  <TableCell>{new Date(fee.date_applied).toLocaleDateString()}</TableCell>
                  <TableCell>{fee.notes || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="h6" gutterBottom>Add New Fee</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Fee Name"
                value={newFee.name}
                onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
                variant="outlined"
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
              />
              <TextField
                label="Amount ($)"
                type="number"
                value={newFee.amount}
                onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                variant="outlined"
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
              />
            </Box>
            <TextField
              label="Inmate ID (optional)"
              value={newFee.inmate_id}
              onChange={(e) => setNewFee({ ...newFee, inmate_id: e.target.value })}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
            />
            <TextField
              label="Item Barcodes (optional)"
              value={newFee.item_barcodes}
              onChange={(e) => setNewFee({ ...newFee, item_barcodes: e.target.value })}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
            />
            <TextField
              label="Notes (optional)"
              value={newFee.notes}
              onChange={(e) => setNewFee({ ...newFee, notes: e.target.value })}
              multiline
              rows={2}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddFee}
              startIcon={<AddIcon />}
              sx={{ py: 1.5 }}
            >
              Add Fee
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Settings;