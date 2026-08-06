'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PasswordInput from '@/components/auth/PasswordInput';

export default function ResetPasswordPage() {
	const [supabase] = useState(() => createClient());
	const [ready, setReady] = useState(false);

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				setReady(true);
			}
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === 'PASSWORD_RECOVERY') {
				setReady(true);
			}
		});

		return () => {
			subscription?.unsubscribe();
		};
	}, [supabase]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (password.length < 8) {
			setError('Password must be at least 8 characters.');
			return;
		}
		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		setLoading(true);
		try {
			const { error: updateError } = await supabase.auth.updateUser({
				password,
			});
			if (updateError) {
				setError(updateError.message);
			} else {
				setSuccess(true);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	if (!ready) {
		return (
			<div className="max-w-md mx-auto px-6 py-16">
				<div className="bg-surface rounded-lg p-8">
					<p className="text-text text-sm">
						Open the reset link from your email to continue.
					</p>
				</div>
			</div>
		);
	}

	if (success) {
		return (
			<div className="max-w-md mx-auto px-6 py-16">
				<div className="bg-surface rounded-lg p-8">
					<h1 className="display text-2xl text-text">
						CHOOSE A NEW PASSWORD
					</h1>
					<p className="mt-6 text-text text-sm">
						Your password has been updated.
					</p>
					<Link
						href="/admin"
						className="mt-4 inline-block py-2 px-4 rounded-md bg-accent hover:bg-accent-hi text-canvas text-sm font-medium transition-colors"
					>
						Go to Admin
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto px-6 py-16">
			<div className="bg-surface rounded-lg p-8">
				<h1 className="display text-2xl text-text">
					CHOOSE A NEW PASSWORD
				</h1>

				<form onSubmit={handleSubmit} className="mt-8 space-y-6">
					<div>
						<label
							htmlFor="new-password"
							className="block text-sm font-medium text-text"
						>
							New password
						</label>
						<div className="mt-1">
							<PasswordInput
								id="new-password"
								value={password}
								onChange={setPassword}
								placeholder="At least 8 characters"
								autoComplete="new-password"
								required
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="confirm-password"
							className="block text-sm font-medium text-text"
						>
							Confirm password
						</label>
						<div className="mt-1">
							<PasswordInput
								id="confirm-password"
								value={confirmPassword}
								onChange={setConfirmPassword}
								placeholder="Re‑enter your new password"
								autoComplete="new-password"
								required
							/>
						</div>
					</div>

					{error && (
						<p className="text-accent text-sm">{error}</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full flex justify-center py-2 px-4 rounded-md bg-accent hover:bg-accent-hi text-canvas text-sm font-medium disabled:opacity-50 transition-colors"
					>
						{loading ? 'Updating password…' : 'Update password'}
					</button>
				</form>
			</div>
		</div>
	);
}