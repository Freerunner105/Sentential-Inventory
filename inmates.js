// pages/inmates.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useRouter } from 'next/router';

const InmateDashboard = ({ user }) => {
  const [inmates, setInmates] = useState([]);
  const router = useRouter();

  useEffect(() => {
    axios.get('http://localhost:5000/inmates')
      .then(async res => {
        const detailedInmates = await Promise.all(res.data.map(async (inmate) => {
          const fees = await axios.get('http://localhost:5000/settings/fees');
          const inmateFees = fees.data.filter(fee => fee.inmate_id === inmate.id).reduce((sum, fee) => sum + fee.amount, 0);
          return { ...inmate, fee: inmateFees };
        }));
        setInmates(detailedInmates);
      })
      .catch(err => console.error('Error fetching inmates:', err));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">Inmate Dashboard</Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>All Inmates</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/inmates/add')}
            sx={{ py: 1.5 }}
          >
            Add Inmate
          </Button>
        </Box>
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Housing Unit</TableCell>
              <TableCell>Fee</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inmates.map((inmate) => (
              <TableRow
                key={inmate.id}
                sx={{ '&:hover': { backgroundColor: '#F0F4F8', cursor: 'pointer' } }}
                onClick={() => router.push(`/inmate/${inmate.id}`)}
              >
                <TableCell>{inmate.id}</TableCell>
                <TableCell>{inmate.name}</TableCell>
                <TableCell>{inmate.housing_unit}</TableCell>
                <TableCell>${(inmate.fee || 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default InmateDashboard;