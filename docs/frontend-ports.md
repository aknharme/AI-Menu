# Frontend Port Bilgilendirmesi

Bu projede üç ayrı React uygulaması vardır. Geliştirme sırasında çakışma olmaması için her uygulama farklı portta çalıştırılır.

| Uygulama | Klasör | Önerilen Port | Lokal URL |
| --- | --- | --- | --- |
| Customer Web | `frontend/customer-web` | `5173` | `http://127.0.0.1:5173/` |
| Admin Web | `frontend/admin-web` | `5174` | `http://127.0.0.1:5174/` |
| Cashier Web | `frontend/cashier-web` | `5175` | `http://127.0.0.1:5175/` |

## Çalıştırma

Customer:

```bash
cd frontend/customer-web
npm run dev -- --host 127.0.0.1 --port 5173
```

Admin:

```bash
cd frontend/admin-web
npm run dev -- --host 127.0.0.1 --port 5174
```

Cashier:

```bash
cd frontend/cashier-web
npm run dev -- --host 127.0.0.1 --port 5175
```

## API Adresi

Her uygulama kendi `.env` dosyasından API adresini okur.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

`.env.example` dosyası örnek olarak tutulur. Gerçek geliştirme ortamında aynı klasöre `.env` dosyası açılabilir.
