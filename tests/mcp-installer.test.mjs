import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const installer = new URL('../install.sh', import.meta.url);
const windowsInstaller = new URL('../install.ps1', import.meta.url);

test('the public install route serves the shell installer with a safe content type', () => {
  const config = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const route = config.routes.find((entry) => entry.src === '/install');

  assert.equal(route?.dest, '/install.sh');
  assert.match(route?.headers?.['Content-Type'] ?? '', /text\/x-shellscript/);
  assert.equal(route?.headers?.['X-Content-Type-Options'], 'nosniff');

  const windowsRoute = config.routes.find((entry) => entry.src === '/install.ps1');
  assert.equal(windowsRoute?.dest, '/install.ps1');
  assert.match(windowsRoute?.headers?.['Content-Type'] ?? '', /text\/plain/);
  assert.equal(windowsRoute?.headers?.['X-Content-Type-Options'], 'nosniff');
});

test('the installer is valid POSIX shell and points only at the production Connector', () => {
  execFileSync('sh', ['-n', installer.pathname]);
  const source = fs.readFileSync(installer, 'utf8');

  assert.match(source, /https:\/\/mcp\.intelligentgrowth\.app\/mcp/);
  assert.match(source, /mcp-remote@0\.1\.38/);
  assert.doesNotMatch(source, /mcp-remote@latest/);
  assert.doesNotMatch(source, /YOUR_KEY|api[_-]?key|access_token/i);
  assert.doesNotMatch(source, /[\u2013\u2014]/);
  assert.match(source, /Step 1 of 4/);
  assert.match(source, /Step 2 of 4/);
  assert.match(source, /Step 3 of 4/);
  assert.match(source, /Step 4 of 4/);
  assert.match(source, /mcp-remote-client/);
});

test('the PowerShell installer writes the Claude Desktop config without invoking sh', () => {
  const source = fs.readFileSync(windowsInstaller, 'utf8');

  assert.match(source, /\$env:APPDATA/);
  assert.match(source, /claude_desktop_config\.json/);
  assert.match(source, /mcpServers/);
  assert.match(source, /mcp-remote/);
  assert.match(source, /https:\/\/mcp\.intelligentgrowth\.app\/mcp/);
  assert.match(source, /Get-Command\s+node\.exe/);
  assert.match(source, /Get-Command\s+npx\.cmd/);
  assert.match(source, /Read-Host/);
  assert.match(source, /mcp-remote-client/);
  assert.match(source, /mcp-remote@0\.1\.38/);
  assert.doesNotMatch(source, /mcp-remote@latest/);
  assert.doesNotMatch(source, /\|\s*sh\b/);
  assert.doesNotMatch(source, /[\u2013\u2014]/);
});

test('the Desktop installer verifies OAuth with mcp-remote-client before reporting done', () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ig-desktop-auth-'));
  const home = path.join(sandbox, 'home');
  const bin = path.join(sandbox, 'bin');
  const log = path.join(sandbox, 'npx.log');
  const configPath = path.join(home, 'claude_desktop_config.json');
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(bin, { recursive: true });

  const npx = path.join(bin, 'npx');
  fs.writeFileSync(npx, '#!/bin/sh\nprintf \'%s\\n\' "$*" >> "$IG_TEST_LOG"\nexit 0\n');
  fs.chmodSync(npx, 0o755);

  const result = spawnSync('sh', [installer.pathname], {
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: home,
      PATH: `${bin}:${process.env.PATH}`,
      IG_CLAUDE_DESKTOP_CONFIG: configPath,
      IG_RUN_AUTH: '1',
      IG_TEST_LOG: log,
    },
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(fs.readFileSync(log, 'utf8'), /-y -p mcp-remote@0\.1\.38 mcp-remote-client https:\/\/mcp\.intelligentgrowth\.app\/mcp/);
  assert.match(result.stdout, /Step 3 of 4.*sign in/is);
  assert.match(result.stdout, /Step 4 of 4.*Done/s);
});

test('a failed OAuth check keeps the config but never reports Done', () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ig-desktop-auth-failure-'));
  const home = path.join(sandbox, 'home');
  const bin = path.join(sandbox, 'bin');
  const configPath = path.join(home, 'claude_desktop_config.json');
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(bin, { recursive: true });

  const npx = path.join(bin, 'npx');
  fs.writeFileSync(npx, '#!/bin/sh\nexit 7\n');
  fs.chmodSync(npx, 0o755);

  const result = spawnSync('sh', [installer.pathname], {
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: home,
      PATH: `${bin}:${process.env.PATH}`,
      IG_CLAUDE_DESKTOP_CONFIG: configPath,
      IG_RUN_AUTH: '1',
    },
  });

  assert.equal(result.status, 1, result.stdout);
  assert.equal(fs.existsSync(configPath), true);
  assert.doesNotMatch(result.stdout, /Step 4 of 4/);
  assert.match(result.stderr, /Sign-in did not finish/);
});

test('the shell one-liner configures Claude Desktop by default', () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ig-desktop-install-'));
  const home = path.join(sandbox, 'home');
  const bin = path.join(sandbox, 'bin');
  const configPath = path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(bin, { recursive: true });

  const npx = path.join(bin, 'npx');
  fs.writeFileSync(npx, '#!/bin/sh\nexit 0\n');
  fs.chmodSync(npx, 0o755);
  const blockedPython = path.join(bin, 'python3');
  fs.writeFileSync(blockedPython, '#!/bin/sh\nexit 99\n');
  fs.chmodSync(blockedPython, 0o755);

  const result = spawnSync('sh', [installer.pathname], {
    cwd: root.pathname,
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: home,
      PATH: `${bin}:${process.env.PATH}`,
      IG_CLAUDE_DESKTOP_CONFIG: configPath,
    },
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assert.deepEqual(config.mcpServers['intelligent-growth'], {
    command: npx,
    args: ['-y', 'mcp-remote@0.1.38', 'https://mcp.intelligentgrowth.app/mcp'],
  });
  assert.match(result.stdout, /Claude Desktop/);
  assert.match(result.stdout, /fully quit and reopen Claude Desktop/i);
});

test('Claude Desktop configuration is backed up and preserves existing servers', () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ig-desktop-existing-'));
  const home = path.join(sandbox, 'home');
  const bin = path.join(sandbox, 'bin');
  const configPath = path.join(home, 'claude_desktop_config.json');
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ mcpServers: { existing: { command: 'existing-server' } } }));

  const npx = path.join(bin, 'npx');
  fs.writeFileSync(npx, '#!/bin/sh\nexit 0\n');
  fs.chmodSync(npx, 0o755);

  const result = spawnSync('sh', [installer.pathname], {
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: home,
      PATH: `${bin}:${process.env.PATH}`,
      IG_CLAUDE_DESKTOP_CONFIG: configPath,
    },
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const updated = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const backup = JSON.parse(fs.readFileSync(`${configPath}.intelligent-growth-backup`, 'utf8'));
  assert.equal(updated.mcpServers.existing.command, 'existing-server');
  assert.equal(updated.mcpServers['intelligent-growth'].command, npx);
  assert.deepEqual(backup, { mcpServers: { existing: { command: 'existing-server' } } });
});

test('non-interactive installs configure selected CLI and JSON clients without touching the real home', () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ig-install-'));
  const home = path.join(sandbox, 'home');
  const bin = path.join(sandbox, 'bin');
  const log = path.join(sandbox, 'calls.log');
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(bin, { recursive: true });

  for (const command of ['claude']) {
    const fake = path.join(bin, command);
    fs.writeFileSync(fake, `#!/bin/sh\nprintf '%s\\n' \"${command} $*\" >> \"$IG_TEST_LOG\"\n`);
    fs.chmodSync(fake, 0o755);
  }
  const blockedCodex = path.join(bin, 'codex');
  fs.writeFileSync(blockedCodex, '#!/bin/sh\nexit 99\n');
  fs.chmodSync(blockedCodex, 0o755);

  const result = spawnSync('sh', [installer.pathname], {
    cwd: root.pathname,
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: home,
      PATH: `${bin}:${process.env.PATH}`,
      IG_INSTALL_CLIENTS: 'claude,codex,cursor',
      IG_TEST_LOG: log,
    },
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const calls = fs.readFileSync(log, 'utf8');
  assert.match(calls, /claude mcp add -s user --transport http intelligent-growth https:\/\/mcp\.intelligentgrowth\.app\/mcp/);

  const codex = fs.readFileSync(path.join(home, '.codex', 'config.toml'), 'utf8');
  assert.match(codex, /\[mcp_servers\.intelligent-growth\]\nurl = "https:\/\/mcp\.intelligentgrowth\.app\/mcp"/);

  const cursor = JSON.parse(fs.readFileSync(path.join(home, '.cursor', 'mcp.json'), 'utf8'));
  assert.deepEqual(cursor.mcpServers['intelligent-growth'], {
    url: 'https://mcp.intelligentgrowth.app/mcp',
  });
  assert.match(result.stdout, /Installed Intelligent Growth for 3 agents/);
  assert.match(result.stdout, /sign in when your agent opens the browser/i);
});

test('JSON configuration is backed up and unrelated servers are preserved', () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ig-install-existing-'));
  const home = path.join(sandbox, 'home');
  const configPath = path.join(home, '.cursor', 'mcp.json');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ mcpServers: { existing: { url: 'https://example.com/mcp' } } }));

  const result = spawnSync('sh', [installer.pathname], {
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: home,
      IG_INSTALL_CLIENTS: 'cursor',
    },
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const updated = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const backup = JSON.parse(fs.readFileSync(`${configPath}.intelligent-growth-backup`, 'utf8'));
  assert.equal(updated.mcpServers.existing.url, 'https://example.com/mcp');
  assert.equal(updated.mcpServers['intelligent-growth'].url, 'https://mcp.intelligentgrowth.app/mcp');
  assert.deepEqual(backup, { mcpServers: { existing: { url: 'https://example.com/mcp' } } });
  assert.match(result.stdout, /Installed Intelligent Growth for 1 agent\./);
});
