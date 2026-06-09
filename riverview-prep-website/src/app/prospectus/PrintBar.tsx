'use client';

import React, { useState } from 'react';

export default function PrintBar() {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  const waitForImages = async () => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.loading = 'eager';
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
          // Trigger a re-fetch in case the browser hasn't started it yet
          if (!img.src) return resolve();
          const src = img.src;
          img.src = '';
          img.src = src;
        });
      })
    );
    // small grace period to let layout/decoding settle
    await new Promise((r) => setTimeout(r, 300));
  };

  const handlePrint = async () => {
    setStatus('loading');
    try {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      await waitForImages();
      window.print();
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="no-print sticky top-0 z-50 bg-brand-green text-white py-3 px-6 flex items-center justify-between shadow-lg">
      <div>
        <p className="font-bold text-sm">Riverview Prospectus — Print Preview</p>
        <p className="text-[11px] text-white/70">Print → Landscape · A4 · Margins: None · Background graphics: ON</p>
      </div>
      <div className="flex gap-3">
        <a href="/" className="text-xs px-4 py-2 border border-white/30 rounded-full hover:bg-white/10">Back to site</a>
        <button
          onClick={handlePrint}
          disabled={status === 'loading'}
          className="text-xs px-5 py-2 bg-brand-gold text-brand-green font-bold rounded-full hover:bg-brand-gold/90 disabled:opacity-60"
        >
          {status === 'loading' ? 'Preparing images…' : 'Print / Save PDF'}
        </button>
      </div>
    </div>
  );
}
