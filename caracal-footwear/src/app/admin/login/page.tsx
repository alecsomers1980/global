'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PasswordInput from '@/components/auth/PasswordInput';

function LoginForm() {
	const searchParams = useSearchParams();
	const next = searchParams.get('next') ?? '/admin';
	const router = useRouter();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [remember, setRemember] = useState(true);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const supabase = createClient(remember);
			const { error: authError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (authError) {
				setError(authError.message);
			} else {
				router.push(next);
				router.refresh();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto px-6 py-16">
			<div className="bg-surface rounded-lg p-8">
				<h1 className="display text-2xl text-text text-center">
					CARACAL ADMIN
				</h1>
				<p className="text-sm text-muted text-center mt-1">
					Sign in to manage the store.
				</p>

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

					<div>
						<div className="flex items-center justify-between">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-text"
							>
								Password
							</label>
							<Link
								href="/forgot-password"
								className="text-xs text-muted hover:text-text"
							>
								Forgot password?
							</Link>
						</div>
						<div className="mt-1">
							<PasswordInput
								id="password"
								value={password}
								onChange={setPassword}
								placeholder="Enter your password"
								autoComplete="current-password"
								required
							/>
						</div>
					</div>

					<div className="flex items-center">
						<input
							id="remember"
							type="checkbox"
							checked={remember}
							onChange={(e) => setRemember(e.target.checked)}
							className="h-4 w-4 rounded border-text/20 bg-surface text-accent focus:ring-accent"
						/>
						<label
							htmlFor="remember"
							className="ml-2 block text-sm text-muted"
						>
							Keep me signed in
						</label>
					</div>

					{error && (
						<p className="text-accent text-sm">{error}</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full flex justify-center py-2 px-4 rounded-md bg-accent hover:bg-accent-hi text-canvas text-sm font-medium disabled:opacity-50 transition-colors"
					>
						{loading ? 'Signing in…' : 'Sign in'}
					</button>
				</form>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginForm />
		</Suspense>
	);
}