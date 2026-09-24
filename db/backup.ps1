# backup.ps1 - Equivalente a Query 6 (Respaldo)
Write-Host "Iniciando respaldo de la base de datos D1 POLI..."

$backupName = "poli-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creando snapshot: $backupName"

npx wrangler d1 backup create poli-db --name=$backupName

if ($LASTEXITCODE -eq 0) {
    Write-Host "Respaldo creado exitosamente." -ForegroundColor Green
    Write-Host "Para listar respaldos usa: npx wrangler d1 backup list poli-db"
} else {
    Write-Host "Error al crear el respaldo." -ForegroundColor Red
}
