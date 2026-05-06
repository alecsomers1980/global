# Extract all daily sheet data from Exec-Air Excel and output JSON
param(
  [string]$OutFile = "scripts\enquiries-data.json"
)

Add-Type -AssemblyName System.IO.Compression.FileSystem
$path = "$PSScriptRoot\..\public\docs\Execair_Daily_Enquiries_April_2026_Branded.xlsx"

if (-not (Test-Path $path)) {
  Write-Error "Excel file not found at $path"
  exit 1
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($path)

# Parse shared strings
$strings = @()
$ss = $zip.GetEntry("xl/sharedStrings.xml")
$s = $ss.Open(); $r = New-Object System.IO.StreamReader($s); $xml = $r.ReadToEnd(); $r.Close()
$tMatches = [regex]::Matches($xml, '<t[^>]*>([^<]*)</t>')
foreach ($m in $tMatches) { $strings += $m.Groups[1].Value }

# Excel date serial to ISO date
function ExcelToDate($serial) {
  if (-not $serial) { return $null }
  if ($serial -eq "–" -or $serial -eq "-") { return $null }
  try {
    $num = [double]$serial
    if ($num -lt 40000) { return $null }
    $utcDays = [Math]::Floor($num) - 25569
    $date = [DateTime]::new(1970, 1, 1, 0, 0, 0, [DateTimeKind]::Utc).AddDays($utcDays)
    return $date.ToString("yyyy-MM-dd")
  } catch {
    return $null
  }
}

# Parse a sheet
function Get-SheetRows($sheetNum) {
  $entry = $zip.GetEntry("xl/worksheets/sheet$sheetNum.xml")
  if (-not $entry) { return @() }
  $st = $entry.Open(); $rd = New-Object System.IO.StreamReader($st); $xml = $rd.ReadToEnd(); $rd.Close()

  $rows = @()
  $rowMatches = [regex]::Matches($xml, '<row[^>]*r="(\d+)"[^>]*>(.*?)</row>', [System.Text.RegularExpressions.RegexOptions]::Singleline)

  foreach ($rm in $rowMatches) {
    $rowNum = [int]$rm.Groups[1].Value
    $rowXml = $rm.Groups[2].Value

    # Skip header rows (1-5) and empty rows
    if ($rowNum -le 5) { continue }

    $cells = @{}
    # Match each cell tag individually, then extract attributes from the full tag
    $cellTagRegex = '<c[^>]*>.*?</c>'
    $cellTagMatches = [regex]::Matches($rowXml, $cellTagRegex)

    foreach ($ctm in $cellTagMatches) {
      $cellTag = $ctm.Value

      # Extract cell reference
      $refMatch = [regex]::Match($cellTag, 'r="([A-Z]+)(\d+)"')
      if (-not $refMatch.Success) { continue }
      $col = $refMatch.Groups[1].Value

      # Check if it's a shared string
      $isString = $cellTag -match '\st="s"'

      # Extract value
      $vMatch = [regex]::Match($cellTag, '<v>([^<]*)</v>')
      if (-not $vMatch.Success) { continue }
      $rawVal = $vMatch.Groups[1].Value

      $val = $rawVal
      if ($isString -and $rawVal -ne $null) {
        $idx = [int]$rawVal
        if ($idx -lt $strings.Count) { $val = $strings[$idx] }
      }

      # Convert date columns
      if (($col -eq "G" -or $col -eq "H") -and $rawVal) {
        $dateVal = ExcelToDate $rawVal
        if ($dateVal) { $val = $dateVal }
      }

      $cells[$col] = $val
    }

    # Only include rows that have a customer name (column B)
    if ($cells.ContainsKey("B") -and $cells["B"] -and $cells["B"].ToString().Trim() -ne "") {
      $rows += @{
        Row = $rowNum
        Cells = $cells
      }
    }
  }
  return $rows
}

# Map status
function Map-Status($s) {
  if (-not $s) { return "new" }
  $str = $s.ToString().ToLower()
  if ($str -match "confirmed") { return "confirmed" }
  if ($str -match "warm") { return "warm_lead" }
  if ($str -match "hold") { return "on_hold" }
  if ($str -match "no answer|no_answer|lost|not") { return "no_answer" }
  if ($str -match "new") { return "new" }
  return "new"
}

function Map-Priority($p) {
  if (-not $p) { return "standard" }
  if ($p.ToString().ToLower() -match "high") { return "high" }
  return "standard"
}

# Process all daily sheets (2-23)
$allEnquiries = @()
$sheetDates = @{}
$sheetNum = 2

# Get sheet names from workbook
$wbEntry = $zip.GetEntry("xl/workbook.xml")
$ws = $wbEntry.Open(); $wr = New-Object System.IO.StreamReader($ws); $wbXml = $wr.ReadToEnd(); $wr.Close()
$nameMatches = [regex]::Matches($wbXml, '<sheet name="([^"]+)"')
$sheetNames = @()
foreach ($nm in $nameMatches) { $sheetNames += $nm.Groups[1].Value }

# Map sheet numbers to dates from the daily sheet descriptions
for ($i = 1; $i -lt $sheetNames.Count; $i++) {
  $name = $sheetNames[$i]
  if ($name -match '^(\d{2})(\d{2})(\d{4})$') {
    $dd = $Matches[1]; $mm = $Matches[2]; $yyyy = $Matches[3]
    $sheetDates[$i + 1] = "$yyyy-$mm-$dd"
  }
}

Write-Output "Processing $(($sheetNames.Count - 2)) daily sheets..."

for ($sheetNum = 2; $sheetNum -le 23; $sheetNum++) {
  $sheetDate = $sheetDates[$sheetNum]
  $rows = Get-SheetRows $sheetNum

  foreach ($row in $rows) {
    $c = $row.Cells

    # Skip rows without customer name
    if (-not $c["B"]) { continue }

    $enquiryDate = if ($c["G"]) { $c["G"].ToString() } else { $sheetDate }
    $followUpDate = if ($c["H"]) { $c["H"].ToString() } else { $null }

    # Parse quote value from column L
    $quoteValue = 0
    if ($c["L"] -and $c["L"] -match '[\d]+') {
      $qv = $c["L"].ToString() -replace '[^\d.]', ''
      [double]::TryParse($qv, [ref]$quoteValue) | Out-Null
    }

    $enquiry = @{
      customer_name   = $c["B"].ToString().Trim()
      company         = if ($c["C"]) { $c["C"].ToString().Trim() } else { "" }
      phone           = ""
      email           = ""
      enquiry_details = if ($c["D"]) { $c["D"].ToString().Trim() } else { "" }
      quote_value     = $quoteValue
      status          = Map-Status ($c["J"])
      priority        = Map-Priority ($c["K"])
      follow_up_date  = $followUpDate
      notes           = if ($c["N"]) { $c["N"].ToString().Trim() } else { "" }
      created_at      = if ($enquiryDate) { "${enquiryDate}T08:00:00+02:00" } else { (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK") }
    }
    $allEnquiries += $enquiry
  }
}

$zip.Dispose()

# Output JSON
$outPath = Join-Path $PSScriptRoot "enquiries-data.json"
$allEnquiries | ConvertTo-Json -Depth 5 | Set-Content -Path $outPath -Encoding UTF8

Write-Output "Extracted $($allEnquiries.Count) enquiries from $($sheetNames.Count - 2) daily sheets"
Write-Output "Saved to: $outPath"
