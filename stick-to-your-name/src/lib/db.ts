import { sql } from "@vercel/postgres";

export type OrderStatus = "pending" | "paid" | "cancelled" | "failed";

export type OrderRow = {
  id: string;
  status: OrderStatus;
  amount_cents: number;
  design_id: string;
  design_name: string;
  child_name: string;
  bag_tag: boolean;
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
};

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id              TEXT PRIMARY KEY,
      status          TEXT NOT NULL DEFAULT 'pending',
      amount_cents    INTEGER NOT NULL,
      design_id       TEXT NOT NULL,
      design_name     TEXT NOT NULL,
      child_name      TEXT NOT NULL,
      bag_tag         BOOLEAN NOT NULL DEFAULT FALSE,
      delivery_option TEXT NOT NULL,
      delivery_address TEXT,
      pudo_location   TEXT,
      customer_name   TEXT NOT NULL,
      customer_email  TEXT NOT NULL,
      customer_phone  TEXT NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      paid_at         TIMESTAMPTZ,
      payfast_payment_id TEXT,
      notes           TEXT
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);`;
  await sql`CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);`;
}

export async function insertPendingOrder(o: {
  id: string;
  amountCents: number;
  designId: string;
  designName: string;
  childName: string;
  bagTag: boolean;
  deliveryOption: string;
  deliveryAddress: string | null;
  pudoLocation: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string | null;
}) {
  await sql`
    INSERT INTO orders (
      id, status, amount_cents, design_id, design_name, child_name, bag_tag,
      delivery_option, delivery_address, pudo_location,
      customer_name, customer_email, customer_phone, notes
    ) VALUES (
      ${o.id}, 'pending', ${o.amountCents}, ${o.designId}, ${o.designName}, ${o.childName}, ${o.bagTag},
      ${o.deliveryOption}, ${o.deliveryAddress}, ${o.pudoLocation},
      ${o.customerName}, ${o.customerEmail}, ${o.customerPhone}, ${o.notes}
    );
  `;
}

export async function markOrderPaid(id: string, payfastPaymentId: string) {
  await sql`
    UPDATE orders
       SET status = 'paid', paid_at = NOW(), payfast_payment_id = ${payfastPaymentId}
     WHERE id = ${id} AND status <> 'paid';
  `;
}

export async function markOrderStatus(id: string, status: OrderStatus) {
  await sql`UPDATE orders SET status = ${status} WHERE id = ${id};`;
}

export async function getOrderById(id: string): Promise<OrderRow | null> {
  const r = await sql<OrderRow>`SELECT * FROM orders WHERE id = ${id} LIMIT 1;`;
  return r.rows[0] ?? null;
}

export async function listOrders(limit = 200): Promise<OrderRow[]> {
  const r = await sql<OrderRow>`
    SELECT * FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;
  return r.rows;
}
