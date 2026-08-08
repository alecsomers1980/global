'use client';

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { SITE } from '@/data/site';
import { TOURS } from '@/data/tours';
import { DESTINATIONS, COMFORT_TIERS } from '@/data/taxonomy';
import { MIN_SUBMIT_MS } from '@/lib/quote-schema'; // server rejects submissions faster than this threshold
import { Button } from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

interface QuoteFormFieldRefs {
  [key: string]: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>;
}

interface QuoteFormProps {
  variant?: 'full' | 'contact';
  defaultExperience?: string;
  defaultDestination?: string;
  defaultComfort?: string;
  sourcePage?: string;
  title?: string;
  className?: string;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  experience: string;
  destination: string;
  comfort: string;
  dateFrom: string;
  dateTo: string;
  adults: number;
  children: number;
  message: string;
}

export function QuoteForm({
  variant = 'full',
  defaultExperience,
  defaultDestination,
  defaultComfort,
  sourcePage,
  title,
  className,
}: QuoteFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeyPot, setHoneyPot] = useState('');
  const renderedAt = useRef<number>(0);

  const getInitialValues = (): FormValues => ({
    name: '',
    email: '',
    phone: '',
    experience: defaultExperience ?? '',
    destination: defaultDestination ?? '',
    comfort: defaultComfort ?? '',
    dateFrom: '',
    dateTo: '',
    adults: 2,
    children: 0,
    message: '',
  });

  const [formValues, setFormValues] = useState<FormValues>(getInitialValues());

  // Refs for focusing first invalid field
  const fieldRefs: QuoteFormFieldRefs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    experience: useRef<HTMLSelectElement>(null),
    destination: useRef<HTMLSelectElement>(null),
    comfort: useRef<HTMLSelectElement>(null),
    dateFrom: useRef<HTMLInputElement>(null),
    dateTo: useRef<HTMLInputElement>(null),
    adults: useRef<HTMLInputElement>(null),
    children: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setFormValues((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrors({});

    const payload = {
      ...formValues,
      website: honeyPot,
      renderedAt: renderedAt.current,
      sourcePage: sourcePage ?? '',
    };

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.ok) {
        setStatus('success');
      } else if (res.status === 400 && json.errors) {
        setErrors(json.errors);
        setStatus('idle');
        // Focus the first invalid field
        const firstErrorKey = Object.keys(json.errors).find(
          (k) => k !== 'form',
        );
        if (firstErrorKey && fieldRefs[firstErrorKey]?.current) {
          fieldRefs[firstErrorKey].current!.focus();
        }
      } else {
        setErrors({ form: 'Something went wrong. Please try again or contact us via WhatsApp.' });
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setErrors({ form: 'Network error. Please check your connection and try again.' });
      setStatus('error');
    }
  };

  const isFull = variant === 'full';

  // Reusable input class
  const inputClass =
    'w-full rounded border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-amber';
  const labelClass = 'mb-2 block text-xs uppercase tracking-wide3 text-text/70';

  if (status === 'success') {
    return (
      <div className={`text-center ${className ?? ''}`} role="alert">
        <CheckCircle2 className="mx-auto h-12 w-12 text-amber" />
        <h3 className="mt-4 text-lg font-semibold uppercase tracking-wide2">
          Thank You, We Have Your Request
        </h3>
        <p className="mt-2 text-sm text-text/70">
          The team will review your enquiry and reply within one business day. For anything
          urgent, you can reach us directly on WhatsApp.
        </p>
        <a
          href={SITE.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber underline underline-offset-2 hover:text-amber-soft"
        >
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="mb-6 text-lg font-semibold uppercase tracking-wide2">{title}</h3>
      )}
      <form onSubmit={handleSubmit} noValidate className="grid gap-5 md:grid-cols-2">
        {/* Honeypot — visually hidden, not display:none */}
        <div className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website" className="sr-only">
            Leave empty
          </label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeyPot}
            onChange={(e) => setHoneyPot(e.target.value)}
          />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="quote-name" className={labelClass}>
            Name <span className="text-amber">*</span>
          </label>
          <input
            ref={fieldRefs.name as React.RefObject<HTMLInputElement>}
            id="quote-name"
            name="name"
            type="text"
            required
            className={inputClass}
            value={formValues.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'quote-name-error' : undefined}
          />
          {errors.name && (
            <p id="quote-name-error" className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="quote-email" className={labelClass}>
            Email <span className="text-amber">*</span>
          </label>
          <input
            ref={fieldRefs.email as React.RefObject<HTMLInputElement>}
            id="quote-email"
            name="email"
            type="email"
            required
            className={inputClass}
            value={formValues.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'quote-email-error' : undefined}
          />
          {errors.email && (
            <p id="quote-email-error" className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="quote-phone" className={labelClass}>
            Phone <span className="text-amber">*</span>
          </label>
          <input
            ref={fieldRefs.phone as React.RefObject<HTMLInputElement>}
            id="quote-phone"
            name="phone"
            type="tel"
            required
            className={inputClass}
            value={formValues.phone}
            onChange={handleChange}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'quote-phone-error' : undefined}
          />
          {errors.phone && (
            <p id="quote-phone-error" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        {isFull && (
          <>
            {/* Experience */}
            <div>
              <label htmlFor="quote-experience" className={labelClass}>
                Experience
              </label>
              <select
                ref={fieldRefs.experience as React.RefObject<HTMLSelectElement>}
                id="quote-experience"
                name="experience"
                className={inputClass}
                value={formValues.experience}
                onChange={handleChange}
                aria-invalid={!!errors.experience}
                aria-describedby={errors.experience ? 'quote-experience-error' : undefined}
              >
                <option value="">Not sure yet</option>
                {TOURS.map((tour) => (
                  <option key={tour.slug} value={tour.slug}>
                    {tour.title}
                  </option>
                ))}
              </select>
              {errors.experience && (
                <p id="quote-experience-error" className="mt-1 text-xs text-red-600">
                  {errors.experience}
                </p>
              )}
            </div>

            {/* Destination */}
            <div>
              <label htmlFor="quote-destination" className={labelClass}>
                Destination
              </label>
              <select
                ref={fieldRefs.destination as React.RefObject<HTMLSelectElement>}
                id="quote-destination"
                name="destination"
                className={inputClass}
                value={formValues.destination}
                onChange={handleChange}
                aria-invalid={!!errors.destination}
                aria-describedby={errors.destination ? 'quote-destination-error' : undefined}
              >
                <option value="">Any destination</option>
                {DESTINATIONS.map((dest) => (
                  <option key={dest.slug} value={dest.slug}>
                    {dest.label}
                  </option>
                ))}
              </select>
              {errors.destination && (
                <p id="quote-destination-error" className="mt-1 text-xs text-red-600">
                  {errors.destination}
                </p>
              )}
            </div>

            {/* Comfort Tier */}
            <div>
              <label htmlFor="quote-comfort" className={labelClass}>
                Comfort Level
              </label>
              <select
                ref={fieldRefs.comfort as React.RefObject<HTMLSelectElement>}
                id="quote-comfort"
                name="comfort"
                className={inputClass}
                value={formValues.comfort}
                onChange={handleChange}
                aria-invalid={!!errors.comfort}
                aria-describedby={errors.comfort ? 'quote-comfort-error' : undefined}
              >
                <option value="">Not sure yet</option>
                {COMFORT_TIERS.map((tier) => (
                  <option key={tier.slug} value={tier.slug}>
                    {tier.label}
                  </option>
                ))}
              </select>
              {errors.comfort && (
                <p id="quote-comfort-error" className="mt-1 text-xs text-red-600">
                  {errors.comfort}
                </p>
              )}
            </div>

            {/* Date From */}
            <div>
              <label htmlFor="quote-dateFrom" className={labelClass}>
                Date From
              </label>
              <input
                ref={fieldRefs.dateFrom as React.RefObject<HTMLInputElement>}
                id="quote-dateFrom"
                name="dateFrom"
                type="date"
                className={inputClass}
                value={formValues.dateFrom}
                onChange={handleChange}
                aria-invalid={!!errors.dateFrom}
                aria-describedby={errors.dateFrom ? 'quote-dateFrom-error' : undefined}
              />
              {errors.dateFrom && (
                <p id="quote-dateFrom-error" className="mt-1 text-xs text-red-600">
                  {errors.dateFrom}
                </p>
              )}
            </div>

            {/* Date To */}
            <div>
              <label htmlFor="quote-dateTo" className={labelClass}>
                Date To
              </label>
              <input
                ref={fieldRefs.dateTo as React.RefObject<HTMLInputElement>}
                id="quote-dateTo"
                name="dateTo"
                type="date"
                className={inputClass}
                value={formValues.dateTo}
                onChange={handleChange}
                aria-invalid={!!errors.dateTo}
                aria-describedby={errors.dateTo ? 'quote-dateTo-error' : undefined}
              />
              {errors.dateTo && (
                <p id="quote-dateTo-error" className="mt-1 text-xs text-red-600">
                  {errors.dateTo}
                </p>
              )}
            </div>

            {/* Adults */}
            <div>
              <label htmlFor="quote-adults" className={labelClass}>
                Adults <span className="text-amber">*</span>
              </label>
              <input
                ref={fieldRefs.adults as React.RefObject<HTMLInputElement>}
                id="quote-adults"
                name="adults"
                type="number"
                min={1}
                required
                className={inputClass}
                value={formValues.adults}
                onChange={handleChange}
                aria-invalid={!!errors.adults}
                aria-describedby={errors.adults ? 'quote-adults-error' : undefined}
              />
              {errors.adults && (
                <p id="quote-adults-error" className="mt-1 text-xs text-red-600">
                  {errors.adults}
                </p>
              )}
            </div>

            {/* Children */}
            <div>
              <label htmlFor="quote-children" className={labelClass}>
                Children
              </label>
              <input
                ref={fieldRefs.children as React.RefObject<HTMLInputElement>}
                id="quote-children"
                name="children"
                type="number"
                min={0}
                className={inputClass}
                value={formValues.children}
                onChange={handleChange}
                aria-invalid={!!errors.children}
                aria-describedby={errors.children ? 'quote-children-error' : undefined}
              />
              {errors.children && (
                <p id="quote-children-error" className="mt-1 text-xs text-red-600">
                  {errors.children}
                </p>
              )}
            </div>
          </>
        )}

        {/* Message */}
        <div className="md:col-span-2">
          <label htmlFor="quote-message" className={labelClass}>
            Message
          </label>
          <textarea
            ref={fieldRefs.message as React.RefObject<HTMLTextAreaElement>}
            id="quote-message"
            name="message"
            rows={4}
            className={inputClass}
            value={formValues.message}
            onChange={handleChange}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'quote-message-error' : undefined}
          />
          {errors.message && (
            <p id="quote-message-error" className="mt-1 text-xs text-red-600">
              {errors.message}
            </p>
          )}
        </div>

        {/* Form-level error */}
        {errors.form && (
          <div className="md:col-span-2 rounded border border-red-600 bg-red-50 px-4 py-3 text-xs text-red-600">
            {errors.form}
          </div>
        )}

        {/* Submit */}
        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full"
          >
            {status === 'submitting'
              ? 'Sending…'
              : isFull
                ? 'Request a Quote'
                : 'Send Message'}
          </Button>
        </div>
      </form>
    </div>
  );
}
