# TradeOff Requirements Compliance Report

Version: 1.0  
Date: 2026-02-27  
Project: IT342-G5 TradeOff

## 1. Purpose
This document verifies whether the requirements in the current SDD draft are met by the implementation in this repository.

Status legend:
- `Met`: implemented and observable in code
- `Partial`: implemented in part, but not fully matching the SDD requirement
- `Missing`: not implemented yet
- `Not Verified`: requirement exists but no measurable test evidence yet

## 2. Critical SDD Consistency Issues To Fix
- Project naming is inconsistent (`TradeOff` vs `TakeOff`). Use only `TradeOff`.
- Scope is contradictory: "Native mobile application" is listed under excluded features, but Android app is part of system scope.
- Functional flow mixes marketplace and e-commerce terms (`cart`, `checkout`, `shipping`) that do not match TradeOff's current marketplace design.
- API contract in SDD (`/api/v1`, JWT bearer with access/refresh tokens, structured error object) does not match current backend implementation.
- Database in SDD is PostgreSQL, but implementation is MySQL (`application.properties`).

## 3. Functional Requirements Traceability

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| FR-01 | User registration | Met | `backend/.../AuthController.java` (`POST /api/auth/register`) | Supports unique email and display name checks with bcrypt hash. |
| FR-02 | User login | Met | `backend/.../AuthController.java` (`POST /api/auth/login`) | Returns profile data; no JWT token issuance yet. |
| FR-03 | User logout endpoint | Partial | `backend/.../AuthController.java` (`POST /api/auth/logout`) | Endpoint exists, but JWT token invalidation is not implemented yet. |
| FR-04 | Item listing create/read/update/delete | Met | `backend/.../ItemController.java` (`GET /api/items`, `GET /api/items/{id}`, `POST /api/items/upload`, `PUT /api/items/{id}`, `DELETE /api/items/{id}`) | CRUD is implemented with ownership checks for update/delete. |
| FR-05 | Marketplace browsing | Met | `web/src/pages/Dashboard.jsx`, `mobile/.../MainActivity.kt` | Listings are displayed and browsable on web and mobile. |
| FR-06 | Search and filtering | Met | `backend/.../ItemController.java` (`GET /api/items/search`) plus web/mobile filters | Supports keyword/category/price/location search. |
| FR-07 | Seller profile viewing | Met | `web/src/pages/SellerProfile.jsx` | Seller page and listing view exist on web. |
| FR-08 | Messaging system | Met | `backend/.../ChatController.java`, `web/src/pages/ChatWidget.jsx`, `mobile/.../ApiService.kt` | Supports send and conversation retrieval. |
| FR-09 | User profile management | Partial | `backend/.../UserController.java` (`GET /api/users/me`, `PUT /api/users/media`) | Profile media update exists; full profile settings and privacy controls are incomplete. |
| FR-10 | Admin moderation panel | Missing | No admin controller/role-based routes | No admin UI/API for reports/moderation. |
| FR-11 | Escrow transaction simulation | Missing | No `transactions` model/repository/controller | Required workflow is not implemented yet. |
| FR-12 | Transaction history | Missing | No transaction entity/API/UI | Not available on web/mobile. |
| FR-13 | Report listing feature | Missing | No report model/API/UI | Not available. |
| FR-14 | Wishlist feature | Missing | No wishlist model/API/UI | Not available. |
| FR-15 | User-specific listing retrieval endpoint | Met | `backend/.../ItemController.java` (`GET /api/items/seller`) | Supports seller email/name query filtering. |

## 4. Non-Functional Requirements Traceability

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| NFR-SEC-01 | Password hashing with bcrypt | Met | `AuthController.java` uses `BCryptPasswordEncoder` | Implemented in register/login verification flow. |
| NFR-SEC-02 | JWT authentication | Missing | No JWT generation/validation code | Current sessions are local-state based. |
| NFR-SEC-03 | Admin role verification | Missing | `SecurityConfig.java` allows all requests | No role model or protected admin routes. |
| NFR-SEC-04 | HTTPS-only communication | Not Verified | Localhost HTTP used in web/mobile API calls | Production TLS policy not configured in this repo. |
| NFR-SEC-05 | Rate limiting (100 req/min/IP) | Missing | No limiter/filter configuration | Not implemented. |
| NFR-SEC-06 | SQL injection prevention | Partial | Spring Data JPA repository usage | Dynamic query hardening not documented/tested. |
| NFR-SEC-07 | XSS protection | Partial | React rendering defaults reduce risk | No explicit sanitization policy documented. |
| NFR-PERF-01 | API <= 2s | Not Verified | No benchmark/test artifacts | Requires load/perf tests. |
| NFR-PERF-02 | Page load <= 3s | Not Verified | No Lighthouse/perf report committed | Requires profiling evidence. |
| NFR-PERF-03 | 100 concurrent users | Not Verified | No load test scripts/results | Requires stress test evidence. |
| NFR-COMP-01 | Android API 24+ | Met | `mobile/app/build.gradle.kts` (`minSdk = 24`) | Matches requirement. |
| NFR-COMP-02 | Browser compatibility matrix | Not Verified | No cross-browser test report | Requires QA pass. |
| NFR-UX-01 | WCAG 2.1 AA | Not Verified | No accessibility audit artifacts | Requires accessibility testing. |

## 5. Correct Current API Baseline (As Implemented)

Base path: `/api`

Authentication:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Users:
- `GET /api/users`
- `GET /api/users/me?email={email}`
- `PUT /api/users/media`

Items:
- `GET /api/items`
- `GET /api/items/search`
- `GET /api/items/seller?email={email}&name={name?}`
- `GET /api/items/{id}`
- `POST /api/items/upload` (multipart)
- `PUT /api/items/{id}` (multipart)
- `DELETE /api/items/{id}?sellerEmail={email}&sellerName={name?}`

Messages:
- `GET /api/messages?user1={email}&user2={email}`
- `POST /api/messages`

## 6. Release Gate For SDD v1.0 "Requirements Met"

The following must be completed before claiming all SDD requirements are met:
- Implement JWT auth (access + refresh) and enforce authorization in backend.
- Add admin role model and admin-only moderation APIs/UI.
- Implement transactions and escrow state machine (`pending -> held -> released/refunded -> completed`).
- Add transaction history endpoints and web/mobile views.
- Add report-listing workflow.
- Add measurable NFR evidence (performance, accessibility, compatibility, security hardening).
- Align SDD API section with actual endpoint paths, payloads, and error schema.
- Finalize one canonical database target (MySQL or PostgreSQL) and update docs/config consistently.

## 7. Final Assessment
Current implementation satisfies the core marketplace baseline (auth, listings, messaging, profile basics) but does **not** yet satisfy full SDD scope due to missing admin, escrow, transaction, and JWT/security requirements.
