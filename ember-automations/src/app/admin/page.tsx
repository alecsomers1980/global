import { serviceClient } from "@/lib/supabaseServer";
import type { Questionnaire } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const db = serviceClient();
  const { data } = await db.from("questionnaires").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Questionnaire[];

  return (
    <div className="glass p-6">
      <h1 className="text-xl font-bold mb-4">Submissions</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6b6b8a]">
            <th className="py-2">Client</th><th>Project</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-[#2a2a3d]">
              <td className="py-2">{r.client_name}</td>
              <td>{r.project_name}</td>
              <td><span className="text-xs uppercase tracking-wide text-ember-500">{r.status}</span></td>
              <td className="text-right"><a className="text-ember-500" href={`/admin/${r.id}`}>Open →</a></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="py-4 text-[#6b6b8a]">No questionnaires yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
