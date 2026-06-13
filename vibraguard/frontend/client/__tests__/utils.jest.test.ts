import { cn, formatTime } from '../lib/utils';

describe('utils.ts', () => {
  it('merges classes with cn', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('formats short ISO timestamps', () => {
    expect(formatTime('2025-06-10T14:30:00')).toBe('14:30:00');
  });

  it('returns empty string when passed empty string', () => {
    expect(formatTime('')).toBe('');
  });

  it('returns raw string when input is not parseable', () => {
    expect(formatTime('not-a-date')).toBe('not-a-date');
  });
});
