param(
  [string]$CsvPath = "d:\Siddharth\Next JS Projects\IT_Equipments Data Files\Assets Data - Copy.csv",
  [switch]$Apply,
  [string]$MySqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
  [string]$HostName = "localhost",
  [int]$Port = 3306,
  [string]$Database = "it_equipment_management_smkc",
  [string]$User = "Siddharth",
  [switch]$ResetImported
)

$ErrorActionPreference = "Stop"

function ConvertTo-Count([object]$Value) {
  $text = [string]$Value
  if ([string]::IsNullOrWhiteSpace($text)) { return 0 }
  $trimmed = $text.Trim()
  if ($trimmed -match "^\d+$") { return [int]$trimmed }
  throw "Invalid numeric value '$text'."
}

function ConvertTo-SlugPart([string]$Value) {
  $upper = $Value.Trim().ToUpperInvariant()
  $upper = $upper -replace "&", " AND "
  $upper = $upper -replace "[^A-Z0-9]+", "-"
  $upper = $upper.Trim("-")
  if ($upper) { return $upper }
  return "UNKNOWN"
}

function Get-DepartmentShortBase([string]$Department) {
  $slug = ConvertTo-SlugPart $Department
  $parts = @($slug -split "-" | Where-Object { $_ -and $_ -notin @("AND", "NO", "NUMBER", "DEPARTMENT", "DEPARMENT") })
  if ($parts.Count -eq 0) { return $slug }
  return $parts[0]
}

function ConvertTo-AssetTypeCode([string]$Category) {
  return (ConvertTo-SlugPart $Category)
}

function Limit-Code([string]$Value, [int]$MaxLength = 50) {
  if ($Value.Length -le $MaxLength) { return $Value }
  $sha1 = [System.Security.Cryptography.SHA1]::Create()
  try {
    $hashBytes = $sha1.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Value))
  }
  finally {
    $sha1.Dispose()
  }
  $hash = -join ($hashBytes[0..2] | ForEach-Object { $_.ToString("x2") })
  return ($Value.Substring(0, $MaxLength - 7).TrimEnd("-") + "-" + $hash).ToUpperInvariant()
}

function Escape-Sql([object]$Value) {
  if ($null -eq $Value) { return "NULL" }
  $text = [string]$Value
  if ([string]::IsNullOrWhiteSpace($text)) { return "NULL" }
  return "'" + ($text -replace "\\", "\\\\" -replace "'", "''") + "'"
}

function New-AssetRecord(
  [string]$DepartmentCode,
  [string]$DepartmentShort,
  [string]$Location,
  [string]$Department,
  [hashtable]$Type,
  [int]$Index
) {
  $assetType = ConvertTo-AssetTypeCode $Type.Category
  $tag = "{0}-{1:D4}" -f $assetType, $Index
  $details = @(
    "Source column: $($Type.Column)",
    "Original department: $Department",
    "Original location: $Location"
  ) -join "; "

  return [pscustomobject]@{
    DepartmentCode = $DepartmentCode
    AssetTag = $tag
    AssetName = $Type.AssetName
    Category = $Type.Category
    Brand = $Type.Brand
    Model = $Type.Model
    SerialNumber = $tag
    Location = $Location
    Specifications = $Type.Specifications
    Remarks = $details
  }
}

if (-not (Test-Path $CsvPath)) {
  throw "CSV file not found: $CsvPath"
}

$assetTypes = @(
  @{ Column = "Dell"; Category = "Desktop"; Brand = "Dell"; Model = $null; AssetName = "Dell Desktop"; Specifications = "Desktop CPU from source summary" },
  @{ Column = "Lenovo"; Category = "Desktop"; Brand = "Lenovo"; Model = $null; AssetName = "Lenovo Desktop"; Specifications = "Desktop CPU from source summary" },
  @{ Column = "HP CPU"; Category = "Desktop"; Brand = "HP"; Model = "CPU"; AssetName = "HP Desktop"; Specifications = "CPU from source summary" },
  @{ Column = "HP AIO"; Category = "Desktop"; Brand = "HP"; Model = "AIO"; AssetName = "HP AIO Desktop"; Specifications = "AIO desktop from source summary" },
  @{ Column = "Laptop"; Category = "Laptop"; Brand = $null; Model = $null; AssetName = "Laptop"; Specifications = "Laptop from source summary" },
  @{ Column = "Asus AIO"; Category = "Desktop"; Brand = "Asus"; Model = "AIO"; AssetName = "Asus AIO Desktop"; Specifications = "AIO desktop from source summary" },
  @{ Column = "Dell AIO"; Category = "Desktop"; Brand = "Dell"; Model = "AIO"; AssetName = "Dell AIO Desktop"; Specifications = "AIO desktop from source summary" },
  @{ Column = "Acer AIO"; Category = "Desktop"; Brand = "Acer"; Model = "AIO"; AssetName = "Acer AIO Desktop"; Specifications = "AIO desktop from source summary" },
  @{ Column = "M-105"; Category = "Printer"; Brand = $null; Model = "M-105"; AssetName = "M-105 Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "M-205"; Category = "Printer"; Brand = $null; Model = "M-205"; AssetName = "M-205 Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "LX-310"; Category = "Printer"; Brand = $null; Model = "LX-310"; AssetName = "LX-310 Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "Epson M-50"; Category = "Printer"; Brand = "Epson"; Model = "M-50"; AssetName = "Epson M-50 Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "Epson Color "; Category = "Printer"; Brand = "Epson"; Model = "Color"; AssetName = "Epson Color Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "Xerox WorkCentre"; Category = "Printer"; Brand = "Xerox"; Model = "WorkCentre"; AssetName = "Xerox WorkCentre Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "Epson M-1120"; Category = "Printer"; Brand = "Epson"; Model = "M-1120"; AssetName = "Epson M-1120 Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "Epson M-200"; Category = "Printer"; Brand = "Epson"; Model = "M-200"; AssetName = "Epson M-200 Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "Epson L-6460"; Category = "Printer"; Brand = "Epson"; Model = "L-6460"; AssetName = "Epson L-6460 Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "Epson M-2170"; Category = "Printer"; Brand = "Epson"; Model = "M-2170"; AssetName = "Epson M-2170 Printer"; Specifications = "Printer model from source summary" },
  @{ Column = "Cannon Printer"; Category = "Printer"; Brand = "Canon"; Model = $null; AssetName = "Canon Printer"; Specifications = "Printer from source summary; source column spells Canon as Cannon" },
  @{ Column = "Projector"; Category = "Projector"; Brand = $null; Model = $null; AssetName = "Projector"; Specifications = "Projector from source summary" },
  @{ Column = "Walky Talky"; Category = "Walky Talky"; Brand = $null; Model = $null; AssetName = "Walky Talky"; Specifications = "Walky Talky from source summary" }
)

$rawRows = Import-Csv -Path $CsvPath
$sourceRows = @(
  $rawRows | Where-Object {
    -not [string]::IsNullOrWhiteSpace($_.Location) -and
    -not [string]::IsNullOrWhiteSpace($_.Department) -and
    $_.Department.Trim().ToUpperInvariant() -ne "TOTAL"
  }
)

$groupMap = [ordered]@{}
foreach ($row in $sourceRows) {
  $key = ($row.Location.Trim() + "|" + $row.Department.Trim()).ToUpperInvariant()
  if (-not $groupMap.Contains($key)) {
    $groupMap[$key] = @()
  }
  $groupMap[$key] = @($groupMap[$key]) + $row
}

$departments = @()
$departmentSequence = 0
foreach ($key in $groupMap.Keys) {
  $rows = @($groupMap[$key])
  $first = $rows[0]
  $location = $first.Location.Trim()
  $department = $first.Department.Trim()
  $departmentSequence++
  $departmentName = $department
  $departmentCode = "{0:D4}" -f $departmentSequence
  $demand = 0
  foreach ($row in $rows) {
    $demand += ConvertTo-Count $row.Demand
  }

  $departments += [pscustomobject]@{
    Code = $departmentCode
    Name = $departmentName
    Location = $location
    OriginalDepartment = $department
    Demand = $demand
    Rows = $rows
    ShortBase = Get-DepartmentShortBase $department
  }
}

foreach ($department in $departments) {
  $department | Add-Member -NotePropertyName Short -NotePropertyValue $department.ShortBase
}

$assets = @()
$tagCounters = @{}
foreach ($department in $departments) {
  foreach ($type in $assetTypes) {
    $count = 0
    foreach ($row in $department.Rows) {
      $count += ConvertTo-Count $row.($type.Column)
    }

    for ($i = 0; $i -lt $count; $i++) {
      $categoryKey = $type.Category.ToUpperInvariant()
      if (-not $tagCounters.ContainsKey($categoryKey)) {
        $tagCounters[$categoryKey] = 0
      }
      $tagCounters[$categoryKey]++
      $assets += New-AssetRecord $department.Code $department.Short $department.Location $department.OriginalDepartment $type $tagCounters[$categoryKey]
    }
  }
}

$categorySummary = $assets | Group-Object Category | Sort-Object Name | ForEach-Object {
  [pscustomobject]@{ Category = $_.Name; Count = $_.Count }
}

$locationSummary = $departments | Group-Object Location | Sort-Object Name | ForEach-Object {
  [pscustomobject]@{ Location = $_.Name; Departments = $_.Count }
}

Write-Host ""
Write-Host "CSV import dry-run summary"
Write-Host "--------------------------"
Write-Host "CSV path: $CsvPath"
Write-Host "Valid CSV rows: $($sourceRows.Count)"
Write-Host "Departments to upsert: $($departments.Count)"
Write-Host "Demand records to upsert: $($departments.Count)"
Write-Host "Assets to upsert: $($assets.Count)"
Write-Host "Apply mode: $($Apply.IsPresent)"
Write-Host "Reset imported rows: $($ResetImported.IsPresent)"
Write-Host ""
Write-Host "Departments by location:"
$locationSummary | Format-Table -AutoSize
Write-Host "Assets by category:"
$categorySummary | Format-Table -AutoSize
Write-Host "Sample asset tags:"
$assets | Select-Object -First 12 AssetTag, AssetName, Category, Brand, Model | Format-Table -AutoSize

$sql = New-Object System.Collections.Generic.List[string]
$sql.Add("USE ``$Database``;")
$sql.Add("START TRANSACTION;")

if ($ResetImported) {
  $sql.Add(@"
DELETE FROM assets
WHERE remarks LIKE '%Source column:%Original department:%Original location:%';

DELETE dd
FROM department_demands dd
INNER JOIN departments d ON d.department_id = dd.department_id
WHERE dd.source = 'Assets Data CSV'
   OR d.description LIKE 'Imported from Assets Data CSV.%';

DELETE FROM departments
WHERE description LIKE 'Imported from Assets Data CSV.%';
"@)
}

foreach ($department in $departments) {
  $sql.Add(@"
INSERT INTO departments (
  department_code, department_name, location, description, is_active
) VALUES (
  $(Escape-Sql $department.Code),
  $(Escape-Sql $department.Name),
  $(Escape-Sql $department.Location),
  $(Escape-Sql ("Imported from Assets Data CSV. Original department: " + $department.OriginalDepartment)),
  TRUE
)
ON DUPLICATE KEY UPDATE
  department_name = VALUES(department_name),
  location = VALUES(location),
  description = VALUES(description),
  is_active = TRUE;
"@)

  $sql.Add(@"
INSERT INTO department_demands (
  department_id, demand_count, source, remarks
) VALUES (
  (SELECT department_id FROM departments WHERE department_code = $(Escape-Sql $department.Code)),
  $($department.Demand),
  'Assets Data CSV',
  $(Escape-Sql ("Demand imported from source rows for " + $department.OriginalDepartment + ", " + $department.Location))
)
ON DUPLICATE KEY UPDATE
  demand_count = VALUES(demand_count),
  source = VALUES(source),
  remarks = VALUES(remarks);
"@)
}

foreach ($asset in $assets) {
  $sql.Add(@"
INSERT INTO assets (
  asset_tag, asset_name, category, brand, model, serial_number,
  custodian_department_id, current_department_id, location,
  asset_condition, lifecycle_status, asset_status,
  specifications, remarks
) VALUES (
  $(Escape-Sql $asset.AssetTag),
  $(Escape-Sql $asset.AssetName),
  $(Escape-Sql $asset.Category),
  $(Escape-Sql $asset.Brand),
  $(Escape-Sql $asset.Model),
  $(Escape-Sql $asset.SerialNumber),
  (SELECT department_id FROM departments WHERE department_code = $(Escape-Sql $asset.DepartmentCode)),
  (SELECT department_id FROM departments WHERE department_code = $(Escape-Sql $asset.DepartmentCode)),
  $(Escape-Sql $asset.Location),
  'Working',
  'In Use',
  'Delivered',
  $(Escape-Sql $asset.Specifications),
  $(Escape-Sql $asset.Remarks)
)
ON DUPLICATE KEY UPDATE
  asset_name = VALUES(asset_name),
  category = VALUES(category),
  brand = VALUES(brand),
  model = VALUES(model),
  custodian_department_id = VALUES(custodian_department_id),
  current_department_id = VALUES(current_department_id),
  location = VALUES(location),
  asset_condition = VALUES(asset_condition),
  lifecycle_status = VALUES(lifecycle_status),
  asset_status = VALUES(asset_status),
  specifications = VALUES(specifications),
  remarks = VALUES(remarks);
"@)
}

$sql.Add("COMMIT;")

$outputDir = Join-Path (Split-Path $PSScriptRoot -Parent) "tmp"
New-Item -ItemType Directory -Force $outputDir | Out-Null
$sqlPath = Join-Path $outputDir "assets-data-import.sql"
[System.IO.File]::WriteAllText($sqlPath, ($sql -join [Environment]::NewLine), [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "Generated SQL: $sqlPath"

if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. To apply after review, rerun with -Apply."
  return
}

if (-not (Test-Path $MySqlExe)) {
  throw "mysql.exe not found: $MySqlExe"
}

$password = $env:MYSQL_PWD
if ([string]::IsNullOrWhiteSpace($password)) {
  $securePassword = Read-Host "MySQL password for user '$User'" -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

$startInfo = [System.Diagnostics.ProcessStartInfo]::new()
$startInfo.FileName = $MySqlExe
$startInfo.Arguments = "--protocol=TCP --host=$HostName --port=$Port --user=$User --default-character-set=utf8mb4 --batch"
$startInfo.UseShellExecute = $false
$startInfo.RedirectStandardInput = $true
$startInfo.RedirectStandardOutput = $true
$startInfo.RedirectStandardError = $true
$startInfo.CreateNoWindow = $true
$startInfo.Environment["MYSQL_PWD"] = $password

$process = [System.Diagnostics.Process]::Start($startInfo)
$process.StandardInput.Write([System.IO.File]::ReadAllText($sqlPath))
$process.StandardInput.Close()
$stdout = $process.StandardOutput.ReadToEnd()
$stderr = $process.StandardError.ReadToEnd()
$process.WaitForExit()

if ($process.ExitCode -ne 0) {
  throw "MySQL import failed: $stderr"
}

if (-not [string]::IsNullOrWhiteSpace($stdout)) {
  Write-Host $stdout
}

Write-Host "Import completed successfully."
