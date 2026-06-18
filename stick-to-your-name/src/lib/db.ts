import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { SEED_DESIGNS } from './designs';

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'failed' | 'printing' | 'shipped' | 'completed';

export interface OrderRow {
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
  status_updated_at: string | null;
}

export interface SettingsRow {
  id: number;
  set_price_cents: number;
  bagtag_price_cents: number;
  collect_price_cents: number;
  pudo_price_cents: number;
  courier_price_cents: number;
}

export interface DesignRow {
  id: string;
  name: string;
  popular: boolean;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: Date;
}

export interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface ContactRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: Date;
}

export async function ensureSchema(): Promise<void> {
  // Orders
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
      notes           TEXT,
      status_updated_at TIMESTAMPTZ
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);`;
  await sql`CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders(customer_email);`;

  // Settings
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id                  INTEGER PRIMARY KEY DEFAULT 1,
      set_price_cents     INTEGER NOT NULL DEFAULT 15000,
      bagtag_price_cents  INTEGER NOT NULL DEFAULT 1500,
      collect_price_cents INTEGER NOT NULL DEFAULT 0,
      pudo_price_cents    INTEGER NOT NULL DEFAULT 7000,
      courier_price_cents INTEGER NOT NULL DEFAULT 10000,
      CONSTRAINT settings_single CHECK (id = 1)
    );
  `;

  // Designs
  await sql`
    CREATE TABLE IF NOT EXISTS designs (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      popular     BOOLEAN NOT NULL DEFAULT FALSE,
      image_url   TEXT,
      active      BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Admin users
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Password resets
  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      token       TEXT PRIMARY KEY,
      admin_id    TEXT NOT NULL,
      expires_at  TIMESTAMPTZ NOT NULL,
      used        BOOLEAN NOT NULL DEFAULT FALSE
    );
  `;

  // Contact messages
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      phone       TEXT,
      message     TEXT NOT NULL,
      read        BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Seeds
  const { rows: [setting] } = await sql`SELECT id FROM settings LIMIT 1;`;
  if (!setting) {
    await sql`
      INSERT INTO settings (id, set_price_cents, bagtag_price_cents, collect_price_cents, pudo_price_cents, courier_price_cents)
      VALUES (1, 15000, 1500, 0, 7000, 10000)
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  const { rows: [design] } = await sql`SELECT id FROM designs LIMIT 1;`;
  if (!design) {
    for (let i = 0; i < SEED_DESIGNS.length; i++) {
      const d = SEED_DESIGNS[i];
      await sql`
        INSERT INTO designs (id, name, popular, image_url, active, sort_order)
        VALUES (${d.id}, ${d.name}, ${d.popular || false}, NULL, TRUE, ${i})
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (adminEmail && adminHash) {
    const { rowCount } = await sql`SELECT 1 FROM admin_users LIMIT 1;`;
    if (rowCount === 0) {
      const id = crypto.randomUUID();
      await sql`
        INSERT INTO admin_users (id, email, password_hash)
        VALUES (${id}, ${adminEmail.toLowerCase()}, ${adminHash})
        ON CONFLICT (email) DO NOTHING;
      `;
    }
  }
}

// --- Orders --- (keep existing signatures)

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
}): Promise<void> {
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

export async function markOrderPaid(id: string, payfastPaymentId: string): Promise<void> {
  await sql`
    UPDATE orders
       SET status = 'paid', paid_at = NOW(), payfast_payment_id = ${payfastPaymentId}
     WHERE id = ${id} AND status <> 'paid';
  `;
}

export async function getOrderById(id: string): Promise<OrderRow | null> {
  const { rows } = await sql<OrderRow>`SELECT * FROM orders WHERE id = ${id}`;
  return rows[0] || null;
}

export async function listOrders(): Promise<OrderRow[]> {
  const { rows } = await sql<OrderRow>`SELECT * FROM orders ORDER BY created_at DESC`;
  return rows;
}

export async function markOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await sql`
    UPDATE orders SET status = ${status}, status_updated_at = NOW()
    WHERE id = ${id}
  `;
}

// --- Settings ---

export async function getSettings(): Promise<SettingsRow> {
  const { rows } = await sql<SettingsRow>`SELECT * FROM settings WHERE id = 1`;
  return rows[0];
}

export async function updateSettings(patch: Partial<Omit<SettingsRow, 'id'>>): Promise<void> {
  const keys: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    keys.push(k);
    values.push(v);
  }
  if (keys.length === 0) return;
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  await sql.query(`UPDATE settings SET ${setClauses} WHERE id = 1`, values);
}

// --- Designs ---

export async function listDesigns(opts?: { activeOnly?: boolean }): Promise<DesignRow[]> {
  if (opts?.activeOnly) {
    const { rows } = await sql<DesignRow>`
      SELECT * FROM designs WHERE active = TRUE ORDER BY sort_order, name
    `;
    return rows;
  }
  const { rows } = await sql<DesignRow>`
    SELECT * FROM designs ORDER BY sort_order, name
  `;
  return rows;
}

export async function getDesign(id: string): Promise<DesignRow | null> {
  const { rows } = await sql<DesignRow>`SELECT * FROM designs WHERE id = ${id}`;
  return rows[0] || null;
}

export async function createDesign(d: {
  id: string;
  name: string;
  popular: boolean;
  image_url: string | null;
  active: boolean;
  sort_order: number;
}): Promise<void> {
  await sql`
    INSERT INTO designs (id, name, popular, image_url, active, sort_order)
    VALUES (${d.id}, ${d.name}, ${d.popular}, ${d.image_url}, ${d.active}, ${d.sort_order})
  `;
}

export async function updateDesign(id: string, patch: Partial<DesignRow>): Promise<void> {
  const settable = ['name', 'popular', 'image_url', 'active', 'sort_order'];
  const parts: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  for (const key of settable) {
    if (key in patch) {
      parts.push(`${key} = $${i++}`);
      values.push((patch as any)[key]);
    }
  }
  if (parts.length === 0) return;
  values.push(id);
  await sql.query(`UPDATE designs SET ${parts.join(', ')} WHERE id = $${i}`, values);
}

export async function deleteDesign(id: string): Promise<void> {
  await sql`DELETE FROM designs WHERE id = ${id}`;
}

// --- Admin ---

export async function getAdminByEmail(email: string): Promise<AdminRow | null> {
  const { rows } = await sql<AdminRow>`SELECT * FROM admin_users WHERE email = ${email.toLowerCase()}`;
  return rows[0] || null;
}

export async function getAdminById(id: string): Promise<AdminRow | null> {
  const { rows } = await sql<AdminRow>`SELECT * FROM admin_users WHERE id = ${id}`;
  return rows[0] || null;
}

export async function updateAdminPassword(id: string, hash: string): Promise<void> {
  await sql`UPDATE admin_users SET password_hash = ${hash} WHERE id = ${id}`;
}

// --- Password Resets ---

export async function createReset(token: string, adminId: string, expiresAt: Date): Promise<void> {
  await sql`
    INSERT INTO password_resets (token, admin_id, expires_at)
    VALUES (${token}, ${adminId}, ${expiresAt.toISOString()})
  `;
}

export interface ResetRow {
  token: string;
  admin_id: string;
  expires_at: string;
  used: boolean;
}

export async function getReset(token: string): Promise<ResetRow | null> {
  const { rows } = await sql<ResetRow>`
    SELECT token, admin_id, expires_at, used FROM password_resets WHERE token = ${token}
  `;
  return rows[0] || null;
}

export async function markResetUsed(token: string): Promise<void> {
  await sql`UPDATE password_resets SET used = TRUE WHERE token = ${token}`;
}

// --- Contact Messages ---

export async function insertContactMessage(m: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<ContactRow> {
  const id = crypto.randomUUID();
  const { rows } = await sql<ContactRow>`
    INSERT INTO contact_messages (id, name, email, phone, message)
    VALUES (${id}, ${m.name}, ${m.email}, ${m.phone || null}, ${m.message})
    RETURNING *
  `;
  return rows[0];
}

export async function listContactMessages(): Promise<ContactRow[]> {
  const { rows } = await sql<ContactRow>`
    SELECT * FROM contact_messages ORDER BY created_at DESC
  `;
  return rows;
}

export async function markMessageRead(id: string): Promise<void> {
  await sql`UPDATE contact_messages SET read = TRUE WHERE id = ${id}`;
}