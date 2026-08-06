import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';
import { ALL_CATEGORIES, type ProductCategory, type SignatureType } from '@/lib/supabase/types';

export const runtime = 'nodejs';

interface ProductInput {
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  style_no: string | null;
  is_signature: boolean;
  signature_type: SignatureType | null;
  base_price: number;
  featured: boolean;
  active: boolean;
}

function validate(body: Partial<ProductInput>): string | null {
  if (!body.slug?.trim()) return 'Slug is required.';
  if (!body.name?.trim()) return 'Name is required.';
  if (!body.category || !ALL_CATEGORIES.includes(body.category)) return 'A valid category is required.';
  if (typeof body.base_price !== 'number' || !Number.isInteger(body.base_price) || body.base_price < 0) {
    return 'Base price must be a non-negative integer number of cents.';
  }
  if (body.is_signature && !body.signature_type) return 'Signature products need a signature_type.';
  if (!body.is_signature && body.signature_type) return 'signature_type must be empty for non-signature products.';
  return null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*, variants:product_variants(*), images:product_images(*)')
    .eq('id', id)
    .single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as Partial<ProductInput>;
  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({
      slug: body.slug!.trim(),
      name: body.name!.trim(),
      description: body.description?.trim() ?? '',
      category: body.category!,
      style_no: body.style_no?.trim() || null,
      is_signature: body.is_signature ?? false,
      signature_type: body.signature_type ?? null,
      base_price: body.base_price!,
      featured: body.featured ?? false,
      active: body.active ?? true,
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
