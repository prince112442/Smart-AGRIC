"use client";

import { useEffect, useState } from "react";
import { Droplets, CheckCircle2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageBanner from "@/components/PageBanner";
import FarmPicker from "@/components/FarmPicker";
import { apiFetch } from "@/lib/api";
import { useFarms } from "@/lib/useFarm";

export default function IrrigationPage() {
  const { farms, selectedFarmId, selectFarm, loading: farmsLoading } = useFarms();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ soilMoisture: "", temperature: "", forecastRainfallMm: "0" });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadItems(farmId: string) {
    if (!farmId) return;
    try {
      setItems(await apiFetch(`/api/irrigation?farmId=${farmId}`));
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
      const record = await apiFetch("/api/irrigation", {
        method: "POST",
        body: JSON.stringify({
          farmId: selectedFarmId,
          soilMoisture: parseFloat(form.soilMoisture),
          temperature: parseFloat(form.temperature),
          forecastRainfallMm: parseFloat(form.forecastRainfallMm || "0"),
        }),
      });
      setResult(record);
      loadItems(selectedFarmId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Irrigation" subtitle="Get an AI recommendation on whether to irrigate today.">
      <div className="max-w-4xl">
        <PageBanner
          title="Irrigation"
          caption="AI recommendations for when and how much to water."
          image="/images/irrigation-watering.jpg"
          alt="Farmer watering crops by hand"
        />
        {!farmsLoading && <FarmPicker farms={farms} selectedFarmId={selectedFarmId} onSelect={selectFarm} />}

        {selectedFarmId && (
          <>
            <form onSubmit={handleSubmit} className="card mb-6 grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="label">Soil moisture (%)</label>
                <input className="input" type="number" step="0.1" required value={form.soilMoisture} onChange={(e) => setForm({ ...form, soilMoisture: e.target.value })} />
              </div>
              <div>
                <label className="label">Temperature (°C)</label>
                <input className="input" type="number" step="0.1" required value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
              </div>
              <div>
                <label className="label">Forecast rainfall (mm)</label>
                <input className="input" type="number" step="0.1" value={form.forecastRainfallMm} onChange={(e) => setForm({ ...form, forecastRainfallMm: e.target.value })} />
              </div>
              <div className="sm:col-span-3">
                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? "Checking..." : "Get recommendation"}
                </button>
              </div>
            </form>

            {result && (
              <div className={`card mb-8 border-2 ${result.recommendation === "Irrigate" ? "border-amber-300 bg-amber-50" : "border-primary-300 bg-primary-50"}`}>
                <p className="font-bold text-lg flex items-center gap-2">
                  {result.recommendation === "Irrigate" ? (
                    <>
                      <Droplets size={20} className="text-amber-600" /> Irrigate today
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} className="text-primary-700" /> No need to irrigate
                    </>
                  )}
                </p>
                {result.recommendation === "Irrigate" && (
                  <p className="text-sm text-gray-700 mt-1">Recommended: ~{result.amountLPerHa} L/ha</p>
                )}
                <p className="text-sm text-gray-600 mt-1">{result.reason}</p>
              </div>
            )}

            <h2 className="font-semibold text-primary-900 mb-2">History</h2>
            {items.length === 0 ? (
              <p className="text-gray-500">No irrigation records yet.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="card flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span className="font-medium text-primary-800">{new Date(item.createdAt).toLocaleString()}</span>
                    <span>{item.recommendation}</span>
                    {item.amountLPerHa > 0 && <span>{item.amountLPerHa} L/ha</span>}
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
