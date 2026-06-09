'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import NewsletterSubscribeModal from '@/components/NewsletterSubscribeModal';

interface Props {
  variant?: 'green' | 'gold';
  className?: string;
  children?: React.ReactNode;
}

export default function SubscribeButton({ variant = 'gold', className = '', children }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const baseClasses = variant === 'gold'
    ? 'inline-flex items-center gap-3 px-8 py-4 bg-brand-gold text-white font-bold rounded-full hover:bg-brand-gold/90 transition-colors text-sm'
    : 'inline-flex items-center gap-3 px-8 py-4 bg-brand-green text-white font-bold rounded-full hover:bg-brand-green/90 transition-all hover:shadow-lg hover:-translate-y-1';

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(baseClasses, className)}
      >
        {children || <>Subscribe <ArrowRight className="w-4 h-4" /></>}
      </button>
      <NewsletterSubscribeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
