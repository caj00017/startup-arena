import { cn } from "@/lib/utils";

const palettes = [
  "from-[#0756c7] to-[#1677ff]",
  "from-[#082b66] to-[#1268e8]",
  "from-[#0b1220] to-[#1677ff]",
  "from-[#063e91] to-[#2b83ff]"
];

export function StartupMark({ name, className }: { name: string; className?: string }) {
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-[var(--foreground)] bg-gradient-to-br text-xl font-black text-white shadow-[3px_3px_0_var(--foreground)]",
        palettes[index],
        className
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
