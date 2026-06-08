import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Tooltip,
  Typography,
} from '@mui/material';
import AppHeader from '@components/AppHeader';
import StatusChip from '@components/StatusChip';
import { formatTime } from '../../utils/format';
import { RootState } from '@store/index';

// ─── constants ────────────────────────────────────────────────────────────────

const COLUMNS = [
  'ID', 'Offer ID', 'Status', 'Name', 'Description',
  'Start Time', 'End Time', 'Funding Type', 'Created By', 'Disabled By',
] as const;

// ─── sub-components ───────────────────────────────────────────────────────────

function DisabledByCell({ disabledBy, reason }: { disabledBy: string; reason: string }) {
  return (
    <Tooltip title={reason || ''} placement="top" arrow>
      <Box>
        <Typography
          variant="body2"
          fontSize="0.82rem"
          sx={{ textDecoration: 'underline dotted', cursor: 'help' }}
        >
          {disabledBy}
        </Typography>
        {reason && (
          <Typography variant="caption" color="error.main" display="block">
            {reason}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function EventOffersPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { data, pid, sid } = useSelector((state: RootState) => state.debugPanel);

  // Guard: user landed here without loading data first
  if (!data) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
        <AppHeader onBack={() => navigate('/')} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="warning">
            No data loaded.{' '}
            <strong onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              Go back
            </strong>{' '}
            and enter a PID + SID first.
          </Alert>
        </Container>
      </Box>
    );
  }

  const event = data.events.find((e) => e.event_id === eventId);
  const timeslots = event?.timeslots ?? [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
      <AppHeader onBack={() => navigate('/')} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ── Breadcrumb ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate('/')}
          >
            ← Event ID list
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mx: 0.5 }}>/</Typography>
          <Typography variant="body2" color="text.secondary">Event {eventId}</Typography>
        </Box>

        {/* ── Page header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Offer configuration — Event {eventId}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              PID <strong>{pid}</strong> · SID <strong>{sid}</strong>
            </Typography>
          </Box>
          <Chip
            label={`${timeslots.length} offer${timeslots.length !== 1 ? 's' : ''}`}
            color="primary"
          />
        </Box>

        {/* ── Offers table ── */}
        <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col}
                    sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {timeslots.map((ts, i) => {
                const d = ts.offer_detail;
                return (
                  <TableRow key={ts.offer_id} hover>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', width: 36 }}>
                      {i + 1}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', maxWidth: 300, wordBreak: 'break-all' }}>
                      {ts.offer_id}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={d?.status} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', maxWidth: 200 }}>
                      {d?.name || '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary', maxWidth: 200 }}>
                      {d?.description || '—'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                      {formatTime(ts.start_time)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                      {formatTime(ts.end_time)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>{d?.funding_type || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>{d?.created_by || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>
                      {d?.disabled_by
                        ? <DisabledByCell disabledBy={d.disabled_by!} reason={d.disabled_reason ?? ''} />
                        : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
