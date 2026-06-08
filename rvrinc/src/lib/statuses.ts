// This module reads the admin-managed status list from the database, using the hardcoded list as a fallback.
import { createClient } from '@/lib/supabase/server';
import { RAF_STATUSES, type StatusConfig, type StatusPhase } from '@/lib/statusConfig';
import { cache } from 'react';

export const getCaseStatuses = cache(async (): Promise<StatusConfig[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('case_statuses')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return RAF_STATUSES;
  }

  return data.map((r) => ({
    slug: r.slug,
    label: r.label,
    phase: r.phase as StatusPhase,
    sortOrder: r.sort_order,
    defaultNote: r.default_note ?? undefined,
    requiresNote: r.requires_note,
    requiresDate: r.requires_date,
    requiresClientAction: r.requires_client_action,
    clientMessage: r.client_message,
  }));
});
