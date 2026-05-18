$ErrorActionPreference = "Stop"

if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
      $parts = $line -split "=", 2
      [Environment]::SetEnvironmentVariable($parts[0], $parts[1], "Process")
    }
  }
}

npm run dev
