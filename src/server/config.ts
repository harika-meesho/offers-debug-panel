export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  supplierOptinAdminBaseUrl:
    process.env.SUPPLIER_OPTIN_ADMIN_BASE_URL || 'http://localhost:8080',
  offerPlatformBaseUrl:
    process.env.OFFER_PLATFORM_BASE_URL || 'http://localhost:8081',
  internalAuthToken: process.env.INTERNAL_AUTH_TOKEN || '',
};
