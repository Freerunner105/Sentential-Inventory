// pages/release.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Tabs, Tab, TextField, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useRouter } from 'next/router';

const ReleaseDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [inmates, setInmates] = useState([]);
  const [selectedInmate, setSelectedInmate] = useState(null);
  const [itemBarcode, setItemBarcode] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (tabValue === 0) {
      fetchInmates();
    }
  }, [tabValue]);

  const fetchInmates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/inmates');
      const detailedInmates = await Promise.all(response.data.map(async (inmate) => {
        const details = await axios.get(`http://localhost:5000/inmates/${inmate.id}`);
        const fees = await axios.get('http://localhost:5000/settings/fees');
        const inmateFees = fees.data.filter(fee => fee.inmate_id === inmate.id).reduce((sum, fee) => sum + fee.amount, 0);
        return {
          ...inmate,
          items: details.data.items,
          fee: inmateFees
        };
      }));
      setInmates(detailedInmates);
    } catch (err) {
      console.error('Error fetching inmates:', err);
      setAlertMessage({ type: 'error', text: 'Failed to fetch inmates!' });
    }
  };

  const handleReleaseInmate = async (inmate) => {
    const assignedItems = inmate.items.filter(item => item.status === 'Assigned');
    if (assignedItems.length === 0) {
      try {
        await axios.put(`http://localhost:5000/inmates/${inmate.id}`, { notes: 'Released on ' + new Date().toISOString().split('T')[0] });
        await axios.delete(`http://localhost:5000/inmates/${inmate.id}`);
        setInmates(inmates.filter(i => i.id !== inmate.id));
        setAlertMessage({ type: 'success', text: 'Inmate released and removed from system successfully!' });
      } catch (err) {
        console.error('Error releasing and deleting inmate:', err);
        setAlertMessage({ type: 'error', text: 'Failed to release and delete inmate!' });
      }
    } else {
      setTabValue(1);
      setSelectedInmate(inmate);
    }
  };

  const handleReturnItem = async () => {
    if (itemBarcode && selectedInmate) {
      try {
        const inmateItem = selectedInmate.items.find(i => i.barcode === itemBarcode && i.status === 'Assigned');
        if (inmateItem) {
          await axios.put(`http://localhost:5000/inmates/${selectedInmate.id}/items/${inmateItem.id}`, {
            return_status: 'Returned',
            condition: 'Used', // Default condition; adjust as needed
          });
          setAlertMessage({ type: 'success', text: 'Item returned successfully!' });
          setItemBarcode('');
          fetchInmates();
        } else {
          setAlertMessage({ type: 'error', text: 'Item not found or not assigned to this inmate!' });
          setItemBarcode('');
        }
      } catch (err) {
        console.error('Error returning item:', err);
        setAlertMessage({ type: 'error', text: 'Failed to return item!' });
        setItemBarcode('');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">Release Dashboard</Typography>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Release Inmate" />
        <Tab label="Return Item" />
      </Tabs>

      {alertMessage && (
        <Alert severity={alertMessage.type} onClose={() => setAlertMessage(null)} sx={{ mb: 2 }}>
          {alertMessage.text}
        </Alert>
      )}

      {tabValue === 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Release Inmate</Typography>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Inmate ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Housing Unit</TableCell>
                <TableCell>Assigned Items</TableCell>
                <TableCell>Fee</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inmates.map((inmate) => (
                <TableRow key={inmate.id} sx={{ '&:hover': { backgroundColor: '#F0F4F8' } }}>
                  <TableCell>{inmate.id}</TableCell>
                  <TableCell>{inmate.name}</TableCell>
                  <TableCell>{inmate.housing_unit}</TableCell>
                  <TableCell>{inmate.items.filter(i => i.status === 'Assigned').length}</TableCell>
                  <TableCell>${(inmate.fee || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleReleaseInmate(inmate)}
                      sx={{ py: 1 }}
                    >
                      Release
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tabValue === 1 && selectedInmate && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Return Item for {selectedInmate.name}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
            <TextField
              label="Scan Item Barcode"
              value={itemBarcode}
              onChange={(e) => setItemBarcode(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleReturnItem}
              startIcon={<AddIcon />}
              sx={{ py: 1.5 }}
            >
              Return Item
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ReleaseDashboard;