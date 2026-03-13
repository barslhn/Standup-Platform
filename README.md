### Standup Platform

Bu proje, klasik sabah stand-up toplantılarını tamamen ortadan kaldırmak için hazırladığım asenkron bir günlük senkronizasyon uygulaması. Amaç, herkesin gün içindeki uygun zamanında kısa bir güncelleme bırakabilmesi ve özellikle blocker durumlarının yöneticilere gecikmeden ve kaybolmadan ulaşması.

Uygulama iki rolden oluşuyor:

- **Employee**: Her gün için bir defa olacak şekilde “Yesterday / Today / Blocker” formatında standup girişi yapar.
- **Manager**: Tüm ekibin durumunu tek ekrandan takip eder, kritik blocker’ları ve eksik güncellemeleri hızlıca görebilir.

Seçtiğim ve odaklandığım challengelar:

- **Real-time (#2)**: Çalışan blocker işaretlediği anda, ilgili yöneticilere Socket.io üzerinden gerçek zamanlı bildirim gidiyor, sayfa yenilemeye gerek kalmıyor.
- **Data Integrity (#3)**: Her standup güncellemesi için versiyonlama yapıyorum. Bir kayıt düzenlendiğinde eski hali `updateVersions` tablosuna JSON olarak yazılıyor, kim ne zaman değiştirmiş görülebiliyor.

### Teknoloji Stack’i Tasklerden Yol Alarak

- **Frontend**
  - Next.js 15/16 (App Router, React 19)
  - TypeScript (strict), ESLint, Tailwind CSS
  - shadcn/ui bileşenleri
  - React Hook Form + Zod validasyon
  - Zustand + persist middleware (auth state)
  - @tanstack/react-query (server state ve caching)
  - axios (API istemcisi)
  - socket.io-client (gerçek zamanlı bildirimler)
  - next-themes (dark/light tema)

- **Backend**
  - NestJS 11 (Express adapter)
  - Drizzle ORM + PostgreSQL
  - Redis (rate limiting + cache)
  - JWT authentication, Role bazlı yetkilendirme (EMPLOYEE / MANAGER)
  - Zod + nestjs-zod ile schema-driven DTO ve fail-fast env doğrulaması
  - Swagger (OpenAPI dokümantasyonu, prod’da basic auth ile koruma)
  - Socket.io WebSocket Gateway (JWT ile handshake, userId → room mapping)

- **Altyapı / Diğer**
  - pnpm (backend ve frontend için)
  - Docker ve docker-compose
  - GitHub Actions

---

### Mimari Özeti

Proje iki ana klasörden oluşuyor:

- `frontend`: Next.js uygulaması. Auth, daily update formu, manager dashboard, manager updates listesi gibi sayfaları içeriyor.
- `backend`: NestJS API. Auth, users, daily-updates modülleri, Drizzle repository katmanı, Redis cache ve WebSocket gateway burada.

Backend tarafında klasik bir **Katmanlı Mimari** ve **Repository Pattern** kullandım:

- **Controller**: Sadece request ve response katmanı, business logic yok.
- **Service**: İş kuralları, validasyonlar ve farklı servislerin orkestrasyonu burada.
- **Repository**: Drizzle ile konuşan, sadece veri erişimiyle ilgilenen katman.

Konfigürasyon tarafında `.env` değişkenleri Zod ile validate ediliyor (fail-fast). Uygulama env eksik ya da hatalıysa daha boot aşamasında kapanıyor.

Real-time için Socket.io:

- Her kullanıcı JWT ile handshake yapıyor.
- Gateway tarafında kullanıcı `sub` id’si ile odaya join ediliyor.
- Manager’lara, çalışanların `update_changed` ve `new_blocker` event’leri userId odası üzerinden gönderiliyor.

Data integrity için:

- `daily_updates` tablosu günlük kayıtları tutuyor.
- `updateVersions` tablosu her değişiklikte eski snapshot’ı JSON olarak saklıyor.
- Edit işlemleri Drizzle transaction içinde yapılıyor, ya hem versiyon hem update başarılı oluyor, ya da ikisi birden rollback ediliyor.


### Çalıştırma (Lokal Geliştirme)

Gereksinimler: Node.js 20+, pnpm yüklü, PostgreSQL ve Redis (istersen docker-compose ile de çalıştırabilirsin, aşağıda anlattım).

1. Depoyu klonla:

```bash
git clone https://github.com/barslhn/Standup-Platform.git
cd Standup-Platform
```

2. Backend bağımlılıkları:

```bash
cd backend
pnpm install
```

3. Frontend bağımlılıkları:

```bash
cd ../frontend
pnpm install
```

4. Gerekli environment değişkenlerini ayarla.

5. Geliştirme modunda çalıştır:

Backend:

```bash
cd backend
pnpm start:dev
```

Frontend:

```bash
cd frontend
pnpm dev
```

Varsayılan olarak:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

---

### Docker ile Backend İmajı (Multi‑Stage, Alpine)

Backend için root seviyede bir `Dockerfile` kullanıyorum. Bu Dockerfile:

- `node:20-alpine` tabanlı,
- Multi-stage build,
- Sadece backend kodunu derleyip `dist` klasörünü production imajına kopyalıyor.

---

### docker-compose ile Full Stack Çalıştırma

Kök dizindeki `docker-compose.yml` dosyası şu servisleri ayağa kaldırır:

- `postgres` – PostgreSQL 16, veri kalıcılığı için volume ile.
- `redis` – Redis 7, append-only log ile.
- `backend` – NestJS API, yukarıdaki Dockerfile’dan build edilir.

### Docker ile Frontend İmajı (Multi‑Stage, Alpine)

Frontend için root seviyede bir `Dockerfile.frontend` kullanıyorum. Bu Dockerfile:

- `node:20-alpine` tabanlı,
- Multi-stage build,
- Next.js uygulamasını production için build edip `standalone` çıktıyla çalıştırıyor.

Build aşamasında `NEXT_PUBLIC_API_URL` ve `NEXT_PUBLIC_WS_URL` değerleri argüman olarak verilebilir, runtime’da da compose üzerinden environment olarak geçilir.

---

### docker-compose ile Frontend Servisi

Kök dizindeki `docker-compose.yml` içinde `frontend` servisi de tanımlıdır:

- `frontend` – Next.js uygulaması, `Dockerfile.frontend` ile build edilir.
- Varsayılan port: `3000:3000`
- `backend` servisine bağımlıdır (`depends_on`).

Böylece `docker compose up -d --build` ile backend + frontend + postgres + redis birlikte ayağa kalkar.

---

Ön hazırlık olarak kök dizinde bir `.env` dosyası oluşturup backend env’lerini buraya taşıyorum, ardından tek komutla tüm stack’i çalıştırabiliyorum:

```bash
docker compose up --build
```

Logları kontrol etmek için:

```bash
 docker compose logs -f backend
 docker compose logs -f frontend
```

Veri kalıcılığını test etmek için(durdumak için down):

```bash
docker compose down
docker compose up
```

PostgreSQL volume sayesinde tablolar ve veriler korunuyor.

---

### CI (GitHub Actions)

`.github/workflows/ci.yml` dosyasında basit bir pipeline var. Her push ve pull request’te:

1. Kod checkout ediliyor.
2. Node 20 ve pnpm kuruluyor.
3. pnpm store cache’leniyor.

Böylece:

- Lint veya type error varsa pipeline erken kırılıyor.
- Build adımına kadar her şeyin derlenebilir ve tip güvenli olduğundan emin oluyorum.

---

### Seçtiğim Challengelar ve Kısa Savunma

- **Real-time (#2)**  
  Çalışan blocker işaretlediğinde backend’de `DailyUpdateService` üzerinden manager’ların userId odalarına `new_blocker` ve `update_changed` event’leri gönderiyorum. Frontend’de Socket.io client, JWT ile handshake yapıp sadece ilgili kullanıcıya ait event’leri dinliyor. Böylece manager, sayfayı yenilemeden kritik durumları görebiliyor.

- **Data Integrity (#3)**  
  Bir standup kaydı güncellendiğinde, eski halini `updateVersions` tablosuna JSON olarak saklıyorum. Bu işlem Drizzle transaction içinde çalışıyor, yani ya hem versiyon hem güncel kayıt yazılıyor, ya da ikisi birden geri alınıyor. Frontend’de “Version History” bileşeniyle geçmiş versiyonları sade bir şekilde gösteriyorum.

---

