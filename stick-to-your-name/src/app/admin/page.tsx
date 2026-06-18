import { isAdmin } from '@/lib/admin';
import { ensureSchema, listOrders } from '@/lib/db';
import { redirect } from 'next/navigation';
import AdminNav from './AdminNav';
import OrderStatusControl from './OrderStatusControl';
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Store,
  Mail,
  Phone,
  Tag,
} from 'lucide-react';

interface OrderRow {
  id: string;
  status: string;
  amount_cents: number;
  design_id: string;
  design_name: string;
  child_name: string;
  bag_tag: unknown;
  delivery_option: string;
  delivery_address: string | null;
  pudo_location: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  paid_at: string | null;
  payfast_payment_id: string | null;
  notes: string | null;
}

/* ---------- helpers ---------- */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatRand(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`;
}

const designGradients = [
  'bg-gradient-to-br from-brand-pink to-brand-teal',
  'bg-gradient-to-br from-brand-teal to-brand-pink',
  'bg-gradient-to-br from-brand-pink to-purple-500',
  'bg-gradient-to-br from-brand-teal to-purple-500',
  'bg-gradient-to-br from-brand-pink to-amber-400',
  'bg-gradient-to-br from-brand-teal to-amber-400',
];

function getDesignColor(designId: string): string {
  let sum = 0;
  for (let i = 0; i < designId.length; i++) sum += designId.charCodeAt(i);
  return designGradients[sum % designGradients.length];
}

function StatusPill({ status }: { status: string }) {
  const s = (status ?? '').toLowerCase();
  if (s === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" /> Paid
      </span>
    );
  }
  if (s === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      <XCircle className="w-3 h-3" /> {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Other'}
    </span>
  );
}

function DeliveryInfo({ order }: { order: OrderRow }) {
  const option = (order.delivery_option ?? '').toLowerCase();
  let Icon = Truck;
  let label = 'Delivery';

  if (option.includes('store')) {
    Icon = Store;
    label = 'Store Pickup';
  } else if (option.includes('locker')) {
    Icon = Package;
    label = 'PUDO Locker';
  } else if (option.includes('pickup')) {
    Icon = Package;
    label = 'Pickup';
  }

  return (
    <div className="flex items-start gap-2 text-sm text-gray-600">
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-medium">{label}</span>
        {order.delivery_address && <p className="leading-tight">{order.delivery_address}</p>}
        {order.pudo_location && <p className="leading-tight text-xs">{order.pudo_location}</p>}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  const isTagged = Boolean(order.bag_tag === true || order.bag_tag === 'yes');
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      {/* top row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-mono">{order.id.slice(0, 8)}</span>
        <StatusPill status={order.status} />
      </div>

      {/* child & design */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${getDesignColor(order.design_id)}`} />
        <div>
          <p className="font-semibold text-gray-900 text-lg leading-tight">{order.child_name}</p>
          <p className="text-sm text-gray-500">{order.design_name}</p>
        </div>
      </div>

      {/* amount */}
      <div className="text-sm font-medium text-gray-700">{formatRand(order.amount_cents)}</div>

      {/* dates */}
      <div className="text-xs text-gray-500 space-y-0.5">
        <p>
          <span className="font-medium">Created:</span> {formatDate(order.created_at)}
        </p>
        {order.paid_at && (
          <p>
            <span className="font-medium">Paid:</span> {formatDate(order.paid_at)}
          </p>
        )}
      </div>

      {/* delivery */}
      <DeliveryInfo order={order} />

      {/* customer */}
      <div className="text-xs text-gray-600 space-y-0.5">
        <p>{order.customer_name}</p>
        <a href={`mailto:${order.customer_email}`} className="text-brand-teal hover:underline inline-flex items-center gap-1">
          <Mail className="w-3 h-3" /> {order.customer_email}
        </a>
        {order.customer_phone && (
          <a href={`tel:${order.customer_phone}`} className="text-brand-teal hover:underline inline-flex items-center gap-1 ml-3">
            <Phone className="w-3 h-3" /> {order.customer_phone}
          </a>
        )}
      </div>

      {/* bag tag badge */}
      {isTagged && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-pink/10 text-brand-pink">
          <Tag className="w-3 h-3" /> Bag Tag
        </span>
      )}

      {/* status control */}
      <div className="flex items-center gap-2 border-t pt-3">
        <span className="text-xs text-gray-500">Update status:</span>
        <OrderStatusControl orderId={order.id} current={order.status} />
      </div>
    </div>
  );
}

/* ---------- page component ---------- */
export default async function AdminPage() {
  if (!(await isAdmin())) redirect('/admin/login');

  await ensureSchema();
  const orders: OrderRow[] = await listOrders();

  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const otherOrders = orders.filter((o) => o.status !== 'paid' && o.status !== 'pending');
  const paidTotal = paidOrders.reduce((sum, o) => sum + o.amount_cents, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Paid</p>
            <p className="text-2xl font-bold text-green-700">{paidOrders.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{pendingOrders.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total paid (Rands)</p>
            <p className="text-2xl font-bold text-gray-900">{formatRand(paidTotal)}</p>
          </div>
        </section>

        {/* orders list */}
        <section className="space-y-8">
          {/* PAID */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" /> Paid Orders
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paidOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {paidOrders.length === 0 && <p className="text-sm text-gray-400 italic">No paid orders.</p>}
          </div>

          {/* PENDING */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" /> Pending Orders
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {pendingOrders.length === 0 && <p className="text-sm text-gray-400 italic">No pending orders.</p>}
          </div>

          {/* OTHER (collapsed) */}
          <details className="group">
            <summary className="cursor-pointer text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" /> Other (Failed / Cancelled)
            </summary>
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {otherOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {otherOrders.length === 0 && <p className="text-sm text-gray-400 italic mt-2">No other orders.</p>}
          </details>
        </section>
      </main>
    </div>
  );
}
