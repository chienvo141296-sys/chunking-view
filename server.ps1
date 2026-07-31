# Lightweight Local HTTP Dev Server with Auto-Git Sync for Chunking Blog
Param(
    [int]$Port = 8080
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

$prefix = "http://localhost:$Port/"
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🚀 Chunking Blog is live at: $prefix" -ForegroundColor Cyan
Write-Host "Auto-Sync to Mobile & Live Web: ENABLED (/api/sync-posts)" -ForegroundColor Green
Write-Host "Press Ctrl+C in this terminal to stop the server." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green

$rootDir = $PSScriptRoot

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $relPath = $request.Url.LocalPath.TrimStart('/')

        # Handle API Auto-Sync to GitHub
        if ($request.HttpMethod -eq "POST" -and $relPath -eq "api/sync-posts") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $bodyJson = $reader.ReadToEnd()
                $reader.Close()

                if (-not [string]::IsNullOrWhiteSpace($bodyJson)) {
                    $posts = $bodyJson | ConvertFrom-Json
                    $jsonFormatted = $posts | ConvertTo-Json -Depth 10

                    $dataPath = Join-Path $rootDir "js\data.js"
                    $dataJsContent = "// Initial Seed Data for Chunking Blog`n`nconst INITIAL_POSTS = $jsonFormatted;`n`nconst INITIAL_ROADMAP = [];`n"

                    [System.IO.File]::WriteAllText($dataPath, $dataJsContent, [System.Text.Encoding]::UTF8)

                    # Trigger Git Auto-Commit & Push to GitHub Pages
                    $gitCmd = '& "C:\Program Files\Git\cmd\git.exe" add js/data.js; & "C:\Program Files\Git\cmd\git.exe" commit -m "Auto-sync user created posts to live web"; & "C:\Program Files\Git\cmd\git.exe" push origin master'
                    powershell -Command $gitCmd | Out-Null

                    $resObj = @{ success = $true; message = "Post synced globally to GitHub Pages! Available on mobile in 30s." }
                    $resJson = $resObj | ConvertTo-Json
                    $resBytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)

                    $response.ContentType = "application/json; charset=utf-8"
                    $response.StatusCode = 200
                    $response.ContentLength64 = $resBytes.Length
                    $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                }
            } catch {
                $errObj = @{ success = $false; error = $_.Exception.Message }
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes(($errObj | ConvertTo-Json))
                $response.StatusCode = 500
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }

            $response.Close()
            continue
        }

        if ([string]::IsNullOrWhiteSpace($relPath)) {
            $relPath = "index.html"
        }

        $filePath = Join-Path $rootDir $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".json" { $response.ContentType = "application/json" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "application/octet-stream" }
            }

            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $statusBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($statusBytes, 0, $statusBytes.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
