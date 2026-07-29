import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const ORIGINAL = { ...process.env };

describe('supabase client', () => {
  beforeEach(() => { process.env = { ...ORIGINAL }; });
  afterEach(() => { process.env = { ...ORIGINAL }; });

  it('throws when the Supabase URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    await expect(import('../../src/lib/supabase?missing-url')).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/
    );
  });

  it('does not contain a hardcoded credential fallback', async () => {
    const fs = await import('node:fs/promises');
    const source = await fs.readFile('src/lib/supabase.ts', 'utf8');
    expect(source).not.toMatch(/https:\/\/[a-z0-9]+\.supabase\.co/);
    expect(source).not.toMatch(/eyJhbGciOi/);
  });
});
