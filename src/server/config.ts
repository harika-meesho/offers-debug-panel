export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  supplierOptinAdminBaseUrl:
    process.env.SUPPLIER_OPTIN_ADMIN_BASE_URL || 'http://localhost:8080',
  supplierOptinSupplierBaseUrl:
    process.env.SUPPLIER_OPTIN_SUPPLIER_BASE_URL || 'http://localhost:8082',
  offerPlatformBaseUrl:
    process.env.OFFER_PLATFORM_BASE_URL || 'http://localhost:8081',
  internalAuthToken: process.env.INTERNAL_AUTH_TOKEN || '',
  clientId: process.env.CLIENT_ID || '10000',
  offerPlatformToken: process.env.OFFER_PLATFORM_TOKEN || '',
};
