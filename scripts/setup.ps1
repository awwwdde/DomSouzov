$ErrorActionPreference = "Stop"

Write-Host "== DomSouzov setup started =="

if (!(Test-Path "backend")) {
  throw "Run this script from repository root."
}

if (!(Test-Path "backend\venv\Scripts\python.exe")) {
  Write-Host "Creating backend virtual environment..."
  python -m venv backend\venv
}

Write-Host "Installing backend dependencies..."
& .\backend\venv\Scripts\python.exe -m pip install --upgrade pip
& .\backend\venv\Scripts\python.exe -m pip install -r .\backend\requirements.txt

if (!(Test-Path "backend\.env")) {
  Write-Host "Creating backend .env from example..."
  Copy-Item .\backend\.env.example .\backend\.env
}

Write-Host "Seeding database..."
& .\backend\venv\Scripts\python.exe .\backend\seed.py

Write-Host "Installing frontend dependencies..."
npm --prefix frontend install

Write-Host "Installing root dependencies..."
npm install

Write-Host "== Setup completed. Run 'npm run dev' from repo root =="
