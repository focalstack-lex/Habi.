import React from 'react';
import type { Measurements } from '../../types/fashion';
import { ALL_MEASUREMENT_FIELDS, hasMeasurements } from '../../utils/sizing';

interface MeasurementsTableProps {
  measurements?: Measurements;
}

/** Seller-entered garment measurements, laid flat in centimetres. Only filled fields are shown. */
export const MeasurementsTable: React.FC<MeasurementsTableProps> = ({ measurements }) => {
  if (!measurements || !hasMeasurements(measurements)) {
    return <p className="text-xs text-zinc-500">Measurements not provided. Ask the seller before reserving.</p>;
  }

  const rows = ALL_MEASUREMENT_FIELDS.flatMap((field) => {
    const value = measurements[field.key];
    return typeof value === 'number' && value > 0 ? [{ ...field, value }] : [];
  });

  return (
    <div>
      <h3 className="font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-zinc-500 mb-2">
        Measurements
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {rows.map((row) => (
          <div
            key={row.key}
            title={row.hint}
            className="flex items-baseline justify-between gap-2 py-1.5 border-b border-zinc-100"
          >
            <dt className="text-xs text-zinc-500">{row.label}</dt>
            <dd className="text-xs font-semibold text-zinc-900 tabular-nums">{row.value} cm</dd>
          </div>
        ))}
      </dl>
      <p className="text-[11px] text-zinc-500 mt-2">Measured laid flat. Compare with a piece you own.</p>
    </div>
  );
};
