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
  TableSortLabel,
  Paper,
  Alert,
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
import type { EventGroup } from '../../types';

// ─── constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const STATUS_ORDER: Record<string, number> = { ACTIVE: 0, DISABLED: 1 };
const statusRank = (s?: string) => STATUS_ORDER[s ?? ''] ?? 2;

type SortCol = 'start_time' | 'status' | 'name' | 'funding_type';
type SortKey = { col: SortCol; dir: 'asc' | 'desc' };

const BASE_COLUMNS: { label: string; sortKey?: SortCol }[] = [
  { label: 'ID' },
  { label: 'Offer ID' },
  { label: 'Time Window', sortKey: 'start_time' },
  { label: 'Status', sortKey: 'status' },
  { label: 'Name', sortKey: 'name' },
  { label: 'Funding Type', sortKey: 'funding_type' },
  { label: 'Created By' },
  { label: 'Disabled By' },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function EventDetailCard({ event }: { event: EventGroup }) {
  const typeColor = event.event_type === 'optin' ? 'secondary' : event.event_type === 'direct' ? 'info' : 'default';
  return (
    <Paper variant="outlined" sx={{ bgcolor: 'white', mb: 2, px: 3, py: 2 }}>
      <Typography fontWeight={700} fontSize="0.9rem" sx={{ mb: 1.5 }}>
        Event Details
      </Typography>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {event.event_image && (
          <Box
            component="img"
            src={event.event_image}
            alt={event.event_name}
            sx={{ width: 64, height: 64, borderRadius: 1, objectFit: 'cover', flexShrink: 0, border: '1px solid', borderColor: 'divider' }}
          />
        )}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Event ID</Typography>
          <Typography variant="body2" fontFamily="monospace" fontWeight={700}>{event.event_id}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Type</Typography>
          <Chip
            label={event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
            size="small"
            color={typeColor as 'secondary' | 'info' | 'default'}
            sx={{ mt: 0.25 }}
          />
        </Box>
        {event.event_name && (
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Event Name</Typography>
            <Typography variant="body2">{event.event_name}</Typography>
          </Box>
        )}
        {event.event_category && (
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Category</Typography>
            <Typography variant="body2">{event.event_category}</Typography>
          </Box>
        )}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Event Window</Typography>
          <Typography variant="body2" fontFamily="monospace" fontSize="0.82rem">
            {formatTime(event.event_start_time || event.start_time)} → {formatTime(event.event_end_time || event.end_time)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function DisabledByCell({ disabledBy, reason }: { disabledBy: string; reason: string }) {
  return (
    <Box>
      <Typography variant="body2" fontSize="0.82rem">{disabledBy}</Typography>
      {reason && (
        <Typography variant="caption" color="error.main" display="block">{reason}</Typography>
      )}
    </Box>
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
  const [pageSize, setPageSize] = useState(10);
  const [sortKeys, setSortKeys] = useState<SortKey[]>([]);

  function handleSort(col: SortCol) {
    setSortKeys((prev) => {
      const idx = prev.findIndex((k) => k.col === col);
      if (idx === -1) return [...prev, { col, dir: 'asc' }];
      if (prev[idx].dir === 'asc') {
        const next = [...prev];
        next[idx] = { col, dir: 'desc' };
        return next;
      }
      return prev.filter((_, i) => i !== idx);
    });
    setPage(1);
  }

  const event = data?.events.find((e) => e.event_id === eventId);
  const timeslots = event?.timeslots ?? [];
  const isOptin = event?.event_type === 'optin';

  const columns = useMemo(() => {
    const cols = [...BASE_COLUMNS];
    if (isOptin) cols.splice(2, 0, { label: 'Optin ID' });
    return cols;
  }, [isOptin]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const base = timeslots.filter((ts) => {
      const d = ts.offer_detail;
      if (statusFilter && d?.status !== statusFilter) return false;
      if (q && !ts.offer_id.toLowerCase().includes(q) && !(d?.name ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
    if (sortKeys.length === 0) return [...base].sort((a, b) => statusRank(a.offer_detail?.status) - statusRank(b.offer_detail?.status));
    return [...base].sort((a, b) => {
      for (const { col, dir } of sortKeys) {
        let cmp = 0;
        if (col === 'start_time') cmp = a.start_time - b.start_time;
        else if (col === 'status') cmp = (a.offer_detail?.status ?? '').localeCompare(b.offer_detail?.status ?? '');
        else if (col === 'name') cmp = (a.offer_detail?.name ?? '').localeCompare(b.offer_detail?.name ?? '');
        else if (col === 'funding_type') cmp = (a.offer_detail?.funding_type ?? '').localeCompare(b.offer_detail?.funding_type ?? '');
        if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }, [timeslots, statusFilter, search, sortKeys]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

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
            Event ID list
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

        {/* ── Event details card ── */}
        {event && <EventDetailCard event={event} />}

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
                  {columns.map((col) => {
                    const sortEntry = col.sortKey ? sortKeys.find((k) => k.col === col.sortKey) : undefined;
                    const priority = col.sortKey ? sortKeys.findIndex((k) => k.col === col.sortKey) : -1;
                    return (
                      <TableCell
                        key={col.label}
                        sortDirection={sortEntry ? sortEntry.dir : false}
                        sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        {col.sortKey ? (
                          <TableSortLabel
                            active={!!sortEntry}
                            direction={sortEntry?.dir ?? 'asc'}
                            onClick={() => handleSort(col.sortKey!)}
                            sx={{ '& .MuiTableSortLabel-icon': { opacity: sortEntry ? 1 : 0.3, transition: 'opacity 0.2s' } }}
                          >
                            {col.label}
                            {sortKeys.length > 1 && priority !== -1 && (
                              <Typography component="span" sx={{ fontSize: '0.6rem', ml: 0.3, fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
                                {priority + 1}
                              </Typography>
                            )}
                          </TableSortLabel>
                        ) : (
                          col.label
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 5, color: 'text.disabled' }}>
                      {hasFilters ? 'No offers match the current filters.' : 'No offers found for this event.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((ts, i) => {
                    const d = ts.offer_detail;
                    const globalIdx = (page - 1) * pageSize + i + 1;
                    return (
                      <TableRow
                        key={`${ts.offer_id}|${ts.start_time}`}
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
                        {isOptin && (
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'text.primary' }}>
                            {ts.optin_id ?? (ts.optin_window?.optin_id != null ? String(ts.optin_window.optin_id) : '—')}
                          </TableCell>
                        )}
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                          {formatTime(ts.start_time)} → {formatTime(ts.end_time)}
                        </TableCell>
                        <TableCell>
                          <StatusChip status={d?.status} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', maxWidth: 200 }}>
                          {d?.name || '—'}
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

          {/* Pagination footer — always visible when there are results */}
          {filtered.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
              {/* Rows per page */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">Rows per page:</Typography>
                <Select
                  size="small"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  sx={{ fontSize: '0.8rem', height: 28, '.MuiSelect-select': { py: 0.25, px: 1 } }}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <MenuItem key={n} value={n} sx={{ fontSize: '0.8rem' }}>{n}</MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Count + page controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
                </Typography>
                <Pagination
                  count={Math.max(1, totalPages)}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  size="small"
                  color="primary"
                />
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
