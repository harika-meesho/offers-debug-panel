import { useState, useEffect } from 'react';
import {
  Box, Typography, Alert, Chip, Button, CircularProgress,
  List, ListItem, ListItemText, Divider, Paper,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { getProductMapForOptin, extractOfferIdsFromProductMap } from '@services/api';
import { LifecycleType } from './types';

interface Props {
  onBack: () => void;
  forcedLifecycle?: LifecycleType;
}

export default function LifecycleView({ onBack, forcedLifecycle }: Props) {
  const { eventId, supplierId, optins, selectedOffer, selectedOptin, isOptinEvent } =
    useSelector((s: RootState) => s.debugPanel);

  const [lifecycle, setLifecycle] = useState<LifecycleType | null>(forcedLifecycle ?? null);
  const [backtraceLog, setBacktraceLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (forcedLifecycle) {
      setLifecycle(forcedLifecycle);
      return;
    }
    if (!isOptinEvent) {
      setLifecycle('B');
      setBacktraceLog(['isOptinEvent = false → Lifecycle B (auto)']);
      return;
    }
    // Path A backtrace
    runBacktrace();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runBacktrace = async () => {
    setRunning(true);
    const log: string[] = [];
    const targetOfferId = selectedOffer?.offerId ?? selectedOptin?.offerId;

    log.push(`isOptinEvent = true → running backtrace for Event ${eventId}`);
    log.push(`${optins.length} optin(s) to check`);

    let matched = false;
    for (const optin of optins) {
      log.push(`→ Checking Optin ${optin.optinId}…`);
      try {
        const maps = await getProductMapForOptin(supplierId, optin.optinId);
        const offerIds = extractOfferIdsFromProductMap(maps);
        log.push(`  HBase offerIds: [${[...offerIds].join(', ')}]`);
        if (targetOfferId && offerIds.has(targetOfferId)) {
          log.push(`  ✓ Match found for offerId ${targetOfferId} → Lifecycle A`);
          matched = true;
          break;
        } else {
          log.push(`  ✗ No match`);
        }
      } catch (e: any) {
        log.push(`  Error fetching productmap: ${e.message}`);
      }
    }

    if (!matched) {
      log.push('No match across all optins → Lifecycle B (fallback)');
      setLifecycle('B');
    } else {
      setLifecycle('A');
    }
    setBacktraceLog(log);
    setRunning(false);
  };

  return (
    <Box>
      {running && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CircularProgress size={16} />
          <Typography variant="body2">Running backtrace…</Typography>
        </Box>
      )}

      {lifecycle && (
        <Alert
          severity={lifecycle === 'A' ? 'success' : 'info'}
          sx={{ mb: 2 }}
        >
          <strong>Lifecycle {lifecycle} detected</strong>
          {lifecycle === 'A'
            ? ' — Optin-based flow. The selected offer is linked to an active optin.'
            : ' — Non-optin flow. Show standard offer UI.'}
        </Alert>
      )}

      {backtraceLog.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
          <Typography variant="subtitle2" gutterBottom>Backtrace Log</Typography>
          <Divider sx={{ mb: 1 }} />
          <List dense disablePadding>
            {backtraceLog.map((line, i) => (
              <ListItem key={i} disablePadding>
                <ListItemText
                  primary={line}
                  primaryTypographyProps={{ variant: 'caption', fontFamily: 'monospace' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {lifecycle && (
        <Box display="flex" gap={1} alignItems="center">
          <Chip
            label={`Lifecycle ${lifecycle}`}
            color={lifecycle === 'A' ? 'success' : 'default'}
            sx={{ fontWeight: 700 }}
          />
          <Typography variant="body2" color="text.secondary">
            Event: {eventId} | Supplier: {supplierId}
          </Typography>
        </Box>
      )}

      <Button sx={{ mt: 3 }} onClick={onBack}>← Back to offers</Button>
    </Box>
  );
}
