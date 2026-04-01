$ErrorActionPreference = 'Stop'

$rootDir = Resolve-Path (Join-Path $PSScriptRoot '..')
$sourceDir = Join-Path $rootDir 'node_modules/@vant/weapp/dist'
$targetDirs = @(
  (Join-Path $rootDir 'wxcomponents/vant'),
  (Join-Path $rootDir 'src/wxcomponents/vant')
)

if (-not (Test-Path $sourceDir)) {
  throw "Missing node_modules/@vant/weapp/dist. Install dependencies first."
}

foreach ($targetDir in $targetDirs) {
  New-Item -ItemType Directory -Force $targetDir | Out-Null
  Copy-Item -Path (Join-Path $sourceDir '*') -Destination $targetDir -Recurse -Force
}

Write-Output ("Synced Vant Weapp assets to: " + ($targetDirs -join ", "))
