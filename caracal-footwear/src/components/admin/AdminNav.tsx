import Link from 'next/link';
import SignOutButton from './SignOutButton';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminNav() {
  return (
    <nav className="flex flex-col gap-1 mt-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface rounded-md"
        >
          {link.label}
        </Link>
      ))}
      <div className="mt-8 pt-4 border-t border-text/10">
        <SignOutButton />
      </div>
    </nav>
  );
}