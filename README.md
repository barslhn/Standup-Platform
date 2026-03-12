### Standup Platform

Bu proje, klasik sabah stand-up toplantılarını tamamen ortadan kaldırmak için hazırladığım asenkron bir günlük senkronizasyon uygulaması. Amaç, herkesin gün içindeki uygun zamanında kısa bir güncelleme bırakabilmesi ve özellikle blocker (engel) durumlarının yöneticilere **gecikmeden** ve **kaybolmadan** ulaşması.

Uygulama iki rolden oluşuyor:

- **Employee**: Her gün için bir defa olacak şekilde “Yesterday / Today / Blocker” formatında standup girişi yapar.
- **Manager**: Tüm ekibin durumunu tek ekrandan takip eder, kritik blocker’ları ve eksik güncellemeleri hızlıca görebilir.

Seçtiğim ve odaklandığım challengelar:

- **Real-time (#2)**: Çalışan blocker işaretlediği anda, ilgili yöneticilere Socket.io üzerinden gerçek zamanlı bildirim gidiyor, sayfa yenilemeye gerek kalmıyor.
- **Data Integrity (#3)**: Her standup güncellemesi için versiyonlama yapıyorum. Bir kayıt düzenlendiğinde eski hali `updateVersions` tablosuna JSON olarak yazılıyor, kim ne zaman değiştirmiş görülebiliyor.
- **Analytics’e yakın ek özellik**: Manager dashboard’unda günlük istatistikler (kaç kişi gönderdi, kimler göndermedi, kaç blocker var, kaç kişi izinli, kaç kayıt sonradan düzenlenmiş) görsel olarak sunuluyor.

---

### Teknoloji Stack’i

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
  - Docker & docker-compose
  - GitHub Actions (CI: Lint → Type Check → Build)

---

### Mimari Özeti

Proje iki ana klasörden oluşuyor:

- `frontend`: Next.js uygulaması. Auth, daily update formu, manager dashboard, manager updates listesi gibi sayfaları içeriyor.
- `backend`: NestJS API. Auth, users, daily-updates modülleri, Drizzle repository katmanı, Redis cache ve WebSocket gateway burada.

Backend tarafında klasik bir **Katmanlı Mimari** ve **Repository Pattern** kullandım:

- **Controller**: Sadece request/response katmanı; business logic yok.
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
- Edit işlemleri Drizzle transaction içinde yapılıyor; ya hem versiyon hem update başarılı oluyor, ya da ikisi birden rollback ediliyor.

---

### Çalıştırma (Lokal Geliştirme)

> Gereksinimler: Node.js 20+, pnpm yüklü, PostgreSQL ve Redis (istersen docker-compose ile de çalıştırabilirsin, aşağıda anlattım).

1. Depoyu klonla:

```bash
git clone <repo-url>
cd standup-platform
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

4. Gerekli environment değişkenlerini ayarla (aşağıdaki bölüme bak).

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

### Environment Değişkenleri

#### Backend (`backend/.env`)

Bu değişkenler `backend/src/common/config/env.ts` içindeki Zod şeması ile doğrulanıyor:

**Zorunlu**

- `NODE_ENV` – `development` | `production` | `test`
- `PORT` – API portu (örn. `3001`)
- `DATABASE_URL` – PostgreSQL bağlantı URL’i  
  Örnek: `postgres://standup_user:standup_pass@localhost:5432/standup_db`
- `JWT_SECRET` – En az 16 karakter uzunluğunda secret
- `JWT_EXPIRES_IN` – JWT yaşam süresi (örn. `1h`, `3600s`)
- `FRONTEND_URL` – CORS ve WebSocket için frontend origin (örn. `http://localhost:3000`)
- `REDIS_HOST` – Redis host (lokalde `localhost` veya docker-compose kullanıyorsan `redis`)
- `REDIS_PORT` – Redis port (varsayılan `6379`)
- `SWAGGER_USER` – Swagger UI için basic auth kullanıcı adı (prod’da)
- `SWAGGER_PASSWORD` – Swagger UI için basic auth şifresi
- `RESEND_API_KEY` – Şifre sıfırlama mailleri için Resend API key
- `MAIL_FROM` – Gönderici e-posta adresi

**Opsiyonel**

- `GCS_BUCKET_NAME`, `GCS_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS` – Google Cloud Storage entegrasyonu için opsiyonel alanlar.

> Bu env değerleri doğru değilse uygulama daha başlarken Zod hatası fırlatıp ayağa kalkmıyor. Böylece yanlış config ile ayağa kalkmamış oluyorum.

#### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL` – Backend API base URL’si  
  Örnek: `http://localhost:3001`
- `NEXT_PUBLIC_WS_URL` – WebSocket URL’si  
  Örnek: `http://localhost:3001`

Bu değerler `frontend/src/core/config.ts` içinde Zod ile validate ediliyor. Eksik ya da hatalı ise Next.js uygulaması boot etmeden hata veriyor.

---

### Docker ile Backend İmajı (Multi‑Stage, Alpine)

Backend için root seviyede bir `Dockerfile` kullanıyorum. Bu Dockerfile:

- `node:20-alpine` tabanlı,
- Multi-stage build (builder + production runner),
- Sadece backend kodunu derleyip `dist` klasörünü production imajına kopyalıyor.

Lokal olarak backend imajını production modunda derleyip test etmek için:

```bash
# Proje kökünde iken
docker build -t standup-backend .

docker run --rm -p 3001:3001 \
  --env-file backend/.env \
  standup-backend
```

Sonra örnek bir endpoint ile test edebilirsin:

```bash
curl http://localhost:3001/test-status/200
```

Eğer her şey doğruysa `{ "message": "OK", "status": 200 }` döner.

---

### docker-compose ile Full Stack Çalıştırma

Kök dizindeki `docker-compose.yml` dosyası şu servisleri ayağa kaldırır:

- `postgres` – PostgreSQL 16, veri kalıcılığı için volume ile.
- `redis` – Redis 7, append-only log ile.
- `backend` – NestJS API, yukarıdaki Dockerfile’dan build edilir.

> İleride istersen frontend için de ayrı bir container eklenebilir, şu an odak backend + DB + Redis tarafında.

Ön hazırlık olarak kök dizinde bir `.env` dosyası oluşturup backend env’lerini buraya taşıyorum:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgres://standup_user:standup_pass@postgres:5432/standup_db
JWT_SECRET=super-secret-jwt-key-change-me
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:3000
REDIS_HOST=redis
REDIS_PORT=6379
SWAGGER_USER=admin
SWAGGER_PASSWORD=admin123
RESEND_API_KEY=your-resend-api-key
MAIL_FROM=onboarding@resend.dev
```

Ardından tek komutla tüm stack’i çalıştırabiliyorum:

```bash
docker compose up --build
```

Çalıştığını test etmek için:

```bash
curl http://localhost:3001/test-status/200
```

Veri kalıcılığını test etmek için:

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
4. **Backend** için:
   - `pnpm install --frozen-lockfile`
   - `pnpm lint`
   - `pnpm tsc --noEmit -p tsconfig.build.json`
   - `pnpm build`
5. **Frontend** için:
   - `pnpm install --frozen-lockfile`
   - `pnpm lint`
   - `pnpm tsc --noEmit`
   - `pnpm build`

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

### Not

Canlıya alma (Google Cloud üzerinde deployment, domain ve SSL) aşamasını ayrı bir adım olarak planladım. Docker ve docker-compose ile lokal ortamı stabilize ettikten sonra GCP üzerinde aynı imajları kullanarak deployment yapmayı hedefliyorum.
