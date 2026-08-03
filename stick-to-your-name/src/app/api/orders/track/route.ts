import { getOrderById } from '@/lib/db';

export const runtime = 'nodejs';

const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

export async function POST(req: Request) {
  // Rate limiting per IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter(t => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    return Response.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Parse JSON body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON in request body.' },
      { status: 400 }
    );
  }

  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!orderId || !email) {
    return Response.json(
      { error: 'Order number and email are required.' },
      { status: 400 }
    );
  }

  const order = await getOrderById(orderId);

  if (!order || order.customer_email.toLowerCase() !== email) {
    return Response.json(
      { error: "We couldn't find that order — check the number and email." },
      { status: 404 }
    );
  }

  // Return only the permitted fields
  return Response.json({
    status: order.status,
    design_name: order.design_name,
    child_name: order.child_name,
    created_at: order.created_at,
    paid_at: order.paid_at,
    status_updated_at: order.status_updated_at,
  });
}