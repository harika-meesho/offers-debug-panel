import { vi, describe, it, expect, beforeEach } from 'vitest';

// Hoist the mock function so the vi.mock factory can reference it
const mockGet = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({ get: mockGet })),
  },
}));

// Import after the mock is registered
import { getProductSupplierOffers, getLifecycleA } from '../api';

describe('getProductSupplierOffers', () => {
  beforeEach(() => mockGet.mockReset());

  it('calls the correct URL', async () => {
    mockGet.mockResolvedValue({ data: { events: [] } });
    await getProductSupplierOffers('123', '456');
    expect(mockGet).toHaveBeenCalledWith('/admin/debug/panel/product-supplier/123/456');
  });

  it('returns the data from the response', async () => {
    const responseData = { events: [], product_details: undefined };
    mockGet.mockResolvedValue({ data: responseData });
    const result = await getProductSupplierOffers('10', '20');
    expect(result).toEqual(responseData);
  });


});

describe('getLifecycleA', () => {
  beforeEach(() => mockGet.mockReset());

  it('sends only sid when optinId is undefined', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await getLifecycleA(undefined, 'sup-1');
    expect(mockGet).toHaveBeenCalledWith('/admin/debug/panel/offer-lifecycle', {
      params: { sid: 'sup-1' },
    });
  });

  it('includes optin_id when optinId is provided', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await getLifecycleA('opt-99', 'sup-1');
    expect(mockGet).toHaveBeenCalledWith('/admin/debug/panel/offer-lifecycle', {
      params: { sid: 'sup-1', optin_id: 'opt-99' },
    });
  });

  it('includes rd_table_name when provided', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await getLifecycleA('opt-1', 'sup-1', 'rd_table_sale_42');
    expect(mockGet).toHaveBeenCalledWith('/admin/debug/panel/offer-lifecycle', {
      params: { sid: 'sup-1', optin_id: 'opt-1', rd_table_name: 'rd_table_sale_42' },
    });
  });

  it('omits optin_id when optinId is empty string', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await getLifecycleA('', 'sup-1');
    const params = mockGet.mock.calls[0][1].params as Record<string, string>;
    expect(params).not.toHaveProperty('optin_id');
  });

  it('omits rd_table_name when not provided', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await getLifecycleA('opt-1', 'sup-1');
    const params = mockGet.mock.calls[0][1].params as Record<string, string>;
    expect(params).not.toHaveProperty('rd_table_name');
  });

  it('returns the data from the response', async () => {
    const responseData = { supplier_optin: null, upload_jobs: null };
    mockGet.mockResolvedValue({ data: responseData });
    const result = await getLifecycleA(undefined, 'sup-1');
    expect(result).toEqual(responseData);
  });
});
