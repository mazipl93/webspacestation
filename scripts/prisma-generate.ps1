# Regenerate Prisma Client when Windows EPERM blocks query_engine-windows.dll.node
# Usage: npm run db:prisma-generate

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Stopping Node processes that may lock Prisma query engine..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$clientDir = Join-Path $root "node_modules\.prisma\client"
$engine = Join-Path $clientDir "query_engine-windows.dll.node"

if (Test-Path $engine) {
  try {
    Remove-Item $engine -Force -ErrorAction Stop
    Write-Host "Removed locked query_engine-windows.dll.node"
  } catch {
    Write-Host "Could not remove query engine (still locked). Close Cursor terminals, npm run dev, and Prisma Studio, then retry."
    exit 1
  }
}

Write-Host "Running prisma generate..."
npx prisma generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Done."
