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
  supplier_optin_id?: string;
  optin_confirmed?: boolean;
  optin_window?: OptinWindow;
  start_time: number;
  end_time: number;
  offer_detail?: OfferDetail;
}

export interface OptinWindow {
  optin_id?: number;
  optin_status?: string;
  optin_type?: string;
  start_date: string;
  end_date: string;
  is_consent_required?: boolean;
  eligibility_criteria_description?: string;
  min_discount?: Record<string, unknown>;
  recommended_discount_table_name?: string;
}

export interface EventGroup {
  event_id: string;
  event_type: string;
  event_name: string;
  event_category: string;
  offer_ids: string[];
  start_time: number;
  end_time: number;
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
  context: string;        // maps to supplier_optin.flow_type — "INLINE" or "FILE"
  supplier_optin_id: number;
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
// Step 1 (optin window) comes from EventGroup.optin in the panel response.
export interface LifecycleAResponse {
  supplier_optin?: SupplierOptinDetails;
  supplier_optin_error?: string;
  file_upload?: FileUploadStatus;
  file_upload_error?: string;
  upload_jobs?: OfferJobsData;
  upload_jobs_error?: string;
}


