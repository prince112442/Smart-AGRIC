"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import AppShell from "@/components/AppShell";
import FarmPicker from "@/components/FarmPicker";
import { apiFetch } from "@/lib/api";
import { useFarms } from "@/lib/useFarm";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AnalyticsPage() {
  const { farms, selectedFarmId, selectFarm, loading: farmsLoading } = useFarms();
  const [yields, setYields] = useState<any[]>([]);
  const [soil, setSoil] = useState<any[]>([]);
  const [weather, setWeather] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedFarmId) return;
    apiFetch(`/api/yield?farmId=${selectedFarmId}`).then((d) => setYields(d.reverse()));
    apiFetch(`/api/soil?farmId=${selectedFarmId}`).then((d) => setSoil(d.reverse()));
    apiFetch(`/api/weather?farmId=${selectedFarmId}`).then((d) => setWeather(d.reverse()));
  }, [selectedFarmId]);

  const yieldChartData = {
    labels: yields.map((y) => new Date(y.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: "Predicted yield (t/ha)",
        data: yields.map((y) => y.predictedYield),
        borderColor: "#16a34a",
        backgroundColor: "#bbf7d0",
        tension: 0.3,
      },
    ],
  };

  const soilChartData = {
    labels: soil.map((s) => new Date(s.recordedAt).toLocaleDateString()),
    datasets: [
      {
        label: "Soil moisture (%)",
        data: soil.map((s) => s.moisture),
        borderColor: "#0ea5e9",
        backgroundColor: "#bae6fd",
        tension: 0.3,
      },
      {
        label: "Soil pH",
        data: soil.map((s) => s.ph),
        borderColor: "#a855f7",
        backgroundColor: "#e9d5ff",
        tension: 0.3,
      },
    ],
  };

  const weatherChartData = {
    labels: weather.map((w) => new Date(w.recordedAt).toLocaleDateString()),
    datasets: [
      {
        label: "Rainfall (mm)",
        data: weather.map((w) => w.rainfall),
        borderColor: "#2563eb",
        backgroundColor: "#bfdbfe",
        tension: 0.3,
      },
      {
        label: "Temperature (°C)",
        data: weather.map((w) => w.temperature),
        borderColor: "#f97316",
        backgroundColor: "#fed7aa",
        tension: 0.3,
      },
    ],
  };

  return (
    <AppShell title="Analytics" subtitle="Trends across your farm's recorded data.">
      <div className="max-w-5xl">
        {!farmsLoading && <FarmPicker farms={farms} selectedFarmId={selectedFarmId} onSelect={selectFarm} />}

        {selectedFarmId && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-semibold text-primary-900 mb-3">Yield prediction trend</h2>
              {yields.length === 0 ? <p className="text-gray-500 text-sm">No yield predictions yet.</p> : <Line data={yieldChartData} />}
            </div>
            <div className="card">
              <h2 className="font-semibold text-primary-900 mb-3">Soil trends</h2>
              {soil.length === 0 ? <p className="text-gray-500 text-sm">No soil readings yet.</p> : <Line data={soilChartData} />}
            </div>
            <div className="card">
              <h2 className="font-semibold text-primary-900 mb-3">Weather trends</h2>
              {weather.length === 0 ? <p className="text-gray-500 text-sm">No weather records yet.</p> : <Line data={weatherChartData} />}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
