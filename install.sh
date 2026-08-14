#!/bin/sh
set -u

MCP_NAME="intelligent-growth"
MCP_URL="https://mcp.intelligentgrowth.app/mcp"

if [ -t 1 ]; then
  BOLD='\033[1m'
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  ACCENT='\033[38;2;232;104;65m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  BOLD=''
  GREEN=''
  RED=''
  ACCENT=''
  DIM=''
  RESET=''
fi

say_error() {
  printf "%bError:%b %s\n" "$RED" "$RESET" "$1" >&2
}

print_banner() {
  printf '\n'
  printf "%bIntelligent Growth%b\n" "$ACCENT$BOLD" "$RESET"
  printf "%b60 product marketing skills inside your AI agent%b\n\n" "$DIM" "$RESET"
}

selection_to_clients() {
  old_ifs=$IFS
  IFS=','
  set -- $1
  IFS=$old_ifs
  result=''
  for choice in "$@"; do
    choice=$(printf '%s' "$choice" | tr -d ' ')
    case "$choice" in
      0|desktop|claude-desktop) client='desktop' ;;
      1|claude) client='claude' ;;
      2|codex) client='codex' ;;
      3|cursor) client='cursor' ;;
      4|vscode|code) client='vscode' ;;
      5|gemini) client='gemini' ;;
      6|opencode) client='opencode' ;;
      *)
        say_error "Unknown agent: $choice"
        return 1
        ;;
    esac
    case ",$result," in
      *",$client,"*) ;;
      *)
        if [ -n "$result" ]; then result="$result,$client"; else result="$client"; fi
        ;;
    esac
  done
  printf '%s' "$result"
}

configure_claude_desktop() {
  if ! command -v node >/dev/null 2>&1 || ! command -v npx >/dev/null 2>&1; then
    say_error 'Node.js 18 or newer is required. Install it from https://nodejs.org and run this command again.'
    return 1
  fi

  node_major=$(node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || printf '0')
  if [ "$node_major" -lt 18 ] 2>/dev/null; then
    say_error 'Node.js 18 or newer is required. Update it from https://nodejs.org and run this command again.'
    return 1
  fi

  npx_path=$(command -v npx)
  if [ -n "${IG_CLAUDE_DESKTOP_CONFIG:-}" ]; then
    config_path=$IG_CLAUDE_DESKTOP_CONFIG
  elif [ "$(uname -s)" = 'Darwin' ]; then
    config_path="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
  else
    say_error 'This shell installer supports Claude Desktop on macOS. On Windows, run: irm https://intelligentgrowth.app/install.ps1 | iex'
    return 1
  fi

  IG_CONFIG_PATH="$config_path" IG_NPX_PATH="$npx_path" IG_MCP_URL="$MCP_URL" node <<'JS'
const fs = require('fs');
const path = require('path');

const configPath = process.env.IG_CONFIG_PATH;
const backupPath = `${configPath}.intelligent-growth-backup`;
const temporaryPath = `${configPath}.intelligent-growth-tmp`;

try {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const exists = fs.existsSync(configPath) && fs.statSync(configPath).size > 0;
  const originalMode = exists ? fs.statSync(configPath).mode : 0o600;
  if (exists && !fs.existsSync(backupPath)) fs.copyFileSync(configPath, backupPath);
  const config = exists ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
  if (!config || Array.isArray(config) || typeof config !== 'object') {
    throw new Error('configuration root must be a JSON object');
  }
  if (!config.mcpServers || Array.isArray(config.mcpServers) || typeof config.mcpServers !== 'object') {
    config.mcpServers = {};
  }
  config.mcpServers['intelligent-growth'] = {
    command: process.env.IG_NPX_PATH,
    args: ['-y', 'mcp-remote', process.env.IG_MCP_URL],
  };
  fs.writeFileSync(temporaryPath, `${JSON.stringify(config, null, 2)}\n`, { mode: originalMode });
  fs.renameSync(temporaryPath, configPath);
} catch (error) {
  if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  console.error(`${error.name}: ${error.message}`);
  process.exit(1);
}
JS
}

configure_claude() {
  if ! command -v claude >/dev/null 2>&1; then
    say_error 'Claude Code is not installed.'
    return 1
  fi
  claude mcp remove "$MCP_NAME" -s user >/dev/null 2>&1 || true
  claude mcp add -s user --transport http "$MCP_NAME" "$MCP_URL" >/dev/null
}

configure_codex() {
  if ! command -v python3 >/dev/null 2>&1; then
    say_error 'python3 is required to configure Codex.'
    return 1
  fi
  IG_CONFIG_PATH="$HOME/.codex/config.toml" IG_MCP_URL="$MCP_URL" python3 - <<'PY'
import os
import re
import shutil
import stat
import sys

path = os.environ['IG_CONFIG_PATH']
url = os.environ['IG_MCP_URL']
backup = path + '.intelligent-growth-backup'

try:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    original_mode = 0o600
    if os.path.exists(path):
        original_mode = stat.S_IMODE(os.stat(path).st_mode)
        if not os.path.exists(backup):
            shutil.copy2(path, backup)
        with open(path, encoding='utf-8') as handle:
            config = handle.read()
    else:
        config = ''

    section = re.compile(
        r'^\[mcp_servers\.intelligent-growth\][ \t]*\n.*?(?=^\[|\Z)',
        flags=re.MULTILINE | re.DOTALL,
    )
    config = section.sub('', config).rstrip()
    entry = f'[mcp_servers.intelligent-growth]\nurl = "{url}"\n'
    updated = f'{config}\n\n{entry}' if config else entry

    temporary = path + '.intelligent-growth-tmp'
    with open(temporary, 'w', encoding='utf-8') as handle:
        handle.write(updated)
    os.chmod(temporary, original_mode)
    os.replace(temporary, path)
except Exception as error:
    print(f'{type(error).__name__}: {error}', file=sys.stderr)
    raise SystemExit(1)
PY
}

configure_json() {
  client=$1
  if ! command -v python3 >/dev/null 2>&1; then
    say_error "python3 is required to configure $client."
    return 1
  fi

  case "$client" in
    cursor)
      config_path="$HOME/.cursor/mcp.json"
      root_key='mcpServers'
      format='standard'
      ;;
    vscode)
      if [ "$(uname -s)" = 'Darwin' ]; then
        config_path="$HOME/Library/Application Support/Code/User/mcp.json"
      else
        config_path="$HOME/.config/Code/User/mcp.json"
      fi
      root_key='servers'
      format='http'
      ;;
    gemini)
      config_path="$HOME/.gemini/settings.json"
      root_key='mcpServers'
      format='gemini'
      ;;
    opencode)
      config_path="$HOME/.config/opencode/opencode.json"
      root_key='mcp'
      format='opencode'
      ;;
    *) return 1 ;;
  esac

  IG_CONFIG_PATH="$config_path" IG_ROOT_KEY="$root_key" IG_FORMAT="$format" IG_MCP_URL="$MCP_URL" \
    python3 - <<'PY'
import json
import os
import re
import shutil
import sys

path = os.environ['IG_CONFIG_PATH']
root_key = os.environ['IG_ROOT_KEY']
fmt = os.environ['IG_FORMAT']
url = os.environ['IG_MCP_URL']
backup = path + '.intelligent-growth-backup'

def strip_jsonc(value):
    value = re.sub(r'/\*.*?\*/', '', value, flags=re.DOTALL)
    value = re.sub(r'^\s*//.*$', '', value, flags=re.MULTILINE)
    return re.sub(r',(\s*[}\]])', r'\1', value)

try:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path) and os.path.getsize(path):
        if not os.path.exists(backup):
            shutil.copy2(path, backup)
        with open(path, encoding='utf-8') as handle:
            raw = handle.read()
        try:
            config = json.loads(raw)
        except json.JSONDecodeError:
            config = json.loads(strip_jsonc(raw))
    else:
        config = {}

    if not isinstance(config, dict):
        raise ValueError('configuration root must be a JSON object')
    if not isinstance(config.get(root_key), dict):
        config[root_key] = {}

    if fmt == 'http':
        value = {'type': 'http', 'url': url}
    elif fmt == 'gemini':
        value = {'httpUrl': url}
    elif fmt == 'opencode':
        value = {'type': 'remote', 'url': url, 'enabled': True}
    else:
        value = {'url': url}

    config[root_key]['intelligent-growth'] = value
    temporary = path + '.intelligent-growth-tmp'
    with open(temporary, 'w', encoding='utf-8') as handle:
        json.dump(config, handle, indent=2)
        handle.write('\n')
    os.replace(temporary, path)
except Exception as error:
    print(f'{type(error).__name__}: {error}', file=sys.stderr)
    raise SystemExit(1)
PY
}

print_banner

if [ -n "${IG_INSTALL_CLIENTS:-}" ]; then
  requested=$IG_INSTALL_CLIENTS
else
  requested='desktop'
fi

clients=$(selection_to_clients "$requested") || exit 1
if [ -z "$clients" ]; then
  say_error 'Choose at least one agent.'
  exit 1
fi

configured=0
failed=0
old_ifs=$IFS
IFS=','
set -- $clients
IFS=$old_ifs

for client in "$@"; do
  printf 'Configuring %s... ' "$client"
  case "$client" in
    desktop) configure_claude_desktop ;;
    claude) configure_claude ;;
    codex) configure_codex ;;
    *) configure_json "$client" ;;
  esac
  if [ "$?" -eq 0 ]; then
    configured=$((configured + 1))
    printf "%bready%b\n" "$GREEN" "$RESET"
  else
    failed=$((failed + 1))
    printf "%bfailed%b\n" "$RED" "$RESET"
  fi
done

if [ "$failed" -gt 0 ]; then
  say_error "$failed agent configuration(s) failed."
  exit 1
fi

if [ "$clients" = 'desktop' ]; then
  printf '\n%bIntelligent Growth is configured for Claude Desktop.%b\n' "$BOLD" "$RESET"
  printf 'Fully quit and reopen Claude Desktop. Your browser will open so you can sign in.\n'
else
  if [ "$configured" -eq 1 ]; then agent_word='agent'; else agent_word='agents'; fi
  printf '\n%bInstalled Intelligent Growth for %s %s.%b\n' "$BOLD" "$configured" "$agent_word" "$RESET"
  printf 'Open your agent, use Intelligent Growth, and sign in when your agent opens the browser.\n'
fi
printf 'Setup help: https://intelligentgrowth.app/mcp/start\n\n'
