"use client";

import Link from "next/link";

export default function FarmPicker({
  farms,
  selectedFarmId,
  onSelect,
}: {
  farms: any[];
  selectedFarmId: string;
  onSelect: (id: string) => void;
}) {
  if (farms.length === 0) {
    return (
      <div className="card mb-6 text-sm text-gray-600">
        You don't have any farms yet.{" "}
        <Link href="/farms" className="text-primary-700 font-medium underline">
          Add a farm
        </Link>{" "}
        to start recording data.
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center gap-3">
      <label className="text-sm font-medium text-gray-600">Farm:</label>
      <select
        className="input max-w-xs"
        value={selectedFarmId}
        onChange={(e) => onSelect(e.target.value)}
      >
        {farms.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name} — {f.location}
          </option>
        ))}
      </select>
    </div>
  );
}
