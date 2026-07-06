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

export function getHpLatexMaterials(settings: any): { name: string; price: number }[] {
  if (settings?.hp_latex_materials && Array.isArray(settings.hp_latex_materials) && settings.hp_latex_materials.length > 0) {
    return settings.hp_latex_materials;
  }
  return HP_LATEX_FALLBACK;
}

export function getArtworkRate(jobcard: any, settings: any): number {
  const stored = parseFloat(jobcard?.artwork_details_json?.rate);
  if (Number.isFinite(stored) && stored > 0) {
    return stored;
  }
  return Number(settings?.artwork_hourly_rate) || 250;
}

export function computeArtworkCharge(jobcard: any, settings: any): number {
  const hours = parseFloat(jobcard?.artwork_details_json?.hours) || 0;
  return hours * getArtworkRate(jobcard, settings);
}

export function computeHpLatexRate(jobcard: any, settings: any): number {
  const list = getHpLatexMaterials(settings);
  const selected: string[] = Array.isArray(jobcard?.materials_json) ? jobcard.materials_json : [];
  return list
    .filter(m => selected.includes(m.name))
    .reduce((a, m) => a + (Number(m.price) || 0), 0);
}

export function getSelectedHpLatexNames(jobcard: any, settings: any): string[] {
  const list = getHpLatexMaterials(settings);
  const selected: string[] = Array.isArray(jobcard?.materials_json) ? jobcard.materials_json : [];
  return list.filter(m => selected.includes(m.name)).map(m => m.name);
}

export function computeHpLatexCharge(jobcard: any, settings: any): number {
  const meters = parseFloat(jobcard?.digital_details_json?.running_meters) || 0;
  return meters * computeHpLatexRate(jobcard, settings);
}

export function syncAutoLines(jobcard: any, settings: any): {
  items_json: any[];
  sub_total: string;
  vat_total: string;
  total: string;
} {
  let items = (Array.isArray(jobcard?.items_json) ? jobcard.items_json : []).filter(
    (it: any) => it && it._auto !== 'artwork' && it._auto !== 'hp_latex'
  );

  // Artwork line
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

  // HP Latex line
  if (jobcard?.prod_digital) {
    const meters = parseFloat(jobcard?.digital_details_json?.running_meters) || 0;
    if (meters > 0) {
      const rate = computeHpLatexRate(jobcard, settings);
      if (rate > 0) {
        const charge = meters * rate;
        items.push({
          _auto: 'hp_latex',
          item: 'HP LATEX PRINT',
          quantity: String(jobcard.digital_details_json?.running_meters ?? ''),
          size: '',
          description: getSelectedHpLatexNames(jobcard, settings).join(', '),
          price: String(rate),
          total: charge.toFixed(2),
        });
      }
    }
  }

  const subtotal = items.reduce((a: number, it: any) => a + (parseFloat(it.total) || 0), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  return {
    items_json: items,
    sub_total: subtotal.toFixed(2),
    vat_total: vat.toFixed(2),
    total: total.toFixed(2),
  };
}