# Mission Control Recovery Runbook

Use this when Mission Control is down or the phone dashboard cannot reach the live site. Do not paste raw passwords or tokens into Discord. Send this runbook and have the trusted local agent read secrets directly on Angelo's Mac.

## Safe Connection Details

- Local URL: `http://127.0.0.1:3002/login`
- Tailnet URL: `https://angelos-mac-mini.tail6b619c.ts.net/login`
- Port: `3002`
- LaunchAgent label: `ai.missioncontrol.3002`
- Project root: `/Users/angelowilliford/.openclaw/workspace/mission-control`
- Environment file: `/Users/angelowilliford/.openclaw/workspace/mission-control/.env`
- Mission Control database: `/Users/angelowilliford/.openclaw/workspace/mission-control/.data/mission-control.db`
- Mission Control token store: `/Users/angelowilliford/.openclaw/workspace/mission-control/.data/mission-control-tokens.json`
- OpenClaw home: `/Users/angelowilliford/.openclaw`
- OpenClaw config: `/Users/angelowilliford/.openclaw/openclaw.json`
- OpenClaw gateway URL: `http://127.0.0.1:18789`
- Admin username: `admin`

## Secret Names To Read Locally

Read these on the Mac from `.env` or the configured token store. Do not send the raw values through Discord.

- `AUTH_SECRET`
- `AUTH_USER`
- `AUTH_PASS` or the hashed password stored in the local database
- `OPENCLAW_GATEWAY_TOKEN`
- `MISSION_CONTROL_TOKENS_PATH`
- `OPENCLAW_CONFIG_PATH`
- `OPENCLAW_HOME`

If the admin password is unknown, reset it locally instead of transmitting an old password.

## Recovery Commands

Run these from a local terminal on Angelo's Mac:

```bash
cd /Users/angelowilliford/.openclaw/workspace/mission-control
pnpm typecheck
pnpm build
/bin/launchctl kickstart -k "gui/$(id -u)/ai.missioncontrol.3002"
sleep 3
curl -sS -I http://127.0.0.1:3002/login | head -n 5
```

If the site still does not answer:

```bash
lsof -nP -iTCP:3002 -sTCP:LISTEN
tail -n 200 ~/Library/Logs/ai.missioncontrol.3002.log
tail -n 200 ~/Library/Logs/ai.missioncontrol.3002.err.log
```

If the gateway badge is disconnected:

```bash
openclaw status
openclaw doctor --fix --non-interactive
```

## Do Not Delete

Do not delete these unless Angelo explicitly approves a backup and reset:

- `/Users/angelowilliford/.openclaw/workspace/mission-control/.data`
- `/Users/angelowilliford/.openclaw`
- `/Users/angelowilliford/.openclaw/openclaw.json`
- `/Users/angelowilliford/.openclaw/workspace/memory`

## Quick Diagnosis

- Login page fails: rebuild and restart `ai.missioncontrol.3002`.
- Login works but gateway badge says local/offline: check OpenClaw gateway status and `OPENCLAW_GATEWAY_TOKEN`.
- Phone cannot open Tailnet URL: confirm Tailscale is connected on the phone and Mac.
- Chat opens but transcript never loads: check the session transcript API and server logs.
- New Chat times out: verify Codex CLI is installed, available on PATH for the LaunchAgent, and able to create a local session from the service environment.
