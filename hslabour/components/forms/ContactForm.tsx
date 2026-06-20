'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { services } from '@/lib/site/services';

interface ContactFormProps {
  heading?: string;
}

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  website: '', // honeypot — must stay empty
};

export default function ContactForm({ heading }: ContactFormProps) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setErrorMessage('');

      // validation
      if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        setErrorMessage('Name, email and message are required.');
        setStatus('error');
        return;
      }
      if (!form.email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        setStatus('error');
        return;
      }

      setStatus('submitting');

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            company: form.company.trim() || undefined,
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
            service: form.service || undefined,
            message: form.message.trim(),
            website: form.website,
          }),
        });
        const data = await res.json();

        if (data.ok) {
          setStatus('success');
          setForm(initialForm);
        } else {
          setErrorMessage(data.error || 'Something went wrong. Please try again.');
          setStatus('error');
        }
      } catch {
        setErrorMessage('Network error. Please check your connection and try again.');
        setStatus('error');
      }
    },
    [form],
  );

  // Success state – show message
  if (status === 'success') {
    return (
      <div className="rounded bg-mint p-6 text-center text-navy">
        <p className="text-lg font-semibold">Thanks — we’ll be in touch</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm underline text-green-dark hover:text-green focus:outline-none"
        >
          Send another message
        </button>
      </div>
    );
  }

  const isSubmitting = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {heading && (
        <h2 className="text-2xl font-bold tracking-tight text-navy">{heading}</h2>
      )}

      {status === 'error' && errorMessage && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Honeypot — hidden from real users; bots that fill it are rejected */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
            Your name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="rounded border border-slate-300 px-3 py-2 text-ink focus:border-green focus:ring-2 focus:ring-green/40 outline-none"
          />
        </div>

        {/* Company */}
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-company" className="text-sm font-medium text-slate-700">
            Company
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            value={form.company}
            onChange={handleChange}
            className="rounded border border-slate-300 px-3 py-2 text-ink focus:border-green focus:ring-2 focus:ring-green/40 outline-none"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="rounded border border-slate-300 px-3 py-2 text-ink focus:border-green focus:ring-2 focus:ring-green/40 outline-none"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-phone" className="text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="rounded border border-slate-300 px-3 py-2 text-ink focus:border-green focus:ring-2 focus:ring-green/40 outline-none"
          />
        </div>
      </div>

      {/* Service select – full width */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-service" className="text-sm font-medium text-slate-700">
          Service you’re interested in
        </label>
        <select
          id="contact-service"
          name="service"
          value={form.service}
          onChange={handleChange}
          className="rounded border border-slate-300 px-3 py-2 text-ink focus:border-green focus:ring-2 focus:ring-green/40 outline-none"
        >
          <option value="">General enquiry</option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-message" className="text-sm font-medium text-slate-700">
          Your message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          value={form.message}
          onChange={handleChange}
          className="rounded border border-slate-300 px-3 py-2 text-ink focus:border-green focus:ring-2 focus:ring-green/40 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded bg-green px-6 py-3 text-sm font-semibold text-navy shadow-sm hover:bg-green-dark focus:outline-none focus:ring-2 focus:ring-green/40 focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}