import axios from 'axios';
import type {
  ProductSupplierResponse,
  LifecycleAResponse,
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
  rdTableName?: string,
): Promise<LifecycleAResponse> {
  const params: Record<string, string> = { sid: supplierId };
  if (optinId) params.optin_id = optinId;
  if (rdTableName) params.rd_table_name = rdTableName;
  const { data } = await client.get('/admin/debug/panel/offer-lifecycle', { params });
  return data;
}


