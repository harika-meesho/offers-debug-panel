import { useState } from 'react';
import {
  Box, Container, Typography, Paper, Tabs, Tab, Divider,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { reset } from '@store/debugPanelSlice';
import PathABFlow from './PathABFlow';
import PathCFlow from './PathCFlow';

export default function DebugPanel() {
  const [tab, setTab] = useState(0);
  const dispatch = useDispatch();

  const handleTabChange = (_: React.SyntheticEvent, newVal: number) => {
    dispatch(reset());
    setTab(newVal);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Supplier Optin Debug Panel
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Diagnose offer visibility and lifecycle for a given supplier/product/event combination.
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Paper elevation={2} sx={{ mt: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} sx={{ px: 2, pt: 1 }}>
          <Tab label="Path A / B  —  Event + Supplier" />
          <Tab label="Direct Path C  —  Product + Supplier" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tab === 0 && <PathABFlow />}
          {tab === 1 && <PathCFlow />}
        </Box>
      </Paper>
    </Container>
  );
}
