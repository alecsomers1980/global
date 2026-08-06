import { describe, it, expect } from 'vitest';
import { isSpamSubmission } from './contact';

describe('isSpamSubmission', () => {
  it('flags a filled honeypot regardless of timing', () => {
    expect(isSpamSubmission('bot-filled-this', Date.now(), Date.now())).toBe(true);
  });

  it('flags a submission faster than the minimum interval', () => {
    const renderedAt = 1000;
    const now = renderedAt + 1000; // 1s later, under the 2.5s floor
    expect(isSpamSubmission('', renderedAt, now)).toBe(true);
  });

  it('allows a genuine submission with an empty honeypot and realistic timing', () => {
    const renderedAt = 1000;
    const now = renderedAt + 5000; // 5s later
    expect(isSpamSubmission('', renderedAt, now)).toBe(false);
  });
});
