export function apiError(e: unknown): string {
  const err = e as { response?: { data?: { error?: string; message?: string } }; message?: string };
  return err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Unknown error';
}
