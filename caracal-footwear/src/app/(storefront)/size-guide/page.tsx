import { getSiteSettings } from '@/lib/queries/products';

export default async function SizeGuidePage() {
  const settings = await getSiteSettings();

  const sizes = [
    { uk: '4', foot: '22.9 cm' },
    { uk: '5', foot: '23.6 cm' },
    { uk: '6', foot: '24.3 cm' },
    { uk: '7', foot: '25.1 cm' },
    { uk: '8', foot: '25.8 cm' },
    { uk: '9', foot: '26.7 cm' },
    { uk: '10', foot: '27.3 cm' },
    { uk: '11', foot: '28.0 cm' },
    { uk: '12', foot: '28.6 cm' },
    { uk: '13', foot: '29.4 cm' },
    { uk: '14', foot: '30.2 cm' },
    { uk: '15', foot: '31.0 cm' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      <h1 className="display text-4xl md:text-5xl text-text">Size Guide</h1>
      <p className="mt-6 text-muted">
        Caracal vellies run true to standard UK sizing, from 4 (ladies) to 15 (mens).
      </p>

      <h2 className="text-xl text-text mt-10 mb-3">Size Chart</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-text/10">
          <thead>
            <tr className="bg-surface text-text">
              <th className="px-4 py-2 text-left">UK Size</th>
              <th className="px-4 py-2 text-left">Foot Length (approx.)</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((row) => (
              <tr key={row.uk} className="border-t border-text/10">
                <td className="px-4 py-2 text-muted">{row.uk}</td>
                <td className="px-4 py-2 text-muted">{row.foot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted mt-2">
        Approximate — foot shape varies, so if you’re between two sizes, WhatsApp us your foot length and we’ll help you choose.
      </p>

      <h2 className="text-xl text-text mt-10 mb-3">How to Measure Your Foot</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted">
        <li>Place a sheet of paper on a hard floor against a wall.</li>
        <li>Stand on it with your heel against the wall.</li>
        <li>Mark the tip of your longest toe.</li>
        <li>Measure wall-to-mark in centimetres.</li>
        <li>Measure both feet and use the larger measurement.</li>
        <li>Match your measurement to the table above.</li>
      </ol>

      <p className="mt-10 text-muted">
        Still unsure?{' '}
        <a
          href={`https://wa.me/${settings.whatsapp_number}`}
          className="text-text underline hover:no-underline"
        >
          WhatsApp us
        </a>{' '}
        with your measurement.
      </p>
    </div>
  );
}