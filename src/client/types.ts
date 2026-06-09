export type OfferStatus = 'ACTIVE' | 'CREATED' | 'DISABLED';

export interface OfferDetail {
  id: string;
  status: OfferStatus;
  event_id?: string;
  start_time: number;
  end_time: number;
  discounts: Record<string, unknown>;
  funding_type: string;
  created_by: string;
  disabled_by?: string;
  disabled_reason?: string;
  name?: string;
  description?: string;
}

export interface TimeslotWithDetail {
  offer_id: string;
  optin_id?: string;
  start_time: number;
  end_time: number;
  offer_detail?: OfferDetail;
}

export interface EventGroup {
  event_id: string;
  event_type: string;
  event_name: string;
  event_category: string;
  offer_ids: string[];
  start_time: number;
  end_time: number;
  optin_window?: OptinEntryData;
  timeslots: TimeslotWithDetail[];
}

export interface ProductDetails {
  id: number;
  name: string;
  image_url: string;
  catalog_id: number;
  category_name: string;
  sku: string;
  description: string;
  valid_for_supplier: boolean;
}

export interface ProductSupplierResponse {
  product_details?: ProductDetails;
  events: EventGroup[];
}

export interface OptinEntry {
  optinId: number;
  eventId: number;
  eventCategory: string;
  eventName: string;
  optinType: string;
  optinStartDate: string;
  optinEndDate: string;
  optinStatus: string;
  parentOptinId: number;
  minDiscount: number;
}

// ─── Lifecycle A types ────────────────────────────────────────────────────────
// These mirror the JSON fields that offer-platform-go's /offer-lifecycle endpoint returns.
// The backend aggregates all downstream calls; the frontend just renders this one response.

export interface OptinEntryData {
  optin_id: number;
  event_id: number;
  event_category: string;
  event_name: string;
  eligibility_criteria_description: string;
  optin_type: string;
  optin_start_date: string;
  optin_end_date: string;
  optin_status: string;
  parent_optin_id: number;
  min_discount: Record<string, unknown>;
  fallback_recommended_discount: Record<string, unknown>;
  recommended_discount_table_name: string;
  file_name: string;
  file_link: string;
  is_consent_required: boolean;
}

export interface OptinDetailsProducts {
  total_opted_in: number;
  total_available: number;
}

export interface SupplierOptinDetails {
  id: number;
  name: string;
  opt_in_status: string;
  products: OptinDetailsProducts;
  opt_in_start_date: string;
  opt_in_end_date: string;
  min_discount: number;
  min_discounts: Record<string, number>;
  event_category: string;
}

export interface UploadErrorDetail {
  products?: number;
  reason: string;
}

export interface FileUploadStatus {
  status: string;
  link: string;
  file_name: string;
  error: UploadErrorDetail;
}

export interface JobBatch {
  total?: number;
  completed?: number;
}

export interface JobError {
  code: number;
  type: string;
  message: string;
}

export interface OfferJobItem {
  id: number;
  source_value: string;
  job_type: string;
  status: string;
  source: string;
  template: string;
  batches?: JobBatch;
  created_at: string;
  updated_at: string;
  error?: JobError[];
  progress_percentage?: number;
}

export interface OfferJobsData {
  data: OfferJobItem[];
  pagination: {
    total_count: number;
    page_number: number;
    page_size: number;
    total_pages: number;
  };
}

// Top-level response from GET /admin/debug/panel/offer-lifecycle (steps 2–4 only).
// Step 1 (optin window) comes from EventGroup.optin_window in the panel response.
export interface LifecycleAResponse {
  supplier_optin?: SupplierOptinDetails;
  supplier_optin_error?: string;
  file_upload?: FileUploadStatus;
  file_upload_error?: string;
  upload_jobs?: OfferJobsData;
  upload_jobs_error?: string;
}

// Top-level response from GET /admin/debug/panel/offer-lifecycle-b (step 2 only).
// Steps 1 (event details) and 3 (offer live state) come from already-loaded panel data.
export interface LifecycleBResponse {
  upload_jobs?: OfferJobsData;
  upload_jobs_error?: string;
}

// ─── Lifecycle B types (offline upload / direct flow) ─────────────────────────

export type OfflineUploadStatus = 'COMPLETED' | 'ERROR' | 'REJECTED' | 'DISABLED' | 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | string;
export type JobStatus = 'COMPLETED' | 'ERROR' | 'IN_PROGRESS' | 'PENDING' | string;

export interface OfflineUploadSummary {
  id: number;
  offerName: string;
  status: OfflineUploadStatus;
  createdBy: string;
  totalBatches: number;
  completedBatches: number;
}

export interface OfflineUploadDetail {
  id: number;
  status: OfflineUploadStatus;
  createdBy: string;
  remarks?: string;
  fileKey?: string;
  totalBatches: number;
  completedBatches: number;
  resultFileKey?: string;
  errorReason?: string;
  errorFileKey?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface OfferJobStatus {
  id: number;
  jobType: string;
  status: JobStatus;
  sourceValue: string;
  batches: { total: number; completed: number };
  errors: string[];
}
