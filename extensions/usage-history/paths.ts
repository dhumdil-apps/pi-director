/** Pi agent dir / sessions / cache paths. */

import { homedir } from "node:os";
import { join } from "node:path";

export function getAgentDir(): string {
  // Replicate Pi's logic: respect PI_CODING_AGENT_DIR env var
  return process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");
}

export function getSessionsDir(): string {
  return join(getAgentDir(), "sessions");
}

export function getDefaultCachePath(): string {
  return join(getAgentDir(), "usage-extension-cache.json");
}
