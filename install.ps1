$ErrorActionPreference = 'Stop'

$mcpUrl = 'https://mcp.intelligentgrowth.app/mcp'
$configDirectory = Join-Path $env:APPDATA 'Claude'
$configPath = Join-Path $configDirectory 'claude_desktop_config.json'
$backupPath = "$configPath.intelligent-growth-backup"
$temporaryPath = "$configPath.intelligent-growth-tmp"

Write-Host ''
Write-Host 'Intelligent Growth'
Write-Host 'Configuring Claude Desktop...'

try {
    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    $npxCommand = Get-Command npx.cmd -ErrorAction SilentlyContinue | Select-Object -First 1
    if (($null -eq $nodeCommand) -or ($null -eq $npxCommand)) {
        throw 'Node.js 18 or newer is required. Install it from https://nodejs.org and run this command again.'
    }
    $nodeMajor = [int]((& $nodeCommand.Source --version).TrimStart('v').Split('.')[0])
    if ($nodeMajor -lt 18) {
        throw 'Node.js 18 or newer is required. Update it from https://nodejs.org and run this command again.'
    }

    New-Item -ItemType Directory -Path $configDirectory -Force | Out-Null

    if ((Test-Path $configPath) -and ((Get-Item $configPath).Length -gt 0)) {
        if (-not (Test-Path $backupPath)) {
            Copy-Item $configPath $backupPath
        }
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
    } else {
        $config = [PSCustomObject]@{}
    }

    if ($null -eq $config.mcpServers) {
        $config | Add-Member -NotePropertyName 'mcpServers' -NotePropertyValue ([PSCustomObject]@{}) -Force
    }

    $entry = [PSCustomObject]@{
        command = $npxCommand.Source
        args = @('-y', 'mcp-remote', $mcpUrl)
    }
    $config.mcpServers | Add-Member -NotePropertyName 'intelligent-growth' -NotePropertyValue $entry -Force

    $json = $config | ConvertTo-Json -Depth 20
    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($temporaryPath, $json + [Environment]::NewLine, $utf8WithoutBom)
    Move-Item $temporaryPath $configPath -Force

    Write-Host 'Ready.' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Intelligent Growth is configured for Claude Desktop.'
    Write-Host 'Fully quit Claude Desktop from the system tray, then reopen it.'
    Write-Host 'Your browser will open so you can sign in.'
    Write-Host 'Setup help: https://intelligentgrowth.app/mcp/start'
    Write-Host ''
} catch {
    if (Test-Path $temporaryPath) {
        Remove-Item $temporaryPath -Force
    }
    Write-Error $_.Exception.Message
    exit 1
}
