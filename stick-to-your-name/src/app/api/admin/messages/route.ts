export const runtime = 'nodejs';

import { isAdmin } from '@/lib/admin';
import { listContactMessages } from '@/lib/db';

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = await listContactMessages();
    return Response.json({ messages });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}