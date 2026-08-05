'use client';
import { useRef, useEffect } from 'react';

interface PayFastRedirectFormProps {
  action: string;
  data: Record<string, string>;
}

export default function PayFastRedirectForm({ action, data }: PayFastRedirectFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <form ref={formRef} action={action} method="POST" className="sr-only" aria-hidden="true">
      {Object.entries(data).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </form>
  );
}