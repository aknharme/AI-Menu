# Branching Strategy

## Branch Rolleri

- `main`: production branch. Sadece onayli release PR'lari merge edilir.
- `develop`: ekibin aktif gelistirme branch'i.
- `feature/*`: yeni ozellikler icin kullanilir.
- `bugfix/*`: gelistirme veya testte bulunan hatalar icin kullanilir.

## Feature Branch Acma

```bash
git checkout develop
git pull origin develop
git checkout -b feature/menu-management
git push -u origin feature/menu-management
```

## Bugfix Branch Acma

```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/order-status
git push -u origin bugfix/order-status
```

## PR Mantigi

1. Gelistirme `develop` baz alinarak yapilir.
2. Branch tamamlaninca GitHub uzerinde `develop` hedefli pull request acilir.
3. CI build basarili olmadan merge edilmez.
4. En az bir ekip incelemesi tavsiye edilir.
5. Merge sonrasi ilgili branch kapatilabilir.

## Merge Akisi

1. `feature/*` veya `bugfix/*` -> `develop`
2. Release zamani `develop` -> `main`

## Kurallar

- `main` ve `develop` branch'lerine dogrudan push yapilmaz.
- Kucuk isler bile branch acilarak ilerler.
- Branch isimleri kisa, okunur ve tek amacli olmalidir.
- PR aciklamasinda ne degistigi ve nasil test edildigi yazilir.
