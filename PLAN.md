# Pi Stack Director rename

## Current state

Pi Director is still stored in the `pi-kit` checkout. Its five-step workflow,
memory, status, and dashboard features are green. The existing display-only
status bridge already speaks to the debug browser's status channel.

## Decisions

- Public and technical name: Pi Director / `pi-director`.
- Pi Inspector stays agent-neutral; Director integrates through a bundled skill
  and the existing CLI rather than duplicating its control plane.
- Browser authorization remains human-gated in Inspector.
- Remote repository rename and push remain approval-gated.

## Desired state

Director installs as `@dhumdil-apps/pi-director`, teaches evidence-first local
browser verification through Pi Inspector, and reports phase/session context to
Inspector without exposing control credentials.

## Approach

Rename product references and the bridge, add the Inspector skill to the Pi
manifest, enrich the status event, verify, commit, and only then rename the
local checkout.

## Quirks

- The workflow prompt must remain byte-stable and contains no dynamic Inspector
  state.
- The pre-existing `.gitignore` correction is user-owned and remains preserved.

## Checklist

- [x] Rename package/docs/bridge identifiers
- [x] Add and validate the Pi Inspector skill
- [x] Add phase and session name to display-only status
- [x] Run unit tests, typecheck, and headless package smoke
- [ ] Commit the verified milestone
- [ ] Rename the local checkout and synchronize workspace consumers
