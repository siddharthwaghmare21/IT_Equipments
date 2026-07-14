$ErrorActionPreference = "Stop"

$projectRoot = Split-Path $PSScriptRoot -Parent
$mysqlHome = "C:\Program Files\MySQL\MySQL Server 8.4"
$mysqlBin = Join-Path $mysqlHome "bin"
$mysqld = Join-Path $mysqlBin "mysqld.exe"
$mysql = Join-Path $mysqlBin "mysql.exe"
$configDir = "C:\ProgramData\MySQL\MySQL Server 8.4"
$dataDir = Join-Path $configDir "Data"
$config = Join-Path $configDir "my.ini"
$statusFile = Join-Path $projectRoot ".mysql-setup-status"

try {
  New-Item -ItemType Directory -Force $configDir | Out-Null
  Copy-Item (Join-Path $projectRoot "database\mysql-local.ini") $config -Force

  if (-not (Test-Path (Join-Path $dataDir "mysql"))) {
    New-Item -ItemType Directory -Force $dataDir | Out-Null
    & $mysqld "--defaults-file=$config" --initialize-insecure
    if ($LASTEXITCODE -ne 0) { throw "MySQL data initialization failed." }
  }

  if (-not (Get-Service MySQL84 -ErrorAction SilentlyContinue)) {
    & $mysqld --install MySQL84 "--defaults-file=$config"
    if ($LASTEXITCODE -ne 0) { throw "MySQL service installation failed." }
  }

  Set-Service MySQL84 -StartupType Automatic
  Start-Service MySQL84

  function Invoke-MySqlInput([string]$Sql, [string]$Password = "") {
    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $mysql
    $startInfo.Arguments = "--protocol=TCP --host=localhost --port=3306 --user=root --batch"
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardInput = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true
    if ($Password) { $startInfo.Environment["MYSQL_PWD"] = $Password }

    $process = [System.Diagnostics.Process]::Start($startInfo)
    $process.StandardInput.Write($Sql)
    $process.StandardInput.Close()
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) { throw "MySQL command failed: $stderr" }
    return $stdout
  }

  $alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#%_-"
  $rootPassword = -join (1..32 | ForEach-Object { $alphabet[(Get-Random -Maximum $alphabet.Length)] })
  $appPassword = -join (1..32 | ForEach-Object { $alphabet[(Get-Random -Maximum $alphabet.Length)] })
  $jwtKey = -join (1..64 | ForEach-Object { $alphabet[(Get-Random -Maximum $alphabet.Length)] })
  $setupKey = -join (1..40 | ForEach-Object { $alphabet[(Get-Random -Maximum $alphabet.Length)] })

  $bootstrapSql = "ALTER USER 'root'@'localhost' IDENTIFIED BY '$rootPassword'; CREATE USER IF NOT EXISTS 'Siddharth'@'localhost' IDENTIFIED BY '$appPassword'; ALTER USER 'Siddharth'@'localhost' IDENTIFIED BY '$appPassword';"
  Invoke-MySqlInput $bootstrapSql | Out-Null

  Get-ChildItem (Join-Path $projectRoot "database\smkc\*.sql") |
    Sort-Object Name |
    ForEach-Object { Invoke-MySqlInput (Get-Content $_.FullName -Raw) $rootPassword | Out-Null }

  $dotnet = Join-Path $env:USERPROFILE ".dotnet\dotnet.exe"
  $backendProject = Join-Path $projectRoot "backend\ITEquipment.Api\ITEquipment.Api.csproj"
  $connectionString = "Server=localhost;Port=3306;Database=it_equipment_management_smkc;User=Siddharth;Password=$appPassword;"
  & $dotnet user-secrets set "ConnectionStrings:DefaultConnection" $connectionString --project $backendProject | Out-Null
  & $dotnet user-secrets set "Jwt:SigningKey" $jwtKey --project $backendProject | Out-Null
  & $dotnet user-secrets set "Bootstrap:SetupKey" $setupKey --project $backendProject | Out-Null

  $secretDir = Join-Path $env:LOCALAPPDATA "ITEquipment"
  New-Item -ItemType Directory -Force $secretDir | Out-Null
  ConvertTo-SecureString $rootPassword -AsPlainText -Force |
    Export-Clixml (Join-Path $secretDir "mysql-root-password.clixml")

  [Environment]::SetEnvironmentVariable("MYSQL_HOME", $configDir, "User")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if (($userPath -split ";") -notcontains $mysqlBin) {
    [Environment]::SetEnvironmentVariable("Path", ($userPath.TrimEnd(";") + ";" + $mysqlBin), "User")
  }

  Set-Content $statusFile "SUCCESS"
}
catch {
  Set-Content $statusFile ("FAILED: " + $_.Exception.Message)
  throw
}
