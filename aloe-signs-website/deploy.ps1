<#
.SYNOPSIS
Triggers a Vercel deployment for the aloe-signs-website by pushing an empty commit.

.DESCRIPTION
Since Vercel automatically deploys on push to the `main` branch, this script simplifies the deployment process
by generating an empty commit with the required deploy message to force a rebuild.
#>
$ErrorActionPreference = "Stop"

Write-Host "Triggering Vercel Deployment for aloe-signs-website..." -ForegroundColor Cyan

# Ensure we are in the correct directory (the script's directory)
$RepoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $RepoPath

# Check if there are any uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Note: You have uncommitted changes in your repository." -ForegroundColor Yellow
    Write-Host "This script will still trigger a build, but you may want to commit and push your actual changes."
    Write-Host ""
}

# Create an empty commit to force Vercel to rebuild
Write-Host "Creating an empty commit to trigger the build..."
git commit --allow-empty -m "deploy: force trigger Vercel build"

# Push to origin main
Write-Host "Pushing to GitHub (origin main)..." -ForegroundColor Cyan
git push origin main

Write-Host "`nDeployment trigger sent to Vercel via GitHub!" -ForegroundColor Green
Write-Host "Check your Vercel Dashboard for progress."
