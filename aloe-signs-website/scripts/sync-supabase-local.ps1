#!/usr/bin/env pwsh
# ============================================================
# Aloe Signs – rclone Sync Script
# Syncs new client uploads FROM Supabase to a local Windows folder.
# When files are MOVED OUT of the local folder, they are automatically
# DELETED from Supabase (conserving cloud storage space).
#
# HOW IT WORKS:
#   rclone "sync" makes the SOURCE match the DESTINATION.
#   But here we REVERSE it: we sync the LOCAL folder → Supabase.
#   This means if a file is removed locally, it will be removed from Supabase.
#
# SETUP:
#   1. Install rclone: https://rclone.org/downloads/
#   2. Run: rclone config
#      - Choose: New Remote
#      - Name: supabase-aloe
#      - Type: s3
#      - Provider: Other
#      - Access Key ID: (from Supabase → Settings → Storage → S3 credentials)
#      - Secret Access Key: (same page)
#      - Endpoint: https://lsvqqnfpikamtovursxy.supabase.co/storage/v1/s3
#      - Region: (leave blank or use 'auto')
#      - Location constraint: (leave blank)
#   3. Configure the variables below and save.
# ============================================================

# ── Configuration ────────────────────────────────────────────
$RemoteName = "supabase-aloe"
$BucketName = "client-uploads"
$LocalFolder = "C:\AloeSignsIncoming"   # Change to your preferred local folder
# ─────────────────────────────────────────────────────────────

# Create local folder if it doesn't exist
if (-not (Test-Path $LocalFolder)) {
    New-Item -ItemType Directory -Path $LocalFolder | Out-Null
    Write-Host "Created local folder: $LocalFolder"
}

Write-Host "=============================="
Write-Host " Aloe Signs – rclone Sync"
Write-Host "=============================="
Write-Host ""

# STEP 1: Download NEW files from Supabase to local folder
#         (copyto: only downloads files that don't exist locally yet)
Write-Host "[1/2] Downloading new files from Supabase to $LocalFolder ..."
rclone copy "${RemoteName}:${BucketName}" $LocalFolder --progress --no-update-modtime

Write-Host ""

# STEP 2: Sync local folder BACK to Supabase (with --delete-after flag)
#         If a file has been MOVED OUT of $LocalFolder, this will delete it
#         from Supabase because the local folder no longer has it.
Write-Host "[2/2] Syncing local changes back to Supabase (removing moved files)..."
rclone sync $LocalFolder "${RemoteName}:${BucketName}" --delete-after --progress

Write-Host ""
Write-Host "✅ Sync complete. Files moved out of '$LocalFolder' have been removed from Supabase."
Write-Host ""

# Optional: Show storage usage after sync
Write-Host "Current Supabase bucket contents:"
rclone ls "${RemoteName}:${BucketName}"
