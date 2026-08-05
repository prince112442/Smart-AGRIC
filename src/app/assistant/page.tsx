"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import FarmPicker from "@/components/FarmPicker";
import { apiFetch } from "@/lib/api";
import { useFarms } from "@/lib/useFarm";

const SUGGESTIONS = [
  "Should I irrigate today?",
  "Why is my crop yield decreasing?",
  "What is my soil condition?",
  "What fertilizer should I use?",
];

export default function AssistantPage() {
  const { farms, selectedFarmId, selectFarm, loading: farmsLoading } = useFarms();
  const [history, setHistory] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedFarmId) return;
    apiFetch(`/api/chat?farmId=${selectedFarmId}`).then(setHistory);
  }, [selectedFarmId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function send(text: string) {
    if (!text.trim() || !selectedFarmId) return;
    setSending(true);
    setMessage("");
    try {
      const saved = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ farmId: selectedFarmId, message: text }),
      });
      setHistory((h) => [...h, saved]);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-primary-900 mb-1">AI Farm Assistant</h1>
        <p className="text-gray-500 mb-6">Ask questions about your farm — answers use your real stored data.</p>

        {!farmsLoading && <FarmPicker farms={farms} selectedFarmId={selectedFarmId} onSelect={selectFarm} />}

        {selectedFarmId && (
          <>
            <div className="card flex-1 mb-4 overflow-y-auto max-h-[50vh] min-h-[300px] space-y-4">
              {history.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No messages yet. Try one of the suggestions below, or ask your own question.
                </p>
              )}
              {history.map((m) => (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-end">
                    <div className="bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%] text-sm">{m.message}</div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-primary-50 border border-primary-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] text-sm text-gray-700">{m.response}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-xs bg-white border border-primary-200 text-primary-700 rounded-full px-3 py-1 hover:bg-primary-50">
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(message);
              }}
              className="flex gap-2"
            >
              <input
                className="input flex-1"
                placeholder="Ask about irrigation, yield, soil, fertilizer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="btn-primary" disabled={sending}>
                {sending ? "..." : "Send"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
