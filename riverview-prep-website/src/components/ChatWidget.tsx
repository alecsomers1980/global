'use client';

import { usePathname } from 'next/navigation';
import AskRiverviewChat from '@/components/AskRiverviewChat';

export default function ChatWidget() {
  const pathname = usePathname();

  // Don't show on admin or prospectus pages
  if (pathname?.startsWith('/admin')) return null;
  if (pathname?.startsWith('/prospectus')) return null;

  return <AskRiverviewChat />;
}
