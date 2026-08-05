"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { useFarms } from "@/lib/useFarm";
import FarmPicker from "@/components/FarmPicker";

export default function DashboardPage() {
  const { farms, selectedFarmId, selectFarm, loading } = useFarms();
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    if (!selectedFarmId) return;
    apiFetch(`/api/farms/${selectedFarmId}`).then(setDetail).catch(() => setDetail(null));
  }, [selectedFarmId]);

  const latestSoil = detail?.soilReadings?.[0];
  const latestWeather = detail?.weatherData?.[0];
  const latestYield = detail?.yieldPredictions?.[0];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary-900 mb-1">Dashboard</h1>
        <p className="text-gray-500 mb-6">Overview of your farm's current status.</p>

        {!loading && <FarmPicker farms={farms} selectedFarmId={selectedFarmId} onSelect={selectFarm} />}

        {farms.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Soil moisture" value={latestSoil ? `${latestSoil.moisture}%` : "—"} sub={latestSoil ? `pH ${latestSoil.ph}` : "No data yet"} />
            <StatCard label="Weather" value={latestWeather ? `${latestWeather.temperature}°C` : "—"} sub={latestWeather ? `${latestWeather.rainfall}mm rain` : "No data yet"} />
            <StatCard label="Predicted yield" value={latestYield ? `${latestYield.predictedYield} t/ha` : "—"} sub={latestYield ? `${latestYield.cropType}, ${(latestYield.confidence * 100).toFixed(0)}% confidence` : "No prediction yet"} />
            <StatCard label="Soil health" value={latestYield?.soilHealth || (latestSoil ? "—" : "—")} sub="Based on latest reading" />
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink href="/soil" label="Log soil reading" icon="🧪" />
          <QuickLink href="/weather" label="Log weather" icon="🌦️" />
          <QuickLink href="/irrigation" label="Check irrigation" icon="💧" />
          <QuickLink href="/yield" label="Predict yield" icon="📈" />
          <QuickLink href="/assistant" label="Ask the AI assistant" icon="🤖" />
          <QuickLink href="/analytics" label="View analytics" icon="📊" />
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-primary-800">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="card flex items-center gap-3 hover:border-primary-300 transition-colors">
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-primary-900">{label}</span>
    </Link>
  );
}
