import Link from 'next/link';
import { Package, Image, DollarSign, Mail, LogOut } from 'lucide-react';

export default function AdminNav() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-y-2">
      <div className="font-semibold text-gray-900">
        Stick to Your Name <span className="text-gray-500 font-normal">· Admin</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-sm text-gray-600 hover:text-brand-pink flex items-center gap-1.5">
          <Package className="w-4 h-4" />
          Orders
        </Link>
        <Link href="/admin/designs" className="text-sm text-gray-600 hover:text-brand-pink flex items-center gap-1.5">
          <Image className="w-4 h-4" />
          Designs
        </Link>
        <Link href="/admin/settings" className="text-sm text-gray-600 hover:text-brand-pink flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" />
          Pricing
        </Link>
        <Link href="/admin/messages" className="text-sm text-gray-600 hover:text-brand-pink flex items-center gap-1.5">
          <Mail className="w-4 h-4" />
          Messages
        </Link>
        <a href="/api/admin/logout" className="text-sm text-gray-600 hover:text-brand-pink flex items-center gap-1.5">
          <LogOut className="w-4 h-4" />
          Sign out
        </a>
      </div>
    </nav>
  );
}