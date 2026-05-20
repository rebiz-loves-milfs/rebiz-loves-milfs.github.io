import { describe, it, expect, vi } from 'vitest';

vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

import { slugify, formatDate, formatDateTime, groupPostsByYear } from '../src/utils/content-utils';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  it('strips non-alphanumeric characters', () => {
    expect(slugify('J-Pop Music!')).toBe('j-pop-music');
  });
  it('handles already-slugged input', () => {
    expect(slugify('my-post')).toBe('my-post');
  });
  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('formatDate', () => {
  it('returns a human-readable date string', () => {
    const result = formatDate(new Date('2025-06-15T00:00:00Z'));
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/2025/);
  });
  it('includes day number', () => {
    const result = formatDate(new Date('2025-01-05T00:00:00Z'));
    expect(result).toMatch(/5/);
  });
});

describe('formatDateTime', () => {
  it('includes date and time components', () => {
    const result = formatDateTime(new Date('2025-03-10T14:00:00Z'));
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/2025/);
  });
  it('uses 12-hour format', () => {
    const result = formatDateTime(new Date('2025-03-10T14:00:00Z'));
    expect(result).toMatch(/AM|PM/);
  });
});

describe('groupPostsByYear', () => {
  const posts = [
    { data: { published: new Date('2024-03-01') } },
    { data: { published: new Date('2024-11-20') } },
    { data: { published: new Date('2025-01-05') } },
  ] as any[];

  it('groups posts by publication year', () => {
    const grouped = groupPostsByYear(posts);
    expect(grouped.size).toBe(2);
    expect(grouped.get(2024)?.length).toBe(2);
    expect(grouped.get(2025)?.length).toBe(1);
  });

  it('returns empty map for empty input', () => {
    expect(groupPostsByYear([]).size).toBe(0);
  });

  it('preserves post order within each year', () => {
    const grouped = groupPostsByYear(posts);
    const posts2024 = grouped.get(2024)!;
    expect(posts2024[0].data.published.getMonth()).toBe(2); // March
    expect(posts2024[1].data.published.getMonth()).toBe(10); // November
  });
});
