"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { useFarms } from "@/lib/useFarm";

export default function FarmsPage() {
  const { farms, refresh, loading } = useFarms();
  const [form, setForm] = useState({ name: "", location: "", sizeHa: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary-900 mb-1">Farms</h1>
        <p className="text-gray-500 mb-6">Register and manage your farms.</p>

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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-primary-900">{f.name}</h3>
                    <p className="text-sm text-gray-500">{f.location}</p>
                    <p className="text-sm text-gray-500">{f.sizeHa} ha</p>
                  </div>
                  <button onClick={() => handleDelete(f.id)} className="text-red-600 text-sm hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
