"use client";

import { useEffect } from "react";

export function ImpressionTracker({ battleId }: { battleId: string }) {
  useEffect(() => {
    void fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventType: "battle_impression", battleId })
    });
  }, [battleId]);
  return null;
}
