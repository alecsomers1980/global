'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const supabase = createClient();
			await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});
			setSent(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto px-6 py-16">
			<div className="bg-surface rounded-lg p-8">
				<h1 className="display text-2xl text-text">
					RESET YOUR PASSWORD
				</h1>

				{sent ? (
					<div className="mt-6 space-y-4">
						<p className="text-text text-sm">
							If that email exists, we&apos;ve sent a reset link.
						</p>
						<Link
							href="/admin/login"
							className="inline-block text-sm text-accent hover:text-accent-hi font-medium"
						>
							Back to sign in
						</Link>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="mt-8 space-y-6">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-text"
							>
								Email address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="mt-1 block w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-sm text-text"
							/>
						</div>

						{error && (
							<p className="text-accent text-sm">{error}</p>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full flex justify-center py-2 px-4 rounded-md bg-accent hover:bg-accent-hi text-canvas text-sm font-medium disabled:opacity-50 transition-colors"
						>
							{loading ? 'Sending reset link…' : 'Send reset link'}
						</button>
					</form>
				)}
			</div>
		</div>
	);
}