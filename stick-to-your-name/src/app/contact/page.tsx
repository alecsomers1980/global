'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (name.trim().length < 2) return 'Please enter your name (at least 2 characters).';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) return 'Please enter a valid email address.';
    if (message.trim().length < 5) return 'Your message should be at least 5 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-purple mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to ordering
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Thanks!</h2>
              <p className="text-gray-600">
                We&rsquo;ll get back to you soon.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Get in touch
              </h1>
              <p className="text-gray-500 mb-6">
                Have a question, suggestion, or just want to say hi? Drop us a
                message.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-shadow"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Phone (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-shadow"
                    placeholder="+27 83 417 5490"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-shadow resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-brand-pink text-white font-medium rounded-xl hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send message'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Aloe Signs contact block */}
        <div className="mt-8 text-center space-y-1 text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            42 Homestead Avenue, Randfontein
          </p>
          <p className="flex items-center justify-center gap-1.5">
            <Phone className="w-4 h-4 text-gray-400" />
            WhatsApp{' '}
            <a
              href="https://wa.me/27834175490"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brand-pink transition-colors"
            >
              083 417 5490
            </a>
          </p>
          <p className="flex items-center justify-center gap-1.5">
            <Mail className="w-4 h-4 text-gray-400" />
            <a
              href="mailto:melissa@aloesigns.co.za"
              className="underline hover:text-brand-pink transition-colors"
            >
              melissa@aloesigns.co.za
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}