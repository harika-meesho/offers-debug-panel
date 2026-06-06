export interface Timeslot {
  offer_id: string;
  event_id: string;
  start_time: number;
  end_time: number;
  optin_id?: string;
}

export type OfferStatus = 'ACTIVE' | 'CREATED' | 'DISABLED';

export interface OfferDetail {
  id: string;
  status: OfferStatus;
  event_id: string;
  start_time: number;
  end_time: number;
  discounts: Record<string, unknown>;
  funding_type: string;
  created_by: string;
  disabled_by: string;
  disabled_reason: string;
  name?: string;
  description?: string;
}

export interface ProductSupplierResponse {
  timeslots: Timeslot[];
  offer_details: Record<string, OfferDetail>;
}
