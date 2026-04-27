# Remote Control Bridge

This is the controlled bridge between official Codex cloud, GitHub, and Angelo's Mac.

## Goal

Angelo wants to be able to use Codex from his phone when Mission Control is down or when he needs remote repair work. The bridge should allow powerful recovery actions without exposing a broad public shell.

## Current Design

Official Codex cloud can:

- inspect and patch this repository,
- produce recovery plans,
- prepare commits or PRs,
- guide Mac-side recovery.

The self-hosted runner bridge adds:

- a GitHub Actions workflow that runs locally on Angelo's Mac,
- explicit phone-visible workflow dispatch,
- a small allowlist of Mission Control/OpenClaw recovery actions,
- logs visible in GitHub Actions.

The first workflow is `.github/workflows/remote-ops.yml`.

## Supported Actions

- `healthcheck` - check LaunchAgent, port `3002`, `/login`, and OpenClaw gateway status hints.
- `tail_logs` - show recent Mission Control service logs.
- `restart_mission_control` - restart the `ai.missioncontrol.3002` LaunchAgent and verify `/login`.
- `rebuild_restart_mission_control` - run typecheck/build, restart the LaunchAgent, and verify `/login`.
- `openclaw_status` - run `openclaw status`.
- `openclaw_doctor_fix` - run `openclaw doctor --fix --non-interactive`, then `openclaw status`.

## Phone Workflow

1. Open GitHub on the phone.
2. Go to `growthbyangie-stack/mission-control`.
3. Open **Actions**.
4. Select **Remote Ops - Mission Control**.
5. Tap **Run workflow**.
6. Choose the action.
7. Enter a reason.
8. Check the confirm box.
9. Run it and watch the log.

For most outages, start with:

1. `healthcheck`
2. `tail_logs`
3. `restart_mission_control`
4. `rebuild_restart_mission_control`

## Runner Requirement

This workflow only works after a self-hosted GitHub Actions runner is installed on Angelo's Mac and registered to this repository with the custom label:

```text
mission-control
```

Recommended runner folder:

```text
/Users/angelowilliford/actions-runner/mission-control
```

Do not run the runner as root. Run it as Angelo's normal macOS user so it can access the same LaunchAgent and local files as the desktop session.

## Safety Boundary

This bridge intentionally does not expose arbitrary shell execution yet. Full remote control should be added as a second-stage, break-glass workflow with:

- manual approval,
- command hashing,
- command allowlists or signed requests,
- strong logs,
- an easy kill switch.

The initial version is for recovery, not unrestricted automation.

## Emergency Prompt For Official Codex

```text
Mission Control is down. Work in growthbyangie-stack/mission-control.

Read AGENTS.md, docs/CODEX-CLOUD-RECOVERY.md, and docs/REMOTE-CONTROL-BRIDGE.md.

Use the Remote Ops workflow if Mac-side recovery is needed. Start with healthcheck, then tail_logs, then restart_mission_control or rebuild_restart_mission_control.

Do not expose secrets. Do not delete local data. Do not add arbitrary shell execution unless Angelo explicitly asks for a break-glass bridge and understands the risk.
```

