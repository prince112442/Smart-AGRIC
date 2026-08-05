"use client";

import ResourcePage from "@/components/ResourcePage";

export default function PestsPage() {
  return (
    <ResourcePage
      title="Pest & Disease Monitoring"
      subtitle="Report pest sightings or disease symptoms and their severity."
      endpoint="/api/pests"
      bannerImage="/images/pests-testing.jpg"
      bannerAlt="Soil testing and inspection tools in the field"
      fields={[
        { key: "pestType", label: "Pest type (optional)", type: "text", required: false },
        { key: "diseaseType", label: "Disease type (optional)", type: "text", required: false },
        { key: "severity", label: "Severity", type: "select", options: ["low", "medium", "high"], defaultValue: "low" },
        { key: "treatment", label: "Treatment applied (optional)", type: "text", required: false },
      ]}
      renderItem={(item) => (
        <div key={item.id} className="card flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="font-medium text-primary-800">{new Date(item.reportedAt).toLocaleDateString()}</span>
          {item.pestType && <span>Pest: {item.pestType}</span>}
          {item.diseaseType && <span>Disease: {item.diseaseType}</span>}
          <span
            className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium ${
              item.severity === "high" ? "bg-red-100 text-red-700" : item.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-primary-100 text-primary-700"
            }`}
          >
            {item.severity}
          </span>
          {item.treatment && <span className="text-gray-500">Treatment: {item.treatment}</span>}
        </div>
      )}
    />
  );
}
