export const HP_LATEX_FALLBACK: { name: string; price: number }[] = [
  { name: 'Oracal 1370', price: 127.67 },
  { name: 'Oracal 1620', price: 145.60 },
  { name: 'Drytack 1370', price: 184.95 },
  { name: 'Drytack 1520', price: 20.20 },
  { name: 'Contravision 1370', price: 137.00 },
  { name: 'Contravision 1520', price: 329.84 },
  { name: 'Air Release 1370', price: 675.95 },
  { name: 'Air Release 1520', price: 750.00 },
  { name: 'PVC 1600', price: 112.00 },
  { name: 'Drytac Retac', price: 184.95 },
  { name: 'Poly Lightbox 1370', price: 184.95 },
  { name: 'Other', price: 0 },
];

// Vinyl Cut materials: cost is per running meter, differs by roll width (600 / 1200).
export const VINYL_CUT_FALLBACK: { name: string; price600: number; price1200: number }[] = [
  { name: 'Mask/Pos', price600: 45, price1200: 90 },
  { name: 'Poly', price600: 19.92, price1200: 159.84 },
  { name: 'Cast', price600: 228, price1200: 456 },
  { name: 'Engineer', price600: 210, price1200: 420 },
  { name: 'Avery Crystal', price600: 107.6, price1200: 215.16 },
  { name: 'Other', price600: 0, price1200: 0 },
];

export function getHpLatexMaterials(settings: any): { name: string; price: number }[] {
  if (settings?.hp_latex_materials && Array.isArray(settings.hp_latex_materials) && settings.hp_latex_materials.length > 0) {
    return settings.hp_latex_materials;
  }
  return HP_LATEX_FALLBACK;
}

export function getVinylCutMaterials(settings: any): { name: string; price600: number; price1200: number }[] {
  if (settings?.vinyl_cut_materials && Array.isArray(settings.vinyl_cut_materials) && settings.vinyl_cut_materials.length > 0) {
    return settings.vinyl_cut_materials;
  }
  return VINYL_CUT_FALLBACK;
}

export function getArtworkRate(jobcard: any, settings: any): number {
  const stored = parseFloat(jobcard?.artwork_details_json?.rate);
  if (Number.isFinite(stored) && stored > 0) { return stored; }
  return Number(settings?.artwork_hourly_rate) || 250;
}

export function computeArtworkCharge(jobcard: any, settings: any): number {
  const hours = parseFloat(jobcard?.artwork_details_json?.hours) || 0;
  return hours * getArtworkRate(jobcard, settings);
}

export function computeHpLatexRate(jobcard: any, settings: any): number {
  const list = getHpLatexMaterials(settings);
  const selected: string[] = Array.isArray(jobcard?.materials_json) ? jobcard.materials_json : [];
  return list.filter(m => selected.includes(m.name)).reduce((a, m) => a + (Number(m.price) || 0), 0);
}

export function getSelectedHpLatexNames(jobcard: any, settings: any): string[] {
  const list = getHpLatexMaterials(settings);
  const selected: string[] = Array.isArray(jobcard?.materials_json) ? jobcard.materials_json : [];
  return list.filter(m => selected.includes(m.name)).map(m => m.name);
}

// HP Latex now supports multiple product rows: [{ material, meters, type_other?, custom_price? }].
export function getHpLatexRows(jobcard: any): any[] {
  // Use new multi-row format if available and non-empty
  if (jobcard?.digital_details_json?.rows && Array.isArray(jobcard.digital_details_json.rows) && jobcard.digital_details_json.rows.length > 0) {
    return jobcard.digital_details_json.rows;
  }

  // Back-compat: synthesize from old running_meters / materials_json
  const runningMeters = jobcard?.digital_details_json?.running_meters;
  if (!runningMeters && runningMeters !== 0) return []; // falsy and not zero -> empty

  // Find first selected material that exists in the hard-coded fallback list
  const selected: string[] = Array.isArray(jobcard?.materials_json) ? jobcard.materials_json : [];
  const found = selected.find((name: string) => HP_LATEX_FALLBACK.some(m => m.name === name)) || '';

  return [
    {
      material: found,
      meters: runningMeters,
    },
  ];
}

export function getHpLatexRowRate(row: any, settings: any): number {
  if (!row) return 0;
  const materials = getHpLatexMaterials(settings);
  if (row.material === 'Other') return parseFloat(row.custom_price) || 0;
  const found = materials.find(m => m.name === row.material);
  return Number(found?.price) || 0;
}

export function computeHpLatexCharge(jobcard: any, settings: any): number {
  const rows = getHpLatexRows(jobcard);
  let total = 0;
  for (const row of rows) {
    const meters = parseFloat(row.meters) || 0;
    const rate = getHpLatexRowRate(row, settings);
    total += meters * rate;
  }
  return total;
}

// Per-meter rate for a single vinyl-cut row, based on its material + width.
export function getVinylCutRowRate(row: any, settings: any): number {
  if (!row) return 0;
  const mats = getVinylCutMaterials(settings);
  const m = mats.find(x => x.name === row.type);
  if (!m) return 0;
  if (row.type === 'Other') return parseFloat(row.custom_price) || 0;
  return String(row.width) === '1200' ? (Number(m.price1200) || 0) : (Number(m.price600) || 0);
}

// Total vinyl-cut charge: Σ(running meters × per-meter rate) + R200 if print-cut.
export function computeVinylCutCharge(jobcard: any, settings: any): number {
  if (!jobcard?.prod_vinyl_cut) return 0;
  const rows = Array.isArray(jobcard.vinyl_cut_details_json) ? jobcard.vinyl_cut_details_json : [];
  let sum = 0;
  for (const row of rows) {
    const meters = parseFloat(row?.qty) || 0;
    sum += meters * getVinylCutRowRate(row, settings);
  }
  if (jobcard.vinyl_cut_printcut) sum += 200;
  return sum;
}

export function syncAutoLines(jobcard: any, settings: any): { items_json: any[]; sub_total: string; vat_total: string; total: string; } {
  const items = (Array.isArray(jobcard?.items_json) ? jobcard.items_json : []).filter(
    (it: any) => it && it._auto !== 'artwork' && it._auto !== 'hp_latex' && it._auto !== 'vinyl_cut'
  );

  // Artwork line ('ARTWORK / LAYOUT' is a real dropdown option, so it displays fine)
  if (jobcard?.prod_artwork) {
    const hours = parseFloat(jobcard?.artwork_details_json?.hours) || 0;
    if (hours > 0) {
      const rate = getArtworkRate(jobcard, settings);
      const charge = hours * rate;
      items.push({
        _auto: 'artwork',
        item: 'ARTWORK / LAYOUT',
        quantity: String(jobcard.artwork_details_json?.hours ?? ''),
        size: '',
        description: 'Design time',
        price: String(rate),
        total: charge.toFixed(2),
      });
    }
  }

  // HP Latex — one line per product row.
  if (jobcard?.prod_digital) {
    const hpRows = getHpLatexRows(jobcard);
    for (const row of hpRows) {
      const meters = parseFloat(row.meters) || 0;
      const rate = getHpLatexRowRate(row, settings);
      if (meters > 0 && rate > 0) {
        const matName = row.material === 'Other' ? (row.type_other || 'Other') : row.material;
        items.push({
          _auto: 'hp_latex',
          item: `HP Latex — ${matName}`,
          itemCustom: 'true',
          quantity: String(row.meters),
          size: '',
          description: 'HP Latex print',
          price: String(rate),
          total: (meters * rate).toFixed(2),
        });
      }
    }
  }

  // HP Vinyl Cut — one line per row (running meters × per-meter rate), material shown.
  if (jobcard?.prod_vinyl_cut) {
    const rows = Array.isArray(jobcard.vinyl_cut_details_json) ? jobcard.vinyl_cut_details_json : [];
    rows.forEach((row: any) => {
      const meters = parseFloat(row?.qty) || 0;
      const rate = getVinylCutRowRate(row, settings);
      if (meters > 0 && rate > 0) {
        const matName = row.type === 'Other' ? (row.type_other || 'Other') : row.type;
        const width = String(row.width || '600');
        items.push({
          _auto: 'vinyl_cut',
          item: `Vinyl Cut — ${matName} (${width}mm)`,
          itemCustom: 'true',
          quantity: String(row.qty ?? ''),
          size: '',
          description: 'HP vinyl cut',
          price: String(rate),
          total: (meters * rate).toFixed(2),
        });
      }
    });
    if (jobcard.vinyl_cut_printcut) {
      items.push({
        _auto: 'vinyl_cut',
        item: 'Vinyl Cut — Print & Cut setup',
        itemCustom: 'true',
        quantity: '1',
        size: '',
        description: '',
        price: '200',
        total: '200.00',
      });
    }
  }

  const subtotal = items.reduce((a: number, it: any) => a + (parseFloat(it.total) || 0), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  return { items_json: items, sub_total: subtotal.toFixed(2), vat_total: vat.toFixed(2), total: total.toFixed(2) };
}
