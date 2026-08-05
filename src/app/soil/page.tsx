"use client";

import ResourcePage from "@/components/ResourcePage";

export default function SoilPage() {
  return (
    <ResourcePage
      title="Soil Monitoring"
      subtitle="Log soil moisture, temperature, pH, and nutrient levels."
      endpoint="/api/soil"
      fields={[
        { key: "moisture", label: "Moisture (%)", type: "number", step: "0.1" },
        { key: "temperature", label: "Temperature (°C)", type: "number", step: "0.1" },
        { key: "ph", label: "pH", type: "number", step: "0.1" },
        { key: "nitrogen", label: "Nitrogen (mg/kg)", type: "number", step: "1" },
        { key: "phosphorus", label: "Phosphorus (mg/kg)", type: "number", step: "1" },
        { key: "potassium", label: "Potassium (mg/kg)", type: "number", step: "1" },
      ]}
      renderItem={(item) => (
        <div key={item.id} className="card flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="font-medium text-primary-800">{new Date(item.recordedAt).toLocaleString()}</span>
          <span>Moisture: {item.moisture}%</span>
          <span>Temp: {item.temperature}°C</span>
          <span>pH: {item.ph}</span>
          <span>N-P-K: {item.nitrogen}/{item.phosphorus}/{item.potassium}</span>
          <span className="text-gray-400">({item.source})</span>
        </div>
      )}
    />
  );
}
