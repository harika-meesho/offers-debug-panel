import React, { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Alert,
  Typography,
} from '@mui/material';
import {
  LifecycleAResponse,
  OptinWindow,
  SupplierOptinDetails,
  FileUploadStatus,
  OfferJobsData,
  OfferDetail,
} from '../../types';
import { getLifecycleA } from '../../services/api';
import LifecycleBSection from './LifecycleBSection';
import { formatTime } from '../../utils/format';
import { M, StepState, StepCircle } from '@components/StepCircle';
import { apiError } from '@utils/apiError';
import FieldRow from '@components/FieldRow';

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatIsoDate(s: string | undefined | null): string {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const color =
    s === 'active' || s === 'opted_in' || s === 'completed' ? 'success'
    : s === 'closed' || s === 'not_opted_in' || s === 'failed' ? 'error'
    : s === 'pending' ? 'warning'
    : s === 'initiated' ? 'info'
    : 'default';
  return (
    <Chip
      label={status || '—'}
      size="small"
      color={color as 'success' | 'error' | 'warning' | 'info' | 'default'}
    />
  );
}


function DiscountChips({ data }: { data: Record<string, unknown> | Record<string, number> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <Typography variant="caption" color="text.secondary">—</Typography>;
  const hasObjectValues = entries.some(([, v]) => typeof v === 'object' && v !== null);
  if (hasObjectValues) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {entries.map(([k, v]) => (
          <Box key={k}>
            <Chip
              label={k}
              size="small"
              variant="outlined"
              sx={{ fontFamily: 'monospace', fontSize: '0.7rem', mb: 0.5 }}
            />
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
          <Chip
            label={k}
            size="small"
            variant="outlined"
            sx={{ fontFamily: 'monospace', fontSize: '0.7rem', mb: 0.5, height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.25 } }}
          />
          <Box sx={{ bgcolor: 'grey.50', px: 1, py: 0.75, borderRadius: 1 }}>
            <Typography variant="caption" fontFamily="monospace" fontWeight={600}>
              {String(v)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── step content components ──────────────────────────────────────────────────

function Step1Content({ d }: { d: OptinWindow }) {
  return (
    <Box>
      {!!d.optin_id && (
        <FieldRow label="Optin ID">
          <Typography variant="caption" fontFamily="monospace">{d.optin_id}</Typography>
        </FieldRow>
      )}
      {d.optin_status && (
        <FieldRow label="Status"><StatusBadge status={d.optin_status} /></FieldRow>
      )}
      {d.optin_type && (
        <FieldRow label="Optin Type">
          <Chip label={d.optin_type} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
        </FieldRow>
      )}
      <FieldRow label="Optin Window">
        <Box>
          <Typography variant="caption" fontFamily="monospace" display="block">{formatIsoDate(d.start_date)}</Typography>
          <Typography variant="caption" fontFamily="monospace" display="block" color="text.secondary">→ {formatIsoDate(d.end_date)}</Typography>
        </Box>
      </FieldRow>
      {d.is_consent_required != null && (
        <FieldRow label="Consent Required">
          <Chip label={d.is_consent_required ? 'Yes' : 'No'} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
        </FieldRow>
      )}
      {d.eligibility_criteria_description && (
        <FieldRow label="Eligibility">
          <Typography variant="caption">{d.eligibility_criteria_description}</Typography>
        </FieldRow>
      )}
      {d.min_discount && Object.keys(d.min_discount).length > 0 && (
        <FieldRow label="Min Discount">
          <DiscountChips data={d.min_discount} />
        </FieldRow>
      )}
    </Box>
  );
}

function Step2Content({ d }: { d: SupplierOptinDetails }) {
  return (
    <Box>
      <FieldRow label="Supplier Optin ID">
        <Typography variant="caption" fontFamily="monospace">{d.supplier_optin_id}</Typography>
      </FieldRow>
      <FieldRow label="Status"><StatusBadge status={d.opt_in_status} /></FieldRow>
      <FieldRow label="Products Opted In">
        <Typography variant="caption">
          {d.products.total_opted_in} / {d.products.total_available}
        </Typography>
      </FieldRow>
      {d.min_discounts && Object.keys(d.min_discounts).length > 0 && (
        <FieldRow label="Min Discounts">
          <DiscountChips data={d.min_discounts} />
        </FieldRow>
      )}
    </Box>
  );
}

function Step3Content({ d }: { d: FileUploadStatus }) {
  return (
    <Box>
      <FieldRow label="Status"><StatusBadge status={d.status} /></FieldRow>
      {d.file_name && (
        <FieldRow label="Filename">
          <Typography variant="caption" fontFamily="monospace">{d.file_name}</Typography>
        </FieldRow>
      )}
      {d.link && (
        <FieldRow label="Download">
          <Typography
            component="a"
            href={d.link}
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Download file
          </Typography>
        </FieldRow>
      )}
      {d.error?.reason && (
        <FieldRow label="Error">
          <Box>
            <Typography variant="caption" color="error.main">{d.error.reason}</Typography>
            {d.error.products != null && (
              <Typography variant="caption" color="error.main" display="block">
                {d.error.products} products affected
              </Typography>
            )}
          </Box>
        </FieldRow>
      )}
    </Box>
  );
}

function Step4Content({ d }: { d: OfferJobsData }) {
  if (!d.data || d.data.length === 0) {
    return <Typography variant="caption" color="text.secondary">No upload jobs found.</Typography>;
  }
  return (
    <Box>
      {d.data.map((job) => (
        <Box key={job.id} sx={{ p: 1.5, mb: 1, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption" fontFamily="monospace" fontWeight={700}>
              Job #{job.id}
            </Typography>
            <StatusBadge status={job.status} />
            {job.job_type && (
              <Chip label={job.job_type} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            )}
          </Box>
          {job.batches && (
            <FieldRow label="Batches">
              <Typography variant="caption">{job.batches.completed ?? '?'} / {job.batches.total ?? '?'}</Typography>
            </FieldRow>
          )}
          {job.progress_percentage != null && (
            <FieldRow label="Progress">
              <Typography variant="caption">{job.progress_percentage}%</Typography>
            </FieldRow>
          )}
          <FieldRow label="Created">
            <Typography variant="caption" fontSize="0.75rem">{job.created_at}</Typography>
          </FieldRow>
          <FieldRow label="Updated">
            <Typography variant="caption" fontSize="0.75rem">{job.updated_at}</Typography>
          </FieldRow>
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

function Step5Content({ d, startTime, endTime }: { d: OfferDetail; startTime: number; endTime: number }) {
  const resolvedStart = d.start_time || startTime;
  const resolvedEnd = d.end_time || endTime;
  return (
    <Box>
      <FieldRow label="Status">
        <Chip
          label={d.status}
          size="small"
          color={d.status === 'ACTIVE' ? 'success' : d.status === 'DISABLED' ? 'error' : 'default'}
        />
      </FieldRow>
      <FieldRow label="Time Window">
        <Typography variant="caption" fontFamily="monospace">
          {formatTime(resolvedStart)} → {formatTime(resolvedEnd)}
        </Typography>
      </FieldRow>
      {d.name && (
        <FieldRow label="Name">
          <Typography variant="caption">{d.name}</Typography>
        </FieldRow>
      )}
      {d.funding_type && (
        <FieldRow label="Funding Type">
          <Typography variant="caption">{d.funding_type}</Typography>
        </FieldRow>
      )}
      {d.created_by && (
        <FieldRow label="Created By">
          <Typography variant="caption">{d.created_by}</Typography>
        </FieldRow>
      )}
      {d.disabled_by && (
        <FieldRow label="Disabled By">
          <Box>
            <Typography variant="caption">{d.disabled_by}</Typography>
            {d.disabled_reason && (
              <Typography variant="caption" color="error.main" display="block">{d.disabled_reason}</Typography>
            )}
          </Box>
        </FieldRow>
      )}
      {d.discounts && Object.keys(d.discounts).length > 0 && (
        <FieldRow label="Discounts">
          <DiscountChips data={d.discounts} />
        </FieldRow>
      )}
    </Box>
  );
}

// ─── main section ─────────────────────────────────────────────────────────────

interface LifecycleSectionProps {
  eventType: string;
  optinWindow: OptinWindow | undefined;
  optinId: string | undefined;
  supplierId: string;
  offerDetail: OfferDetail | undefined;
  eventStartTime: number;
  eventEndTime: number;
  slotStartTime: number;
  slotEndTime: number;
  eventId: string;
  eventName: string;
  eventCategory: string;
}

export default function LifecycleSection({
  eventType,
  optinWindow,
  optinId,
  supplierId,
  offerDetail,
  eventStartTime,
  eventEndTime,
  slotStartTime,
  slotEndTime,
  eventId,
  eventName,
  eventCategory,
}: LifecycleSectionProps) {
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lifecycle, setLifecycle] = useState<LifecycleAResponse | null>(null);

  // isFileFlow is derived from the supplier's actual flow_type (context field in Step 2 response),
  // not from optin_type (which is the optin category: ALL/SSCAT/SUPPLIER_PRODUCTS).
  const isFileFlow = lifecycle?.supplier_optin?.context === 'FILE';

  useEffect(() => {
    if (eventType !== 'optin') return;
    let cancelled = false;

    setLoading(true);
    setFetchError(null);
    setLifecycle(null);

    const rdTableName = optinWindow?.recommended_discount_table_name;
    getLifecycleA(optinId, supplierId, rdTableName)
      .then((resp) => { if (!cancelled) setLifecycle(resp); })
      .catch((e) => { if (!cancelled) setFetchError(apiError(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [optinId, supplierId, eventType, optinWindow?.recommended_discount_table_name]);

  if (eventType !== 'optin') {
    return (
      <LifecycleBSection
        eventId={eventId}
        eventType={eventType}
        eventName={eventName}
        eventCategory={eventCategory}
        eventStartTime={eventStartTime}
        eventEndTime={eventEndTime}
        slotStartTime={slotStartTime}
        slotEndTime={slotEndTime}
        offerDetail={offerDetail}
      />
    );
  }

  // ── optin flow ───────────────────────────────────────────────────────────────

  function step1State(): StepState {
    return optinWindow ? 'done' : 'warn';
  }

  function step2State(): StepState {
    if (loading && !lifecycle) return 'loading';
    if (lifecycle?.supplier_optin_error) return 'error';
    if (!optinId) return 'warn';
    const s = lifecycle?.supplier_optin?.opt_in_status?.toLowerCase();
    if (!s) return lifecycle ? 'warn' : 'pending';
    return s === 'opted_in' || s === 'active' ? 'done' : 'warn';
  }

  function step3State(): StepState {
    if (!isFileFlow) return 'pending';
    if (loading && !lifecycle) return 'loading';
    if (lifecycle?.file_upload_error) return 'error';
    const s = lifecycle?.file_upload?.status?.toLowerCase();
    if (!s) return lifecycle ? 'warn' : 'pending';
    return s === 'completed' ? 'done' : s === 'failed' ? 'error' : 'warn';
  }

  function step4State(): StepState {
    if (loading && !lifecycle) return 'loading';
    if (lifecycle?.upload_jobs_error) return 'error';
    if (!lifecycle?.upload_jobs?.data?.length) return lifecycle ? 'warn' : 'pending';
    return lifecycle.upload_jobs.data.some((j) =>
      j.status === 'FAILED' || j.status === 'ERROR'
    ) ? 'error' : 'done';
  }

  function step5State(): StepState {
    if (!offerDetail) return 'pending';
    if (offerDetail.status === 'ACTIVE') return 'done';
    if (offerDetail.status === 'DISABLED') return 'error';
    return 'warn';
  }

  const steps: { index: number; title: string; state: StepState; content: React.ReactNode }[] = [
    {
      index: 1,
      title: 'Optin Window',
      state: step1State(),
      content: optinWindow ? (
        <Step1Content d={optinWindow} />
      ) : (
        <Typography variant="caption" color="text.secondary">
          No optin record found for this event.
        </Typography>
      ),
    },
    {
      index: 2,
      title: 'Supplier Optin Status',
      state: step2State(),
      content: (
        <>
          {!optinId && (
            <Alert severity="warning" sx={{ mb: 1, py: 0.5, fontSize: '0.8rem' }}>
              No optin_id on this timeslot.
            </Alert>
          )}
          {lifecycle?.supplier_optin ? (
            <Step2Content d={lifecycle.supplier_optin} />
          ) : (
            !loading && (
              <Typography variant="caption" color="text.secondary">
                {lifecycle?.supplier_optin_error
                  ? 'Supplier has not opted in.'
                  : optinId
                  ? 'No data returned.'
                  : 'Skipped — optin_id missing.'}
              </Typography>
            )
          )}
        </>
      ),
    },
    {
      index: 3,
      title: 'File Upload Status',
      state: step3State(),
      content: lifecycle?.file_upload ? (
        <Step3Content d={lifecycle.file_upload} />
      ) : (
        !loading && (
          <>
            {lifecycle?.file_upload_error && (
              <Alert severity="warning" sx={{ mb: 1, py: 0.5, fontSize: '0.8rem' }}>{lifecycle.file_upload_error}</Alert>
            )}
            <Typography variant="caption" color="text.secondary">
              {isFileFlow
                ? lifecycle?.file_upload_error ? undefined : 'No file upload data found.'
                : !lifecycle?.supplier_optin
                ? 'Not applicable — supplier has not opted in.'
                : 'Not applicable — optin type is not FILE.'}
            </Typography>
          </>
        )
      ),
    },
    {
      index: 4,
      title: 'Upload Job Status',
      state: step4State(),
      content: lifecycle?.upload_jobs ? (
        <Step4Content d={lifecycle.upload_jobs} />
      ) : (
        !loading && (
          <>
            {lifecycle?.upload_jobs_error && (
              <Alert severity="warning" sx={{ mb: 1, py: 0.5, fontSize: '0.8rem' }}>{lifecycle.upload_jobs_error}</Alert>
            )}
            <Typography variant="caption" color="text.secondary">
              {lifecycle?.supplier_optin ? 'No upload jobs found.' : 'Not applicable — supplier has not opted in.'}
            </Typography>
          </>
        )
      ),
    },
    {
      index: 5,
      title: 'Offer Live State',
      state: step5State(),
      content: offerDetail ? (
        <Step5Content d={offerDetail} startTime={slotStartTime} endTime={slotEndTime} />
      ) : (
        <Typography variant="caption" color="text.secondary">
          Offer details not available.
        </Typography>
      ),
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'white', overflow: 'hidden',
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
          Event {eventId} · optin flow
        </Typography>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }}>{fetchError}</Alert>
      )}

      {/* Single scroll container keeps header + content in sync */}
      <Box sx={{ overflowX: 'auto' }}>

        {/* Step indicator row */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 2.5, pb: 2, bgcolor: 'white', minWidth: `${steps.length * 220}px` }}>
          {steps.map((step, i) => (
            <React.Fragment key={step.index}>
              <Box sx={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StepCircle n={step.index} state={step.state} />
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ fontSize: '0.68rem', color: M.purpleMid, display: 'block', lineHeight: 1 }}
                  >
                    STEP {step.index}
                  </Typography>
                  <Typography
                    fontWeight={700}
                    fontSize="0.85rem"
                    sx={{ whiteSpace: 'nowrap', color: step.state === 'done' ? M.purple : 'text.primary' }}
                  >
                    {step.title}
                  </Typography>
                </Box>
              </Box>
              {i < steps.length - 1 && (
                <Box sx={{ px: 1, flexShrink: 0 }}>
                  <Box sx={{ width: 28, height: 2, borderRadius: 1, bgcolor: step.state === 'done' ? M.purple : M.purpleBorder, transition: 'background-color 0.3s' }} />
                </Box>
              )}
            </React.Fragment>
          ))}
        </Box>

        <Divider sx={{ borderColor: M.purpleFaint }} />

        {/* Step content row */}
        <Box sx={{ display: 'flex', minWidth: `${steps.length * 220}px` }}>
          {steps.map((step, i) => (
            <Box
              key={step.index}
              sx={{
                flex: 1,
                minWidth: 220,
                maxWidth: 320,
                overflowX: 'hidden',
                p: 2.5,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                borderRight: i < steps.length - 1 ? `1px solid ${M.purpleFaint}` : 'none',
              }}
            >
              {loading && !lifecycle && (step.index === 2 || step.index === 3 || step.index === 4) ? (
                <CircularProgress size={18} />
              ) : (
                step.content
              )}
            </Box>
          ))}
        </Box>

      </Box>
    </Paper>
  );
}
