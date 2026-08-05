"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import FarmPicker from "./FarmPicker";
import { apiFetch } from "@/lib/api";
import { useFarms } from "@/lib/useFarm";

export type Field = {
  key: string;
  label: string;
  type: "number" | "text" | "select" | "date";
  step?: string;
  options?: string[];
  defaultValue?: string;
  required?: boolean;
};

export default function ResourcePage({
  title,
  subtitle,
  endpoint,
  fields,
  renderItem,
}: {
  title: string;
  subtitle: string;
  endpoint: string; // e.g. "/api/soil"
  fields: Field[];
  renderItem: (item: any) => React.ReactNode;
}) {
  const { farms, selectedFarmId, selectFarm, loading: farmsLoading } = useFarms();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? ""]))
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  async function loadItems(farmId: string) {
    if (!farmId) return;
    setItemsLoading(true);
    try {
      const data = await apiFetch(`${endpoint}?farmId=${farmId}`);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }

  useEffect(() => {
    loadItems(selectedFarmId);
  }, [selectedFarmId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFarmId) return;
    setError("");
    setSubmitting(true);
    try {
      const payload: Record<string, any> = { farmId: selectedFarmId };
      for (const f of fields) {
        payload[f.key] = f.type === "number" ? parseFloat(form[f.key]) : form[f.key];
      }
      await apiFetch(endpoint, { method: "POST", body: JSON.stringify(payload) });
      setForm(Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? ""])));
      loadItems(selectedFarmId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary-900 mb-1">{title}</h1>
        <p className="text-gray-500 mb-6">{subtitle}</p>

        {!farmsLoading && <FarmPicker farms={farms} selectedFarmId={selectedFarmId} onSelect={selectFarm} />}

        {selectedFarmId && (
          <>
            <form onSubmit={handleSubmit} className="card mb-8 grid sm:grid-cols-3 gap-3 items-end">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  {f.type === "select" ? (
                    <select
                      className="input"
                      required={f.required !== false}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="input"
                      type={f.type}
                      step={f.step}
                      required={f.required !== false}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <div className="sm:col-span-3">
                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save reading"}
                </button>
              </div>
            </form>

            {itemsLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-gray-500">No records yet.</p>
            ) : (
              <div className="space-y-2">{items.map((item) => renderItem(item))}</div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
