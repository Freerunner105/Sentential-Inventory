import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const AddInmate = () => {
  const [inmate, setInmate] = useState({ id: '', name: '', housing_unit: '', fees_paid: '', notes: '' });
  const [barcode, setBarcode] = useState('');
  const [items, setItems] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const router = useRouter();

  const handleInputChange = (field) => (e) => {
    setInmate({ ...inmate, [field]: e.target.value });
  };

  const handleAssignItem = () => {
    if (barcode) {
      axios.get('http://localhost:5000/inventory')
        .then(res => {
          const item = res.data.find(i => i.barcode === barcode && i.status === 'In Stock');
          if (item) {
            setItems([...items, { barcode: item.barcode, name: item.name, status: 'Assigned' }]);
            setBarcode('');
            setAlertMessage({ type: 'success', text: 'Item assigned to list!' });
          } else {
            setAlertMessage({ type: 'error', text: 'Item not found or not in stock!' });
          }
        })
        .catch(err => {
          console.error('Error fetching inventory:', err);
          setAlertMessage({ type: 'error', text: 'Failed to fetch inventory!' });
        });
    }
  };

  const handleSubmit = async () => {
    if (!inmate.id || !inmate.name) {
      setAlertMessage({ type: 'error', text: 'Inmate ID and Name are required!' });
      return;
    }
    const newInmate = {
      id: inmate.id,
      name: inmate.name,
      housing_unit: inmate.housing_unit || 'Unknown',
      fees_paid: parseFloat(inmate.fees_paid) || 0.0,
      notes: inmate.notes || '',
    };
    try {
      await axios.post('http://localhost:5000/inmates', newInmate);
      for (const item of items) {
        await axios.post(`http://localhost:5000/inmates/${inmate.id}/items`, { barcode: item.barcode });
      }
      setInmate({ id: '', name: '', housing_unit: '', fees_paid: '', notes: '' });
      setItems([]);
      setAlertMessage({ type: 'success', text: 'Inmate and items added successfully!' });
      router.push('/inmates');
    } catch (err) {
      console.error('Error adding inmate or items:', err);
      setAlertMessage({ type: 'error', text: 'Failed to add inmate or items!' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">Add New Inmate</Typography>
      {alertMessage && (
        <Alert severity={alertMessage.type} onClose={() => setAlertMessage(null)} sx={{ mb: 2 }}>
          {alertMessage.text}
        </Alert>
      )}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <TextField label="Inmate ID" value={inmate.id} onChange={handleInputChange('id')} variant="outlined" />
          <TextField label="Name" value={inmate.name} onChange={handleInputChange('name')} variant="outlined" />
          <TextField label="Housing Unit" value={inmate.housing_unit} onChange={handleInputChange('housing_unit')} variant="outlined" />
          <TextField label="Fees Paid ($)" type="number" value={inmate.fees_paid} onChange={handleInputChange('fees_paid')} variant="outlined" />
          <TextField label="Notes" value={inmate.notes} onChange={handleInputChange('notes')} multiline rows={2} variant="outlined" />
          <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={<AddIcon />}>
            Save Inmate
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>Assign Items</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <TextField label="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} variant="outlined" />
          <Button variant="contained" color="primary" onClick={handleAssignItem} startIcon={<AddIcon />}>
            Assign Item
          </Button>
        </Box>

        {items.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Barcode</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.barcode}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default AddInmate;