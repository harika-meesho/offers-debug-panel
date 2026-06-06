/**
 * Format a Unix timestamp (seconds or milliseconds) to a human-readable string.
 * Returns '—' for falsy values.
 */
export function formatTime(unix: number): string {
  if (!unix) return '—';
  const ms = unix > 1e12 ? unix : unix * 1000;
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
