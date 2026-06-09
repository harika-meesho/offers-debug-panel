import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Chip,
  Divider,
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AppHeader from '@components/AppHeader';
import StatusChip from '@components/StatusChip';
import { formatTime } from '../../utils/format';
import { RootState } from '@store/index';

// ─── constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const COLUMNS = [
  'ID', 'Offer ID', 'Time Window', 'Status', 'Name', 'Description',
  'Funding Type', 'Created By', 'Disabled By',
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

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const event = data?.events.find((e) => e.event_id === eventId);
  const timeslots = event?.timeslots ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return timeslots.filter((ts) => {
      const d = ts.offer_detail;
      if (statusFilter && d?.status !== statusFilter) return false;
      if (q && !ts.offer_id.toLowerCase().includes(q) && !(d?.name ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [timeslots, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = statusFilter || search;

  function clearFilters() {
    setStatusFilter('');
    setSearch('');
    setPage(1);
  }

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

        <Alert severity="info" sx={{ mb: 2 }}>
          Click any offer row to see all overlapping offers across events.
        </Alert>

        {/* ── Table card ── */}
        <Paper variant="outlined" sx={{ bgcolor: 'white' }}>

          {/* Filter bar */}
          <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="DISABLED">DISABLED</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search by offer ID or name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              sx={{ minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearch(''); setPage(1); }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {hasFilters && (
                <Typography variant="caption" color="text.secondary">
                  {filtered.length} of {timeslots.length} offers
                </Typography>
              )}
              {hasFilters && (
                <Typography
                  variant="caption"
                  color="primary.main"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={clearFilters}
                >
                  Clear all
                </Typography>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Table */}
          <TableContainer>
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
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 5, color: 'text.disabled' }}>
                      {hasFilters ? 'No offers match the current filters.' : 'No offers found for this event.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((ts, i) => {
                    const d = ts.offer_detail;
                    const globalIdx = (page - 1) * PAGE_SIZE + i + 1;
                    return (
                      <TableRow
                        key={ts.offer_id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/event/${eventId}/offer/${ts.offer_id}/overlapping`)}
                      >
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', width: 36 }}>
                          {globalIdx}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', maxWidth: 300, wordBreak: 'break-all' }}>
                          {ts.offer_id}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                          {formatTime(ts.start_time)} → {formatTime(ts.end_time)}
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
                        <TableCell sx={{ fontSize: '0.82rem' }}>{d?.funding_type || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{d?.created_by || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>
                          {d?.disabled_by
                            ? <DisabledByCell disabledBy={d.disabled_by!} reason={d.disabled_reason ?? ''} />
                            : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination — only shown when there is more than one page */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1.5, borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                size="small"
                color="primary"
              />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
