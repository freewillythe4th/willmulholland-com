$ErrorActionPreference = 'Stop'

$mcpUrl = 'https://mcp.intelligentgrowth.app/mcp'
$mcpRemotePackage = 'mcp-remote@0.1.38'
$configDirectory = Join-Path $env:APPDATA 'Claude'
$configPath = Join-Path $configDirectory 'claude_desktop_config.json'
$backupPath = "$configPath.intelligent-growth-backup"
$temporaryPath = "$configPath.intelligent-growth-tmp"

Write-Host ''
Write-Host 'Intelligent Growth'

$interactive = $env:IG_NONINTERACTIVE -ne '1'
if ($interactive) {
    Read-Host 'Step 1 of 4: Press Enter to continue' | Out-Null
    Write-Host ''
    Write-Host 'Step 2 of 4: Choose where to install Intelligent Growth.'
    Write-Host ''
    Write-Host '  1. Claude Desktop'
    Write-Host ''
    $desktopChoice = Read-Host 'Choose [1]'
    if (($desktopChoice -ne '') -and ($desktopChoice -ne '1')) {
        Write-Error 'Choose 1 for Claude Desktop.'
        exit 1
    }
}

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
        args = @('-y', $mcpRemotePackage, $mcpUrl)
    }
    $config.mcpServers | Add-Member -NotePropertyName 'intelligent-growth' -NotePropertyValue $entry -Force

    $json = $config | ConvertTo-Json -Depth 20
    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($temporaryPath, $json + [Environment]::NewLine, $utf8WithoutBom)
    Move-Item $temporaryPath $configPath -Force

    Write-Host 'Ready.' -ForegroundColor Green

    if ($interactive -or ($env:IG_RUN_AUTH -eq '1')) {
        Write-Host ''
        Write-Host 'Step 3 of 4: Sign in through the browser.'
        Write-Host 'A sign-in page will open. When it is finished, return here.'
        Write-Host ''
        & $npxCommand.Source -y -p $mcpRemotePackage 'mcp-remote-client' $mcpUrl
        if ($LASTEXITCODE -ne 0) {
            throw 'Sign-in did not finish. The Connector is configured, so you can restart Claude Desktop to try again.'
        }
        Write-Host ''
        Write-Host 'Step 4 of 4: Done.' -ForegroundColor Green
        Write-Host 'Intelligent Growth is connected to Claude Desktop.'
        Write-Host 'Fully quit Claude Desktop from the system tray, reopen it, then start a new chat.'
    } else {
        Write-Host ''
        Write-Host 'Intelligent Growth is configured for Claude Desktop.'
        Write-Host 'Fully quit Claude Desktop from the system tray, then reopen it.'
        Write-Host 'Your browser will open so you can sign in.'
    }
    Write-Host 'Setup help: https://intelligentgrowth.app/mcp/start'
    Write-Host ''
} catch {
    if (Test-Path $temporaryPath) {
        Remove-Item $temporaryPath -Force
    }
    Write-Error $_.Exception.Message
    exit 1
}
