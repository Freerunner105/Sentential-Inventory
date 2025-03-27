// pages/inmate/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const InmateDetails = ({ user }) => {
  const [inmate, setInmate] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/inmates/${id}`)
        .then(res => setInmate(res.data))
        .catch(err => {
          console.error('Error fetching inmate:', err);
          setAlertMessage({ type: 'error', text: 'Failed to fetch inmate details!' });
        });
    }
  }, [id]);

  const handleAssignItem = () => {
    if (barcode && inmate) {
      axios.post(`http://localhost:5000/inmates/${inmate.id}/items`, { barcode })
        .then(() => {
          setBarcode('');
          axios.get(`http://localhost:5000/inmates/${inmate.id}`)
            .then(res => {
              setInmate(res.data);
              setAlertMessage({ type: 'success', text: 'Item assigned successfully!' });
            });
        })
        .catch(err => {
          console.error('Error assigning item:', err);
          setAlertMessage({ type: 'error', text: 'Failed to assign item!' });
        });
    }
  };

  if (!inmate) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">Inmate Details</Typography>
      {alertMessage && (
        <Alert severity={alertMessage.type} onClose={() => setAlertMessage(null)} sx={{ mb: 2 }}>
          {alertMessage.text}
        </Alert>
      )}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{inmate.name} (ID: {inmate.id})</Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1"><strong>Housing Unit:</strong> {inmate.housing_unit}</Typography>
          <Typography variant="body1"><strong>Fee:</strong> ${(inmate.fee || 0).toFixed(2)}</Typography>
          <Typography variant="body1"><strong>Notes:</strong> {inmate.notes || 'N/A'}</Typography>
        </Box>
        <Typography variant="h6" gutterBottom>Assigned Items</Typography>
        <Table sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell>Barcode</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inmate.items.map((item) => (
              <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#F0F4F8' } }}>
                <TableCell>{item.barcode}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
          <TextField
            label="Assign Item Barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignItem}
            startIcon={<AddIcon />}
            sx={{ py: 1.5 }}
          >
            Assign Item
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InmateDetails;