"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageBanner from "@/components/PageBanner";
import { apiFetch } from "@/lib/api";
import { useFarms } from "@/lib/useFarm";

export default function FarmsPage() {
  const router = useRouter();
  const { farms, refresh, loading } = useFarms();
  const [form, setForm] = useState({ name: "", location: "", sizeHa: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [seedingId, setSeedingId] = useState<string | null>(null);
  const [seededId, setSeededId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/api/farms", {
        method: "POST",
        body: JSON.stringify({ ...form, sizeHa: parseFloat(form.sizeHa) }),
      });
      setForm({ name: "", location: "", sizeHa: "" });
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this farm and all its data?")) return;
    await apiFetch(`/api/farms/${id}`, { method: "DELETE" });
    refresh();
  }

  async function handleSeed(id: string) {
    if (!confirm("Generate 30 days of realistic demo readings (soil, weather, irrigation, yield, pests) for this farm?")) return;
    setSeedingId(id);
    setSeededId(null);
    try {
      await apiFetch(`/api/farms/${id}/seed`, { method: "POST" });
      setSeededId(id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSeedingId(null);
    }
  }

  return (
    <AppShell title="My Farms" subtitle="Register and manage your farms.">
      <div className="max-w-4xl">
        <PageBanner
          title="My Farms"
          caption="Every farm you register — its crops, size, and location — lives here."
          image="/images/farms-harvest.jpg"
          alt="Farmer carrying a harvest basket"
        />
        <form onSubmit={handleSubmit} className="card mb-8 grid sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="label">Farm name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label">Size (ha)</label>
            <input className="input" type="number" step="0.1" required value={form.sizeHa} onChange={(e) => setForm({ ...form, sizeHa: e.target.value })} />
          </div>
          <div className="sm:col-span-4">
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <button className="btn-primary" disabled={submitting}>
              {submitting ? "Adding..." : "Add farm"}
            </button>
          </div>
        </form>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : farms.length === 0 ? (
          <p className="text-gray-500">No farms yet — add your first one above.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {farms.map((f) => (
              <div key={f.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-primary-900">{f.name}</h3>
                    <p className="text-sm text-gray-500">{f.location}</p>
                    <p className="text-sm text-gray-500">{f.sizeHa} ha</p>
                  </div>
                  <button onClick={() => handleDelete(f.id)} className="text-red-600 text-sm hover:underline">
                    Delete
                  </button>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleSeed(f.id)}
                    disabled={seedingId === f.id}
                    className="btn-secondary text-sm w-full flex items-center justify-center gap-2"
                  >
                    <History size={15} />
                    {seedingId === f.id ? "Generating 30 days of data..." : "Load 30 days of demo data"}
                  </button>
                  {seededId === f.id && (
                    <p className="text-xs text-primary-700 mt-2 text-center">
                      Done —{" "}
                      <button onClick={() => router.push("/dashboard")} className="underline font-medium">
                        view it on the dashboard
                      </button>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
