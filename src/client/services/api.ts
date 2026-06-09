import axios from 'axios';
import type {
  ProductSupplierResponse,
  LifecycleAResponse,
  LifecycleBResponse,
  OfflineUploadSummary,
  OfflineUploadDetail,
  OfferJobStatus,
} from '../types';

const client = axios.create({ baseURL: '' });

export async function getProductSupplierOffers(
  pid: string,
  sid: string,
): Promise<ProductSupplierResponse> {
  const { data } = await client.get(
    `/admin/debug/panel/product-supplier/${pid}/${sid}`,
  );
  return data;
}

export async function getLifecycleA(
  optinId: string | undefined,
  supplierId: string,
  optinType: string | undefined,
): Promise<LifecycleAResponse> {
  const params: Record<string, string> = { sid: supplierId };
  if (optinId) params.optin_id = optinId;
  if (optinType) params.optin_type = optinType;
  const { data } = await client.get('/admin/debug/panel/offer-lifecycle', { params });
  return data;
}

export async function getLifecycleB(eventId: string): Promise<LifecycleBResponse> {
  const { data } = await client.get('/admin/debug/panel/offer-lifecycle-b', { params: { event_id: eventId } });
  return data;
}

// ─── Lifecycle B API helpers ──────────────────────────────────────────────────

type RawUpload = {
  id: number;
  event_id?: number;
  status: string;
  created_by: string;
  remarks?: string;
  file_key?: string;
  created_at?: string;
  completed_at?: string;
  offer?: { name?: string };
  batches?: { total?: number; completed?: number };
  result_file_key?: string;
  error?: { reason?: string; file_key?: string };
};

type RawJob = {
  id: number; job_type: string; status: string; source_value: string;
  batches?: { total?: number; completed?: number };
  error?: Array<{ message: string }>;
};

export async function getOfflineUploads(eventId: string): Promise<{ uploads: OfflineUploadSummary[] }> {
  const { data } = await client.get('/admin/debug/panel/offers/uploads', {
    params: { event_id: eventId, limit: 20 },
  });
  const items: RawUpload[] = data?.data ?? [];
  return {
    uploads: items.map((u) => ({
      id: Number(u.id),
      offerName: u.offer?.name ?? '',
      status: u.status,
      createdBy: u.created_by ?? '',
      totalBatches: Number(u.batches?.total ?? 0),
      completedBatches: Number(u.batches?.completed ?? 0),
    })),
  };
}

export async function getOfflineUploadDetail(id: number): Promise<OfflineUploadDetail> {
  const { data }: { data: RawUpload } = await client.get(`/admin/debug/panel/offers/upload/${id}`);
  return {
    id: Number(data.id),
    status: data.status,
    createdBy: data.created_by ?? '',
    remarks: data.remarks || undefined,
    fileKey: data.file_key || undefined,
    totalBatches: Number(data.batches?.total ?? 0),
    completedBatches: Number(data.batches?.completed ?? 0),
    resultFileKey: data.result_file_key || undefined,
    errorReason: data.error?.reason || undefined,
    errorFileKey: data.error?.file_key || undefined,
    createdAt: data.created_at || undefined,
    completedAt: data.completed_at || undefined,
  };
}

export async function getOfferJobStatus(uploadId: number): Promise<OfferJobStatus> {
  const { data } = await client.get('/v2/debug/panel/offer/job/fetch', {
    params: { source_value: String(uploadId) },
  });
  const items: RawJob[] = data?.data ?? [];
  if (items.length === 0) throw new Error('No job record found');
  const j = items[0];
  return {
    id: j.id,
    jobType: j.job_type ?? '',
    status: j.status,
    sourceValue: j.source_value ?? '',
    batches: { total: Number(j.batches?.total ?? 0), completed: Number(j.batches?.completed ?? 0) },
    errors: (j.error ?? []).map((e) => e.message),
  };
}
