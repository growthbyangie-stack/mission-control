# Codex Cloud Recovery Path

Use this guide when Mission Control or OpenClaw is down and Angelo needs to use the official Codex path from ChatGPT/web/mobile.

## What Official Codex Can Do

Official Codex can work on the `builderz-labs/mission-control` GitHub repository in a cloud sandbox. It can:

- inspect the codebase,
- diagnose likely regressions,
- patch files,
- run repository checks,
- prepare a PR or patch summary,
- produce exact local recovery commands for Angelo's Mac.

Official Codex cannot directly control Angelo's Mac, restart LaunchAgents, inspect local process logs, or read `.env` secrets unless Angelo separately gives it a trusted local bridge.

## Setup Checklist

1. Open `https://chatgpt.com/codex`.
2. Connect the GitHub account that has access to `builderz-labs/mission-control`.
3. Select the `builderz-labs/mission-control` repository.
4. Confirm Codex sees this file and `AGENTS.md`.
5. Use the prompt below when the live site is down.

## Emergency Prompt

```text
Mission Control is down. Work in builderz-labs/mission-control.

First read AGENTS.md and docs/MISSION-CONTROL-RECOVERY-RUNBOOK.md.

Goal:
- diagnose the likely code or build issue,
- patch the repo if needed,
- run pnpm typecheck and pnpm build,
- do not expose secrets,
- do not delete local data paths,
- give me exact local commands to run on my Mac if launchctl/process recovery is required.

Important local deployment details:
- local URL: http://127.0.0.1:3002/login
- tailnet URL: https://angelos-mac-mini.tail6b619c.ts.net/login
- LaunchAgent: ai.missioncontrol.3002
- local project root on Mac: /Users/angelowilliford/.openclaw/workspace/mission-control
```

## Local Break-Glass Commands

If Angelo is at the Mac or has a trusted local agent, run:

```bash
cd /Users/angelowilliford/.openclaw/workspace/mission-control
pnpm typecheck
pnpm build
/bin/launchctl kickstart -k "gui/$(id -u)/ai.missioncontrol.3002"
sleep 3
curl -sS -I --connect-timeout 2 http://127.0.0.1:3002/login | head -n 8
```

If the site appears down while the browser is on an API path, open:

```text
http://127.0.0.1:3002/login
```

Do not use `/api/chat/voice/realtime` as the page URL. That endpoint may return `Unauthorized` when opened directly.

## Future Bridge Options

For full remote repair when Angelo is away from the Mac, add one of these later:

- a self-hosted GitHub Actions runner on the Mac with tightly scoped recovery workflows,
- a signed Mission Control maintenance queue that can pull a reviewed patch and restart the service,
- a Tailscale SSH recovery path with key-based access and command allowlists.

Do not enable broad unattended shell access from the public internet.
