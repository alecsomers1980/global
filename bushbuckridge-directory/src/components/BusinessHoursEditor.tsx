'use client';
import React from 'react';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface Props {
  value: Record<string, DayHours> | null | undefined;
  onChange: (v: Record<string, DayHours>) => void;
}

const ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const LABEL: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};
const DEFAULT: DayHours = { open: '08:00', close: '17:00', closed: false };

function normalize(v?: Record<string, DayHours> | null): Record<string, DayHours> {
  const r: Record<string, DayHours> = {};
  ORDER.forEach((d) => {
    r[d] = v?.[d]
      ? { open: v[d].open ?? DEFAULT.open, close: v[d].close ?? DEFAULT.close, closed: v[d].closed ?? DEFAULT.closed }
      : { ...DEFAULT };
  });
  return r;
}

const BusinessHoursEditor: React.FC<Props> = ({ value, onChange }) => {
  const hours = normalize(value);

  const update = (day: string, field: 'open' | 'close' | 'closed', val: string | boolean) => {
    const next = { ...hours, [day]: { ...hours[day], [field]: val } };
    onChange(next);
  };

  return (
    <div>
      {ORDER.map((day) => {
        const d = hours[day];
        const closed = d.closed;
        return (
          <div key={day} className="flex items-center gap-3 py-2">
            <span className="w-12 text-sm font-bold text-primary/70">{LABEL[day]}</span>
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <input
                type="checkbox"
                checked={closed}
                onChange={(e) => update(day, 'closed', e.target.checked)}
              />
              Closed
            </label>
            <input
              type="time"
              value={d.open}
              disabled={closed}
              className={`h-10 rounded-xl border border-primary/10 bg-white/50 px-3 text-sm${closed ? ' opacity-40' : ''}`}
              onChange={(e) => update(day, 'open', e.target.value)}
            />
            <input
              type="time"
              value={d.close}
              disabled={closed}
              className={`h-10 rounded-xl border border-primary/10 bg-white/50 px-3 text-sm${closed ? ' opacity-40' : ''}`}
              onChange={(e) => update(day, 'close', e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default BusinessHoursEditor;