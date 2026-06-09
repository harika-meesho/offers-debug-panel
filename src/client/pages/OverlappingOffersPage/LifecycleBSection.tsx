import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import type { LifecycleBResponse, OfferDetail } from '../../types';
import { getLifecycleB } from '../../services/api';
import { formatTime } from '../../utils/format';

// ─── Meesho brand tokens ──────────────────────────────────────────────────────

const M = {
  purple:      '#6C3FC5',
  purpleDeep:  '#5a33a8',
  purpleLight: '#F0EAFB',
  purpleMid:   '#9B7EE0',
  purpleBorder:'#DDD0F0',
  purpleFaint: '#EDE7F6',
};

// ─── step circle ──────────────────────────────────────────────────────────────

type StepState = 'done' | 'warn' | 'error' | 'loading' | 'pending';

function StepCircle({ n, state }: { n: number; state: StepState }) {
  const base = {
    width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, fontSize: '0.78rem', fontWeight: 700,
  };
  if (state === 'loading') {
    return (
      <Box sx={{ ...base, border: `2px solid ${M.purple}` }}>
        <CircularProgress size={14} sx={{ color: M.purple }} />
      </Box>
    );
  }
  const cfg: Record<StepState, { bg: string; border: string; color: string }> = {
    done:    { bg: M.purple,   border: M.purple,        color: '#fff'    },
    error:   { bg: '#D32F2F',  border: '#D32F2F',       color: '#fff'    },
    warn:    { bg: '#ED6C02',  border: '#ED6C02',       color: '#fff'    },
    pending: { bg: M.purpleLight, border: M.purpleBorder, color: M.purpleMid },
    loading: { bg: '#fff',     border: M.purple,        color: M.purple  },
  };
  const c = cfg[state];
  return (
    <Box sx={{ ...base, bgcolor: c.bg, border: `2px solid ${c.border}`, color: c.color }}>
      {n}
    </Box>
  );
}

// ─── field ────────────────────────────────────────────────────────────────────

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'flex-start' }}>
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{ width: 110, flexShrink: 0, color: '#7B6A9C' }}
      >
        {label}
      </Typography>
      <Typography variant="caption" fontFamily={mono ? 'monospace' : undefined} sx={{ wordBreak: 'break-all' }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

// ─── step 1: event details ────────────────────────────────────────────────────

function EventDetailsContent({
  eventId, eventType, eventName, eventCategory, slotStartTime, slotEndTime,
}: {
  eventId: string; eventType: string; eventName: string;
  eventCategory: string; slotStartTime: number; slotEndTime: number;
}) {
  return (
    <Box>
      <Field label="Event ID" value={eventId} mono />
      <Field label="Event Type" value={eventType} />
      {eventName && <Field label="Event Name" value={eventName} />}
      {eventCategory && <Field label="Category" value={eventCategory} />}
      <Field
        label="Time Window"
        value={`${formatTime(slotStartTime)} → ${formatTime(slotEndTime)}`}
        mono
      />
    </Box>
  );
}

// ─── step 2: upload jobs ──────────────────────────────────────────────────────

function JobsContent({ d }: { d: LifecycleBResponse['upload_jobs'] }) {
  if (!d || !d.data || d.data.length === 0) {
    return (
      <Typography variant="caption" sx={{ color: M.purpleMid }}>
        No upload jobs found for this event.
      </Typography>
    );
  }
  return (
    <Box>
      {d.data.map((job) => (
        <Box
          key={job.id}
          sx={{
            bgcolor: M.purpleLight, borderRadius: 1.5, p: 1.5,
            border: `1px solid ${M.purpleBorder}`, mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label={job.status}
              size="small"
              color={
                job.status === 'COMPLETED' ? 'success'
                : job.status === 'FAILED' || job.status === 'ERROR' ? 'error'
                : 'warning'
              }
              sx={{ fontWeight: 700, fontSize: '0.72rem' }}
            />
            {job.job_type && (
              <Typography variant="caption" sx={{ color: M.purpleMid }} fontFamily="monospace">
                {job.job_type}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: M.purpleMid }} fontFamily="monospace">
              Job #{job.id}
            </Typography>
          </Box>
          <Field label="Source Value" value={job.source_value} mono />
          {job.batches && (
            <Field label="Batches" value={`${job.batches.completed ?? '?'} / ${job.batches.total ?? '?'} completed`} />
          )}
          {job.progress_percentage != null && (
            <Field label="Progress" value={`${job.progress_percentage}%`} />
          )}
          <Field label="Created" value={job.created_at} mono />
          <Field label="Updated" value={job.updated_at} mono />
          {job.error && job.error.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {job.error.map((e, i) => (
                <Alert key={i} severity="error" sx={{ py: 0.25, fontSize: '0.8rem' }}>
                  [{e.type}] {e.message}
                </Alert>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

// ─── step 3: offer live state ─────────────────────────────────────────────────

type LiveLabel = 'LIVE' | 'UPCOMING' | 'EXPIRED' | 'NOT ACTIVATED' | 'DISABLED';

function toSec(ts: number): number {
  return ts > 1e10 ? Math.floor(ts / 1000) : ts;
}

export function deriveLiveState(
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
      <Field label="Time Window" value={`${formatTime(startTime)} → ${formatTime(endTime)}`} mono />
      {d.name && <Field label="Name" value={d.name} />}
      {d.funding_type && <Field label="Funding Type" value={d.funding_type} />}
      {d.created_by && <Field label="Created By" value={d.created_by} mono />}
      {d.disabled_by && (
        <>
          <Divider sx={{ my: 1, borderColor: M.purpleFaint }} />
          <Field label="Disabled By" value={d.disabled_by} mono />
          {d.disabled_reason && <Field label="Disable Reason" value={d.disabled_reason} />}
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
  slotStartTime: number;
  slotEndTime: number;
  offerDetail: OfferDetail | undefined;
}

type StepDef = { index: number; title: string; state: StepState; content: React.ReactNode };

export default function LifecycleBSection({
  eventId, eventType, eventName, eventCategory, slotStartTime, slotEndTime, offerDetail,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lifecycle, setLifecycle] = useState<LifecycleBResponse | null>(null);

  useEffect(() => {
    if (!eventId || eventId === 'unknown') return;
    let cancelled = false;
    setLoading(true); setFetchError(null); setLifecycle(null);
    getLifecycleB(eventId)
      .then((resp) => { if (!cancelled) setLifecycle(resp); })
      .catch((e: unknown) => {
        if (cancelled) return;
        const err = e as { response?: { data?: { error?: string; message?: string } }; message?: string };
        setFetchError(err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Unknown error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [eventId]);

  function jobsStepState(): StepState {
    if (loading) return 'loading';
    if (fetchError) return 'error';
    if (!lifecycle) return 'pending';
    if (lifecycle.upload_jobs_error) return 'warn';
    if (!lifecycle.upload_jobs?.data?.length) return 'warn';
    return lifecycle.upload_jobs.data.some((j) =>
      j.status === 'FAILED' || j.status === 'ERROR'
    ) ? 'error' : 'done';
  }

  function offerStepState(): StepState {
    if (!offerDetail) return 'pending';
    const s = deriveLiveState(offerDetail, slotStartTime, slotEndTime);
    if (s.label === 'LIVE') return 'done';
    if (s.label === 'DISABLED' || s.label === 'EXPIRED') return 'error';
    if (s.label === 'UPCOMING') return 'warn';
    return 'pending';
  }

  const step1: StepDef = {
    index: 1, title: 'Event Details', state: 'done',
    content: (
      <EventDetailsContent
        eventId={eventId} eventType={eventType} eventName={eventName}
        eventCategory={eventCategory} slotStartTime={slotStartTime} slotEndTime={slotEndTime}
      />
    ),
  };

  const steps: StepDef[] = [
    step1,
    {
      index: 2, title: 'Upload Jobs', state: jobsStepState(),
      content: !eventId || eventId === 'unknown' ? (
        <Typography variant="caption" sx={{ color: M.purpleMid }}>No event ID — upload jobs unavailable.</Typography>
      ) : (
        <>
          {loading && <CircularProgress size={18} sx={{ color: M.purple }} />}
          {fetchError && <Alert severity="error" sx={{ py: 0.5 }}>{fetchError}</Alert>}
          {lifecycle?.upload_jobs_error && (
            <Alert severity="warning" sx={{ py: 0.5 }}>{lifecycle.upload_jobs_error}</Alert>
          )}
          {!loading && !fetchError && <JobsContent d={lifecycle?.upload_jobs} />}
        </>
      ),
    },
    {
      index: 3, title: 'Offer Live State', state: offerStepState(),
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
          {steps.map((step, i) => (
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
              {i < steps.length - 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 40, height: 2, borderRadius: 1,
                      bgcolor: step.state === 'done' ? M.purple : M.purpleBorder,
                      transition: 'background-color 0.3s',
                    }}
                  />
                </Box>
              )}
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
