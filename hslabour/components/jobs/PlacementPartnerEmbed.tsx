'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function PlacementPartnerEmbed({
  url,
  title = 'Current Vacancies',
}: {
  url?: string;
  title?: string;
} = {}) {
  const careersUrl = url ?? process.env.NEXT_PUBLIC_PP_CAREERS_URL;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(1200);

  useEffect(() => {
    if (!careersUrl) return;

    function handleMessage(event: MessageEvent) {
      const origin = typeof event.origin === 'string' ? event.origin.toLowerCase() : '';
      if (
        origin.includes('placementpartner') &&
        event.data &&
        typeof event.data === 'object' &&
        typeof event.data.height === 'number'
      ) {
        setHeight(event.data.height);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [careersUrl]);

  if (!careersUrl) {
    return (
      <p className="text-center text-gray-600 py-12 max-w-prose mx-auto">
        Our current vacancies are temporarily unavailable. Please{' '}
        <Link
          href="/"
          className="text-blue-700 underline hover:text-blue-800 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700"
        >
          visit our homepage
        </Link>{' '}
        or contact us for more information.
      </p>
    );
  }

  return (
    <div className="w-full">
      <iframe
        ref={iframeRef}
        src={careersUrl}
        title={title}
        loading="lazy"
        className="w-full border-0"
        style={{ minHeight: '1200px', height: `${height}px` }}
        allow="cors; fullscreen"
      />
    </div>
  );
}