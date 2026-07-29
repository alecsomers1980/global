import { requireAdmin } from '@/lib/auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { logAudit } from '@/lib/audit';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateTempPassword(): string {
  const hasDigit = /\d/;
  const hasLetter = /[a-zA-Z]/;
  let p = '';
  do {
    p = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  } while (!hasDigit.test(p) || !hasLetter.test(p) || p.length < 8);
  return p;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));

    const supabase = createAdminSupabase();

    if (body.action === 'reset_password') {
      // Fetch existing user to get email and metadata
      const { data: { user }, error: fetchError } = await supabase.auth.admin.getUserById(id);
      if (fetchError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const tempPassword = generateTempPassword();

      const { error: updateError } = await supabase.auth.admin.updateUserById(id, {
        password: tempPassword,
        app_metadata: {
          ...user.app_metadata,
          must_change_password: true,
        },
      });

      if (updateError) {
        return NextResponse.json({ message: updateError.message }, { status: 400 });
      }

      await logAudit({
        actorEmail: admin.staff.email,
        actorCode: admin.staff.code,
        action: 'user.update',
        entityType: 'user',
        entityId: user.email,
        summary: `Reset password for ${user.email}`,
      });

      return NextResponse.json({ tempPassword });
    }

    // Update details: full_name, short_code, role
    const { full_name, short_code, role } = body;

    const { data: { user }, error: fetchError } = await supabase.auth.admin.getUserById(id);
    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUserMeta = {
      ...user.user_metadata,
      ...(full_name !== undefined ? { full_name } : {}),
    };

    const updatedAppMeta = {
      ...user.app_metadata,
      ...(role !== undefined ? { role } : {}),
      ...(short_code !== undefined ? { short_code } : {}),
    };

    const { error: updateError } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: updatedUserMeta,
      app_metadata: updatedAppMeta,
    });

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    await logAudit({
      actorEmail: admin.staff.email,
      actorCode: admin.staff.code,
      action: 'user.update',
      entityType: 'user',
      entityId: user.email,
      summary: `Updated ${user.email}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;

    if (id === admin.staff.user.id) {
      return NextResponse.json({ message: 'You cannot delete your own account' }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    const { data: { user }, error: fetchError } = await supabase.auth.admin.getUserById(id);
    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 400 });
    }

    await logAudit({
      actorEmail: admin.staff.email,
      actorCode: admin.staff.code,
      action: 'user.delete',
      entityType: 'user',
      entityId: user.email,
      summary: `Deleted ${user.email}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
