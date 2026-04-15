
$user = "alecs@precisionmedia.co.za"
$pass = "Jaco@2024"
$pair = $user + ":" + $pass
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)
$headers = @{ "Authorization" = "Basic $base64" }

try {
    $response = Invoke-RestMethod -Uri "https://services.exdev.autotrader.co.za/api/syndication/v1.0/listings" -Headers $headers -Method Get
    Write-Host "SUCCESS"
    $response | ConvertTo-Json
} catch {
    Write-Host "FAILURE"
    $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd()
    }
}
