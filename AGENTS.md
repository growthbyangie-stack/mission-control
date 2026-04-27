# Mission Control Codex Instructions

This repository powers Angelo's local Mission Control dashboard for OpenClaw/Codex operations.

## Highest-Priority Recovery Context

When Angelo says "Mission Control is down", "the site is down", "gateway is disconnected", or "voice broke the UI", first read:

- `docs/MISSION-CONTROL-RECOVERY-RUNBOOK.md`
- `docs/CODEX-CLOUD-RECOVERY.md`
- `docs/REMOTE-CONTROL-BRIDGE.md`

The live local deployment normally runs from:

- Project root: `/Users/angelowilliford/.openclaw/workspace/mission-control`
- Local URL: `http://127.0.0.1:3002/login`
- Tailnet URL: `https://angelos-mac-mini.tail6b619c.ts.net/login`
- LaunchAgent label: `ai.missioncontrol.3002`

## Safety Rules

- Do not print, commit, or transmit raw secrets from `.env`, token stores, cookies, or local databases.
- Do not delete `.data`, `.openclaw`, OpenClaw config, memory files, or chat attachments unless Angelo explicitly approves a backup and deletion.
- Do not assume a raw API route is a broken page. For example, `/api/chat/voice/realtime` can return `Unauthorized` when opened directly and still be healthy for app-internal use.
- Prefer targeted fixes over broad rewrites. This project has many local customizations for mobile control, approvals, BlueBubbles review, uploads, voice, and session handoff.

## Build And Verification

Before handing back a code change, run the narrowest relevant checks:

```bash
pnpm typecheck
pnpm build
```

For a local service recovery on Angelo's Mac, verify:

```bash
lsof -nP -iTCP:3002 -sTCP:LISTEN
curl -sS -I --connect-timeout 2 http://127.0.0.1:3002/login
```

Restart command for the live local service:

```bash
/bin/launchctl kickstart -k "gui/$(id -u)/ai.missioncontrol.3002"
```

## Codex Cloud Boundary

Codex cloud can inspect this repo, propose patches, run tests in its sandbox, and open PRs. It cannot directly restart Angelo's Mac or read local-only secrets unless a separate trusted local bridge is configured. If a fix requires local process control, produce exact local commands and explain what a trusted local agent must run.

The first trusted bridge is the GitHub Actions workflow `.github/workflows/remote-ops.yml`, which requires a self-hosted Mac runner labeled `mission-control`. Use only its approved actions unless Angelo explicitly asks to design a stronger break-glass control path.
