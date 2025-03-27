// pages/laundry.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const LaundryDashboard = () => {
  const [laundryItems, setLaundryItems] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    fetchLaundryItems();
  }, []);

  const fetchLaundryItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/inmates');
      const allItems = [];
      for (const inmate of response.data) {
        const inmateDetails = await axios.get(`http://localhost:5000/inmates/${inmate.id}`);
        const laundryItems = inmateDetails.data.items.filter(item => item.return_status === 'Laundry' || item.status === 'In Laundry');
        allItems.push(...laundryItems.map(item => ({
          id: item.id,
          barcode: item.barcode,
          name: item.name,
          inmateId: inmate.id,
          inmateName: inmate.name,
          status: item.status,
          condition: item.condition,
        })));
      }
      setLaundryItems(allItems);
    } catch (err) {
      console.error('Error fetching laundry items:', err);
      setAlertMessage({ type: 'error', text: 'Failed to fetch laundry items!' });
    }
  };

  const handleScanToLaundry = async () => {
    if (barcode) {
      try {
        const inventoryRes = await axios.get('http://localhost:5000/inventory');
        const item = inventoryRes.data.find(i => i.barcode === barcode);
        if (!item) {
          setAlertMessage({ type: 'error', text: 'Item not found!' });
          setBarcode('');
          return;
        }

        const inmatesRes = await axios.get('http://localhost:5000/inmates');
        let foundInmate = null;
        for (const inmate of inmatesRes.data) {
          const inmateDetails = await axios.get(`http://localhost:5000/inmates/${inmate.id}`);
          const hasItem = inmateDetails.data.items.some(it => it.barcode === barcode);
          if (hasItem) {
            foundInmate = inmate;
            break;
          }
        }

        if (foundInmate) {
          await axios.put(`http://localhost:5000/inmates/${foundInmate.id}/items/${item.id}`, {
            return_status: 'Laundry',
          });
          setAlertMessage({ type: 'success', text: 'Item sent to laundry!' });
          setBarcode('');
          fetchLaundryItems();
        } else {
          setAlertMessage({ type: 'error', text: 'Item not assigned to any inmate!' });
          setBarcode('');
        }
      } catch (err) {
        console.error('Error scanning item to laundry:', err);
        setAlertMessage({ type: 'error', text: 'An error occurred while scanning!' });
        setBarcode('');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">Laundry Dashboard</Typography>
      {alertMessage && (
        <Alert severity={alertMessage.type} onClose={() => setAlertMessage(null)} sx={{ mb: 2 }}>
          {alertMessage.text}
        </Alert>
      )}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Items in Laundry</Typography>
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Barcode</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Inmate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Condition</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {laundryItems.map((item) => (
              <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#F0F4F8' } }}>
                <TableCell>{item.barcode}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.inmateName} ({item.inmateId})</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.condition || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          <TextField
            label="Scan Barcode to Send to Laundry"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleScanToLaundry}
            startIcon={<AddIcon />}
            sx={{ py: 1.5 }}
          >
            Send to Laundry
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LaundryDashboard;