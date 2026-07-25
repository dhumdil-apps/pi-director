# Agent Status Bridge

Vendor-neutral display-only progress reporting. There is no setting: discovery is
the switch. The bridge reports whenever it can find a local observer and stays
silent when it cannot.

Configure `AGENT_STATUS_URL` and `AGENT_STATUS_TOKEN`. When those are absent, the bridge
reads `AGENT_STATUS_DISCOVERY`, falling back to `~/.wingman/status.json`. Remove that file
(or stop the observer) and reporting stops with it.

Every call is fire-and-forget, capped by a short timeout, and can never block or fail a Pi
turn — including at shutdown, where the goodbye and release are posted without waiting.
An observer is expected to release a session whose process is gone and to age one out by
heartbeat TTL, so a lost goodbye costs nothing.
