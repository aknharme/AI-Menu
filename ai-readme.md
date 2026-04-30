# AI Menu Yapay Zeka Rehberi

Bu dokuman, projedeki yapay zeka kismini anlamak isteyen biri icin hazirlandi. Amaç; AI'nin bu projede tam olarak ne yaptigini, ne yapmadigini, hangi servislerle calistigini, backend ile nasil entegre oldugunu ve nasil test edilecegini netlestirmektir.

## Bu Projede AI'nin Rolu Nedir

Bu projede AI bir chatbot degildir.

AI'nin tek gorevi:

- kullanicinin serbest metnini analiz etmek
- bu metinden kisa tag listesi uretmek

AI'nin yapmadigi seyler:

- urun secmek
- fiyat karsilastirmasi yapmak
- menuden dogrudan tavsiye karari vermek
- siparis olusturmak

Yani dogru tanim sunlardir:

- AI -> tag uretir
- backend -> urun secer
- frontend -> sonucu gosterir

## Kullanilan AI Teknolojisi

Su an projede kullanilan AI servisi:

- Ollama

Varsayilan model:

- `qwen2.5:3b`

Bu ayarlar su dosyada bulunur:

- `api/appsettings.json`
- `api/Options/OllamaOptions.cs`

## AI Tarafinda Onemli Dosyalar

- `api/Services/OllamaTagService.cs`
- `api/Services/RecommendationService.cs`
- `api/Controllers/RecommendationController.cs`
- `api/Services/TagNormalizer.cs`
- `api/Repositories/RecommendationRepository.cs`
- `api/Entities/Tag.cs`
- `api/Entities/ProductTag.cs`
- `api/Entities/RecommendationLog.cs`

## Mimari Akis

AI akis mantigi su sekildedir:

1. Customer frontend prompt alir
2. Prompt backend'e gider
3. Backend `OllamaTagService` ile Ollama'ya istek gonderir
4. Ollama JSON tag listesi doner
5. Backend tag'leri normalize eder
6. Backend tag'lere gore aktif urunleri filtreler
7. Eslesen urunleri response olarak gonderir
8. Surec `RecommendationLogs` tablosuna yazilir

Bu akis iki parcaya ayrilir:

- `prompt -> tags`
- `tags -> products`

## Endpointler

### 1. `POST /api/recommendation`

Bu endpoint sadece tag uretir.

Ornek request:

```json
{
  "prompt": "hafif bir sey istiyorum"
}
```

Ornek response:

```json
{
  "tags": ["hafif"]
}
```

### 2. `POST /api/recommendation/tags`

Bu endpoint `POST /api/recommendation` ile ayni amaca hizmet eden alias endpoint'tir.

### 3. `POST /api/recommendation/products`

Bu endpoint AI kullanmaz. Tag listesi verilince backend urunleri filtreler.

Ornek request:

```json
{
  "restaurantId": "11111111-1111-1111-1111-111111111111",
  "tags": ["hafif", "tavuk"]
}
```

### 4. `POST /api/recommendation/prompt`

Bu endpoint ucundan uca akistir:

- once AI ile tag uretir
- sonra backend ile urun getirir

Ornek request:

```json
{
  "restaurantId": "11111111-1111-1111-1111-111111111111",
  "prompt": "hafif ve tavuklu bir sey istiyorum"
}
```

## Prompt Engineering Mantigi

`OllamaTagService` icinde modele giden prompt cok net sinirlandirilir.

Hedef:

- sadece tag uret
- en fazla 5 tag don
- JSON disina cikma
- aciklama yazma
- kucuk harf kullan

Bu sayede AI'yi serbest konusmaya birakmiyoruz. Model ne kadar iyi olursa olsun backend icin parse edilebilir, sade ve kontrollu bir cikis istiyoruz.

## JSON Parse Mantigi

Modelin ideal cevabi su formatta olmalidir:

```json
{"tags":["hafif","tavuk"]}
```

Ama model bazen saf JSON donmeyebilir. Bu yuzden servis iki katmanli davraniyor:

1. once JSON parse etmeyi dener
2. olmazsa string icinden tag benzeri degerleri ayiklar

Bu fallback mantigi `OllamaTagService` icinde bulunur.

## Tag Normalization

AI'den gelen veriye guvenip direkt sorgu yapmiyoruz.

`TagNormalizer` sunlari yapar:

- bos degerleri atar
- tekrar eden tag'leri temizler
- kucuk harfe indirger
- backend'in kullanabilecegi sade forma cevirir

Bu cok onemli cunku recommendation sorgusu normalize tag ile calisir.

## Backend ile AI Arasindaki Sinir

Bu proje icin en kritik tasarim karari budur:

AI, recommendation mantiginin sadece giris asamasindadir.

AI'nin output'u:

- tag listesi

Backend'in sorumluluklari:

- restoran aktif mi
- urun aktif mi
- tag eslesmesi var mi
- relevance sirasi nasil olacak
- fallback ne olacak

Bu ayrim sayesinde sistem daha guvenli, test edilebilir ve deterministik kalir.

## Fallback Mantigi

AI servisinde hata olursa sistem tamamen kirilmaz.

Su durumlar ele alinir:

- Ollama kapaliysa
- model hata donerse
- response parse edilemezse
- tag bulunamazsa

Davranis:

- sadece tag endpoint'i bos liste donebilir
- prompt endpoint'i populer urun fallback'ine dusebilir

Bu sayede customer tarafinda deneyim tamamen bos kalmaz.

## Veritabanindaki AI Iliskileri

AI tarafini destekleyen tablolar:

- `Tags`
- `ProductTags`
- `RecommendationLogs`

### `Tags`

Restorana ozel sozluk tablosudur.

### `ProductTags`

Urun ile tag arasindaki esleme tablosudur.

### `RecommendationLogs`

AI calistiginda su bilgiler yazilir:

- prompt
- extracted tags
- recommended products
- createdAt

Bu sayede admin panelde AI akisinin ne urettigi gorulebilir.

## Frontend'de AI Nerede Kullanilir

Customer uygulamada `MenuPage` icinde bir prompt alani vardir.

Frontend'in gorevi:

- kullanicidan metin almak
- prompt'u backend'e gondermek
- loading gostermek
- hata mesajini gostermek
- donen urun onerilerini listelemek

Yani frontend de AI karar vermez.

## Ornek Promptlar

Test icin kullanilabilecek ornekler:

- `hafif bir sey istiyorum`
- `tavuklu bir sey olsun`
- `gluten hassasiyetim var`
- `soguk bir icecek istiyorum`
- `hafif ama doyurucu olsun`

## Ollama Kurulum ve Test

### Kurulum

Makinede Ollama kurulu olmali.

Model yukleme:

```bash
ollama pull qwen2.5:3b
```

### Servis kontrolu

```bash
curl http://localhost:11434/api/tags
```

Model listesi bos degilse servis hazirdir.

## AI Akisini Manuel Test Etme

### Sadece tag extraction

```bash
curl -X POST http://localhost:5268/api/recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "hafif bir sey istiyorum"
  }'
```

### Uctan uca prompt -> urun onerisi

```bash
curl -X POST http://localhost:5268/api/recommendation/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "11111111-1111-1111-1111-111111111111",
    "prompt": "hafif ve tavuklu bir sey istiyorum"
  }'
```

## AI Tarafinda Su Anda Neler Var

- Ollama entegrasyonu
- prompt engineering
- JSON parse mantigi
- fallback davranisi
- tag normalization
- backend recommendation entegrasyonu
- log kaydi

## AI Tarafinda Su Anda Neler Yok

- embedding tabanli arama
- vector database
- semantic search
- conversational memory
- RAG sistemi
- model secimine gore dinamik prompt yonetimi
- confidence score

## Bu Tasarimin Avantajlari

- AI kismina asiri guvenilmez
- backend kontrolu kaybetmez
- test etmek kolaydir
- hata olsa da sistem fallback ile ayakta kalir
- restoran bazli veri izolasyonu korunur

## Bu Dokumani Kim Kullanmalı

- AI entegrasyonunu anlayacak backend developer
- Ollama tarafini kuracak DevOps veya geliştirici
- recommendation sistemini gelistirecek kisi
- prompt davranisini degistirmek isteyen kisi
- customer tarafindaki AI deneyimini iyilestirecek kisi
