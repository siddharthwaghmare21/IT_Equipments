param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$DotnetArguments
)

$ErrorActionPreference = "Stop"

$dotnetCommand = Get-Command dotnet -ErrorAction SilentlyContinue
$dotnetPath = if ($dotnetCommand) {
  $dotnetCommand.Source
} else {
  Join-Path $env:USERPROFILE ".dotnet\dotnet.exe"
}

if (-not (Test-Path $dotnetPath)) {
  throw ".NET SDK was not found in PATH or $dotnetPath."
}

& $dotnetPath @DotnetArguments
exit $LASTEXITCODE
