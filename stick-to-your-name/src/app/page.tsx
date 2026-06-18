import { ensureSchema, listDesigns, getSettings } from '@/lib/db';
import OrderForm from './OrderForm';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await ensureSchema();
  const [designs, settings] = await Promise.all([
    listDesigns({ activeOnly: true }),
    getSettings(),
  ]);

  return <OrderForm designs={designs} settings={settings} />;
}
