# AI Menu

Multi-restaurant QR menu ve siparis sistemi icin hazirlanmis mono-repo proje yapisi.
Bu repo ekipteki backend, customer, admin ve cashier gelistirmelerini ayni yerde yonetmek icin tasarlanmistir.

## Proje Ozeti

- `api`: ASP.NET Core Web API
- `customer-web`: QR ile acilan musteri arayuzu
- `admin-web`: restoran yonetim paneli
- `cashier-web`: siparis operasyon ekranlari
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
|-- admin-web/
|   |-- src/
|   |   |-- components/
|   |   |   `-- StatCard.tsx
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |   `-- AdminLayout.tsx
|   |   |-- pages/
|   |   |   `-- DashboardPage.tsx
|   |   |-- router/
|   |   |   `-- index.tsx
|   |   |-- services/
|   |   |   `-- api.ts
|   |   |-- types/
|   |   |-- utils/
|   |   |-- index.css
|   |   `-- main.tsx
|   |-- .env.example
|   |-- index.html
|   `-- package.json
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
|-- cashier-web/
|   |-- src/
|   |   |-- components/
|   |   |   `-- OrderCard.tsx
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |   `-- CashierLayout.tsx
|   |   |-- pages/
|   |   |   `-- OrdersPage.tsx
|   |   |-- router/
|   |   |   `-- index.tsx
|   |   |-- services/
|   |   |   `-- api.ts
|   |   |-- types/
|   |   |   `-- order.ts
|   |   |-- utils/
|   |   |-- index.css
|   |   `-- main.tsx
|   |-- .env.example
|   |-- index.html
|   `-- package.json
|-- customer-web/
|   |-- src/
|   |   |-- components/
|   |   |   `-- MenuList.tsx
|   |   |-- hooks/
|   |   |   `-- useQueryParams.ts
|   |   |-- layouts/
|   |   |   `-- CustomerLayout.tsx
|   |   |-- pages/
|   |   |   `-- MenuPage.tsx
|   |   |-- router/
|   |   |   `-- index.tsx
|   |   |-- services/
|   |   |   |-- api.ts
|   |   |   `-- menuService.ts
|   |   |-- types/
|   |   |   `-- menu.ts
|   |   |-- utils/
|   |   |   `-- formatPrice.ts
|   |   |-- index.css
|   |   `-- main.tsx
|   |-- .env.example
|   |-- index.html
|   `-- package.json
|-- docs/
|   |-- branching-strategy.md
|   |-- frontend-ports.md
|   `-- repository-tree.md
|-- infra/
|   |-- nginx/
|   |   `-- default.conf
|   |-- docker-compose.dev.yml
|   `-- README.md
|-- .gitignore
|-- AI-Menu.sln
`-- database.sql
```

Detayli aaciklama icin [docs/repository-tree.md](/C:/Users/Kadir/Desktop/AI-MENU/docs/repository-tree.md) dosyasina bakilabilir.

## Branch Yapisi

- `main`: production branch
- `develop`: aktif gelistirme branch'i
- `feature/*`: yeni ozellik gelistirmeleri
- `bugfix/*`: hata duzeltmeleri

Detayli kurallar [docs/branching-strategy.md](/C:/Users/Kadir/Desktop/AI-MENU/docs/branching-strategy.md) icinde yer alir.

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
cd customer-web
npm install
npm run dev
```

### Admin Web

```bash
cd admin-web
npm install
npm run dev
```

### Cashier Web

```bash
cd cashier-web
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
npm create vite@latest customer-web -- --template react-ts
npm create vite@latest admin-web -- --template react-ts
npm create vite@latest cashier-web -- --template react-ts
```

Tailwind kurulumu:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Klasor Aciklamalari

- `api`: menu ve siparis endpoint'leri ile EF Core veri katmani
- `customer-web`: QR menu deneyimi
- `admin-web`: dashboard ve yonetim ekranlari
- `cashier-web`: siparis operasyon arayuzu
- `infra`: lokal docker ve reverse proxy ayarlari
- `docs`: ekip icin repo ve surec dokumani
