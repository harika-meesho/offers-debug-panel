import { describe, it, expect } from 'vitest';
import { formatTime } from '../format';

describe('formatTime', () => {
  it('returns "—" for 0', () => {
    expect(formatTime(0)).toBe('—');
  });

  it('handles a seconds-precision Unix timestamp', () => {
    // 1700000000 seconds = Wed Nov 15 2023 (approx)
    const result = formatTime(1700000000);
    expect(result).toContain('2023');
  });

  it('handles a milliseconds-precision Unix timestamp', () => {
    // 1700000000000 ms = same instant as above
    const result = formatTime(1700000000000);
    expect(result).toContain('2023');
  });

  it('returns the same formatted string for seconds and equivalent milliseconds', () => {
    expect(formatTime(1700000000)).toEqual(formatTime(1700000000000));
  });

  it('returns a non-empty string for a valid timestamp', () => {
    expect(formatTime(1000000000)).not.toBe('—');
  });
});
