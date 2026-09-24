# restore.ps1 - Equivalente a Restauración (Query 6)
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupId
)

Write-Host "Iniciando restauración de la base de datos D1 POLI desde el snapshot $BackupId..."

npx wrangler d1 backup restore poli-db --backup-id=$BackupId

if ($LASTEXITCODE -eq 0) {
    Write-Host "Restauración exitosa." -ForegroundColor Green
} else {
    Write-Host "Error durante la restauración." -ForegroundColor Red
}
