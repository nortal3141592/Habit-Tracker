# Starts the backend (FastAPI, via uv) and frontend (Vite) together.
# Run this from the repo root: .\dev.ps1
#
# Ctrl+C stops both processes cleanly.

$FrontendDir = "habit-tracker-frontend"

Write-Host "Starting backend..."
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    uv run uvicorn app.main:app --reload
}

Write-Host "Starting frontend..."
$frontendJob = Start-Job -ScriptBlock {
    Set-Location (Join-Path $using:PWD $using:FrontendDir)
    npm run dev
}

function Cleanup {
    Write-Host ""
    Write-Host "Shutting down..."
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "Done."
}

try {
    # Stream both jobs' output live until you Ctrl+C
    while ($true) {
        Receive-Job $backendJob, $frontendJob
        Start-Sleep -Milliseconds 300
    }
}
finally {
    # Ctrl+C triggers this via the pipeline-stopped exception, same as
    # a normal error would — this always runs on exit either way
    Cleanup
}