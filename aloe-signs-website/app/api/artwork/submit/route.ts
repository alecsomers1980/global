import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { validateSubmission } from '@/lib/artwork/validation';
import { verifyRenderToken, honeypotTripped, hashIp } from '@/lib/artwork/antibot';
import { createSubmission, attachFiles, countRecentByIpHash } from '@/lib/artwork/repository';

export const runtime = 'nodejs';
const RATE_LIMIT_PER_HOUR = 5;

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (!forwarded) return 'unknown';
  return forwarded.split(',')[0].trim();
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  if (honeypotTripped(body)) {
    return NextResponse.json({ id: null, reference: 'AW-OK', uploads: [] });
  }

  const token = (body as { token?: unknown }).token;
  const tokenResult = verifyRenderToken(token);
  if (!tokenResult.ok) {
    const message =
      tokenResult.reason === 'too-fast'
        ? 'That was submitted a little too quickly — please try again.'
        : 'This form expired. Please refresh the page and try again.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const validation = validateSubmission(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(req));
  const recent = await countRecentByIpHash(ipHash, 60);
  if (recent >= RATE_LIMIT_PER_HOUR) {
    return NextResponse.json(
      { error: 'Too many submissions from this connection. Please try again later, or call 011 693 2600.' },
      { status: 429 },
    );
  }

  const { companyName, contactPerson, contactNumber, email, description, files } = validation.value;

  const submission = await createSubmission({
    companyName,
    contactPerson,
    contactNumber,
    email,
    description,
    ipHash,
  });

  const supabase = createAdminSupabase();
  const uploads: { path: string; token: string }[] = [];
  const records: {
    storagePath: string;
    originalName: string;
    sizeBytes: number;
    mimeType: string;
  }[] = [];

  for (const file of files) {
    const path = `${submission.id}/${Date.now()}_${safeName(file.name)}`;
    const { data, error } = await supabase.storage
      .from('artwork-uploads')
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json(
        { error: 'Could not prepare the upload. Please try again.' },
        { status: 500 },
      );
    }

    uploads.push({ path, token: data.token });
    records.push({
      storagePath: path,
      originalName: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
    });
  }

  await attachFiles(submission.id, records);

  return NextResponse.json({
    id: submission.id,
    reference: submission.reference,
    uploads,
  });
}

