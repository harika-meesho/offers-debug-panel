import axios from 'axios';
import { ProductSupplierResponse } from '../types';

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
