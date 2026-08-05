import Link from "next/link";

const FEATURES = [
  { icon: "🌱", title: "Farm & Crop Management", desc: "Track every farm, its crops, and growth stages in one place." },
  { icon: "🧪", title: "Soil Monitoring", desc: "Log moisture, pH, and N-P-K — manually today, from sensors tomorrow." },
  { icon: "🌦️", title: "Weather Tracking", desc: "Record conditions and forecasts that feed straight into recommendations." },
  { icon: "💧", title: "Irrigation Advice", desc: "AI recommends whether to irrigate today, and how much water to use." },
  { icon: "📈", title: "Yield Prediction", desc: "Predicts expected yield per crop with a confidence score." },
  { icon: "🤖", title: "AI Farm Assistant", desc: "Ask questions in plain English, answered from your farm's real data." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-primary-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-primary-700 text-xl">🌾 AgriSense</span>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary">Log in</Link>
            <Link href="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
          AI-Powered Smart Agriculture Monitoring
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          A connected decision-support platform that helps farmers monitor conditions,
          predict yield, and get AI recommendations — from any device, no hardware required to start.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="btn-primary text-base px-6 py-3">Create free account</Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">I already have one</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <div className="text-3xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-primary-900 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-primary-100 py-6 text-center text-sm text-gray-500">
        AgriSense — Computational Thinking Capstone Project
      </footer>
    </main>
  );
}
