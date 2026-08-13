type Props = {
  phone: string; // digits only, international format e.g. "27831234567"
  message?: string;
};

export default function WhatsAppButton({ phone, message = "Hi, I'd like to enquire about Woodpecker Guesthouse" }: Props) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.03h-.01a8.1 8.1 0 0 1-4.14-1.14l-.3-.18-3.13.82.84-3.05-.19-.31a8.07 8.07 0 0 1-1.24-4.26c0-4.47 3.64-8.1 8.12-8.1 2.17 0 4.2.84 5.73 2.38a8.05 8.05 0 0 1 2.38 5.73c0 4.47-3.64 8.11-8.12 8.11z" />
      </svg>
    </a>
  );
}