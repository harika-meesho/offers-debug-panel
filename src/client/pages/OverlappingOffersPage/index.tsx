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

const TABLE_COLUMNS = [
  'ID', 'Offer ID', 'Event ID', 'Event Name', 'Time Window', 'Status', 'Name', 'Funding Type',
] as const;

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

// ─── selected offer card ──────────────────────────────────────────────────────

function LabelValue({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.25 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontFamily={mono ? 'monospace' : undefined}
        fontSize={mono ? '0.8rem' : '0.85rem'}
        sx={{ wordBreak: 'break-all' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function SelectedOfferCard({ ts }: { ts: EnrichedTimeslot }) {
  const d = ts.offer_detail;
  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, mb: 3, borderColor: 'primary.main', borderWidth: 2, bgcolor: 'white' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography fontWeight={700} fontSize="1rem">Selected Offer</Typography>
        {d?.status && <StatusChip status={d.status} />}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
        <LabelValue label="Offer ID" value={ts.offer_id} mono />
        <LabelValue label="Event ID" value={ts.event_id} mono />
        <LabelValue label="Event Name" value={ts.event_name || '—'} />
        <LabelValue
          label="Time Window"
          value={`${formatTime(ts.start_time)} → ${formatTime(ts.end_time)}`}
          mono
        />
        {d?.name && <LabelValue label="Name" value={d.name} />}
        {d?.funding_type && <LabelValue label="Funding Type" value={d.funding_type} />}
        {d?.created_by && <LabelValue label="Created By" value={d.created_by} />}
        {d?.disabled_by && (
          <Box>
            <LabelValue label="Disabled By" value={d.disabled_by} />
            {d.disabled_reason && (
              <Typography variant="caption" color="error.main">{d.disabled_reason}</Typography>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function OverlappingOffersPage() {
  const { eventId, offerId } = useParams<{ eventId: string; offerId: string }>();
  const navigate = useNavigate();

  const { data, pid, sid } = useSelector((state: RootState) => state.debugPanel);

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

  const selectedTs =
    allTimeslots.find((ts) => ts.offer_id === offerId && ts.event_id === eventId) ??
    allTimeslots.find((ts) => ts.offer_id === offerId);

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

  const overlappingOffers = allTimeslots
    .filter(
      (ts) =>
        ts.offer_id !== selectedTs.offer_id &&
        ts.start_time < selectedTs.end_time &&
        ts.end_time > selectedTs.start_time
    )
    .sort((a, b) => a.event_id.localeCompare(b.event_id));

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

        {/* ── Selected offer card ── */}
        <SelectedOfferCard ts={selectedTs} />

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
                    {TABLE_COLUMNS.map((col) => (
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
                  {/* ── Row 0: selected offer ── */}
                  {(() => {
                    const d = selectedTs.offer_detail;
                    return (
                      <TableRow sx={{ bgcolor: '#EEF4FB', borderLeft: `3px solid ${SELECTED_COLOR}` }}>
                        <TableCell sx={{ fontSize: '0.75rem', width: 36 }}>
                          <Chip label="→" size="small" color="primary" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', maxWidth: 260, wordBreak: 'break-all', fontWeight: 700 }}>
                          {selectedTs.offer_id}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: SELECTED_COLOR, flexShrink: 0 }} />
                            {selectedTs.event_id}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{selectedTs.event_name || '—'}</TableCell>
                        <TableCell sx={{ minWidth: 200 }}>
                          <SingleBar
                            offer={selectedTs}
                            color={SELECTED_COLOR}
                            globalMin={globalMin}
                            globalSpan={globalSpan}
                          />
                        </TableCell>
                        <TableCell><StatusChip status={d?.status} /></TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{d?.name || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{d?.funding_type || '—'}</TableCell>
                      </TableRow>
                    );
                  })()}

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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                            {ts.event_id}
                          </Box>
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
        {/* ── Lifecycle section ── */}
        {selectedEvent && (
          <LifecycleSection
            eventType={selectedEvent.event_type}
            optinWindow={selectedEvent.optin_window}
            optinId={selectedTs?.optin_id ?? undefined}
            supplierId={sid}
            offerDetail={selectedTs?.offer_detail}
            slotStartTime={selectedTs.start_time}
            slotEndTime={selectedTs.end_time}
          />
        )}
      </Container>
    </Box>
  );
}
