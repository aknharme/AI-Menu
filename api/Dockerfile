# API image'i once uygulamayi publish eder, sonra hafif ASP.NET runtime uzerinden calisir.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY AiMenu.Api.csproj ./
RUN dotnet restore AiMenu.Api.csproj

COPY . ./
RUN dotnet publish AiMenu.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "AiMenu.Api.dll"]
