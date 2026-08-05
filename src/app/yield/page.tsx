"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import FarmPicker from "@/components/FarmPicker";
import { apiFetch } from "@/lib/api";
import { useFarms } from "@/lib/useFarm";

const EMPTY = {
  cropType: "",
  moisture: "",
  temperature: "",
  ph: "",
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  rainfall: "",
  humidity: "",
  farmSizeHa: "",
  fertilizerKgPerHa: "",
};

export default function YieldPage() {
  const { farms, selectedFarmId, selectFarm, loading: farmsLoading } = useFarms();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadItems(farmId: string) {
    if (!farmId) return;
    try {
      setItems(await apiFetch(`/api/yield?farmId=${farmId}`));
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    loadItems(selectedFarmId);
    setResult(null);
  }, [selectedFarmId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFarmId) return;
    setError("");
    setSubmitting(true);
    try {
      const payload: any = { farmId: selectedFarmId, cropType: form.cropType };
      for (const key of Object.keys(form) as (keyof typeof form)[]) {
        if (key === "cropType") continue;
        if (form[key] !== "") payload[key] = parseFloat(form[key]);
      }
      const record = await apiFetch("/api/yield", { method: "POST", body: JSON.stringify(payload) });
      setResult(record);
      loadItems(selectedFarmId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Yield Prediction" subtitle="Estimate expected yield from soil, weather, and crop data.">
      <div className="max-w-4xl">
        {!farmsLoading && <FarmPicker farms={farms} selectedFarmId={selectedFarmId} onSelect={selectFarm} />}

        {selectedFarmId && (
          <>
            <form onSubmit={handleSubmit} className="card mb-6 grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="label">Crop type</label>
                <input className="input" required value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })} placeholder="maize, rice, wheat..." />
              </div>
              <div>
                <label className="label">Farm size used (ha)</label>
                <input className="input" type="number" step="0.1" required value={form.farmSizeHa} onChange={(e) => setForm({ ...form, farmSizeHa: e.target.value })} />
              </div>
              <div>
                <label className="label">Fertilizer (kg/ha, optional)</label>
                <input className="input" type="number" step="1" value={form.fertilizerKgPerHa} onChange={(e) => setForm({ ...form, fertilizerKgPerHa: e.target.value })} />
              </div>
              <div>
                <label className="label">Soil moisture (%)</label>
                <input className="input" type="number" step="0.1" required value={form.moisture} onChange={(e) => setForm({ ...form, moisture: e.target.value })} />
              </div>
              <div>
                <label className="label">Soil pH</label>
                <input className="input" type="number" step="0.1" required value={form.ph} onChange={(e) => setForm({ ...form, ph: e.target.value })} />
              </div>
              <div>
                <label className="label">Temperature (°C)</label>
                <input className="input" type="number" step="0.1" required value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
              </div>
              <div>
                <label className="label">Nitrogen (mg/kg)</label>
                <input className="input" type="number" step="1" required value={form.nitrogen} onChange={(e) => setForm({ ...form, nitrogen: e.target.value })} />
              </div>
              <div>
                <label className="label">Phosphorus (mg/kg)</label>
                <input className="input" type="number" step="1" required value={form.phosphorus} onChange={(e) => setForm({ ...form, phosphorus: e.target.value })} />
              </div>
              <div>
                <label className="label">Potassium (mg/kg)</label>
                <input className="input" type="number" step="1" required value={form.potassium} onChange={(e) => setForm({ ...form, potassium: e.target.value })} />
              </div>
              <div>
                <label className="label">Rainfall (mm)</label>
                <input className="input" type="number" step="0.1" required value={form.rainfall} onChange={(e) => setForm({ ...form, rainfall: e.target.value })} />
              </div>
              <div>
                <label className="label">Humidity (%)</label>
                <input className="input" type="number" step="0.1" required value={form.humidity} onChange={(e) => setForm({ ...form, humidity: e.target.value })} />
              </div>
              <div className="sm:col-span-3">
                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? "Predicting..." : "Predict yield"}
                </button>
              </div>
            </form>

            {result && (
              <div className="card mb-8 border-2 border-primary-300 bg-primary-50">
                <p className="font-bold text-lg text-primary-900">
                  {result.predictedYield} tons/ha for {result.cropType}
                </p>
                <p className="text-sm text-gray-700 mt-1">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                <p className="text-sm text-gray-700">Soil health: {result.soilHealth}</p>
              </div>
            )}

            <h2 className="font-semibold text-primary-900 mb-2">History</h2>
            {items.length === 0 ? (
              <p className="text-gray-500">No predictions yet.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="card flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span className="font-medium text-primary-800">{new Date(item.createdAt).toLocaleString()}</span>
                    <span>{item.cropType}</span>
                    <span>{item.predictedYield} t/ha</span>
                    <span>{(item.confidence * 100).toFixed(0)}% confidence</span>
                    <span>{item.soilHealth}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
