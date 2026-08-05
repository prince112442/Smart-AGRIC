"use client";

import ResourcePage from "@/components/ResourcePage";

export default function WeatherPage() {
  return (
    <ResourcePage
      title="Weather Monitoring"
      subtitle="Record temperature, humidity, rainfall, and forecast notes."
      endpoint="/api/weather"
      bannerImage="/images/weather-sprout.jpg"
      bannerAlt="Seedling breaking through soil after rain"
      fields={[
        { key: "temperature", label: "Temperature (°C)", type: "number", step: "0.1" },
        { key: "humidity", label: "Humidity (%)", type: "number", step: "0.1" },
        { key: "rainfall", label: "Rainfall (mm)", type: "number", step: "0.1" },
        { key: "forecast", label: "Forecast note (optional)", type: "text", required: false },
      ]}
      renderItem={(item) => (
        <div key={item.id} className="card flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="font-medium text-primary-800">{new Date(item.recordedAt).toLocaleString()}</span>
          <span>{item.temperature}°C</span>
          <span>{item.humidity}% humidity</span>
          <span>{item.rainfall}mm rain</span>
          {item.forecast && <span className="text-gray-500">"{item.forecast}"</span>}
        </div>
      )}
    />
  );
}
