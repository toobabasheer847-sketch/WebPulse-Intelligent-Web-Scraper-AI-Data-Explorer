# WebPulse local PostgreSQL setup
# Usage: .\scripts\setup-db.ps1 -PostgresPassword "12345"

param(
  [string]$PostgresPassword = "12345",
  [string]$DbUser = "webpulse",
  [string]$DbPassword = "12345",
  [string]$DbName = "webpulse"
)

$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psql)) {
  Write-Error "psql not found at $psql. Adjust the path for your PostgreSQL version."
  exit 1
}

$env:PGPASSWORD = $PostgresPassword

Write-Host "Creating role and database..."
& $psql -U postgres -h localhost -p 5432 -d postgres -f "$PSScriptRoot\setup-db.sql"

Write-Host "Granting ownership..."
& $psql -U postgres -h localhost -p 5432 -d $DbName -c @"
ALTER DATABASE $DbName OWNER TO $DbUser;
ALTER SCHEMA public OWNER TO $DbUser;
GRANT ALL ON SCHEMA public TO $DbUser;
GRANT CREATE ON SCHEMA public TO $DbUser;
"@

Write-Host "Done. DATABASE_URL=postgresql://${DbUser}:${DbPassword}@localhost:5432/${DbName}"
Write-Host "Run: npm run migrate"
