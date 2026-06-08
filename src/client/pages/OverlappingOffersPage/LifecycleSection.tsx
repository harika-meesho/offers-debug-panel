import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Alert,
  Typography,
} from '@mui/material';
import {
  LifecycleAResponse,
  OptinEntryData,
  SupplierOptinDetails,
  FileUploadStatus,
  OfferJobsData,
  OfferDetail,
} from '../../types';

import { getLifecycleA } from '../../services/api';
import { formatTime } from '../../utils/format';

// ─── helpers ──────────────────────────────────────────────────────────────────

function apiError(e: unknown): string {
  const err = e as { response?: { data?: { error?: string; message?: string } }; message?: string };
  return err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Unknown error';
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const color =
    s === 'active' || s === 'opted_in' || s === 'completed' ? 'success'
    : s === 'closed' || s === 'not_opted_in' || s === 'failed' ? 'error'
    : s === 'pending' ? 'warning'
    : 'default';
  return (
    <Chip
      label={status || '—'}
      size="small"
      color={color as 'success' | 'error' | 'warning' | 'default'}
    />
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        py: 0.75,
        alignItems: 'flex-start',
        borderBottom: '1px solid',
        borderColor: 'grey.100',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={600}
        sx={{ minWidth: 200, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}

function DiscountChips({ data }: { data: Record<string, unknown> | Record<string, number> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <Typography variant="body2" color="text.secondary">—</Typography>;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {entries.map(([k, v]) => (
        <Chip
          key={k}
          label={`${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`}
          size="small"
          variant="outlined"
          sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}
        />
      ))}
    </Box>
  );
}

// ─── step card shell ──────────────────────────────────────────────────────────

function StepCard({
  step,
  title,
  loading,
  stepError,
  children,
}: {
  step: number;
  title: string;
  loading: boolean;
  stepError?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ mb: 2, bgcolor: 'white' }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: loading || stepError || children ? 2 : 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {step}
          </Box>
          <Typography fontWeight={700} fontSize="0.95rem">
            {title}
          </Typography>
          {loading && <CircularProgress size={16} sx={{ ml: 'auto' }} />}
        </Box>
        {stepError && <Alert severity="warning" sx={{ mt: 1 }}>{stepError}</Alert>}
        {!loading && !stepError && children}
      </CardContent>
    </Card>
  );
}

// ─── step 1: optin window ─────────────────────────────────────────────────────

function Step1Content({ d }: { d: OptinEntryData }) {
  return (
    <Box>
      <FieldRow label="Optin ID">
        <Typography variant="body2" fontFamily="monospace">{d.optin_id}</Typography>
      </FieldRow>
      <FieldRow label="Status"><StatusBadge status={d.optin_status} /></FieldRow>
      <FieldRow label="Optin Type">
        <Chip label={d.optin_type || '—'} size="small" color={d.optin_type === 'FILE' ? 'info' : 'default'} />
      </FieldRow>
      <FieldRow label="Optin Window">
        <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
          {d.optin_start_date} → {d.optin_end_date}
        </Typography>
      </FieldRow>
      {d.parent_optin_id !== 0 && (
        <FieldRow label="Parent Optin ID">
          <Typography variant="body2" fontFamily="monospace">{d.parent_optin_id}</Typography>
        </FieldRow>
      )}
      <FieldRow label="Consent Required">
        <Chip
          label={d.is_consent_required ? 'Yes' : 'No'}
          size="small"
          color={d.is_consent_required ? 'warning' : 'default'}
        />
      </FieldRow>
      {d.eligibility_criteria_description && (
        <FieldRow label="Eligibility">
          <Typography variant="body2" color="text.secondary">{d.eligibility_criteria_description}</Typography>
        </FieldRow>
      )}
      {d.min_discount && Object.keys(d.min_discount).length > 0 && (
        <FieldRow label="Min Discount">
          <DiscountChips data={d.min_discount} />
        </FieldRow>
      )}
      {d.file_link && (
        <FieldRow label="File">
          <Typography
            component="a"
            href={d.file_link}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {d.file_name || d.file_link}
          </Typography>
        </FieldRow>
      )}
    </Box>
  );
}

// ─── step 2: supplier optin status ───────────────────────────────────────────

function Step2Content({ d, supplierId }: { d: SupplierOptinDetails; supplierId: string }) {
  return (
    <Box>
      <FieldRow label="Supplier ID">
        <Typography variant="body2" fontFamily="monospace">{supplierId}</Typography>
      </FieldRow>
      <FieldRow label="Supplier Optin ID">
        <Typography variant="body2" fontFamily="monospace">{d.id}</Typography>
      </FieldRow>
      <FieldRow label="Status"><StatusBadge status={d.opt_in_status} /></FieldRow>
      <FieldRow label="Products Opted In">
        <Typography variant="body2">
          {d.products.total_opted_in} / {d.products.total_available}
        </Typography>
      </FieldRow>
      {d.opt_in_start_date && (
        <FieldRow label="Optin Window">
          <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
            {d.opt_in_start_date} → {d.opt_in_end_date}
          </Typography>
        </FieldRow>
      )}
      {d.min_discounts && Object.keys(d.min_discounts).length > 0 && (
        <FieldRow label="Min Discounts">
          <DiscountChips data={d.min_discounts} />
        </FieldRow>
      )}
    </Box>
  );
}

// ─── step 3: file upload status ───────────────────────────────────────────────

function Step3Content({ d }: { d: FileUploadStatus }) {
  return (
    <Box>
      <FieldRow label="Status"><StatusBadge status={d.status} /></FieldRow>
      {d.file_name && (
        <FieldRow label="Filename">
          <Typography variant="body2" fontFamily="monospace">{d.file_name}</Typography>
        </FieldRow>
      )}
      {d.link && (
        <FieldRow label="Download">
          <Typography
            component="a"
            href={d.link}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Download file
          </Typography>
        </FieldRow>
      )}
      {d.error?.reason && (
        <FieldRow label="Error">
          <Box>
            <Typography variant="body2" color="error.main">{d.error.reason}</Typography>
            {d.error.products != null && (
              <Typography variant="caption" color="error.main">
                {d.error.products} products affected
              </Typography>
            )}
          </Box>
        </FieldRow>
      )}
    </Box>
  );
}

// ─── step 4: upload job status ────────────────────────────────────────────────

function Step4Content({ d }: { d: OfferJobsData }) {
  if (!d.data || d.data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">No upload jobs found.</Typography>
    );
  }
  return (
    <Box>
      {d.data.map((job) => (
        <Paper key={job.id} variant="outlined" sx={{ p: 1.5, mb: 1, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
              Job #{job.id}
            </Typography>
            <StatusBadge status={job.status} />
            {job.job_type && (
              <Chip label={job.job_type} size="small" variant="outlined" />
            )}
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 1,
            }}
          >
            {job.batches && (
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Batches
                </Typography>
                <Typography variant="body2">
                  {job.batches.completed ?? '?'} / {job.batches.total ?? '?'}
                </Typography>
              </Box>
            )}
            {job.progress_percentage != null && (
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Progress
                </Typography>
                <Typography variant="body2">{job.progress_percentage}%</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                Created
              </Typography>
              <Typography variant="body2" fontSize="0.8rem">{job.created_at}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                Updated
              </Typography>
              <Typography variant="body2" fontSize="0.8rem">{job.updated_at}</Typography>
            </Box>
          </Box>
          {job.error && job.error.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {job.error.map((e, i) => (
                <Alert key={i} severity="error" sx={{ py: 0.25, fontSize: '0.8rem' }}>
                  [{e.type}] {e.message}
                </Alert>
              ))}
            </Box>
          )}
        </Paper>
      ))}
    </Box>
  );
}

// ─── step 5: offer live state ─────────────────────────────────────────────────

function Step5Content({ d, startTime, endTime }: { d: OfferDetail; startTime: number; endTime: number }) {
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
        <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
          {formatTime(d.start_time || startTime)} → {formatTime(d.end_time || endTime)}
        </Typography>
      </FieldRow>
      {d.funding_type && (
        <FieldRow label="Funding Type">
          <Typography variant="body2">{d.funding_type}</Typography>
        </FieldRow>
      )}
      {d.created_by && (
        <FieldRow label="Created By">
          <Typography variant="body2">{d.created_by}</Typography>
        </FieldRow>
      )}
      {d.disabled_by && (
        <FieldRow label="Disabled By">
          <Box>
            <Typography variant="body2">{d.disabled_by}</Typography>
            {d.disabled_reason && (
              <Typography variant="caption" color="error.main">{d.disabled_reason}</Typography>
            )}
          </Box>
        </FieldRow>
      )}
      {d.discounts && Object.keys(d.discounts).length > 0 && (
        <FieldRow label="Discounts">
          <Box
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              bgcolor: 'grey.50',
              p: 1,
              borderRadius: 1,
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            <pre style={{ margin: 0 }}>{JSON.stringify(d.discounts, null, 2)}</pre>
          </Box>
        </FieldRow>
      )}
    </Box>
  );
}

// ─── main section ─────────────────────────────────────────────────────────────

interface LifecycleSectionProps {
  eventType: string;
  optinWindow: OptinEntryData | undefined;
  optinId: string | undefined;
  supplierId: string;
  offerDetail: OfferDetail | undefined;
  slotStartTime: number;
  slotEndTime: number;
}

export default function LifecycleSection({
  eventType,
  optinWindow,
  optinId,
  supplierId,
  offerDetail,
  slotStartTime,
  slotEndTime,
}: LifecycleSectionProps) {
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lifecycle, setLifecycle] = useState<LifecycleAResponse | null>(null);

  const optinType = optinWindow?.optin_type;

  useEffect(() => {
    if (eventType !== 'optin') return;
    let cancelled = false;

    setLoading(true);
    setFetchError(null);
    setLifecycle(null);

    getLifecycleA(optinId, supplierId, optinType)
      .then((resp) => { if (!cancelled) setLifecycle(resp); })
      .catch((e) => { if (!cancelled) setFetchError(apiError(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [optinId, supplierId, eventType, optinType]);

  const isFileFlow = optinType === 'FILE';

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Offer Lifecycle
        </Typography>
        <Chip
          label={eventType === 'optin' ? 'Lifecycle A — Optin' : 'Lifecycle B — Direct'}
          size="small"
          color={eventType === 'optin' ? 'secondary' : 'info'}
        />
      </Box>

      {eventType !== 'optin' ? (
        <Alert severity="info">
          Lifecycle B (Direct flow) — coming soon.
        </Alert>
      ) : (
        <>
          {fetchError && (
            <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>
          )}

          {!optinId && !loading && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No optin_id on this timeslot — steps 2, 3 and 4 are unavailable.
            </Alert>
          )}

          {/* Step 1 — Optin Window (from panel response, no extra API call) */}
          <StepCard step={1} title="Optin Window" loading={false}>
            {optinWindow ? (
              <Step1Content d={optinWindow} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No optin record found for this event.
              </Typography>
            )}
          </StepCard>

          {/* Step 2 — Supplier Optin Status */}
          <StepCard
            step={2}
            title="Supplier Optin Status"
            loading={loading}
            stepError={lifecycle?.supplier_optin_error}
          >
            {lifecycle?.supplier_optin ? (
              <Step2Content d={lifecycle.supplier_optin} supplierId={supplierId} />
            ) : (
              !loading && !lifecycle?.supplier_optin_error && (
                <Typography variant="body2" color="text.secondary">
                  {optinId ? 'No data returned.' : 'Skipped — optin_id missing.'}
                </Typography>
              )
            )}
          </StepCard>

          {/* Step 3 — File Upload Status (FILE flow only) */}
          <StepCard
            step={3}
            title="File Upload Status"
            loading={loading}
            stepError={lifecycle?.file_upload_error}
          >
            {lifecycle?.file_upload ? (
              <Step3Content d={lifecycle.file_upload} />
            ) : (
              !loading && (
                <Typography variant="body2" color="text.secondary">
                  {isFileFlow
                    ? lifecycle?.file_upload_error
                      ? undefined
                      : 'No file upload data found.'
                    : 'Not applicable — INLINE flow.'}
                </Typography>
              )
            )}
          </StepCard>

          {/* Step 4 — Upload Job Status */}
          <StepCard
            step={4}
            title="Upload Job Status"
            loading={loading}
            stepError={lifecycle?.upload_jobs_error}
          >
            {lifecycle?.upload_jobs ? (
              <Step4Content d={lifecycle.upload_jobs} />
            ) : (
              !loading && !lifecycle?.upload_jobs_error && (
                <Typography variant="body2" color="text.secondary">
                  {lifecycle?.supplier_optin
                    ? 'No upload jobs found.'
                    : 'Not applicable — supplier has not opted in.'}
                </Typography>
              )
            )}
          </StepCard>

          {/* Step 5 — Offer Live State (from Redux, no API call) */}
          <StepCard step={5} title="Offer Live State" loading={false}>
            {offerDetail ? (
              <Step5Content d={offerDetail} startTime={slotStartTime} endTime={slotEndTime} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Offer details not available.
              </Typography>
            )}
          </StepCard>
        </>
      )}
    </Box>
  );
}
