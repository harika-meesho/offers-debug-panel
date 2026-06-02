import axios from 'axios';
import { Optin, Offer, HBaseProductMap } from '@pages/DebugPanel/types';

const client = axios.create({ baseURL: '' });

/** Gap 1: Get optins for event_id */
export async function getOptinsForEvent(eventId: string): Promise<Optin[]> {
  const { data } = await client.get(`/api/v1/optin/${eventId}/optins`);
  return data?.optins ?? data ?? [];
}

/** Gap 2: Get product list for a specific optin */
export async function getProductsForOptin(
  supplierId: string,
  optinId: number,
): Promise<number[]> {
  const { data } = await client.get(
    `/admin/v2/supplier/${supplierId}/optin/${optinId}/products`,
  );
  return data?.productIds ?? data ?? [];
}

/** Gap 3: Get HBase product map (offerIds) for an optin */
export async function getProductMapForOptin(
  supplierId: string,
  optinId: number,
): Promise<HBaseProductMap[]> {
  const { data } = await client.get(
    `/admin/supplier/${supplierId}/optin/${optinId}/productmap`,
  );
  return data?.productMaps ?? data ?? [];
}

/** Gap 4: Get all offers for a product+supplier (no event_id filter) */
export async function getOffersForProductSupplier(
  productId: string,
  supplierId: string,
): Promise<Offer[]> {
  const { data } = await client.get(
    `/admin/productsupplier/offerdetails/${productId}/${supplierId}`,
  );
  return data?.offers ?? data ?? [];
}

/** Gap 5: Get single offer details by offerId */
export async function getOfferById(offerId: string): Promise<Offer> {
  const { data } = await client.get(`/admin/offerdetails/${offerId}`);
  return data?.offer ?? data;
}

/** Extract all offerIds from HBase productMap entries */
export function extractOfferIdsFromProductMap(maps: HBaseProductMap[]): Set<string> {
  const ids = new Set<string>();
  for (const map of maps) {
    for (const discount of Object.values(map.discounts ?? {})) {
      for (const assortment of Object.values(discount.assortments ?? {})) {
        if (assortment.offerId) ids.add(assortment.offerId);
        if (assortment.newOfferId) ids.add(assortment.newOfferId);
      }
    }
  }
  return ids;
}

/** Group offers by event_id */
export function groupOffersByEventId(offers: Offer[]): Record<number, Offer[]> {
  return offers.reduce<Record<number, Offer[]>>((acc, offer) => {
    const key = offer.eventId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(offer);
    return acc;
  }, {});
}
