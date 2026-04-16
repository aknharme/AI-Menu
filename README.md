# AI-Powered QR Menu & Ordering System

Yapay zeka destekli, multi-restaurant (çoklu işletme) mimarisine sahip QR kodlu menü ve sipariş yönetim platformu. Müşteriler masalardaki QR kodu okutarak sipariş verebilir, arka planda doğal dil işleme destekli bir yapay zeka ürünleri etiketleyerek yönlendirme yapar.

## 🚀 Teknolojiler
- **Backend:** ASP.NET Core Web API
- **Frontend:** React, Vite, Tailwind CSS (Müşteri, Admin ve Kasiyer panelleri olarak ayrılmış)
- **Database:** PostgreSQL
- **AI Tarafı:** Ollama (Llama / Qwen) ile etiket üretimi
- **Altyapı & Yayına Alma:** Docker, Docker Compose, Nginx

## 📂 Klasör Yapısı (Mono-repo)
```text
📦 aimenü
├── 📂 api               # ASP.NET Core Web API (Backend servisi, veritabanı iletişimi, AI entegrasyonu)
├── 📂 admin-web         # React + Vite (Restoran yönetimi, menü/ürün/kategori tanımlama)
├── 📂 cashier-web       # React + Vite (Kasiyer ve mutfak için canlı sipariş takip & durum güncelleme)
├── 📂 customer-web      # React + Vite (Müşterilerin QR ile göreceği mobil-öncelikli sipariş arayüzü)
├── 📂 docs              # API dokümanları, mimari çizimler ve iş kuralları notları
├── 📂 infra             # Docker compose dosyaları, Nginx konfigürasyonları, veritabanı scriptleri
├── 📂 .github
│   └── 📂 workflows     # GitHub Actions CI/CD pipeline'ları (Otomatik derleme & test)
├── 📜 .gitignore        # .NET, Node.js ve işletim sistemine özel ignore tanımları
└── 📜 README.md         # Proje ana dokümantasyonu
```

## 🌿 Branch Kullanımı ve Git Kuralları

Bu repo projeyi hızlı ve güvenli geliştirmek adına **Trunk-Based Development** uyarlaması ile çalışır.

### Branch İsimlendirme Kuralları:
- `main` : Tamamen stabil, **Production** ortamına çıkan branch. (Direkt commit atılamaz, sadece PR ile merge edilir)
- `develop` : Aktif geliştirmenin yapıldığı branch. (Tüm güncel özellikler burada toplanır)
- `feature/[özellik-adı]` : Yeni geliştirilecek bir özellik veya sayfa için açılır. *Örn: `feature/cart-module`, `feature/payment-integration`*
- `bugfix/[hata-adı]` : Geliştirme, test sürecinde bulunan bug'lar için açılır. *Örn: `bugfix/cart-calc-error`*
- `hotfix/[hata-adı]` : Production'da (`main`) ortaya çıkan ve acil çözülmesi gereken hatalar için açılır. *Örn: `hotfix/login-crash`*

### Git Akışı (Workflow) ve Pull Request (PR) Süreci:
1. Geliştirici, `develop` branch'inden güncel kodları çeker ve yeni branch'ini oluşturur:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/yeni-ozellik
   ```
2. Geliştirici kendi lokalinde değişiklikleri yapar ve branch'ine gönderir (`git push -u origin feature/yeni-ozellik`).
3. Çalışma bittiğinde GitHub üzerinden `develop` branch'ini hedefleyen bir **Pull Request (PR)** açılır.
4. Açılan PR sistemdeki GitHub Actions sürecini tetikler (Tüm kodların hatasız derlendiği kontrol edilir).
5. (Opsiyonel) Ekipteki başka bir kişi PR'ı inceler (**Code Review**).
6. İnceleme onaylanınca kod **"Squash and Merge"** veya **"Rebase"** seçeneği ile temiz bir geçmiş bırakılarak `develop`'a birleştirilir.
7. Deployment zamanı geldiğinde `develop`, `main`'e merge edilerek production ortamına sürülür.

## 🛠️ Nasıl Çalıştırılır (Geliştirme Ortamı)

Projenin birbiri ile konuşan farklı parçaları vardır. Gelecekte tüm repo'yu tek bir tuşla Docker üzerinden kaldıracağız:
```bash
cd infra
docker-compose -f docker-compose.dev.yml up -d
```
Ancak geliştirme esnasında ilgili klasörlere girip kendi toolları ile başlatabilirsiniz:
- Backend: `cd api` -> `dotnet run`
- Web Müşteri: `cd customer-web` -> `npm install` && `npm run dev`
