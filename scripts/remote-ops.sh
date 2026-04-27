#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-healthcheck}"
MC_ROOT="${MC_ROOT:-/Users/angelowilliford/.openclaw/workspace/mission-control}"
MC_URL="${MC_URL:-http://127.0.0.1:3002/login}"
MC_PORT="${MC_PORT:-3002}"
MC_LABEL="${MC_LABEL:-ai.missioncontrol.3002}"
OPENCLAW_GATEWAY_URL="${OPENCLAW_GATEWAY_URL:-http://127.0.0.1:18789}"

section() {
  printf '\n== %s ==\n' "$*"
}

run() {
  printf '+ %s\n' "$*"
  "$@"
}

require_macos_user_runner() {
  section "Runner identity"
  run id
  run pwd

  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "This workflow must run on Angelo's macOS self-hosted runner." >&2
    exit 2
  fi

  if [[ "$(id -u)" == "0" ]]; then
    echo "Do not run this recovery bridge as root." >&2
    exit 2
  fi
}

verify_root() {
  section "Mission Control root"
  if [[ ! -d "$MC_ROOT" ]]; then
    echo "Mission Control root not found: $MC_ROOT" >&2
    exit 2
  fi
  cd "$MC_ROOT"
  run pwd
}

launchctl_print() {
  section "LaunchAgent"
  /bin/launchctl print "gui/$(id -u)/$MC_LABEL" | sed -n '1,120p' || true
}

port_check() {
  section "Port $MC_PORT"
  lsof -nP -iTCP:"$MC_PORT" -sTCP:LISTEN || true
}

login_check() {
  section "Login URL"
  curl -sS -I --connect-timeout 5 "$MC_URL" | sed -n '1,12p'
}

gateway_hint() {
  section "OpenClaw gateway hint"
  curl -sS -I --connect-timeout 2 "$OPENCLAW_GATEWAY_URL" | sed -n '1,8p' || true
}

tail_logs() {
  section "Recent stderr"
  tail -n 160 "$MC_ROOT/.data/launchd.stderr.log" 2>/dev/null || true

  section "Recent stdout"
  tail -n 160 "$MC_ROOT/.data/launchd.stdout.log" 2>/dev/null || true
}

restart_mission_control() {
  section "Restart Mission Control LaunchAgent"
  run /bin/launchctl kickstart -k "gui/$(id -u)/$MC_LABEL"
  sleep 3
  port_check
  login_check
}

rebuild_restart_mission_control() {
  section "Typecheck"
  run pnpm typecheck

  section "Build"
  run pnpm build

  restart_mission_control
}

openclaw_status() {
  section "OpenClaw status"
  if ! command -v openclaw >/dev/null 2>&1; then
    echo "openclaw command not found on runner PATH" >&2
    exit 2
  fi
  run openclaw status
}

openclaw_doctor_fix() {
  section "OpenClaw doctor fix"
  if ! command -v openclaw >/dev/null 2>&1; then
    echo "openclaw command not found on runner PATH" >&2
    exit 2
  fi
  run openclaw doctor --fix --non-interactive
  run openclaw status
}

healthcheck() {
  require_macos_user_runner
  verify_root
  launchctl_print
  port_check
  login_check
  gateway_hint
}

main() {
  case "$ACTION" in
    healthcheck)
      healthcheck
      ;;
    tail_logs)
      require_macos_user_runner
      verify_root
      tail_logs
      ;;
    restart_mission_control)
      require_macos_user_runner
      verify_root
      restart_mission_control
      ;;
    rebuild_restart_mission_control)
      require_macos_user_runner
      verify_root
      rebuild_restart_mission_control
      ;;
    openclaw_status)
      require_macos_user_runner
      openclaw_status
      ;;
    openclaw_doctor_fix)
      require_macos_user_runner
      openclaw_doctor_fix
      ;;
    *)
      echo "Unknown action: $ACTION" >&2
      exit 2
      ;;
  esac
}

main
