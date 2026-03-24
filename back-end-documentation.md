# Bayt Car Backend — Project Documentation

> Session reference file. Read this at the start of every session.

---

## System Overview

### Entities

**Service** — Two kinds:
- **Priced Service**
  - `PRICED_FIXED` — fixed total price
  - `PRICED_BY_OPTION` — price determined by selected attribute options (sum of `AttributeOption.price_adjustment`); `selectedAttributes` required
  - `PRICED_PER_UNIT` — unit price × quantity
- **Non-Priced Service** — handled through offers, two flows:
  - *Customer-led*: customer submits an offer price → provider accepts or rejects it
  - *Provider-led*: customer submits no price → providers submit bids → customer accepts or rejects

**ServiceRequest** — References a `serviceId`. System resolves the pricing model from that ID and branches accordingly:
- `PRICED_FIXED` → expects total price from `service.base_price`
- `PRICED_BY_OPTION` → expects `selectedAttributes` (required); price = sum of option adjustments
- `PRICED_PER_UNIT` → expects `quantity`; price = `unit_price × quantity`
- `NON_PRICED` + `customerOfferPrice` → wait for provider to accept/reject
- `NON_PRICED` + no price → wait for provider bids; customer accepts or rejects

### Actors

| Actor | Role |
|-------|------|
| **Admin** | Platform management dashboard |
| **Provider** | Listens for and responds to service requests |
| **Customer** | Browses and requests services |

### Request Flow

1. **Creation** — Customer creates a `ServiceRequest`. Always succeeds regardless of wallet state. `is_paid` starts as `false`.
2. **Provider Notification** — Nearby verified providers are notified immediately after creation (geo-aware dispatch).
3. **Type Resolution** — Flow branches based on `pricing_model` (see [Service Request Lifecycle](#service-request-lifecycle)).
4. **Payment** — Customer pays via `POST /service-requests/:id/pay` with any supported method:
   - `WALLET` — amount frozen in wallet escrow (`frozen_balance`); released to provider on completion, refunded on cancellation
   - `CASH` / `VISA` / `MASTERCARD` — method recorded, `is_paid` set to `true`; no wallet interaction
5. **In Progress** — Once accepted:
   - Chat is enabled between customer and assigned provider
   - Live tracking begins (customer sees provider's real-time location)
6. **Completion** — When marked done:
   - For `WALLET` payments: frozen funds released to provider's wallet
   - Commission is calculated and recorded
   - Customer receives a push notification prompting them to rate the provider

---

## Technical Overview

A full-featured **car/home services platform backend** built with Node.js + TypeScript + Express. Supports customers, service providers, and admins with a complete service request lifecycle, real-time tracking/chat, wallet & commission system, and mobile-optimized API.

- **Language:** TypeScript (ES2022, ESNext modules)
- **Framework:** Express 5.x
- **Database:** MySQL/MariaDB via Prisma ORM 7.x
- **Real-time:** Socket.IO 4.x
- **Auth:** JWT (access 15m, refresh 7d) + bcryptjs
- **Port:** 5000 (default)
- **Entry point:** `src/index.ts` → `src/app.ts`

---

## Project Structure

```
src/
├── config/           # env.ts (environment loader), database config
├── constants/        # enums.ts — UserRole, RequestStatus, etc.
├── controllers/      # 23 controllers (HTTP layer)
├── middleware/       # auth.ts (JWT), authorize.ts (RBAC), upload.ts (multer avatar)
├── repositories/     # 26 repos (Prisma query layer)
├── routes/           # 26 route files
├── services/         # 27 services (business logic)
├── docs/             # openapi.ts (Swagger generation)
├── tests/            # Integration & smoke tests
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── socket.ts         # Socket.IO setup (chat + tracking)
├── app.ts            # Express app, middleware, route mounting
└── index.ts          # HTTP server + Socket.IO init

prisma/
├── schema.prisma     # 22+ models
└── migrations/

dist/                 # Compiled output (git-ignored)
uploads/
└── avatars/          # User avatar uploads (git-ignored)
```

---

## Environment Setup

Copy `.env.example` to `.env`:

```env
DATABASE_URL=mysql://root:@localhost:3306/bayt_car
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760        # 10MB
COMMISSION_RATE=0.15
SUSPENSION_THRESHOLD=3

# Email / SMTP (for OTP password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Bayt Car <no-reply@baytcar.com>

# Social login
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
APPLE_CLIENT_ID=com.yourapp.bundle-id   # bundle/service ID for Sign in with Apple
```

---

## Scripts

```bash
npm run dev              # Dev with hot reload (tsx + nodemon)
npm run build            # Compile TypeScript → dist/
npm start                # Production (from dist/)
npm run prisma:migrate   # Apply DB migrations
npm run seed             # Seed database
npm run docs:update      # Regenerate Swagger JSON
npm run test:mobile      # Full test suite
npm run qa:mobile-contract  # Mobile contract verification
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
```

---

## Architecture Layers

```
Routes → Controllers → Services → Repositories → Prisma → DB
                    ↑
              Middleware (auth, authorize, upload, validation)
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Routes | `src/routes/` | URL registration, validation, middleware |
| Controllers | `src/controllers/` | HTTP req/res, input extraction, response shaping |
| Services | `src/services/` | Business logic, orchestration |
| Repositories | `src/repositories/` | All Prisma queries |

---

## Authentication

**Endpoints:**
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | Public | Register CUSTOMER or PROVIDER |
| POST | `/api/auth/app/login` | Public | Login (mobile app users) |
| POST | `/api/auth/admin/login` | Public | Login (admin dashboard) |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | Public | Invalidate refresh token |
| POST | `/api/auth/change-password` | Bearer | Change password |
| POST | `/api/auth/forgot-password` | Public | Send OTP to email for password reset |
| POST | `/api/auth/reset-password` | Public | Reset password using OTP |
| POST | `/api/auth/social-login` | Public | Login/register via Google, Facebook, or Apple |

**Social Login Providers** (`POST /api/auth/social-login`):
| Provider | Token type | Notes |
|----------|-----------|-------|
| `google` | ID token | Verified via Google OAuth2Client; stored in `google_id` |
| `facebook` | Access token | Verified via Graph API; stored in `facebook_id` |
| `apple` | Identity token (JWT) | Verified via Apple JWKS (no extra package); stored in `apple_id` |

**Flow:**
1. Register / login → returns `accessToken` (15m) + `refreshToken` (7d)
2. Attach `Authorization: Bearer <accessToken>` to all protected requests
3. On 401, call `/api/auth/refresh` with `{ refreshToken }` body
4. Logout blacklists the refresh token in DB

**Middleware:**
- `authenticate` (`src/middleware/auth.ts`) — validates JWT, attaches `req.user`
- `authorize(...roles)` (`src/middleware/authorize.ts`) — RBAC check
- `uploadAvatar` (`src/middleware/upload.ts`) — multer diskStorage for avatar uploads

---

## User Roles

**App users** (`AppUser`) have a `current_mode` field only — no separate role field:

| Mode | Description |
|------|-------------|
| `CUSTOMER` | Books services, makes offers, manages wallet |
| `PROVIDER` | Accepts jobs, tracks requests, receives commissions |

**Admin staff** are stored in `SystemUser` and have fine-grained RBAC via `Role` → `Permission`:
- `Role` defines named roles (e.g. `super_admin`, `finance_manager`)
- `Permission` defines capability slugs (e.g. `services.create`, `finance.view`)
- `RolePermission` is the pivot joining them

---

## Core API Routes

### Users (Self-service — any authenticated user)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/me` | Bearer | Get own full profile (wallet, loyalty, recent requests) |
| PATCH | `/api/users/me` | Bearer | Update own name and/or phone |
| POST | `/api/users/me/avatar` | Bearer | Upload profile picture (`multipart/form-data`, `avatar` field) |
| PATCH | `/api/users/me/mode` | Bearer | Switch current_mode (CUSTOMER ↔ PROVIDER; requires provider profile) |

### Users (Admin only)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | ADMIN | List all users |
| POST | `/api/users` | ADMIN | Create user |
| GET | `/api/users/:id` | ADMIN | Get user by ID |
| PATCH | `/api/users/:id` | ADMIN | Update user (incl. role, isActive) |
| DELETE | `/api/users/:id` | ADMIN | Delete user |

### Providers
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/providers` | PROVIDER | Create provider profile |
| GET | `/api/providers` | Public | List providers |
| GET | `/api/providers/me` | PROVIDER | Get own provider profile |
| PATCH | `/api/providers/me/location` | PROVIDER | Update last known GPS location (used for geo dispatch) |
| GET | `/api/providers/:id` | Public | Provider details |
| PUT | `/api/providers/:id/verify` | ADMIN | Verify provider |
| PUT | `/api/providers/:id/suspend` | ADMIN | Suspend provider |

### Services
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/services` | Optional | No token → active only; admin token → all (supports `?isActive` filter) |
| POST | `/api/services` | ADMIN | Create service |
| GET | `/api/services/:id` | Optional | No token → 404 if inactive; admin token → always returns |
| PATCH | `/api/services/:id/catalog` | ADMIN | Update catalog fields (name, description, category_id, gps_radius_km, icon_url, is_active, is_emergency, icon_shape, display_color, sort_order) and optionally upsert/remove a service-scoped discount offer (`offer.type`, `offer.value`, `offer.validFrom`, `offer.validTo`; pass `offer: null` to deactivate) |
| PATCH | `/api/services/:id/icon` | ADMIN | Upload icon image (`multipart/form-data`, `icon` field — JPEG/PNG/WebP) |
| PUT | `/api/services/:id` | PROVIDER | Update own service (name, price, duration) |
| DELETE | `/api/services/:id` | PROVIDER | Delete service |
| GET | `/api/services/:id/attributes` | Public | List attributes for a service |
| POST | `/api/services/:id/attributes` | PROVIDER | Add attribute to a service |
| PUT | `/api/services/:id/attributes/:attrId` | PROVIDER | Update attribute |
| DELETE | `/api/services/:id/attributes/:attrId` | PROVIDER | Delete attribute |

### Service Categories
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/service-categories` | Optional | No token → active only; admin token → all |
| POST | `/api/service-categories` | ADMIN | Create category (`slug` auto-generated from `name_ar` if omitted) |
| GET | `/api/service-categories/:id` | Optional | No token → 404 if inactive; admin token → always returns |
| PATCH | `/api/service-categories/:id` | ADMIN | Update category |
| DELETE | `/api/service-categories/:id` | ADMIN | Delete category |

### Service Requests (Core Lifecycle)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/service-requests` | Auth | Create request; body varies by `pricing_model` (see lifecycle section). Always succeeds — wallet not required. |
| GET | `/api/service-requests` | Auth | List requests (role-filtered) |
| GET | `/api/service-requests/open` | PROVIDER | Job board: open NON_PRICED requests with no provider |
| POST | `/api/service-requests/:id/pay` | CUSTOMER | Pay for a request (`paymentMethod`: `CASH`, `VISA`, `MASTERCARD`, `WALLET`) |
| POST | `/api/service-requests/:id/provider/accept` | PROVIDER | Accept a priced or customer-led request |
| POST | `/api/service-requests/:id/provider/bid` | PROVIDER | Submit a bid (NON_PRICED provider-led) |
| GET | `/api/service-requests/:id/bids` | CUSTOMER | List all PENDING bids for a NON_PRICED provider-led request |
| POST | `/api/service-requests/:id/bids/:bidId/accept` | CUSTOMER | Accept a specific bid by ID (atomically rejects all others) |
| POST | `/api/service-requests/:id/bids/:bidId/reject` | CUSTOMER | Reject a specific bid (other bids and request stay OPEN) |
| GET | `/api/service-requests/:id/details` | Auth | Full order aggregate |
| GET | `/api/service-requests/:id/timeline` | Auth | Status history |
| PUT | `/api/service-requests/:id/status` | Auth | Update status |
| DELETE | `/api/service-requests/:id` | Auth | Cancel with reason |
| PATCH | `/api/service-requests/:id/adjust-price` | ADMIN | Override `final_agreed_price` with `{ newPrice }` |

### Offers / Negotiation
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/offers` | Auth | Create offer |
| PUT | `/api/offers/:id/counter` | Auth | Provider counter-offer |
| PUT | `/api/offers/:id/customer-accept` | Auth | Customer accepts counter |
| PUT | `/api/offers/:id/customer-reject` | Auth | Customer rejects counter |
| DELETE | `/api/offers/:id` | Auth | Withdraw offer |

### Wallet
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/wallet` | Auth | Get balance |
| POST | `/api/wallet/topup` | Auth | Add funds |
| GET | `/api/wallet/transactions` | Auth | Transaction history |

### Orders, Invoices & Commissions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders/:requestId` | ADMIN | Finalize order |
| GET | `/api/orders/:requestId/breakdown` | Auth | Commission breakdown |
| POST | `/api/invoices/service-request/:id` | ADMIN | Create invoice |
| GET | `/api/invoices/verify/:qrToken` | Public | Verify via QR (no auth) |
| GET | `/api/invoices/:id/pdf` | Auth | Export PDF |
| GET | `/api/commission-rules` | ADMIN | List commission rules |

### Tracking (REST)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/tracking/service-requests` | PROVIDER | Post location update |
| GET | `/api/tracking/service-requests/:id` | Auth | Latest location |
| GET | `/api/tracking/service-requests/:id/history` | Auth | Location history (paginated) |
| PATCH | `/api/tracking/stop/service-requests/:id` | PROVIDER | Stop tracking |

### Chat, Reviews & Notifications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/chat` | Auth | Start conversation |
| POST | `/api/chat/:id/send` | Auth | Send message |
| POST | `/api/reviews` | Auth | Submit review (after completion) |
| GET | `/api/notifications` | Auth | List notifications |
| PUT | `/api/notifications/:id/read` | Auth | Mark as read |

### Loyalty
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/loyalty` | Auth | Get points balance |
| POST | `/api/loyalty/redeem` | Auth | Redeem points → wallet cashback |

### Admin & Settings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | ADMIN | Platform statistics |
| GET | `/api/system-settings` | Auth | System configuration |
| GET | `/api/tax` | Auth | Tax settings |

---

## Service Request Lifecycle

The flow branches at creation time based on the service's `pricing_model`:

### PRICED_FIXED
```
OPEN → (provider accepts) → ACCEPTED → COMPLETED
```
- `final_agreed_price` = `service.base_price` (flat); attributes may add optional adjustments on top
- Request body: `serviceId`, `scheduledDate`, `selectedAttributes?` — DROPDOWN item: `{ attributeId, selectedOptionId }`; RADIO item: `{ attributeId }` (presence = selected)

### PRICED_BY_OPTION
```
OPEN → (provider accepts) → ACCEPTED → COMPLETED
```
- `final_agreed_price` = sum of `AttributeOption.price_adjustment` values from selected attributes; `base_price` is always `0`
- `selectedAttributes` is **required** — request creation throws if none provided
- Use this for services where the price is unknown until the customer picks options (e.g. تركيب دش: small=100, medium=150, large=200)
- Request body: `serviceId`, `scheduledDate`, `selectedAttributes` (required) — each item: `{ attributeId, selectedOptionId }` where `selectedOptionId` is the UUID of the chosen `AttributeOption`

### PRICED_PER_UNIT
```
OPEN → (provider accepts) → ACCEPTED → COMPLETED
```
- `final_agreed_price` = `service.base_price` (unit price) × `quantity`
- Request body requires: `quantity` (positive integer)

### NON_PRICED — Sub-case A (customer-led offer)
```
OPEN → (provider accepts customer price) → ACCEPTED → COMPLETED
```
- Customer includes `customerOfferPrice` in the request body
- Provider accepts or passes; if accepted, `final_agreed_price = customerOfferPrice`

### NON_PRICED — Sub-case B (provider-led offers)
```
OPEN → (multiple providers submit bids) → (customer accepts one bid) → ACCEPTED → COMPLETED
```
- Customer sends no price; providers submit bids via `POST /api/service-requests/:id/provider/bid`
- **Multiple concurrent bids are supported** — each bid is a `ServiceRequestBid` row; `ServiceRequest.status` stays `OPEN` throughout
- Customer lists pending bids via `GET /api/service-requests/:id/bids` and accepts/rejects individual bids by `bidId`
- On acceptance: winning bid → `ACCEPTED`, all other pending bids atomically → `REJECTED`, `ServiceRequest` → `ACCEPTED`
- On rejection of a single bid: only that bid → `REJECTED`; other bids and the request remain `OPEN`
- Each provider can only have one `PENDING` bid per request (unique constraint)

### On COMPLETED (all types):
1. `OrderFinalizationService` calculates commission breakdown
2. Applies tax settings
3. Awards loyalty points (idempotent via unique constraint)
4. Creates immutable Invoice (INV-YYYYMM-XXXX)

### Cancellation Approval (paid requests)
When a request has been paid (funds frozen), cancellation by one party requires the other party's approval:
- `cancel_request_status` on `ServiceRequest`: `NOT_REQUESTED` → `PENDING` → (`REJECTED` or auto-cancelled)
- Fields: `cancel_request_reason`, `cancel_requested_by`, `cancel_requested_at`
- On approval: frozen funds returned via `PAYMENT_HOLD_RELEASED` wallet transaction — **only if `is_paid=true` and `payment_method='WALLET'`**; CASH/VISA/MASTERCARD cancellations require no wallet action

---

## Real-Time (Socket.IO)

**Auth:** JWT token required on connection.

**Chat events:**
| Event | Direction | Description |
|-------|-----------|-------------|
| `join_conversation` | Client → Server | Join chat room |
| `leave_conversation` | Client → Server | Leave chat room |
| `send_message` | Client → Server | Send message |
| `message_sent` | Server → Client | ACK with message |
| `typing_start` / `typing_stop` | Client → Server | Typing status |

**Dispatch events (server-pushed, no client join needed):**
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `new_service_request` | Server → Provider | `{ serviceRequestId, serviceId, serviceName, pricingModel, subType, finalAgreedPrice, customerOfferPrice, scheduledAt, createdAt, latitude, longitude }` | Emitted to online providers in range when a request is created; `subType` is `PRICED`, `CUSTOMER_LED`, or `PROVIDER_LED` |
| `new_bid_received` | Server → Customer | `{ serviceRequestId, bidId, providerId, providerName, bidPrice, submittedAt }` | Emitted to the customer when a provider submits a bid on their NON_PRICED provider-led request |
| `bid_accepted` | Server → Provider | `{ serviceRequestId, bidId }` | Emitted to the winning provider when the customer accepts their bid |

**Tracking events:**
| Event | Direction | Description |
|-------|-----------|-------------|
| `join_tracking` | Provider → Server | Start tracking session |
| `location_update` | Provider → Server | Broadcast coordinates |
| `stop_tracking` | Provider → Server | End session |
| `watch_tracking` | Customer/Admin → Server | Subscribe to updates |
| `location_updated` | Server → Watchers | Real-time coordinates |
| `tracking_stopped` | Server → Watchers | Session ended |

**Rooms:** `user:{userId}`, `conversation:{conversationId}`, `tracking:{serviceRequestId}`

**Server-side emit helper:** `emitToUser(userId, event, payload)` exported from `src/socket.ts` — emits to `user:{userId}` room; safe no-op if called before socket init.

---

## Database Schema (Key Models)

| Model | Key Fields | Notes |
|-------|------------|-------|
| `AppUser` | id (UUID), phone, email, is_provider, current_mode, is_active, avatar, is_verified, google_id, facebook_id, apple_id | Unified customer/provider; `is_provider Boolean @default(false)` — schema flag; `current_mode` (CUSTOMER/PROVIDER) drives runtime behaviour; `is_active` (default true) — admin can freeze/suspend; `is_verified` (schema only, no login blocking); OTP moved to `Otp` table; each social ID column is independently nullable and unique; back-relations `customer_conversations` and `provider_conversations` link to `Conversation` |
| `Otp` | id (UUID), user_id, code, purpose, expires_at, created_at | Dedicated OTP table; `purpose` = `PASSWORD_RESET` / `EMAIL_VERIFY` / `PHONE_VERIFY`; one row per user per purpose (old row deleted before insert) |
| `ProviderProfile` | id (UUID), is_verified, is_suspended, unpaid_count, suspension_reason, suspended_until, suspended_by, rating, last_latitude, last_longitude | 1-to-1 with AppUser; suspension state merged in (no separate ProviderSuspension table); lat/lng used for geo dispatch |
| `Service` | id (UUID), pricing_model, base_price, unit_label, gps_radius_km, category_id, is_active, is_emergency, is_negotiable, icon_shape, display_color, sort_order | `PRICED_FIXED` / `PRICED_BY_OPTION` / `PRICED_PER_UNIT` / `NON_PRICED`; base_price = 0 for PRICED_BY_OPTION, unit price for PRICED_PER_UNIT; `is_active`/`is_emergency`/`is_negotiable` are admin-managed CMS flags |
| `ServiceCategory` | id (UUID), name_ar, name_en, slug, sort_order, is_active | Optional category grouping for services |
| `ServiceAttribute` | label, field_type, is_required, affects_price, price_adjustment (Decimal?, nullable) | DROPDOWN/RADIO; used for option-based pricing on PRICED_BY_OPTION services; `price_adjustment` stores the fixed upcharge for RADIO attributes (selected = upcharge applied, absent = not selected); DROPDOWN price adjustments live on `AttributeOption` rows instead |
| `AttributeOption` | label, price_adjustment | Option values for DROPDOWN attributes; each selectable option carries its own `price_adjustment` |
| `ServiceRequest` | id (UUID), status, final_agreed_price, quantity, latitude, longitude, is_paid, payment_method, address_*, cancel_request_status, accepted_at, provider_discount_amount | Core transaction model; `is_paid` (default `false`) set to `true` via `POST /:id/pay`; `payment_method` one of `CASH`, `VISA`, `MASTERCARD`, `WALLET`; address fields for booking; `cancel_request_status` (NOT_REQUESTED/PENDING/REJECTED) for paid-request cancellation approval flow; `provider_discount_amount Decimal? @default(0.00)` — optional discount applied by provider on acceptance |
| `ServiceRequestBid` | id (UUID), service_request_id, provider_id, bid_price, status (PENDING/ACCEPTED/REJECTED), created_at | One row per provider bid on a NON_PRICED provider-led request; `@@unique([service_request_id, provider_id])` prevents duplicate bids; accepted atomically via `acceptBidAndRejectOthers` transaction |
| `ServiceRequestExtra` | attribute_id (nullable), selected_option, custom_name, custom_price, final_price, quantity | Attribute selections on a request; `attribute_id` null for custom (free-text) extras |
| `Wallet` | user_id (unique), balance, frozen_balance | One per user |
| `WalletTransaction` | type, amount | DEPOSIT/WITHDRAWAL/PAYMENT_SENT/PAYMENT_HOLD/PAYMENT_HOLD_RELEASED/PAYMENT_RELEASED_TO_PROVIDER/etc. |
| `Commission` | serviceRequestId, amount, isPaid, dueDate | Provider commission due |
| `CommissionBreakdown` | base_price, customer_fee, provider_commission, tax, discount_amount, platform_discount_amount, provider_discount_amount, final_customer_pay, final_provider_receive | Per completed request; `platform_discount_amount` = discount absorbed by platform commission; `provider_discount_amount` = discount from provider earnings only (platform commission unchanged) |
| `CommissionRule` | scope (GLOBAL/SERVICE/PROVIDER), pct fields | Configurable rates |
| `SystemRevenue` | amount, source_type, reference_id | Platform earnings ledger |
| `Invoice` | invoice_number, qr_token, status, cashback_used, discount_amount | Immutable after creation; snapshots customer/provider/service |
| `LoyaltyPointsAccount` | user_id (unique), balance (integer points) | Per user |
| `LoyaltyConfig` | points_per_currency, cashback_per_point, min_points_redemption | Global config |
| `Conversation` | id (UUID), serviceRequestId (unique), customerId, providerId, lastMessageAt | Chat threads; `customerId` and `providerId` are direct FK columns on `Conversation`; `@@unique([customerId, providerId])` prevents duplicate threads; `customer` and `provider` relate back to `AppUser` via `"CustomerConversations"` / `"ProviderConversations"` named relations |
| `Message` | conversationId, senderId, content, attachments, isRead, readAt | Chat messages; `attachments` stores attachment URL(s) |
| `Tracking` | serviceRequestId (unique), providerId, lat, lng, speed, heading | Latest provider location; `heading` in degrees |
| `Notification` | user_id, title, body, data (Json), is_read, read_at | In-app notifications; `data` for deep-link payload |
| `PushToken` | user_id, token, platform, device_name, is_active, last_used_at | FCM/APNs tokens |
| `RefreshToken` | token (unique, VARCHAR 512), userId, expiresAt | Token blacklisting; token column widened to avoid JWT truncation |
| `SystemUser` | id (UUID), email, role_id | Admin accounts; RBAC via `Role` → `Permission` |
| `Role` | id (UUID), name (unique) | Admin role (e.g. super_admin, finance) |
| `Permission` | id (UUID), slug (unique) | Permission slug (e.g. `services.create`, `finance.view`) |
| `RolePermission` | role_id, permission_id | Pivot — many-to-many Role ↔ Permission |
| `SystemSetting` | key (PK), value | Key-value config store |
| `TaxSettings` | is_enabled, tax_percent | Platform tax config |
| `Offer` | code, type (PERCENTAGE/FIXED), value, scope (ALL/SERVICE/SERVICES), entity_id, provider_id, valid_from/to, usage_limit, is_active | Discount/promo records; `scope=SERVICE` → single service via `entity_id`; `scope=SERVICES` → multiple services via `OfferService` pivot; `provider_id null` = admin/global offer, set = provider-owned promo; linked to `ProviderProfile` via `offers Offer[]` back-relation |
| `OfferService` | offer_id, service_id (@@id([offer_id, service_id])) | Pivot linking an offer to multiple services when `scope = SERVICES` |
| `OfferUsage` | offer_id, service_request_id, user_id, discount_amount | Per-use audit trail |
| `Review` | serviceRequestId (unique), rating (1-5), comment (Json multilingual) | Post-completion |
| `Report` | report_type, title, period_from/to, summary (Json) | Admin-generated reports (WALLET_SUMMARY, FINANCIAL, SERVICES_BY_REGION) |
| `Banner` | image_url, type (AD/SERVICE), service_id, platform (ALL/ANDROID/IOS), sort_order | In-app banners linked optionally to a service |
| `SplashScreen` | image_url, title, platform, valid_from/to | Mobile splash/onboarding screens |

All primary keys use UUID (`@default(uuid())`).

---

## Commission & Loyalty

**Commission:**
- Default rate: 10% (configurable via `CommissionRule`)
- Scopes: GLOBAL → SERVICE-specific → PROVIDER-specific (most specific wins)
- Due: 30 days after completion
- Suspension: unpaid count > `SUSPENSION_THRESHOLD` (default 3) → provider suspended

**Loyalty:**
- Earn: configurable points per currency unit (e.g., 1pt/SAR)
- Redeem: points → wallet cashback
- Min threshold: configurable (default 100 pts)
- Idempotent: unique constraint prevents double-award

---

## Invoice Format

- **Number:** `INV-YYYYMM-XXXX` (e.g., `INV-202503-0001`)
- **QR Token:** 64-byte hex (public verification, no auth needed)
- **Status:** `PAID` or `REFUNDED`
- **Immutable** once created (snapshots customer/provider names as JSON)
- **PDF export:** PdfKit library, authenticated endpoint

---

## Avatar Upload

- **Endpoint:** `POST /api/users/me/avatar` (`multipart/form-data`, field: `avatar`)
- **Middleware:** `src/middleware/upload.ts` (multer diskStorage)
- **Allowed types:** JPEG, PNG, WebP
- **Max size:** `MAX_FILE_SIZE` env var (default 10 MB)
- **Storage path:** `UPLOAD_DIR/avatars/<userId>-<timestamp>.<ext>` (default `./uploads/avatars/`)
- **Avatar field** on `AppUser` stores a URL string (e.g., `/uploads/avatars/abc-123.jpg`)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [src/index.ts](src/index.ts) | Server entry point |
| [src/app.ts](src/app.ts) | Express setup, route mounting |
| [src/socket.ts](src/socket.ts) | Socket.IO (chat, tracking, dispatch); exports `isUserOnline`, `getUserSocketId`, `emitToUser` |
| [src/config/env.ts](src/config/env.ts) | Environment variable loader |
| [src/middleware/auth.ts](src/middleware/auth.ts) | JWT authentication middleware; exports `authenticate`, `optionalAuthenticate` (populates `req.user` if token present, never returns 401), `authorize` |
| [src/middleware/authorize.ts](src/middleware/authorize.ts) | Role-based authorization |
| [src/middleware/upload.ts](src/middleware/upload.ts) | Multer avatar upload middleware |
| [src/constants/enums.ts](src/constants/enums.ts) | Shared enums (roles, statuses) |
| [prisma/schema.prisma](prisma/schema.prisma) | Full database schema |
| [.env.example](.env.example) | Environment template |
| [MOBILE_BACKEND_TASKS.md](MOBILE_BACKEND_TASKS.md) | Implementation roadmap |
| [MOBILE_LIFECYCLE_TEST_SCENARIOS.md](MOBILE_LIFECYCLE_TEST_SCENARIOS.md) | Test scenarios |
| [src/utils/geo.ts](src/utils/geo.ts) | Haversine distance helper for geo-aware provider dispatch |
| [bayt-car-api-docs.json](bayt-car-api-docs.json) | Exported Swagger/OpenAPI spec (89 paths) |

---

## Swagger / API Docs

- **Local:** `http://localhost:5000/api-docs` (disabled in production)
- **Update:** `npm run docs:update` → regenerates `bayt-car-api-docs.json`
- **Source:** `src/docs/openapi.ts`
- **Tags:** Auth, Users, Providers, Services, **Service Categories** (separate from Services), Service Requests, Invoices, Loyalty & Wallet, Admin, Chat, Furniture Delivery, Offers, Reviews, Notifications, System Settings, Tracking

---

## Testing

```bash
npm run test:mobile             # Full mobile test suite
npm run qa:mobile-contract      # Contract verification
```

Test files in `src/tests/`:
- `api-smoke.test.ts` — Smoke tests
- `mobile-contract.test.ts` — Mobile API contract
- `auth-middleware.test.ts` — Auth middleware unit tests
- `review-lifecycle.integration.test.ts` — Full lifecycle integration

---

## Docker

```bash
npm run docker:up    # docker-compose up
npm run docker:down  # docker-compose down
```

`Dockerfile` + `docker-compose.yml` at project root.

---

## Current Branch & Status

- **Main branch:** `main`
- **Active branch:** `mkhaled-test-after-codex-tasks`
- All primary keys migrated to UUID
- Core features implemented: auth, requests, offers, wallet, commissions, loyalty, invoices, tracking, chat, notifications
- **Completed:**
  - `PATCH /users/me/mode` auto-creates a blank `ProviderProfile` (all defaults) when switching to PROVIDER for the first time — no separate profile creation step required
  - `PATCH /users/me` now accepts `email` updates alongside `name` and `phone`; Prisma P2002 (unique constraint) caught and returned as 409 with a human-readable message
  - All mobile auth responses (`register`, `app/login`, `social-login`) now return `currentMode` only — `role` and `isProvider` fields removed; `confirm_password` validation added to `register`
  - `GET /users/me` and `PATCH /users/me` responses return `currentMode` instead of `role`
  - JWT refresh fixed: decoded payload claims (`exp`, `iat`) are stripped before re-signing a new access token
  - `RefreshToken.token` column widened from `VARCHAR(191)` to `VARCHAR(512)` to prevent JWT truncation; migration `20260315000008_refresh_token_varchar512` applied
  - OTP fields (`otp_code`, `otp_expires_at`) removed from `AppUser`; dedicated `Otp` table added with `purpose` column (`PASSWORD_RESET` / `EMAIL_VERIFY` / `PHONE_VERIFY`); `is_verified` boolean added to `AppUser` (schema only, no login blocking); migration `20260315000007_otp_table_and_is_verified` applied
  - Full auth endpoint Swagger documentation (forgot-password, reset-password, social-login, logout, change-password)
  - Social login supports Google, Facebook, Apple (JWKS verification); X/Twitter dropped
  - User self-service endpoints: GET/PATCH `/users/me`, POST `/users/me/avatar`, PATCH `/users/me/mode`
  - Avatar upload middleware (`src/middleware/upload.ts`) using multer diskStorage
  - Swagger Service Categories tag separated from Services tag
  - Geo-aware provider dispatch (`dispatchToProviders`): notifies only providers within `Service.gps_radius_km` of request coordinates; falls back to all verified providers when geo data is absent or no providers are in range
  - `ServiceRequest` schema extended with `latitude` / `longitude` (Decimal, nullable)
  - `PATCH /api/providers/me/location` — provider reports current GPS coordinates (stored on `ProviderProfile.last_latitude` / `last_longitude`)
  - `src/utils/geo.ts` — Haversine distance helper
  - Removed `GET /api/auth/me` (superseded by `GET /api/users/me` and `GET /api/providers/me`)
  - Apple promoted to primary social login partner alongside Google and Facebook
  - Replaced `social_provider`/`social_id` (generic composite-key approach) with three dedicated unique columns: `google_id`, `facebook_id`, `apple_id` on `AppUser`; migration `20260315000006` applied
  - Replaced `PricingType` enum (`FIXED`, `BY_OPTION`, `PER_UNIT`, `CUSTOMER_DEFINED`) with `ServiceType` enum on the `Service` model; renamed field `pricing_type` → `pricing_model`
  - Migration applied: `prisma/migrations/20260314000000_replace_pricing_type_with_service_type/`
  - `ServiceRequest` extended with `quantity Int?` (required for `PRICED_PER_UNIT` services; `final_agreed_price = base_price × quantity`)
  - `NON_PRICED` covers two sub-flows: customer-led (send `customerOfferPrice`) and provider-led (providers submit bids via `/provider/bid`)
  - Added `PRICED_BY_OPTION` as a distinct 4th pricing model — price resolved entirely from `AttributeOption.price_adjustment`; `selectedAttributes` required at request creation; `base_price` always 0
  - `PRICED_FIXED` is now strictly flat-price only; attribute adjustments are optional extras on top
  - Seed updated: `تركيب دش` (dish installation) migrated from `PRICED_FIXED` to `PRICED_BY_OPTION`
  - Migration applied: `prisma/migrations/20260314000001_add_priced_by_option/`
  - Swagger docs updated: all `pricing_model` enums include `PRICED_BY_OPTION`; `POST /service-requests` has a pricing model reference table
  - RBAC system for `SystemUser`: `Role`, `Permission`, `RolePermission` models; `SystemUser.role_id` FK replaces flat role string
  - `ServiceRequest` address fields: `address_city`, `address_area`, `address_street`, `address_building`, `payment_method`
  - `ServiceRequest` cancellation approval flow: `cancel_request_status` (NOT_REQUESTED/PENDING/REJECTED), `cancel_request_reason`, `cancel_requested_by`, `cancel_requested_at`
  - `ServiceRequest.accepted_at` — timestamp when request became ACCEPTED (used for payment timeout)
  - `ServiceRequest.provider_discount_amount` — optional discount applied by provider on acceptance
  - `ServiceRequestExtra` expanded: optional `attribute_id` (null for custom extras), `selected_option` (Json), `custom_input`, `custom_name`, `custom_price`, `quantity`
  - `Tracking.heading` field added (degrees, optional)
  - `Message.attachments` and `Message.readAt` fields added
  - `Notification.data` (Json) and `Notification.read_at` fields added
  - `PushToken.device_name` and `PushToken.last_used_at` fields added
  - `SystemRevenue` model — platform earnings ledger
  - `Report` model — admin-generated reports (WALLET_SUMMARY, FINANCIAL, TRANSACTIONS)
  - `Banner` model — in-app banners (AD or SERVICE type) with platform targeting (ALL/ANDROID/IOS)
  - `SplashScreen` model — mobile splash/onboarding screens
  - `OfferUsage` model — per-use audit trail for promo codes
  - `TransactionType` extended with `PAYMENT_HOLD`, `PAYMENT_HOLD_RELEASED`, `PAYMENT_RELEASED_TO_PROVIDER`
  - `AppUser` has no `role` field — only `current_mode` (CUSTOMER/PROVIDER); admin roles via `SystemUser` RBAC
  - Payment decoupled from service request creation: `POST /service-requests` no longer requires or touches the wallet — always succeeds; `is_paid Boolean @default(false)` added to `ServiceRequest` schema
  - New `POST /service-requests/:id/pay` endpoint (CUSTOMER only): accepts `paymentMethod` of `CASH`, `VISA`, `MASTERCARD`, or `WALLET`; WALLET payments freeze the amount in escrow (`walletRepository.freezeForRequest`); other methods simply mark `is_paid=true`
  - Wallet release on completion (`releaseToProvider`) and wallet refund on cancellation (`unfreezeToCustomer`) are now gated on `payment_method === 'WALLET'` — CASH/VISA/MASTERCARD requests skip wallet operations entirely
  - `serviceRequestRepository.markPaid(id, paymentMethod)` helper added
  - `POST /service-requests` Swagger docs overhauled: removed `providerId` (commented out in route), removed `offerId` (not wired to repository), added per-pricing-model `examples` dropdown, improved field descriptions
  - `POST /service-requests/:id/pay` documented in Swagger with method-specific behaviour table
  - **Real-time broadcast system**: `dispatchToProviders()` now emits `new_service_request` Socket.IO event to each online provider's `user:{userId}` room on request creation; FCM/DB notifications continue for offline providers; payload includes `pricingModel`, `subType` (`PRICED` / `CUSTOMER_LED` / `PROVIDER_LED`), and price fields per model
  - **Multi-bid support for NON_PRICED provider-led flow**: `ServiceRequestBid` model added (`prisma/schema.prisma`); `BidStatus` enum (`PENDING` / `ACCEPTED` / `REJECTED`); unique constraint `[service_request_id, provider_id]` prevents duplicate bids; `ServiceRequest.status` stays `OPEN` while bids are pending (no longer moves to `PENDING_CUSTOMER_APPROVAL` for provider-led requests)
  - **New bid API endpoints**: `GET /:id/bids` (list pending), `POST /:id/bids/:bidId/accept` (atomic accept + reject others), `POST /:id/bids/:bidId/reject` (single rejection); old `/:id/customer/accept-bid` and `/:id/customer/reject-bid` removed
  - **`new_bid_received` socket event**: emitted to customer's `user:{userId}` room when a provider submits a bid; payload includes `bidId`, `providerName`, `bidPrice`
  - **`bid_accepted` socket event**: emitted to the winning provider when their bid is accepted
  - **`emitToUser(userId, event, payload)` export** added to `src/socket.ts`; uses module-level `_io` var assigned in `initializeSocket()`; safe no-op before init
  - `serviceRequestRepository` extended with `createBid`, `findBidById`, `findPendingBids`, `findExistingBid`, `acceptBidAndRejectOthers` (atomic Prisma transaction)
  - **Route file updated** (`src/routes/serviceRequest.routes.ts`): old `/:id/customer/accept-bid` and `/:id/customer/reject-bid` routes removed; new `GET /:id/bids`, `POST /:id/bids/:bidId/accept`, `POST /:id/bids/:bidId/reject` routes added with `authorize(UserRole.CUSTOMER)` and UUID param validation for both `:id` and `:bidId`
  - **`selectedAttributes` input contract changed**: `selectedOption` (translated name object) replaced by `selectedOptionId` (UUID of `AttributeOption`); service now resolves options by `opt.id === selectedOptionId` instead of brittle `JSON.stringify` name comparison; throws `Option <id> not found for attribute <id>` on invalid ID; `ServiceRequestExtra.selectedOption` stores the option's `label` string for display; route validator added (`body('selectedAttributes.*.selectedOptionId').optional().isUUID()`); Swagger request body schema and examples updated accordingly
  - **RADIO attribute price adjustment**: `price_adjustment Decimal?` column added to `ServiceAttribute` (applied via raw SQL due to DB drift; `prisma generate` re-run); DROPDOWN price adjustments remain on `AttributeOption`; service layer now branches on `field_type` — DROPDOWN uses `selectedOptionId` lookup, RADIO reads `attribute.price_adjustment` directly when the attribute is included with no `selectedOptionId`; Swagger `selectedOptionId` description updated to clarify DROPDOWN-only requirement; PRICED_FIXED example updated to show a RADIO entry alongside a DROPDOWN entry
  - **Seed redesigned** (`prisma/seed.ts`): `upsertAttribute` helper updated to accept `priceAdjustment` parameter (stored on the attribute for RADIO, ignored for DROPDOWN); 11 services now have realistic attributes (previously only 4); RADIO attributes that incorrectly held multiple `AttributeOption` rows converted to true boolean RADIOs (options cleared, price on attribute); services and their attributes: تركيب دش (حجم طبق الدش DROPDOWN priced), غسيل السيارات (نوع السيارة DROPDOWN +0/+20/+30, تلميع إضافي RADIO +40), تغيير زيت (ماركة الزيت DROPDOWN informational, تغيير الفلتر الهوائي RADIO +30), تنظيف تكيف (نوع التكيف DROPDOWN informational, مستوى التنظيف RADIO +40), تغيير كفر (حجم الإطار DROPDOWN +0/+20/+40, ضبط التوازن RADIO +30), تغيير بطارية (سعة البطارية DROPDOWN +0/+40/+80), سطحه ونش (نوع المركبة DROPDOWN +0/+60/+120), وايت مويه (سعة الصهريج DROPDOWN +0/+50/+120), مسح درج (المساحة التقريبية DROPDOWN +0/+25/+60, تعقيم وتطهير RADIO +30), غسيل سجاد (نوع السجاد DROPDOWN informational, إزالة البقع RADIO +20), أسطوانة غاز (حجم الأسطوانة DROPDOWN +0/+15/+35)
  - **Required attribute validation on request creation**: `createServiceRequest` now validates `ServiceAttribute.is_required` for all pricing models (including `NON_PRICED`); runs immediately after service fetch, before any pricing-model branching; throws `Missing required attribute: "<label>" (<id>)` (400) if any required attribute is absent from `selectedAttributes`; optional attributes pass through without error
  - **RADIO attribute guard**: inside the attribute-processing loop, a RADIO entry that accidentally carries a `selectedOptionId` now throws `Attribute "<label>" is a RADIO type and does not accept a selectedOptionId` instead of falling into the DROPDOWN branch and producing a misleading "Option not found" error; guard runs before the DROPDOWN/RADIO branch; all RADIO attributes in the seed are `is_required: false` by convention — presence in `selectedAttributes` signals selection, absence signals deselection
  - **Swagger `POST /service-requests` docs updated**: `selectedAttributes` description changed from "Required for PRICED_BY_OPTION" to "Optional for all pricing models — runtime enforces `is_required` per attribute"; `notes` and `selectedAttributes` added to all five pricing-model examples (`PRICED_BY_OPTION`, `PRICED_PER_UNIT`, `NON_PRICED_customer_led`, `NON_PRICED_provider_led` were previously missing one or both fields)
  - **Swagger `POST /services` examples added**: four named per-pricing-model examples added (previously had no `examples` block); PRICED_FIXED is the baseline with all 7 fields (`name`, `slug`, `description`, `pricing_model`, `base_price`, `category_id`, `attributes` with DROPDOWN + RADIO); PRICED_BY_OPTION shows `base_price: 0` with inline comment; PRICED_PER_UNIT annotates `base_price` as unit price multiplied by quantity at request time; NON_PRICED omits `base_price` with inline comment explaining price is agreed via offer or bid; each example uses inline `//` comments to explain field-level decisions
  - **Bad-merge fixes**: `user.service.ts`, `service.service.ts`, `service.repository.ts` all had duplicate code blocks, duplicate destructure bindings, and broken `select` nesting from merge conflicts; all cleaned up
  - **`is_provider` removed from service/auth layer**: `getUserById` select and role mapping in `user.service.ts` updated to use `current_mode` exclusively; `is_provider` removed from `createUser` data payload (redundant with `current_mode`); `appUserLogin` select in `auth.service.ts` no longer fetches `is_provider`
  - **`Service` schema duplicate fields fixed**: `is_negotiable`, `is_active`, `is_emergency`, `icon_shape`, `display_color` were duplicated in `prisma/schema.prisma` (bad merge); duplicates removed; `db push` applied
  - **`AppUser.is_active` column added to DB**: field existed in schema but was missing from the live database due to prior drift; resolved via `prisma db push`
  - **Conversation model — direct participant columns**: `customerId` and `providerId` are explicit FK columns on `Conversation`; `@@unique([customerId, providerId])` enforces one thread per pair; `AppUser` carries `customer_conversations` / `provider_conversations` back-relations; `conversation.repository.ts` `findByUserId` filters via these columns
  - **`conversation.repository.ts` rewritten**: removed `findByCustomerAndProvider`; added `findByServiceRequestId`; `create` signature accepts `{ serviceRequestId, customerId, providerId, lastMessageAt }`; `findById` includes `serviceRequest → { customer, provider }`; `findByUserId(userId, role, page, limit)` and `countByUserId(userId, role)` filter via direct `customerId`/`providerId` columns
  - **`chat.service.ts` updated**: `getOrCreateConversation` looks up/creates conversation by `serviceRequestId` only; `validateConversationAccess` reads participant IDs from `conversation.serviceRequest`; `getUserConversations` accepts and forwards `role` parameter
  - **`chat.controller.ts` updated**: `getUserConversations` passes `req.user!.role` to service — single endpoint serves both CUSTOMER and PROVIDER callers
  - **`optionalAuthenticate` middleware added** to `src/middleware/auth.ts`: populates `req.user` if a valid Bearer token is present; proceeds anonymously (no 401) if no token or invalid/expired token; suspended app users treated as anonymous on public routes
  - **Role-aware GET endpoints — Service Categories**: `GET /service-categories` and `GET /service-categories/:id` now use `optionalAuthenticate`; unauthenticated/non-admin callers receive active-only results; admin token returns all including inactive; inactive category ID returns 404 for public callers; `serviceCategory.service.ts` `list` and `getById` accept `activeOnly` param; Swagger updated with `security: [{}]` and role-aware descriptions
  - **Role-aware GET endpoints — Services**: same pattern applied to `GET /services` and `GET /services/:id`; non-admin callers always get `is_active=true` results; admin callers retain full `?isActive` query param control; `service.service.ts` `getServiceById` accepts `activeOnly` param; Swagger updated
  - **Services route table completed**: `PATCH /:id/catalog`, `PATCH /:id/icon`, `PUT /:id`, `DELETE /:id`, and all attribute CRUD routes were already implemented but undocumented in project docs and Swagger — now fully documented; `PATCH /:id/catalog` Swagger expanded from 2 fields to all 10 supported fields; `PATCH /:id/icon` Swagger entry added (multipart/form-data, field `icon`)
  - **`PATCH /service-requests/:id/adjust-price`** (ADMIN only): overrides `final_agreed_price` with `{ newPrice: number }`; validates UUID param and positive float body; controller calls `serviceRequestService.adjustPrice(id, newPrice)`
  - **Service-scoped discount offer via `PATCH /services/:id/catalog`**: admin can now pass an optional `offer` object `{ type: PERCENTAGE|FIXED, value, validFrom?, validTo? }` alongside any catalog fields; service layer upserts an `Offer` record with `scope=SERVICE` and `entity_id=serviceId` (creates with auto-code `SVC-{id[0..7]}` if none exists, updates existing); pass `offer: null` to deactivate; validators added to route file for `offer.type`, `offer.value`, `offer.validFrom`, `offer.validTo`
  - **Merge conflict resolution (main ← feature branch)**: `prisma/schema.prisma` — `is_provider Boolean @default(false)` uncommented on `AppUser`; `customer_conversations`/`provider_conversations` back-relations added to `AppUser`; `offer_services OfferService[]` added to `Service`; `provider_discount_amount Decimal? @default(0.00)` restored on `ServiceRequest`; `customerId`/`providerId` FK columns + named relations + `@@unique([customerId, providerId])` added to `Conversation`; `OfferService` pivot model added; `SERVICES` added to `OfferScope` enum; `provider_id` and `offer_services` added to `Offer`; `platform_discount_amount`/`provider_discount_amount` added to `CommissionBreakdown`; schema validated clean; `serviceRequest.service.ts` — kept `conversationRepository` import (ours) alongside `refundOnCancelService` and `promoOfferService` imports (main); `service.service.ts` — `getServiceById` now both enforces `activeOnly` check (ours) and enriches response with `icon_shape`/`display_color` from `SystemSetting` (main); auto-generated `generated/prisma/` files accepted as deleted (gitignored)
- In progress: UUID consistency cleanup, offer state machine, notification push integration
