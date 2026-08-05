"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "./api";

export function useFarms() {
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/farms");
      setFarms(data);
      const saved = localStorage.getItem("sap_selected_farm");
      const stillExists = data.find((f: any) => f.id === saved);
      const next = stillExists ? saved! : data[0]?.id || "";
      setSelectedFarmId(next);
      if (next) localStorage.setItem("sap_selected_farm", next);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function selectFarm(id: string) {
    setSelectedFarmId(id);
    localStorage.setItem("sap_selected_farm", id);
  }

  return { farms, selectedFarmId, selectFarm, loading, error, refresh };
}
