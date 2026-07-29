import { describe, it, expect } from 'vitest';
import { excerptFromHtml, spreadByCategory } from '../../src/lib/text';

describe('excerptFromHtml', () => {
  it('strips tags', () => {
    expect(excerptFromHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('decodes common entities', () => {
    expect(excerptFromHtml('<p>Fish &amp; chips &nbsp;now</p>')).toBe('Fish & chips now');
  });

  it('collapses escaped newlines', () => {
    expect(excerptFromHtml('one\\ntwo')).toBe('one two');
  });

  it('truncates on a word boundary and appends an ellipsis', () => {
    const out = excerptFromHtml('<p>' + 'word '.repeat(60) + '</p>', 40);
    expect(out.length).toBeLessThanOrEqual(43);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/wor…$/);
  });

  it('does not truncate text already short enough', () => {
    expect(excerptFromHtml('<p>Short one</p>', 40)).toBe('Short one');
  });

  it('returns an empty string for null', () => {
    expect(excerptFromHtml(null)).toBe('');
  });
});

describe('spreadByCategory', () => {
  const post = (id: string, slug: string) => ({ id, categories: [{ slug }] });

  it('caps how many posts come from any one category', () => {
    const input = [
      post('1', 'crime'), post('2', 'crime'), post('3', 'crime'),
      post('4', 'sports'), post('5', 'community'),
    ];
    const out = spreadByCategory(input, 4, 2);
    expect(out.filter(p => p.categories[0].slug === 'crime')).toHaveLength(2);
    expect(out).toHaveLength(4);
  });

  it('preserves input order', () => {
    const input = [post('1', 'crime'), post('2', 'sports'), post('3', 'community')];
    expect(spreadByCategory(input, 3, 2).map(p => p.id)).toEqual(['1', '2', '3']);
  });

  it('backfills from over-quota categories rather than returning short', () => {
    const input = [post('1', 'crime'), post('2', 'crime'), post('3', 'crime'), post('4', 'crime')];
    expect(spreadByCategory(input, 3, 2)).toHaveLength(3);
  });

  it('handles posts with no category', () => {
    const input = [{ id: '1', categories: [] }, post('2', 'crime')];
    expect(spreadByCategory(input, 2, 1)).toHaveLength(2);
  });

  it('never exceeds the limit', () => {
    const input = Array.from({ length: 20 }, (_, i) => post(String(i), 'crime'));
    expect(spreadByCategory(input, 8, 2)).toHaveLength(8);
  });
});