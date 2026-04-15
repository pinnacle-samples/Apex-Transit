import { rcsClient } from './rcsClient';

/**
 * Fire-and-forget typing indicator. Returns synchronously — the request is
 * kicked off in the background and any error is logged but never thrown,
 * so a failed indicator never blocks or delays the actual response.
 * Auto-expires after ~20s or when the agent sends a message.
 */
export function sendTypingIndicator(to: string): void {
  const agentId = process.env.AGENT_NAME ?? process.env.PINNACLE_AGENT_ID;
  if (!agentId) {
    console.warn('[typing] AGENT_NAME / PINNACLE_AGENT_ID env is not set — skipping typing indicator');
    return;
  }
  rcsClient.messages.rcs
    .sendTyping({ agentId, to })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[typing] sendTyping failed for ${to}: ${msg}`);
    });
}
