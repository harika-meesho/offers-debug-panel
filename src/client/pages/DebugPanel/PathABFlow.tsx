import { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  List, ListItem, ListItemButton, ListItemText, Chip, Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/index';
import {
  setEventId, setSupplierId, setOptins, setOffers,
  setSelectedOptin, setIsOptinEvent, setLoading, setError,
} from '@store/debugPanelSlice';
import {
  getOptinsForEvent, getOffersForProductSupplier,
} from '@services/api';
import LifecycleView from './LifecycleView';

type Step = 'input' | 'path-a-optins' | 'path-b-pid' | 'offers' | 'lifecycle';

export default function PathABFlow() {
  const dispatch = useDispatch();
  const { eventId, supplierId, optins, offers, loading, error } = useSelector(
    (s: RootState) => s.debugPanel,
  );
  const [step, setStep] = useState<Step>('input');
  const [pidInput, setPidInput] = useState('');

  const handleFetchOptins = async () => {
    if (!eventId || !supplierId) return;
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const result = await getOptinsForEvent(eventId);
      dispatch(setOptins(result));
      dispatch(setIsOptinEvent(result.length > 0));
      if (result.length > 0) {
        setStep('path-a-optins');
      } else {
        setStep('path-b-pid');
      }
    } catch (e: any) {
      dispatch(setError(e.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSelectOptin = (optin: any) => {
    dispatch(setSelectedOptin(optin));
    setStep('lifecycle');
  };

  const handleFetchOffersPathB = async () => {
    if (!pidInput || !supplierId) return;
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const result = await getOffersForProductSupplier(pidInput, supplierId);
      dispatch(setOffers(result));
      setStep('offers');
    } catch (e: any) {
      dispatch(setError(e.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (step === 'lifecycle') return <LifecycleView onBack={() => setStep('path-a-optins')} />;

  return (
    <Box>
      {step === 'input' && (
        <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
          <Typography variant="subtitle1" fontWeight={600}>
            Step 1 — Enter Event ID + Supplier ID
          </Typography>
          <TextField
            label="Event ID (EID)"
            value={eventId}
            onChange={e => dispatch(setEventId(e.target.value))}
            size="small"
          />
          <TextField
            label="Supplier ID (SID)"
            value={supplierId}
            onChange={e => dispatch(setSupplierId(e.target.value))}
            size="small"
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            variant="contained"
            onClick={handleFetchOptins}
            disabled={loading || !eventId || !supplierId}
          >
            {loading ? <CircularProgress size={18} /> : 'Check Optins'}
          </Button>
        </Box>
      )}

      {step === 'path-a-optins' && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>Path A</strong> — {optins.length} optin(s) found for Event {eventId}. Select one to backtrace.
          </Alert>
          <List dense>
            {optins.map(o => (
              <ListItem key={o.optinId} disablePadding>
                <ListItemButton onClick={() => handleSelectOptin(o)}>
                  <ListItemText
                    primary={`Optin ID: ${o.optinId}`}
                    secondary={`Status: ${o.status ?? '—'}`}
                  />
                  <Chip label="Select" size="small" color="primary" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Button sx={{ mt: 2 }} onClick={() => setStep('input')}>← Back</Button>
        </Box>
      )}

      {step === 'path-b-pid' && (
        <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
          <Alert severity="info" sx={{ mb: 1 }}>
            <strong>Path B</strong> — No optins found for Event {eventId}. Enter Product ID to view offers.
          </Alert>
          <TextField
            label="Product ID (PID)"
            value={pidInput}
            onChange={e => setPidInput(e.target.value)}
            size="small"
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            variant="contained"
            onClick={handleFetchOffersPathB}
            disabled={loading || !pidInput}
          >
            {loading ? <CircularProgress size={18} /> : 'Fetch Offers'}
          </Button>
          <Button onClick={() => setStep('input')}>← Back</Button>
        </Box>
      )}

      {step === 'offers' && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Path B — {offers.length} offer(s) for Product {pidInput} / Supplier {supplierId}.
            Lifecycle B applies (no optins for Event {eventId}).
          </Alert>
          <Divider sx={{ my: 1 }} />
          <LifecycleView onBack={() => setStep('path-b-pid')} forcedLifecycle="B" />
        </Box>
      )}
    </Box>
  );
}
