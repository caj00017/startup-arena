"use client";

import { useEffect } from "react";

export function ImpressionTracker({
  battleId,
  referralCode
}: {
  battleId: string;
  referralCode?: string;
}) {
  useEffect(() => {
    void fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventType: "battle_impression",
        battleId,
        referralCode
      })
    });
  }, [battleId, referralCode]);
  return null;
}
