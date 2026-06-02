export type LifecycleType = 'A' | 'B';

export interface Optin {
  optinId: number;
  supplierId: number;
  eventId: number;
  status: string;
  [key: string]: unknown;
}

export interface Assortment {
  offerId?: string;
  newOfferId?: string;
  offerStartTime?: number;
  offerEndTime?: number;
  basicPrice?: number;
  premiumPrice?: number;
}

export interface Discount {
  basicDiscount?: number;
  premiumDiscount?: number;
  durationInDays?: number;
  assortments?: Record<string, Assortment>;
}

export interface Offer {
  offerId: string;
  eventId: number;
  productId: number;
  supplierId: number;
  status?: string;
  discounts?: Record<string, Discount>;
  [key: string]: unknown;
}

export interface HBaseProductMap {
  productId: number;
  optinId: number;
  supplierId: number;
  supplierOptinId: number;
  discounts?: Record<string, Discount>;
}
