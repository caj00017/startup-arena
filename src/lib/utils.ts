import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2
  }).format(cents / 100);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function normalizeUrl(value: string) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function percentage(part: number, total: number) {
  if (total === 0) return 50;
  return Math.round((part / total) * 100);
}

export function utcDayWindow(now = new Date()) {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const auctionClose = new Date(end);
  auctionClose.setUTCHours(auctionClose.getUTCHours() - 1);
  return { start, end, auctionClose };
}
