'use client';

import { useState } from 'react';

interface PasswordInputProps {
	id: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	autoComplete?: string;
	required?: boolean;
}

export default function PasswordInput({
	id,
	value,
	onChange,
	placeholder,
	autoComplete,
	required = true,
}: PasswordInputProps) {
	const [show, setShow] = useState(false);

	return (
		<div className="relative">
			<input
				id={id}
				type={show ? 'text' : 'password'}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				autoComplete={autoComplete}
				required={required}
				className="bg-surface border border-text/20 rounded-md px-3 py-2 pr-16 text-sm w-full text-text"
			/>
			<div className="absolute inset-y-0 right-0 flex items-center pr-3">
				<button
					type="button"
					onClick={() => setShow(!show)}
					aria-label={show ? 'Hide password' : 'Show password'}
					className="text-xs text-muted hover:text-text"
				>
					{show ? 'Hide' : 'Show'}
				</button>
			</div>
		</div>
	);
}