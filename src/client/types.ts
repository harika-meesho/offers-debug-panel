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
  offer_ids: string[];
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
