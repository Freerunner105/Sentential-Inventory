// pages/_app.js
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Layout user={user}>
        <Component {...pageProps} user={user} setUser={setUser} />
      </Layout>
    </ThemeProvider>
  );
}

export default MyApp;