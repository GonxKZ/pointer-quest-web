# filtra-errores.ps1  (formato BLOQUE: "ERROR in <loc>" + "TSxxxx: mensaje")
param(
  [string]$OutFile = "errores_formato_bloque.txt",
  [int]$CaptureSeconds = 35,
  [switch]$UntilKey,
  [switch]$SaveRaw
)

$ErrorActionPreference = "Continue"
$env:NO_COLOR="1"; $env:FORCE_COLOR="0"; $env:BROWSER="none"; $env:CI="true"

$rawOut = Join-Path $env:TEMP "npm_raw_out.log"
$rawErr = Join-Path $env:TEMP "npm_raw_err.log"
Remove-Item $rawOut,$rawErr -Force -ErrorAction SilentlyContinue | Out-Null

$ps = Start-Process -FilePath "powershell" `
  -ArgumentList "-NoProfile","-Command","npm start" `
  -RedirectStandardOutput $rawOut `
  -RedirectStandardError  $rawErr `
  -PassThru

if ($UntilKey) { Write-Host "Capturando... pulsa Enter para detener."; $null = Read-Host }
else { Start-Sleep -Seconds $CaptureSeconds }

try { Stop-Process -Id $ps.Id -Force } catch {}

$text = ""
if (Test-Path $rawOut) { $text += (Get-Content $rawOut -Raw) }
if (Test-Path $rawErr) { $text += "`n" + (Get-Content $rawErr -Raw) }
# Limpia códigos ANSI
$text = [regex]::Replace($text, "\x1B\[[0-?]*[ -/]*[@-~]", "")
$text = $text -replace "`r",""

if ($SaveRaw) { Set-Content -Path "npm_start_full.log" -Value $text -Encoding utf8 }

# ---- PARSER: "ERROR in <loc>" + siguiente línea como mensaje ----
$lines = $text -split "`n"
$errors = New-Object System.Collections.Generic.List[string]

for ($i=0; $i -lt $lines.Count; $i++) {
  $line = $lines[$i]
  $m = [regex]::Match($line, '^ERROR in\s+(?<rest>.+?)\s*$')
  if ($m.Success) {
    $loc = $m.Groups['rest'].Value.Trim()     # Mantiene "src/X.tsx:12:3" o "./src/X.tsx 855:37-50"
    # Busca la siguiente línea no vacía: suele ser "TSxxxx: mensaje" o "export 'X' ... not found ..."
    $j = $i + 1
    while ($j -lt $lines.Count -and ($lines[$j].Trim() -eq '')) { $j++ }
    $msg = if ($j -lt $lines.Count) { $lines[$j].Trim() } else { "" }
    $msg = ([regex]::Replace($msg, '\s+', ' ')).Trim()
    $errors.Add(("ERROR in {0}`n{1}" -f $loc, $msg))
    $i = $j
    continue
  }

  # Captura también "Attempted import error:" suelto (sin fichero)
  if ($line.Trim().StartsWith("Attempted import error:")) {
    $msg = ([regex]::Replace($line.Trim(), '\s+', ' '))
    $errors.Add("ERROR in (sin-fichero)`n$msg")
  }
}

# Guarda salida
$nl = "`r`n"
Set-Content -Path $OutFile -Encoding utf8 -Value (($errors -join ($nl + $nl)) + $nl)
Write-Host "Generado: $OutFile"
