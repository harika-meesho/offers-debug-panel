export function apiError(e: unknown): string {
  const err = e as { response?: { data?: { error?: string; message?: string } }; message?: string };
  return err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Unknown error';
}

// Parses the raw lifecycle step error strings produced by the BFF.
// Format: "failed to fetch X: client error: status=NNN method=Y url=Z message={json}"
// Extracts developer_message from the JSON body; falls back to the raw string if already clean.
export function parseLifecycleError(raw: string): string {
  if (!raw) return raw;

  const msgIdx = raw.lastIndexOf(' message=');
  if (msgIdx !== -1) {
    const jsonStr = raw.slice(msgIdx + ' message='.length);
    try {
      const body = JSON.parse(jsonStr) as Record<string, unknown>;
      const reason =
        (body.developer_message as string) ||
        (body.message as string) ||
        (body.error as string) ||
        (body.code as string);
      if (reason) {
        const statusMatch = raw.match(/status=(\d+)/);
        return statusMatch ? `HTTP ${statusMatch[1]}: ${reason}` : reason;
      }
    } catch {
      // JSON parse failed — fall through to raw
    }
  }

  return raw;
}
