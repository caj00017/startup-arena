import { describe, expect, it } from "vitest";
import {
  battleRawDataExpiresAt,
  isBattleRawDataAvailable,
  rawDataRetentionMs
} from "@/services/retention";

describe("raw-data retention", () => {
  it("expires finalized battle data exactly 30 days after finalization", () => {
    const finalizedAt = new Date("2026-07-25T12:00:00.000Z");
    const battle = {
      status: "finalized" as const,
      finalizedAt,
      updatedAt: finalizedAt
    };
    const expiresAt = new Date(finalizedAt.getTime() + rawDataRetentionMs);

    expect(battleRawDataExpiresAt(battle)).toEqual(expiresAt);
    expect(
      isBattleRawDataAvailable(battle, new Date(expiresAt.getTime() - 1))
    ).toBe(true);
    expect(isBattleRawDataAvailable(battle, expiresAt)).toBe(false);
  });

  it("does not start the retention clock while a battle is active", () => {
    const battle = {
      status: "live" as const,
      finalizedAt: null,
      updatedAt: new Date("2026-07-01T00:00:00.000Z")
    };

    expect(battleRawDataExpiresAt(battle)).toBeNull();
    expect(isBattleRawDataAvailable(battle, new Date("2027-01-01T00:00:00.000Z"))).toBe(true);
  });
});
