# AI Menu

Multi-restaurant QR menu ve siparis sistemi icin hazirlanmis mono-repo proje yapisi.
Bu repo ekipteki backend, customer, admin ve cashier gelistirmelerini ayni yerde yonetmek icin tasarlanmistir.

## Proje Ozeti

- `api`: ASP.NET Core Web API
- `frontend/customer-web`: QR ile acilan musteri arayuzu
- `frontend/admin-web`: restoran yonetim paneli
- `frontend/cashier-web`: siparis operasyon ekranlari
- `infra`: docker ve nginx konfigrasyonlari
- `docs`: repo yapisi, branch akisi ve notlar

## Kullanilan Teknolojiler

- Backend: ASP.NET Core 8, Entity Framework Core, PostgreSQL
- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router
- API Client: Axios
- CI: GitHub Actions
- Infra: Docker Compose, Nginx

## Klasor Agaci

```text
AI-MENU/
|-- .github/
|   `-- workflows/
|       `-- build-check.yml
|-- api/
|   |-- Controllers/
|   |   |-- MenuController.cs
|   |   `-- OrdersController.cs
|   |-- Data/
|   |   |-- AppDbContext.cs
|   |   `-- AppDbSeeder.cs
|   |-- DTOs/
|   |   |-- CreateOrderItemRequestDto.cs
|   |   |-- CreateOrderRequestDto.cs
|   |   |-- MenuCategoryDto.cs
|   |   |-- MenuProductDto.cs
|   |   |-- MenuResponseDto.cs
|   |   |-- OrderItemResponseDto.cs
|   |   `-- OrderResponseDto.cs
|   |-- Entities/
|   |   |-- Category.cs
|   |   |-- Order.cs
|   |   |-- OrderItem.cs
|   |   |-- Product.cs
|   |   |-- Restaurant.cs
|   |   `-- Table.cs
|   |-- Properties/
|   |   `-- launchSettings.json
|   |-- Repositories/
|   |   |-- Interfaces/
|   |   |   |-- IOrderRepository.cs
|   |   |   `-- IRestaurantRepository.cs
|   |   |-- OrderRepository.cs
|   |   `-- RestaurantRepository.cs
|   |-- Services/
|   |   |-- Interfaces/
|   |   |   |-- IMenuService.cs
|   |   |   `-- IOrderService.cs
|   |   |-- MenuService.cs
|   |   `-- OrderService.cs
|   |-- AiMenu.Api.csproj
|   |-- AiMenu.Api.http
|   |-- appsettings.json
|   |-- Program.cs
|   `-- README.md
|-- docs/
|   |-- branching-strategy.md
|   |-- frontend-ports.md
|   `-- repository-tree.md
|-- frontend/
|   |-- admin-web/
|   |   |-- src/
|   |   |-- .env.example
|   |   |-- index.html
|   |   `-- package.json
|   |-- cashier-web/
|   |   |-- src/
|   |   |-- .env.example
|   |   |-- index.html
|   |   `-- package.json
|   `-- customer-web/
|       |-- src/
|       |-- .env.example
|       |-- index.html
|       `-- package.json
|-- infra/
|   |-- nginx/
|   |   `-- default.conf
|   |-- docker-compose.dev.yml
|   `-- README.md
|-- .gitignore
|-- AI-Menu.sln
`-- database.sql
```

Detayli aciklama icin [docs/repository-tree.md](docs/repository-tree.md) dosyasina bakilabilir.

## Branch Yapisi

- `main`: production branch
- `develop`: aktif gelistirme branch'i
- `feature/*`: yeni ozellik gelistirmeleri
- `bugfix/*`: hata duzeltmeleri

Detayli kurallar [docs/branching-strategy.md](docs/branching-strategy.md) icinde yer alir.

## Feature Branch Nasil Acilir

```bash
git checkout develop
git pull origin develop
git checkout -b feature/menu-filter
```

Bugfix icin:

```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/order-total
```

## Merge ve PR Kurallari

- Dogrudan `main` veya `develop` branch'ine commit atilmaz.
- Her is ayrica bir `feature/*` veya `bugfix/*` branch'inde yapilir.
- Her branch GitHub'a push edilir ve `develop` hedefli PR acilir.
- Build check gecmeden merge yapilmaz.
- Production'a cikacak toplu degisiklikler `develop -> main` PR'i ile ilerler.

## Calistirma

### Backend

```bash
cd api
dotnet restore
dotnet run
```

Varsayilan olarak Swagger acilir. `ConnectionStrings__DefaultConnection` verilmezse InMemory database ile ayaga kalkar.

### Customer Web

```bash
cd frontend/customer-web
npm install
npm run dev
```

### Admin Web

```bash
cd frontend/admin-web
npm install
npm run dev
```

### Cashier Web

```bash
cd frontend/cashier-web
npm install
npm run dev
```

### Docker ile Lokal Baslangic

```bash
cd infra
docker compose -f docker-compose.dev.yml up --build
```

## Vite Kurulum Komutlari

Asagidaki komutlar bu repo icindeki frontend uygulamalarinin ilk kurulum mantigini temsil eder:

```bash
npm create vite@latest frontend/customer-web -- --template react-ts
npm create vite@latest frontend/admin-web -- --template react-ts
npm create vite@latest frontend/cashier-web -- --template react-ts
```

Tailwind kurulumu:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Klasor Aciklamalari

- `api`: menu ve siparis endpoint'leri ile EF Core veri katmani
- `frontend/customer-web`: QR menu deneyimi
- `frontend/admin-web`: dashboard ve yonetim ekranlari
- `frontend/cashier-web`: siparis operasyon arayuzu
- `infra`: lokal docker ve reverse proxy ayarlari
- `docs`: ekip icin repo ve surec dokumani
