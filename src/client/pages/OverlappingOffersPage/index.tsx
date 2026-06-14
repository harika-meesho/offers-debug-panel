import { useState, useMemo } from 'react';
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
  TableSortLabel,
  Paper,
  Alert,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import AppHeader from '@components/AppHeader';
import StatusChip from '@components/StatusChip';
import { formatTime } from '../../utils/format';
import { RootState } from '@store/index';
import { TimeslotWithDetail } from '../../types';
import LifecycleSection from './LifecycleSection';

// ─── types ────────────────────────────────────────────────────────────────────

interface EnrichedTimeslot extends TimeslotWithDetail {
  event_id: string;
  event_name: string;
}

// ─── constants ────────────────────────────────────────────────────────────────

const SELECTED_COLOR = '#1976d2';

const EVENT_PALETTE = [
  '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4',
  '#F44336', '#795548', '#607D8B', '#E91E63',
];

const STATUS_ORDER: Record<string, number> = { ACTIVE: 0, DISABLED: 1 };
const statusRank = (s?: string) => STATUS_ORDER[s ?? ''] ?? 2;

type SortCol = 'event_id' | 'status' | 'name' | 'funding_type';
type SortKey = { col: SortCol; dir: 'asc' | 'desc' };

const COLUMNS: { label: string; sortKey?: SortCol }[] = [
  { label: '#' },
  { label: 'Offer ID' },
  { label: 'Event ID', sortKey: 'event_id' },
  { label: 'Event Name' },
  { label: 'Time Window' },
  { label: 'Status', sortKey: 'status' },
  { label: 'Name', sortKey: 'name' },
  { label: 'Funding Type', sortKey: 'funding_type' },
];

const tooltipSlotProps = {
  tooltip: {
    sx: {
      bgcolor: 'white',
      color: 'text.primary',
      boxShadow: 6,
      border: '1px solid',
      borderColor: 'divider',
      p: 0,
      maxWidth: 420,
      '& .MuiTooltip-arrow': {
        color: 'white',
        '&::before': { border: '1px solid', borderColor: 'divider' },
      },
    },
  },
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function toLeftPct(t: number, min: number, span: number) {
  return span === 0 ? 0 : ((t - min) / span) * 100;
}


// ─── single bar (shown in each row's Time Window cell) ────────────────────────

function SingleBar({
  offer,
  color,
  globalMin,
  globalSpan,
}: {
  offer: EnrichedTimeslot;
  color: string;
  globalMin: number;
  globalSpan: number;
}) {
  const left = toLeftPct(offer.start_time, globalMin, globalSpan);
  const width = Math.max(toLeftPct(offer.end_time, globalMin, globalSpan) - left, 2);
  return (
    <Box sx={{ width: 180, cursor: 'help' }}>
      <Box sx={{ position: 'relative', height: 8, bgcolor: 'grey.100', borderRadius: 0.5 }}>
        <Box
          sx={{
            position: 'absolute', top: 0, bottom: 0, borderRadius: 0.5,
            bgcolor: color,
            left: `${left}%`,
            width: `${width}%`,
          }}
        />
      </Box>
    </Box>
  );
}

// ─── mini timeline (shown in tooltip on bar hover) ────────────────────────────

function MiniTimeline({
  selected,
  offer,
  color,
}: {
  selected: EnrichedTimeslot;
  offer: EnrichedTimeslot;
  color: string;
}) {
  const timeMin = Math.min(selected.start_time, offer.start_time);
  const timeMax = Math.max(selected.end_time, offer.end_time);
  const span = timeMax - timeMin;

  const BAR_H = 28;

  function bar(ts: EnrichedTimeslot, barColor: string, label: string, bold: boolean) {
    const left = toLeftPct(ts.start_time, timeMin, span);
    const width = toLeftPct(ts.end_time, timeMin, span) - left;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
        <Box sx={{ width: 110, flexShrink: 0, pr: 1 }}>
          <Typography
            variant="caption"
            fontFamily="monospace"
            fontSize="0.68rem"
            noWrap
            sx={{ color: bold ? barColor : 'text.secondary', fontWeight: bold ? 700 : 400 }}
          >
            {bold ? '▶ ' : ''}{label}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, position: 'relative', height: BAR_H }}>
          <Box sx={{ position: 'absolute', inset: '30% 0', bgcolor: 'grey.100', borderRadius: 0.5 }} />
          <Box
            sx={{
              position: 'absolute',
              top: bold ? '18%' : '24%',
              bottom: bold ? '18%' : '24%',
              left: `${left}%`,
              width: `${Math.max(width, 2)}%`,
              bgcolor: barColor,
              borderRadius: 1,
              opacity: bold ? 1 : 0.85,
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 360, p: 1 }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1.25 }}>
        Overlap Timeline
      </Typography>

      {bar(selected, SELECTED_COLOR, 'Selected', true)}
      {bar(offer, color, offer.offer_id.slice(-10), false)}

      {/* Time axis */}
      <Box sx={{ display: 'flex', ml: '110px', mt: 0.25 }}>
        <Box sx={{ flex: 1, borderTop: '1.5px solid', borderColor: 'grey.300' }} />
      </Box>
      <Box sx={{ display: 'flex', ml: '110px', mt: 0.25 }}>
        <Typography variant="caption" color="text.disabled" fontFamily="monospace" fontSize="0.65rem">
          {formatTime(timeMin)}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.disabled" fontFamily="monospace" fontSize="0.65rem">
          {formatTime(timeMax)}
        </Typography>
      </Box>

      <Divider sx={{ my: 1.25 }} />

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Selected window</Typography>
          <Typography variant="caption" fontFamily="monospace" fontSize="0.68rem">
            {formatTime(selected.start_time)} → {formatTime(selected.end_time)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">This offer</Typography>
          <Typography variant="caption" fontFamily="monospace" fontSize="0.68rem">
            {formatTime(offer.start_time)} → {formatTime(offer.end_time)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── selected offer bar tooltip ───────────────────────────────────────────────

function SelectedBarTooltip({ ts }: { ts: EnrichedTimeslot }) {
  return (
    <Box sx={{ width: 280, p: 1 }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1 }}>
        Selected Offer
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Time Window</Typography>
      <Typography variant="caption" fontFamily="monospace" fontSize="0.68rem">
        {formatTime(ts.start_time)} → {formatTime(ts.end_time)}
      </Typography>
    </Box>
  );
}

// ─── selected offer row ───────────────────────────────────────────────────────

function SelectedOfferRow({
  ts,
  globalMin,
  globalSpan,
}: {
  ts: EnrichedTimeslot;
  globalMin: number;
  globalSpan: number;
}) {
  const d = ts.offer_detail;
  return (
    <TableRow sx={{ bgcolor: '#EEF4FB', borderLeft: `3px solid ${SELECTED_COLOR}` }}>
      <TableCell sx={{ fontSize: '0.75rem', width: 36, color: 'text.disabled' }}>—</TableCell>
      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', maxWidth: 260, wordBreak: 'break-all', fontWeight: 700 }}>
        {ts.offer_id}
      </TableCell>
      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{ts.event_id}</TableCell>
      <TableCell sx={{ fontSize: '0.82rem' }}>{ts.event_name || '—'}</TableCell>
      <TableCell sx={{ minWidth: 200 }}>
        <Tooltip title={<SelectedBarTooltip ts={ts} />} placement="left" arrow slotProps={tooltipSlotProps}>
          <Box sx={{ display: 'inline-block' }}>
            <SingleBar offer={ts} color={SELECTED_COLOR} globalMin={globalMin} globalSpan={globalSpan} />
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell><StatusChip status={d?.status} /></TableCell>
      <TableCell sx={{ fontSize: '0.82rem' }}>{d?.name || '—'}</TableCell>
      <TableCell sx={{ fontSize: '0.82rem' }}>{d?.funding_type || '—'}</TableCell>
    </TableRow>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function OverlappingOffersPage() {
  const { eventId, offerId } = useParams<{ eventId: string; offerId: string }>();
  const navigate = useNavigate();

  const { data, pid, sid } = useSelector((state: RootState) => state.debugPanel);

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
  }

  if (!data) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
        <AppHeader onBack={() => navigate('/')} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="warning">
            No data loaded.{' '}
            <strong onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Go back</strong>
            {' '}and enter a PID + SID first.
          </Alert>
        </Container>
      </Box>
    );
  }

  const allTimeslots: EnrichedTimeslot[] = data.events.flatMap((e) =>
    e.timeslots.map((ts) => ({ ...ts, event_id: e.event_id, event_name: e.event_name }))
  );

  const selectedTs = allTimeslots.reduce<EnrichedTimeslot | undefined>((best, ts) => {
    if (ts.offer_id === offerId && ts.event_id === eventId) return ts;
    if (!best && ts.offer_id === offerId) return ts;
    return best;
  }, undefined);

  const selectedEvent = data.events.find((e) => e.event_id === eventId);

  if (!selectedTs) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
        <AppHeader onBack={() => navigate(`/event/${eventId}`)} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">Offer not found in loaded data.</Alert>
        </Container>
      </Box>
    );
  }

  const overlappingOffers = useMemo(() => {
    const base = allTimeslots.filter(
      (ts) =>
        ts.offer_id !== selectedTs.offer_id &&
        ts.start_time < selectedTs.end_time &&
        ts.end_time > selectedTs.start_time
    );
    if (sortKeys.length === 0) return [...base].sort((a, b) => a.event_id.localeCompare(b.event_id));
    return [...base].sort((a, b) => {
      for (const { col, dir } of sortKeys) {
        let cmp = 0;
        if (col === 'event_id') cmp = a.event_id.localeCompare(b.event_id);
        else if (col === 'status') cmp = statusRank(a.offer_detail?.status) - statusRank(b.offer_detail?.status);
        else if (col === 'name') cmp = (a.offer_detail?.name ?? '').localeCompare(b.offer_detail?.name ?? '');
        else if (col === 'funding_type') cmp = (a.offer_detail?.funding_type ?? '').localeCompare(b.offer_detail?.funding_type ?? '');
        if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }, [allTimeslots, selectedTs, sortKeys]);

  // Stable color per event from palette
  const eventColorMap = new Map<string, string>();
  let colorIdx = 0;
  for (const ts of overlappingOffers) {
    if (!eventColorMap.has(ts.event_id)) {
      eventColorMap.set(ts.event_id, EVENT_PALETTE[colorIdx++ % EVENT_PALETTE.length]);
    }
  }

  // Global time bounds — all bars share the same scale
  const globalMin = overlappingOffers.reduce(
    (m, ts) => Math.min(m, ts.start_time),
    selectedTs.start_time
  );
  const globalMax = overlappingOffers.reduce(
    (m, ts) => Math.max(m, ts.end_time),
    selectedTs.end_time
  );
  const globalSpan = globalMax - globalMin;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
      <AppHeader onBack={() => navigate(`/event/${eventId}`)} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ── Breadcrumb ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate('/')}
          >
            Event ID list
          </Typography>
          <Typography variant="body2" color="text.disabled">/</Typography>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate(`/event/${eventId}`)}
          >
            Event {eventId}
          </Typography>
          <Typography variant="body2" color="text.disabled">/</Typography>
          <Typography variant="body2" color="text.secondary">Overlapping offers</Typography>
        </Box>

        {/* ── Page header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Overlapping offers</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              PID <strong>{pid}</strong> · SID <strong>{sid}</strong>
            </Typography>
          </Box>
          {overlappingOffers.length > 0 && (
            <Chip
              label={`${overlappingOffers.length} overlapping offer${overlappingOffers.length !== 1 ? 's' : ''}`}
              color="warning"
            />
          )}
        </Box>

        {/* ── Offer Lifecycle ── */}
        {selectedEvent && (
          <Box sx={{ mb: 3 }}>
            <LifecycleSection
              eventType={selectedEvent.event_type}
              eventId={selectedEvent.event_id}
              eventName={selectedEvent.event_name}
              eventCategory={selectedEvent.event_category}
              optinWindow={selectedTs?.optin_window}
              optinId={
                selectedTs?.optin_id ??
                (selectedTs?.optin_window?.optin_id != null
                  ? String(selectedTs.optin_window.optin_id)
                  : undefined)
              }
              supplierId={sid}
              offerDetail={selectedTs?.offer_detail}
              eventStartTime={selectedEvent.start_time}
              eventEndTime={selectedEvent.end_time}
              slotStartTime={selectedTs.start_time}
              slotEndTime={selectedTs.end_time}
            />
          </Box>
        )}

        {/* ── Overlapping offers table ── */}
        {overlappingOffers.length === 0 ? (
          <Alert severity="success" sx={{ mb: 0 }}>
            No other offers overlap with this offer's time window.
          </Alert>
        ) : (
          <Paper variant="outlined" sx={{ bgcolor: 'white', overflow: 'hidden' }}>
            {/* Section header */}
            <Box sx={{ px: 3, py: 1.75, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography fontWeight={700} fontSize="0.95rem">Overlapping Offers</Typography>
              <Typography variant="caption" color="text.secondary">
                — hover the Time Window bar to see the overlap timeline
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    {COLUMNS.map((col) => {
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
                  {/* ── Row 0: selected offer ── */}
                  <SelectedOfferRow ts={selectedTs} globalMin={globalMin} globalSpan={globalSpan} />

                  {/* ── Overlapping offer rows ── */}
                  {overlappingOffers.map((ts, i) => {
                    const d = ts.offer_detail;
                    const color = eventColorMap.get(ts.event_id) ?? '#90A4AE';
                    return (
                      <TableRow
                        key={`${ts.offer_id}|${ts.event_id}|${ts.start_time}`}
                        hover
                        sx={{ cursor: 'default' }}
                      >
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', width: 36 }}>
                          {i + 1}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', maxWidth: 260, wordBreak: 'break-all' }}>
                          {ts.offer_id}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                          {ts.event_id}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{ts.event_name || '—'}</TableCell>
                        <TableCell sx={{ minWidth: 200 }}>
                          <Tooltip
                            title={<MiniTimeline selected={selectedTs} offer={ts} color={color} />}
                            placement="left"
                            arrow
                            slotProps={tooltipSlotProps}
                          >
                            <Box sx={{ display: 'inline-block' }}>
                              <SingleBar
                                offer={ts}
                                color={color}
                                globalMin={globalMin}
                                globalSpan={globalSpan}
                              />
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={d?.status} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{d?.name || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{d?.funding_type || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
