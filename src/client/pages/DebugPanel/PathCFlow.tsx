import { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemButton, ListItemText, Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/index';
import {
  setProductId, setSupplierId, setOffers,
  setSelectedOffer, setOptins, setIsOptinEvent,
  setLoading, setError, setEventId,
} from '@store/debugPanelSlice';
import { getOffersForProductSupplier, getOptinsForEvent, groupOffersByEventId } from '@services/api';
import { Offer } from './types';
import LifecycleView from './LifecycleView';

type Step = 'input' | 'offers' | 'lifecycle';

export default function PathCFlow() {
  const dispatch = useDispatch();
  const { productId, supplierId, offers, loading, error } = useSelector(
    (s: RootState) => s.debugPanel,
  );
  const [step, setStep] = useState<Step>('input');
  const [checkingLifecycle, setCheckingLifecycle] = useState(false);

  const handleFetchOffers = async () => {
    if (!productId || !supplierId) return;
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const result = await getOffersForProductSupplier(productId, supplierId);
      dispatch(setOffers(result));
      setStep('offers');
    } catch (e: any) {
      dispatch(setError(e.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSelectOffer = async (offer: Offer) => {
    dispatch(setSelectedOffer(offer));
    const eid = String(offer.eventId);
    dispatch(setEventId(eid));
    setCheckingLifecycle(true);
    dispatch(setError(null));
    try {
      const optins = await getOptinsForEvent(eid);
      dispatch(setOptins(optins));
      dispatch(setIsOptinEvent(optins.length > 0));
      setStep('lifecycle');
    } catch (e: any) {
      dispatch(setError(e.message));
    } finally {
      setCheckingLifecycle(false);
    }
  };

  const grouped = groupOffersByEventId(offers);

  if (step === 'lifecycle') return <LifecycleView onBack={() => setStep('offers')} />;

  return (
    <Box>
      {step === 'input' && (
        <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
          <Typography variant="subtitle1" fontWeight={600}>
            Step 1 — Enter Product ID + Supplier ID
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All offers will be fetched and grouped by Event ID. Lifecycle is determined after you select an offer.
          </Typography>
          <TextField
            label="Product ID (PID)"
            value={productId}
            onChange={e => dispatch(setProductId(e.target.value))}
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
            onClick={handleFetchOffers}
            disabled={loading || !productId || !supplierId}
          >
            {loading ? <CircularProgress size={18} /> : 'Fetch All Offers'}
          </Button>
        </Box>
      )}

      {step === 'offers' && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            {offers.length} offer(s) found for PID {productId} / SID {supplierId}, grouped by Event ID.
            Select an offer to determine lifecycle.
          </Alert>
          {checkingLifecycle && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CircularProgress size={16} />
              <Typography variant="body2">Checking optins for selected offer…</Typography>
            </Box>
          )}
          {Object.entries(grouped).map(([eid, eidOffers]) => (
            <Accordion key={eid} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>Event ID: {eid}</Typography>
                <Chip label={`${eidOffers.length} offer(s)`} size="small" sx={{ ml: 2 }} />
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {eidOffers.map(o => (
                    <ListItem key={o.offerId} disablePadding>
                      <ListItemButton onClick={() => handleSelectOffer(o)} disabled={checkingLifecycle}>
                        <ListItemText
                          primary={`Offer ID: ${o.offerId}`}
                          secondary={`Status: ${o.status ?? '—'}`}
                        />
                        <Chip label="Select → detect lifecycle" size="small" color="primary" />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
          <Button sx={{ mt: 2 }} onClick={() => setStep('input')}>← Back</Button>
        </Box>
      )}
    </Box>
  );
}
