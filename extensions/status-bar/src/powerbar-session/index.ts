import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { SEPARATOR } from "../powerbar/settings.js";

/** Same prefixes `task.ts` stamps: `YYYY-MM-DDTHH:MM:SS` or legacy `YYYY-MM-DD--HH-MM-SS`. */
const TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):\d{2}|--(\d{2})-(\d{2})-\d{2})(?:-|$)/i;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatPrettyDateTime(month: number, day: number, hours: number, minutes: number): string {
  return `${day} ${MONTHS[month - 1]} ${pad(hours)}:${pad(minutes)}`;
}

function formatClock(now: Date): string {
  return formatPrettyDateTime(now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes());
}

function formatSessionLabel(name: string | undefined, now = new Date()): string {
  const trimmed = name?.trim() ?? "";
  const match = trimmed.match(TIMESTAMP);
  if (!match) {
    return trimmed ? `${formatClock(now)}${SEPARATOR}${trimmed}` : formatClock(now);
  }

  const pretty = formatPrettyDateTime(
    Number(match[2]),
    Number(match[3]),
    Number(match[4] ?? match[6]),
    Number(match[5] ?? match[7]),
  );
  const prefix = match[0].replace(/-$/, "");
  const rest = trimmed.slice(prefix.length).replace(/^-/, "");
  return rest ? `${pretty}${SEPARATOR}${rest}` : pretty;
}

function emitSessionName(pi: ExtensionAPI, name: string | undefined): void {
  pi.events.emit("powerbar:update", {
    id: "session-name",
    text: formatSessionLabel(name),
    color: "accent",
    row: 4,
  });
}

export default function createExtension(pi: ExtensionAPI): void {
  pi.events.emit("powerbar:register-segment", { id: "session-name", label: "Session Name", row: 4 });

  pi.on("session_start", async () => emitSessionName(pi, pi.getSessionName()));
  pi.on("session_info_changed", async (event) => emitSessionName(pi, event.name));
}
