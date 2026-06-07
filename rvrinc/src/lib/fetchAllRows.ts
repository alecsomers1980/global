// Supabase enforces a server-side max-rows cap (default 1000) that a client .limit() cannot exceed.
// Page through the result set with .range() so large branches (e.g. Marble Hall) are not truncated.
export async function fetchAllRows(factory: () => any): Promise<any[]> {
    const results: any[] = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
        const query = factory();
        const to = from + pageSize - 1;
        const { data, error } = await query.range(from, to);
        if (error) break;
        if (!data || data.length === 0) break;
        results.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
    }

    return results;
}
