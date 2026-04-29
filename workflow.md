# BACKEND

cd api
dotnet restore
dotnet run

# FRONTEND ve DATABASE

docker compose up -d --build

DBeaver
Host: localhost
Port: 5432
Database: ai_menu
User: postgres
Password: postgres
