"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui";

async function mutate(url: string, body?: object, method = "POST") {
  const response = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const result = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(result.error || "Admin action failed.");
}

export function StartupReviewControls({ startupId }: { startupId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  async function review(status: "approved" | "rejected") {
    setPending(status); setError("");
    try { await mutate(`/api/admin/startups/${startupId}`, { status }, "PATCH"); router.refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Failed."); }
    finally { setPending(""); }
  }
  return <div><div className="flex gap-2"><Button onClick={() => review("approved")} disabled={Boolean(pending)} className="min-h-9 px-3 py-1 text-xs">{pending === "approved" ? "Approving…" : "Approve"}</Button><Button onClick={() => review("rejected")} disabled={Boolean(pending)} className="min-h-9 bg-white px-3 py-1 text-xs text-[var(--foreground)] shadow-[2px_2px_0_var(--line)]">Reject</Button></div>{error && <p className="mt-2 text-xs font-bold text-red-700">{error}</p>}</div>;
}

export function StartupEditForm({ startup }: { startup: { id: string; name: string; tagline: string; url: string } }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try { await mutate(`/api/admin/startups/${startup.id}`, { name: form.get("name"), tagline: form.get("tagline"), url: form.get("url") }, "PATCH"); setMessage("Presentation saved."); router.refresh(); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Failed."); }
    finally { setPending(false); }
  }
  return <details className="mt-4 rounded-xl bg-[#e7edf5] p-4"><summary className="cursor-pointer text-sm font-black">Edit battle presentation</summary><form onSubmit={save} className="mt-4 grid gap-3"><input name="name" defaultValue={startup.name} className="min-h-10 rounded-lg border-2 border-[var(--line)] bg-white px-3 text-sm" aria-label="Startup name" /><textarea name="tagline" defaultValue={startup.tagline} rows={2} className="rounded-lg border-2 border-[var(--line)] bg-white px-3 py-2 text-sm" aria-label="Startup tagline" /><input name="url" type="url" defaultValue={startup.url} className="min-h-10 rounded-lg border-2 border-[var(--line)] bg-white px-3 text-sm" aria-label="Startup URL" /><div className="flex items-center gap-3"><Button type="submit" disabled={pending} className="min-h-9 px-3 py-1 text-xs">{pending ? "Saving…" : "Save edits"}</Button>{message && <span className="text-xs font-bold text-[var(--muted)]">{message}</span>}</div></form></details>;
}

export function WildcardControl({ auctionId, currentId, startups }: { auctionId: string; currentId?: string | null; startups: { id: string; name: string }[] }) {
  const router = useRouter();
  const [startupId, setStartupId] = useState(currentId || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function save() {
    setPending(true); setMessage("");
    try { await mutate(`/api/admin/auctions/${auctionId}/wildcard`, { startupId }, "PATCH"); setMessage("Wildcard saved."); router.refresh(); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Failed."); }
    finally { setPending(false); }
  }
  return <div className="flex flex-wrap items-center gap-2"><select value={startupId} onChange={(event) => setStartupId(event.target.value)} className="min-h-10 rounded-lg border-2 border-[var(--line)] bg-white px-3 text-sm"><option value="">No wildcard</option>{startups.map((startup) => <option key={startup.id} value={startup.id}>{startup.name}</option>)}</select><Button onClick={save} disabled={pending || !startupId} className="min-h-10 px-3 py-1 text-xs">{pending ? "Saving…" : "Set fallback"}</Button>{message && <span className="text-xs font-bold text-[var(--muted)]">{message}</span>}</div>;
}

export function RolloverControl() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function run() {
    setPending(true); setMessage("");
    try { await mutate("/api/admin/rollover"); setMessage("Transitions checked successfully."); router.refresh(); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Failed."); }
    finally { setPending(false); }
  }
  return <div><Button onClick={run} disabled={pending}>{pending ? "Checking…" : "Run due transitions"}</Button>{message && <p className="mt-3 text-sm font-bold text-[var(--muted)]">{message}</p>}</div>;
}

export function VoteModerationControls({ voteId }: { voteId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function update(status: "valid" | "invalid") {
    setPending(true);
    await mutate(`/api/admin/votes/${voteId}`, { status }, "PATCH");
    setPending(false); router.refresh();
  }
  return <div className="flex gap-2"><Button disabled={pending} onClick={() => update("valid")} className="min-h-9 px-3 py-1 text-xs">Valid</Button><Button disabled={pending} onClick={() => update("invalid")} className="min-h-9 bg-white px-3 py-1 text-xs text-[var(--foreground)] shadow-[2px_2px_0_var(--line)]">Invalidate</Button></div>;
}

export function InitialBattleControl({ startups }: { startups: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    try { await mutate("/api/admin/battles", { championStartupId: form.get("championStartupId"), challengerStartupId: form.get("challengerStartupId"), wildcardStartupId: form.get("wildcardStartupId") || undefined, startMode: form.get("startMode") }); router.refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Failed."); }
    finally { setPending(false); }
  }
  return <form onSubmit={create} className="mt-6 grid gap-4 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--brand)] p-5 shadow-hard-sm"><h3 className="text-xl font-black">Create the first battle</h3><div className="grid gap-3 sm:grid-cols-2"><AdminSelect name="championStartupId" label="Initial champion" startups={startups} /><AdminSelect name="challengerStartupId" label="Initial challenger" startups={startups} /></div><AdminSelect name="wildcardStartupId" label="Auction fallback" startups={startups} optional /><label className="grid gap-1 text-sm font-black">Start<select name="startMode" className="min-h-10 rounded-lg border-2 border-[var(--foreground)] bg-white px-3"><option value="next_midnight_utc">Next midnight UTC</option><option value="now">Immediately</option></select></label><Button type="submit" disabled={pending || startups.length < 2} className="w-fit">{pending ? "Creating…" : "Create battle and auction"}</Button>{error && <p className="text-sm font-bold text-red-800">{error}</p>}</form>;
}

function AdminSelect({ name, label, startups, optional = false }: { name: string; label: string; startups: { id: string; name: string }[]; optional?: boolean }) {
  return <label className="grid gap-1 text-sm font-black">{label}<select name={name} required={!optional} className="min-h-10 rounded-lg border-2 border-[var(--foreground)] bg-white px-3"><option value="">{optional ? "No fallback" : "Select startup"}</option>{startups.map((startup) => <option key={startup.id} value={startup.id}>{startup.name}</option>)}</select></label>;
}

export function PauseControl({ kind, id, status }: { kind: "battle" | "auction"; id: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const paused = status === "paused";
  async function toggle() {
    setPending(true);
    await mutate(`/api/admin/${kind}s/${id}/state`, { action: paused ? "resume" : "pause" }, "PATCH");
    setPending(false); router.refresh();
  }
  return <Button onClick={toggle} disabled={pending} className="min-h-9 bg-white px-3 py-1 text-xs text-[var(--foreground)] shadow-[2px_2px_0_var(--line)]">{pending ? "Updating…" : paused ? "Resume" : "Pause"}</Button>;
}
