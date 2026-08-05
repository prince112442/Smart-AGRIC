"use client";

import ResourcePage from "@/components/ResourcePage";

export default function CropsPage() {
  return (
    <ResourcePage
      title="Crop Management"
      subtitle="Track what's planted, its growth stage, and harvest timing."
      endpoint="/api/crops"
      fields={[
        { key: "cropType", label: "Crop type", type: "text" },
        { key: "plantingDate", label: "Planting date", type: "date" },
        {
          key: "growthStage",
          label: "Growth stage",
          type: "select",
          options: ["planted", "growing", "flowering", "harvest-ready", "harvested"],
          defaultValue: "planted",
        },
      ]}
      renderItem={(item) => (
        <div key={item.id} className="card flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="font-medium text-primary-800">{item.cropType}</span>
          <span>Planted: {new Date(item.plantingDate).toLocaleDateString()}</span>
          <span className="capitalize">Stage: {item.growthStage}</span>
        </div>
      )}
    />
  );
}
