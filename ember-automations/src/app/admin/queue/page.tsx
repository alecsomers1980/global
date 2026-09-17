import { serviceClient } from "@/lib/supabaseServer";
import { listPending } from "@/lib/spine/outbox";
import { getClient } from "@/lib/spine/record";
import { creditBalance } from "@/lib/spine/requests";
import QueueItem from "./QueueItem";

export const dynamic = "force-dynamic";

export default async function AdminQueuePage() {
  const db = serviceClient();
  const items = await listPending(db);

  const queueItems = await Promise.all(
    items.map(async (item) => {
      let balanceAfter: number | null = null;

      if (item.kind === "estimate") {
        const client = await getClient(db, item.client_id);
        if (client) {
          const balance = await creditBalance(db, client);
          balanceAfter = balance - Number(item.draft.credits);
        }
      }

      return { item, balanceAfter };
    })
  );

  return (
    <div className="glass p-6">
      <h1 className="text-xl font-bold mb-4">Approval queue</h1>

      {queueItems.length === 0 ? (
        <p className="text-[#6b6b8a] text-sm">Nothing waiting for approval.</p>
      ) : (
        <div className="space-y-4">
          {queueItems.map(({ item, balanceAfter }) => (
            <QueueItem key={item.id} item={item} balanceAfter={balanceAfter} />
          ))}
        </div>
      )}
    </div>
  );
}
