# Start all VibraGuard microservices for local development
# Run this from the backend directory

$modules = @(
    "auth-service",
    "motor-service",
    "alert-service",
    "workorder-service",
    "inventory-service",
    "blockchain-service",
    "bi-service",
    "api-gateway"
)

Write-Host "Building all modules..." -ForegroundColor Yellow
mvn compile -q

foreach ($module in $modules) {
    $port = switch ($module) {
        "auth-service" { 8081 }
        "motor-service" { 8082 }
        "alert-service" { 8083 }
        "workorder-service" { 8084 }
        "inventory-service" { 8085 }
        "blockchain-service" { 8086 }
        "bi-service" { 8088 }
        "api-gateway" { 8080 }
    }
    
    Write-Host "Starting $module on port $port..." -ForegroundColor Green
    $logFile = "logs/$module.log"
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    
    $job = Start-Job -Name $module -ScriptBlock {
        param($mod, $log)
        cd "C:\projects\VibraGuard\vibraguard\backend"
        mvn spring-boot:run -pl $mod > $log 2>&1
    } -ArgumentList $module, $logFile
    
    Start-Sleep -Seconds 2
}

Write-Host "`nAll services starting. Check logs/ directory for output." -ForegroundColor Cyan
Write-Host "API Gateway: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Auth Service: http://localhost:8081" -ForegroundColor Cyan
Write-Host "Motor Service: http://localhost:8082" -ForegroundColor Cyan
Write-Host "Alert Service: http://localhost:8083" -ForegroundColor Cyan
Write-Host "WorkOrder Service: http://localhost:8084" -ForegroundColor Cyan
Write-Host "Inventory Service: http://localhost:8085" -ForegroundColor Cyan
Write-Host "Blockchain Service: http://localhost:8086" -ForegroundColor Cyan
Write-Host "BI Service: http://localhost:8088" -ForegroundColor Cyan

# Show running jobs
Get-Job | Where-Object { $_.State -eq "Running" } | Format-Table Id, Name, State

Write-Host "`nTo stop all services: Get-Job | Stop-Job" -ForegroundColor Yellow
