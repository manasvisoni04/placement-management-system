$ports = @(3000, 5000, 5173, 5174)
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            if ($conn.OwningProcess) {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "Killed process on port $port"
            }
        }
    } catch {}
}

Start-Process cmd -ArgumentList "/k title Legacy Server & color 0a & node server.js" -WorkingDirectory e:\placement
Start-Process cmd -ArgumentList "/k title API Server & color 0b & node index.js" -WorkingDirectory e:\placement\server
Start-Process cmd -ArgumentList "/k title Vite Frontend & color 0d & npm run dev" -WorkingDirectory e:\placement\client
Write-Host "All components started successfully in new windows."
