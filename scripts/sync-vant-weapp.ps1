$ErrorActionPreference = 'Stop'

$rootDir = Resolve-Path (Join-Path $PSScriptRoot '..')
$sourceDir = Join-Path $rootDir 'node_modules/@vant/weapp/dist'
$pagesConfigPath = Join-Path $rootDir 'src/pages.json'
$targetDirs = @(
  (Join-Path $rootDir 'wxcomponents/vant'),
  (Join-Path $rootDir 'src/wxcomponents/vant')
)
$infraDirs = @('common', 'mixins', 'wxs')

if (-not (Test-Path $sourceDir)) {
  throw "Missing node_modules/@vant/weapp/dist. Install dependencies first."
}

if (-not (Test-Path $pagesConfigPath)) {
  throw "Missing src/pages.json."
}

$pagesConfig = Get-Content $pagesConfigPath -Raw | ConvertFrom-Json
$seedComponents = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$queued = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$visited = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$queue = [System.Collections.Generic.Queue[string]]::new()

function Add-SeedFromStyle($style) {
  if ($null -eq $style -or $null -eq $style.usingComponents) {
    return
  }

  foreach ($property in $style.usingComponents.PSObject.Properties) {
    $componentPath = [string]$property.Value
    if ($componentPath -match '^/wxcomponents/vant/([^/]+)/index$') {
      [void]$seedComponents.Add($Matches[1])
    }
  }
}

function Add-ToQueue([string]$name) {
  if ([string]::IsNullOrWhiteSpace($name)) {
    return
  }

  if ($queued.Add($name)) {
    $queue.Enqueue($name)
  }
}

Add-SeedFromStyle $pagesConfig.globalStyle
foreach ($page in @($pagesConfig.pages)) {
  Add-SeedFromStyle $page.style
}
foreach ($subPackage in @($pagesConfig.subPackages)) {
  foreach ($page in @($subPackage.pages)) {
    Add-SeedFromStyle $page.style
  }
}

if ($seedComponents.Count -eq 0) {
  throw "No Vant components found in pages.json usingComponents."
}

foreach ($name in $seedComponents) {
  Add-ToQueue $name
}

while ($queue.Count -gt 0) {
  $componentName = $queue.Dequeue()
  if ($visited.Contains($componentName)) {
    continue
  }
  [void]$visited.Add($componentName)

  $componentPath = Join-Path $sourceDir $componentName
  if (-not (Test-Path $componentPath)) {
    throw "Missing Vant component directory: $componentName"
  }

  $componentConfigPath = Join-Path $componentPath 'index.json'
  if (-not (Test-Path $componentConfigPath)) {
    continue
  }

  $componentConfig = Get-Content $componentConfigPath -Raw | ConvertFrom-Json
  if ($null -eq $componentConfig.usingComponents) {
    continue
  }

  foreach ($property in $componentConfig.usingComponents.PSObject.Properties) {
    $ref = [string]$property.Value

    if ($ref -match '^/wxcomponents/vant/([^/]+)/index$') {
      Add-ToQueue $Matches[1]
      continue
    }

    if ($ref -match '^\.\./([^/]+)/index$') {
      Add-ToQueue $Matches[1]
      continue
    }

    if ($ref -match '^\.\./([^/]+)$') {
      Add-ToQueue $Matches[1]
      continue
    }

    if ($ref -match '^\.\/([^/]+)/index$') {
      Add-ToQueue $Matches[1]
      continue
    }

    if ($ref -match '^\.\/([^/]+)$') {
      Add-ToQueue $Matches[1]
      continue
    }
  }
}

$copyDirs = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($name in $visited) {
  [void]$copyDirs.Add($name)
}
foreach ($name in $infraDirs) {
  [void]$copyDirs.Add($name)
}

foreach ($targetDir in $targetDirs) {
  New-Item -ItemType Directory -Force $targetDir | Out-Null
  if ((Get-ChildItem -Path $targetDir | Measure-Object).Count -gt 0) {
    Get-ChildItem -Path $targetDir | Remove-Item -Recurse -Force
  }

  foreach ($componentDir in ($copyDirs | Sort-Object)) {
    $sourcePath = Join-Path $sourceDir $componentDir
    if (-not (Test-Path $sourcePath)) {
      throw "Missing Vant component directory: $componentDir"
    }

    Copy-Item -Path $sourcePath -Destination $targetDir -Recurse -Force
  }
}

Write-Output ("Synced Vant components: " + (($visited | Sort-Object) -join ", "))
Write-Output ("Synced lightweight Vant Weapp assets to: " + ($targetDirs -join ", "))
