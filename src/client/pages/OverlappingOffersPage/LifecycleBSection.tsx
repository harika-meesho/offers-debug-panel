import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import type { OfferDetail } from '../../types';
import { formatTime } from '../../utils/format';
import { M, StepState, StepCircle } from '@components/StepCircle';
import FieldRow from '@components/FieldRow';

// ─── step 1: event details ────────────────────────────────────────────────────

function EventDetailsContent({
  eventId, eventType, eventName, eventCategory, slotStartTime, slotEndTime,
}: {
  eventId: string; eventType: string; eventName: string;
  eventCategory: string; slotStartTime: number; slotEndTime: number;
}) {
  return (
    <Box>
      <FieldRow border={false} label="Event ID" value={eventId} mono />
      <FieldRow border={false} label="Event Type" value={eventType} />
      {eventName && <FieldRow border={false} label="Event Name" value={eventName} />}
      {eventCategory && <FieldRow border={false} label="Category" value={eventCategory} />}
      <FieldRow border={false}
        label="Time Window"
        value={`${formatTime(slotStartTime)} → ${formatTime(slotEndTime)}`}
        mono
      />
    </Box>
  );
}

// ─── step 2: offer live state ─────────────────────────────────────────────────

function DiscountChips({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <Typography variant="caption" color="text.secondary">—</Typography>;
  const hasObjectValues = entries.some(([, v]) => typeof v === 'object' && v !== null);
  if (hasObjectValues) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {entries.map(([k, v]) => (
          <Box key={k}>
            <Chip label={k} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', mb: 0.5 }} />
            <Box sx={{ bgcolor: 'grey.50', px: 1, py: 0.75, borderRadius: 1 }}>
              {typeof v === 'object' && v !== null ? (
                Object.entries(v as Record<string, unknown>).map(([ik, iv]) => (
                  <Typography key={ik} variant="caption" fontFamily="monospace" display="block" lineHeight={1.7}>
                    <Box component="span" sx={{ color: 'text.secondary' }}>{ik}:</Box>
                    {' '}{typeof iv === 'object' ? JSON.stringify(iv) : String(iv ?? '—')}
                  </Typography>
                ))
              ) : (
                <Typography variant="caption" fontFamily="monospace">{String(v)}</Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {entries.map(([k, v]) => (
        <Box key={k}>
          <Chip label={k} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', mb: 0.5, height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.25 } }} />
          <Box sx={{ bgcolor: 'grey.50', px: 1, py: 0.75, borderRadius: 1 }}>
            <Typography variant="caption" fontFamily="monospace" fontWeight={600}>{String(v)}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

type LiveLabel = 'LIVE' | 'UPCOMING' | 'EXPIRED' | 'NOT ACTIVATED' | 'DISABLED';

function toSec(ts: number): number {
  return ts > 1e12 ? Math.floor(ts / 1000) : ts;
}

function deriveLiveState(
  d: OfferDetail,
  slotStart = 0,
  slotEnd = 0,
): { label: LiveLabel; color: 'success' | 'warning' | 'error' | 'default' } {
  const now = Math.floor(Date.now() / 1000);
  const start = toSec(d.start_time || slotStart);
  const end = toSec(d.end_time || slotEnd);
  if (d.status === 'DISABLED') return { label: 'DISABLED', color: 'error' };
  if (d.status === 'CREATED') return { label: 'NOT ACTIVATED', color: 'default' };
  if (!end) {
    return d.status === 'ACTIVE'
      ? { label: 'LIVE', color: 'success' }
      : { label: 'NOT ACTIVATED', color: 'default' };
  }
  if (now < start) return { label: 'UPCOMING', color: 'warning' };
  if (now > end) return { label: 'EXPIRED', color: 'default' };
  return { label: 'LIVE', color: 'success' };
}

function OfferLiveContent({
  d, slotStartTime, slotEndTime,
}: { d: OfferDetail; slotStartTime: number; slotEndTime: number }) {
  const live = deriveLiveState(d, slotStartTime, slotEndTime);
  const startTime = d.start_time || slotStartTime;
  const endTime = d.end_time || slotEndTime;
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip label={live.label} color={live.color} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
      </Box>
      <FieldRow border={false} label="Time Window" value={`${formatTime(startTime)} → ${formatTime(endTime)}`} mono />
      {d.name && <FieldRow border={false} label="Name" value={d.name} />}
      {d.funding_type && <FieldRow border={false} label="Funding Type" value={d.funding_type} />}
      {d.created_by && <FieldRow border={false} label="Created By" value={d.created_by} mono />}
      {d.disabled_by && (
        <>
          <Divider sx={{ my: 1, borderColor: M.purpleFaint }} />
          <FieldRow border={false} label="Disabled By" value={d.disabled_by} mono />
          {d.disabled_reason && <FieldRow border={false} label="Disable Reason" value={d.disabled_reason} />}
        </>
      )}
      {d.discounts && Object.keys(d.discounts).length > 0 && (
        <>
          <Divider sx={{ my: 1, borderColor: M.purpleFaint }} />
          <FieldRow border={false} label="Discounts">
            <DiscountChips data={d.discounts} />
          </FieldRow>
        </>
      )}
    </Box>
  );
}

// ─── component ───────────────────────────────────────────────────────────────

interface Props {
  eventId: string;
  eventType: string;
  eventName: string;
  eventCategory: string;
  eventStartTime: number;
  eventEndTime: number;
  slotStartTime: number;
  slotEndTime: number;
  offerDetail: OfferDetail | undefined;
}

type StepDef = { index: number; title: string; state: StepState; content: React.ReactNode };

export default function LifecycleBSection({
  eventId, eventType, eventName, eventCategory,
  eventStartTime, eventEndTime, slotStartTime, slotEndTime, offerDetail,
}: Props) {
  function offerStepState(): StepState {
    if (!offerDetail) return 'pending';
    const s = deriveLiveState(offerDetail, slotStartTime, slotEndTime);
    if (s.label === 'LIVE') return 'done';
    if (s.label === 'DISABLED' || s.label === 'EXPIRED') return 'error';
    if (s.label === 'UPCOMING') return 'warn';
    return 'pending';
  }

  const steps: StepDef[] = [
    {
      index: 1, title: 'Event Details', state: 'done',
      content: (
        <EventDetailsContent
          eventId={eventId} eventType={eventType} eventName={eventName}
          eventCategory={eventCategory} slotStartTime={eventStartTime} slotEndTime={eventEndTime}
        />
      ),
    },
    {
      index: 2, title: 'Offer Live State', state: offerStepState(),
      content: offerDetail ? (
        <OfferLiveContent d={offerDetail} slotStartTime={slotStartTime} slotEndTime={slotEndTime} />
      ) : (
        <Typography variant="caption" sx={{ color: M.purpleMid }}>No offer detail available.</Typography>
      ),
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'white',
        overflow: 'hidden',
        border: `1px solid ${M.purpleBorder}`,
        borderTop: `3px solid ${M.purple}`,
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2, bgcolor: M.purpleLight, borderBottom: `1px solid ${M.purpleBorder}` }}>
        <Typography fontWeight={700} fontSize="0.95rem" sx={{ color: M.purple }}>
          Offer Lifecycle
        </Typography>
        <Typography variant="caption" sx={{ color: M.purpleMid }}>
          Event {eventId} · {eventType} flow
        </Typography>
      </Box>

      {/* Step indicators */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {steps.map((step) => (
            <React.Fragment key={step.index}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                  <StepCircle n={step.index} state={step.state} />
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ fontSize: '0.68rem', color: M.purpleMid, display: 'block', lineHeight: 1 }}
                    >
                      STEP {step.index}
                    </Typography>
                    <Typography fontWeight={700} fontSize="0.88rem" sx={{ color: step.state === 'done' ? M.purple : 'text.primary' }}>
                      {step.title}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </Box>

      <Divider sx={{ borderColor: M.purpleFaint }} />

      {/* Content columns */}
      <Box sx={{ display: 'flex' }}>
        {steps.map((step, i) => (
          <Box
            key={step.index}
            sx={{
              flex: 1, p: 2.5, minWidth: 0,
              borderRight: i < steps.length - 1 ? `1px solid ${M.purpleFaint}` : 'none',
            }}
          >
            {step.content}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
