"use client";

import { useEffect, useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";
import { Sprout, Leaf, Droplets, Bug, Plus, ArrowUpRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import FarmPicker from "@/components/FarmPicker";
import { apiFetch } from "@/lib/api";
import { useFarms } from "@/lib/useFarm";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const { farms, selectedFarmId, selectFarm, loading } = useFarms();
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    if (!selectedFarmId) return;
    apiFetch(`/api/farms/${selectedFarmId}`).then(setDetail).catch(() => setDetail(null));
  }, [selectedFarmId]);

  const soilReadings = [...(detail?.soilReadings || [])].reverse();
  const latestSoil = detail?.soilReadings?.[0];
  const latestWeather = detail?.weatherData?.[0];
  const latestYield = detail?.yieldPredictions?.[0];
  const cropsTracked = detail?.crops?.length || 0;
  const pestAlerts = (detail?.pestReports || []).filter((p: any) => p.severity !== "low");

  const soilHealthCounts = (detail?.yieldPredictions || []).reduce(
    (acc: Record<string, number>, y: any) => {
      acc[y.soilHealth] = (acc[y.soilHealth] || 0) + 1;
      return acc;
    },
    {}
  );
  const hasSoilHealthData = Object.keys(soilHealthCounts).length > 0;

  return (
    <AppShell title="Dashboard" subtitle="Monitor your farms and act on AI recommendations with ease.">
      {!loading && <FarmPicker farms={farms} selectedFarmId={selectedFarmId} onSelect={selectFarm} />}

      {farms.length === 0 ? null : (
        <>
          {/* Stat cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl bg-primary-900 text-white p-5">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-primary-100">Total Farms</p>
                <Sprout size={16} className="text-primary-200" />
              </div>
              <p className="text-3xl font-bold">{farms.length}</p>
            </div>
            <StatCard icon={<Leaf size={16} />} label="Crops Tracked" value={cropsTracked} />
            <StatCard icon={<Droplets size={16} />} label="Soil Readings" value={detail?.soilReadings?.length || 0} />
            <StatCard
              icon={<Bug size={16} />}
              label="Pest Alerts"
              value={pestAlerts.length}
              accent={pestAlerts.length > 0 ? "text-amber-600" : undefined}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            {/* Soil moisture trend */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-primary-900">Soil Moisture Trend</h2>
                <span className="text-xs text-gray-400">Last {soilReadings.length} readings</span>
              </div>
              {soilReadings.length === 0 ? (
                <EmptyHint text="Log a soil reading to see the trend here." href="/soil" cta="Log soil reading" />
              ) : (
                <Line
                  data={{
                    labels: soilReadings.map((s: any) => new Date(s.recordedAt).toLocaleDateString()),
                    datasets: [
                      {
                        label: "Moisture (%)",
                        data: soilReadings.map((s: any) => s.moisture),
                        borderColor: "#16a34a",
                        backgroundColor: "#bbf7d0",
                        tension: 0.35,
                        fill: true,
                      },
                    ],
                  }}
                  options={{ plugins: { legend: { display: false } }, maintainAspectRatio: true }}
                />
              )}
            </div>

            {/* AI Reminder */}
            <div className="card flex flex-col">
              <h2 className="font-semibold text-primary-900 mb-3">AI Reminder</h2>
              {!latestSoil ? (
                <EmptyHint text="No soil data yet — nothing to recommend." href="/irrigation" cta="Check irrigation" />
              ) : latestSoil.moisture < 30 ? (
                <>
                  <p className="text-sm text-gray-700 mb-1">
                    Soil moisture is low at <strong>{latestSoil.moisture}%</strong> on {detail?.name}.
                  </p>
                  <p className="text-xs text-gray-400 mb-4">Based on the latest soil reading.</p>
                  <Link href="/irrigation" className="btn-primary text-center mt-auto">
                    Check irrigation
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-700 mb-1">
                    Soil moisture looks healthy at <strong>{latestSoil.moisture}%</strong>.
                  </p>
                  <p className="text-xs text-gray-400 mb-4">No irrigation action needed right now.</p>
                  <Link href="/assistant" className="btn-secondary text-center mt-auto">
                    Ask the assistant
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Recent pest alerts */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-primary-900">Recent Alerts</h2>
                <Link href="/pests" className="text-xs text-primary-700 flex items-center gap-1">
                  <Plus size={13} /> New
                </Link>
              </div>
              {(detail?.pestReports || []).length === 0 ? (
                <EmptyHint text="No pest or disease reports yet." href="/pests" cta="Report an issue" />
              ) : (
                <div className="space-y-3">
                  {detail.pestReports.map((p: any) => (
                    <div key={p.id} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 w-2 h-2 rounded-full ${
                          p.severity === "high" ? "bg-red-500" : p.severity === "medium" ? "bg-amber-500" : "bg-primary-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-gray-800">{p.pestType || p.diseaseType || "Issue reported"}</p>
                        <p className="text-xs text-gray-400">{new Date(p.reportedAt).toLocaleDateString()} &middot; {p.severity} severity</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Crop health donut */}
            <div className="card">
              <h2 className="font-semibold text-primary-900 mb-3">Soil Health (from predictions)</h2>
              {!hasSoilHealthData ? (
                <EmptyHint text="Run a yield prediction to see soil health breakdown." href="/yield" cta="Predict yield" />
              ) : (
                <div className="max-w-[200px] mx-auto">
                  <Doughnut
                    data={{
                      labels: Object.keys(soilHealthCounts),
                      datasets: [
                        {
                          data: Object.values(soilHealthCounts),
                          backgroundColor: ["#16a34a", "#facc15", "#ef4444"],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{ plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } } }}
                  />
                </div>
              )}
            </div>

            {/* Latest sensor reading */}
            <div className="rounded-2xl bg-primary-900 text-white p-5 flex flex-col">
              <p className="text-sm text-primary-100 mb-1">Latest Soil Reading</p>
              {!latestSoil ? (
                <p className="text-sm text-primary-200 mt-2">No readings yet for this farm.</p>
              ) : (
                <>
                  <p className="text-xs text-primary-300 mb-4">
                    {latestSoil.source === "sensor" ? "From IoT sensor" : "Manually entered"} &middot;{" "}
                    {new Date(latestSoil.recordedAt).toLocaleString()}
                  </p>
                  <p className="text-4xl font-bold mb-1">{latestSoil.moisture}%</p>
                  <p className="text-sm text-primary-200">Soil moisture &middot; {latestSoil.temperature}&deg;C &middot; pH {latestSoil.ph}</p>
                  <Link href="/soil" className="mt-auto pt-4 text-sm text-white flex items-center gap-1 font-medium">
                    View history <ArrowUpRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {farms.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">You don't have any farms yet.</p>
          <Link href="/farms" className="btn-primary inline-block">
            Add your first farm
          </Link>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: string }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${accent || "text-primary-900"}`}>{value}</p>
    </div>
  );
}

function EmptyHint({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="text-sm text-gray-500 py-6">
      <p className="mb-3">{text}</p>
      <Link href={href} className="text-primary-700 font-medium underline">
        {cta}
      </Link>
    </div>
  );
}
