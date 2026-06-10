# Sync FACEBOOK_* from .env.fb.test to Vercel production (no token output).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$vars = @{}
Get-Content ".env.fb.test" | ForEach-Object {
  if ($_ -match '^([^=]+)=(.*)$') { $vars[$Matches[1]] = $Matches[2] }
}

$keys = @(
  "FACEBOOK_AUTO_POST",
  "FACEBOOK_PAGE_ID",
  "FACEBOOK_GRAPH_VERSION",
  "FACEBOOK_PAGE_ACCESS_TOKEN"
)

foreach ($key in $keys) {
  if (-not $vars[$key]) { throw "Missing $key in .env.fb.test" }
  Write-Host "Updating $key on Vercel production..."
  vercel env rm $key production --yes 2>$null
  $vars[$key] | vercel env add $key production
}

Write-Host "Done. Redeploy with: vercel --prod --yes"
