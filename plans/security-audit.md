# Security Audit Plan — Farm App Frontend

**Date:** 31 March 2026  
**Scope:** Frontend codebase only (`/frontend/`)  
**Severity Levels:** Critical > High > Medium > Low

---

## Summary

18 security gaps identified across authentication, data storage, infrastructure, and input handling. Fixes organized into 4 phases. Most critical issues: sensitive data logged to console, missing CSP headers, no HTTPS enforcement, plaintext auth state in localStorage, and overly broad service worker caching.

---

## Phase 1: Critical — Eliminate Data Exposure & Auth Leaks

### 1.1 Remove Sensitive `console.log` Statements

**Severity:** Critical  
**Files:** `app/stores/auth.ts`  
**Lines:** ~67–68, ~82, ~182–183

**Problem:**
```typescript
// DANGEROUS — logs ALL cookies including XSRF-TOKEN to browser console
console.log('cookie value is:', document.cookie);

// Logs user data object to console
console.log('User data fetched:', farmer.value);
```

These statements run in production. Any browser extension, analytics hook, or shoulder-surfer can read them.

**Fix:**
- Delete `console.log('cookie value is:', document.cookie)` in both `login()` and `register()`
- Delete `console.log('User data fetched:', farmer.value)`
- For any debug logging you want to keep during development only, wrap with:
  ```typescript
  if (import.meta.dev) {
    console.log('CSRF cookie ensured.');
  }
  ```

---

### 1.2 Add Content Security Policy (CSP) Header

**Severity:** Critical  
**File:** `docker/nginx.conf`

**Problem:**
The nginx config has `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, and `Referrer-Policy`, but **no CSP header**. Without CSP, inline scripts and external resources can execute freely — the primary defense against XSS is missing.

**Fix:**
Add to the `server` block:
```nginx
# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://farm-app-backend.test; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

# Restrict unused browser features
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

**Notes:**
- `'unsafe-inline'` for `style-src` is needed for Tailwind CSS. Do NOT add it for `script-src`.
- Update `connect-src` to include your actual backend URL in production.
- If you use Google Fonts, add `https://fonts.googleapis.com` to `style-src` and `https://fonts.gstatic.com` to `font-src`.

---

### 1.3 Enforce HTTPS and Add HSTS

**Severity:** Critical  
**File:** `docker/nginx.conf`

**Problem:**
The config only listens on port 80 (HTTP). No TLS termination, no HSTS header. Credentials and CSRF tokens travel in plaintext over the network.

**Fix — Option A (nginx handles TLS):**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # HSTS — force HTTPS for 1 year
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ... rest of existing config ...
}
```

**Fix — Option B (reverse proxy handles TLS):**
If Traefik, Cloudflare, or another proxy terminates TLS upstream, still add the HSTS header:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```
And document this in the project README.

---

### 1.4 Replace localStorage Auth Flag with sessionStorage

**Severity:** Critical  
**File:** `app/stores/auth.ts`  
**Lines:** ~84, ~130, ~165, ~194, ~220

**Problem:**
```typescript
localStorage.setItem('auth_logged_in', 'true');
```
`localStorage` persists indefinitely and is readable by any JavaScript on the origin (including XSS payloads). An attacker with XSS can set this to `'true'` and trick the app into thinking the user is authenticated.

**Fix — Option A (minimal change):**
Replace all `localStorage` calls with `sessionStorage`:
```typescript
// Before
localStorage.setItem('auth_logged_in', 'true');
localStorage.getItem('auth_logged_in');
localStorage.removeItem('auth_logged_in');

// After
sessionStorage.setItem('auth_logged_in', 'true');
sessionStorage.getItem('auth_logged_in');
sessionStorage.removeItem('auth_logged_in');
```
This clears when the browser tab is closed.

**Fix — Option B (recommended):**
Remove the flag entirely. Always validate the session with the server on app boot:
```typescript
const initialize = async () => {
  if (isInitialized.value) return;
  if (import.meta.client) {
    try {
      await apiFetch('/sanctum/csrf-cookie');
      await fetchUser(); // If 401, user is not authenticated
    } catch (err: any) {
      farmer.value = null;
      isAuthenticated.value = false;
    }
  }
  isInitialized.value = true;
};
```

---

### 1.5 Exclude Sensitive API Routes from Service Worker Cache

**Severity:** Critical  
**File:** `nuxt.config.ts` (workbox `runtimeCaching`, ~line 100)

**Problem:**
```typescript
{
  urlPattern: /\/api\/.*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    expiration: { maxAgeSeconds: 60 * 60 * 24 } // 24 hours
  }
}
```
This caches **all** API responses, including `/api/user` (user profile), authentication-related endpoints, and other sensitive data. Cached responses persist across browser sessions in the service worker cache.

**Fix:**
Narrow the URL pattern to exclude sensitive endpoints:
```typescript
{
  // Only cache farm/crop/livestock/inventory data endpoints
  urlPattern: /\/api\/v1\/(farms|crops|livestock|inventory)\/.*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24
    },
    cacheableResponse: { statuses: [0, 200] },
    networkTimeoutSeconds: 10
  }
}
```

---

## Phase 2: High — Harden Authentication & Input Handling

### 2.1 Remove Axios, Consolidate to `$apiFetch`

**Severity:** High  
**Files:** `app/composables/useAuth.ts`, `package.json`

**Problem:**
`useAuth.ts` imports `axios` and manually constructs CSRF headers, while the rest of the app uses `$apiFetch` (which handles CSRF automatically via `00.apiFetch.ts`). Two HTTP clients = two configurations to audit, two potential points of failure.

**Fix:**
Refactor `useAuth.ts` to use `$apiFetch`:
```typescript
export const useAuth = () => {
  const { $apiFetch } = useNuxtApp()
  const { ensureCsrf } = useSanctum()

  async function register(payload: Record<string, any>) {
    await ensureCsrf()
    return $apiFetch('/register', { method: 'POST', body: payload })
  }

  async function login(payload: Record<string, any>) {
    await ensureCsrf()
    return $apiFetch('/login', { method: 'POST', body: payload })
  }

  async function forgotPassword(payload: Record<string, any>) {
    return $apiFetch('/forgot-password', { method: 'POST', body: payload })
  }

  async function resetPassword(payload: Record<string, any>) {
    await ensureCsrf()
    return $apiFetch('/reset-password', { method: 'POST', body: payload })
  }

  async function logout() {
    await ensureCsrf()
    return $apiFetch('/logout', { method: 'POST' })
  }

  return { register, login, forgotPassword, resetPassword, logout }
}
```

Then remove `axios` from `package.json` and run `npm install`.

**Can run in parallel with Step 2.2.**

---

### 2.2 Add Client-Side Input Validation with Zod

**Severity:** High  
**Files:** `app/stores/auth.ts`, `app/pages/admin/farms/add.vue`, `app/pages/auth/reset-password.vue`  
**New dependency:** `zod`

**Problem:**
No validation before API calls. While the backend should validate too, client-side validation provides defense-in-depth and better UX.

**Fix:**
Install Zod: `npm install zod`

Create `app/utils/schemas.ts`:
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(255),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format').max(255),
  phone: z.string().min(1, 'Phone is required').max(20),
  farm_name: z.string().min(1, 'Farm name is required').max(255),
  farm_type: z.string().min(1, 'Farm type is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(255),
})

export const farmSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().max(500),
  size: z.string().max(50),
  type: z.string().min(1).max(100),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(255),
  password_confirmation: z.string().min(8).max(255),
})
```

Use in `auth.ts` store:
```typescript
import { loginSchema } from '~/utils/schemas'

const login = async (credentials: LoginCredentials) => {
  const parsed = loginSchema.safeParse(credentials)
  if (!parsed.success) {
    error.value = parsed.error.errors.map(e => e.message).join(', ')
    return { success: false, error: error.value }
  }
  // ... proceed with API call using parsed.data
}
```

**Can run in parallel with Step 2.1.**

---

### 2.3 Sanitize Error Messages

**Severity:** High  
**File:** `app/stores/auth.ts`

**Problem:**
Raw backend error messages are displayed to users:
```typescript
error.value = resData?.message || 'Invalid email or password';
```
This can leak internal details (database field names, validation rules, stack traces).

**Fix:**
Map backend errors to controlled messages:
```typescript
// Generic handler for auth errors
const getAuthErrorMessage = (resData: any, fallback: string): string => {
  // Only surface validation field errors, never raw messages
  if (resData?.errors) {
    const validationErrors = resData.errors as ValidationErrors;
    const messages: string[] = [];
    for (const key of Object.keys(validationErrors)) {
      const msgs = validationErrors[key];
      if (msgs?.length) messages.push(...msgs);
    }
    return messages.join(', ');
  }
  return fallback;
};

// In login():
error.value = getAuthErrorMessage(resData, 'Invalid email or password');

// In register():
error.value = getAuthErrorMessage(resData, 'Registration failed. Please try again.');
```

For forgot-password, **always** show the same message:
```typescript
successMessage.value = 'If an account with this email exists, you will receive a password reset link.';
```

---

### 2.4 Add Referrer Policy for Password Reset Page

**Severity:** High  
**File:** `app/pages/auth/reset-password.vue`

**Problem:**
The URL contains `?token=abc123&email=user@example.com`. If the user clicks any external link from this page, the Referer header leaks the token and email to that external site.

**Fix:**
Add to the `<script setup>` section:
```typescript
useHead({
  meta: [
    { name: 'referrer', content: 'no-referrer' }
  ]
})
```

This ensures no Referer header is sent from this page.

---

## Phase 3: Medium — Strengthen Data Layer & Infrastructure

### 3.1 Validate API Responses Before IndexedDB Storage

**Severity:** Medium  
**File:** `app/composables/useOfflineData.ts`

**Problem:**
API responses are stored directly in IndexedDB without validation. A compromised backend or MITM attack could inject malicious data.

**Fix:**
Use the Zod `farmSchema` (from Step 2.2) to validate before storing:
```typescript
import { z } from 'zod'

const apiFarmSchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  location: z.string().max(500),
  size: z.string(),
  type: z.string(),
  owner: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// In getFarms() when processing API response:
for (const farm of freshFarms) {
  const parsed = apiFarmSchema.safeParse(farm)
  if (parsed.success) {
    await db.addFarm({ ...parsed.data, synced: true })
  } else {
    console.error('Invalid farm data from API, skipping:', parsed.error)
  }
}
```

---

### 3.2 Minimize Data Stored in Sync Queue

**Severity:** Medium  
**File:** `app/composables/useOfflineData.ts`

**Problem:**
The sync queue stores complete entity objects:
```typescript
const syncItem: SyncQueue = {
  data: farmData,  // ENTIRE farm object duplicated here
}
```
This doubles the plaintext exposure in IndexedDB.

**Fix:**
Store only references:
```typescript
const syncItem: SyncQueue = {
  id: crypto.randomUUID(),
  action: farm.id ? 'update' : 'create',
  entity: 'farm',
  data: { id: farmData.id },  // Only the ID
  timestamp: Date.now(),
  synced: false
}
```

When syncing, look up full data from the `farms` store:
```typescript
// In syncPendingChanges()
for (const item of queue) {
  let payload = item.data
  if (item.action !== 'delete') {
    const fullEntity = await db.getFarm(item.data.id)
    if (!fullEntity) continue
    payload = fullEntity
  }
  // ... send payload to API
}
```

---

### 3.3 Fix CSRF Race Condition in `useSanctum.ts`

**Severity:** Medium  
**File:** `app/composables/useSanctum.ts`

**Problem:**
```typescript
async function ensureCsrf() {
  if (isReady.value || isLoading.value) return  // BUG: concurrent callers skip CSRF entirely
}
```
If two functions call `ensureCsrf()` simultaneously, the second caller sees `isLoading = true` and returns immediately — without the CSRF cookie being set.

**Fix:**
Cache and share the promise:
```typescript
let csrfPromise: Promise<void> | null = null

async function ensureCsrf() {
  if (isReady.value) return
  if (!csrfPromise) {
    csrfPromise = (async () => {
      isLoading.value = true
      try {
        await $fetch(`${base}/sanctum/csrf-cookie`, {
          credentials: 'include',
          method: 'GET'
        })
        isReady.value = true
      } finally {
        isLoading.value = false
        csrfPromise = null
      }
    })()
  }
  return csrfPromise
}
```

---

### 3.4 Cache `initialize()` Promise in Auth Store

**Severity:** Medium  
**File:** `app/stores/auth.ts`

**Problem:**
`initialize()` is called by both `01.auth.ts` plugin and `auth.ts` middleware. If called concurrently, multiple `/api/user` requests fire.

**Fix:**
```typescript
let initPromise: Promise<void> | null = null

const initialize = async () => {
  if (isInitialized.value) return
  if (!initPromise) {
    initPromise = (async () => {
      // ... existing initialization logic ...
      isInitialized.value = true
    })()
  }
  return initPromise
}
```

---

### 3.5 Fix nginx Header Inheritance in Location Blocks

**Severity:** Medium  
**File:** `docker/nginx.conf`

**Problem:**
The asset caching block and `sw.js` block use `add_header`, which **replaces** all parent-level headers in nginx. Security headers from the server block are lost for these locations.

**Fix:**
Re-include security headers in each location block, or use `include` directive:

Create `/etc/nginx/snippets/security-headers.conf`:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; ..." always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

Then in each location block:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    include /etc/nginx/snippets/security-headers.conf;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Phase 4: Low — Polish & Maintenance

### 4.1 Remove Verbose Console Logging in Production

**Severity:** Low  
**Files:** `app/stores/auth.ts`, `app/composables/useOffline.ts`, `app/composables/useOfflineData.ts`

**Problem:**
Numerous `console.log` calls in production code expose operational details:
- `auth.ts`: "Login already in progress", "CSRF cookie ensured", "Login successful"
- `useOffline.ts`: "Back online! Syncing...", "Gone offline", sync item data
- `useOfflineData.ts`: "Farm saved online", "Farm deleted online"

**Fix:**
Wrap all debug logging with `import.meta.dev`:
```typescript
if (import.meta.dev) {
  console.log('Back online! Syncing pending changes...')
}
```

Or create a simple logger utility:
```typescript
// app/utils/logger.ts
export const logger = {
  debug: (...args: any[]) => {
    if (import.meta.dev) console.log(...args)
  },
  error: console.error, // Always log errors
}
```

**Can run in parallel with Step 4.2.**

---

### 4.2 Audit and Update Dependencies

**Severity:** Low  
**File:** `package.json`

**Actions:**
1. Run `npm audit` and fix findings
2. Remove `@nuxtjs/pwa` from devDependencies — it's deprecated; `@vite-pwa/nuxt` is already used
3. Remove `axios` after Step 2.1 is complete
4. Ensure all packages are on latest patch versions: `npm update`

**Can run in parallel with Step 4.1.**

---

### 4.3 Create Backend Security Checklist

**Severity:** Low (for frontend team)  
**File:** Create `SECURITY-CHECKLIST.md` in project root

These issues were identified during the frontend audit but **require backend fixes**:

- [ ] **IDOR Protection:** All `/api/v1/farms/farm/{uuid}` endpoints verify the authenticated user owns the requested farm
- [ ] **Rate Limiting:** 5 failed attempts → 15 min lockout per IP+email on `/login`, `/register`, `/forgot-password`
- [ ] **Password Reset Tokens:** Single-use, expire after 60 minutes, invalidated after use
- [ ] **Server-Side Input Validation:** All endpoints validate independently of frontend
- [ ] **CORS Configuration:** Only specific origins allowed (never wildcard with credentials)
- [ ] **Session Cookie Flags:** `HttpOnly`, `Secure`, `SameSite=Lax`
- [ ] **CSRF Token Rotation:** Rotate after password change and other sensitive operations
- [ ] **Account Enumeration:** `/forgot-password` returns same response for existing and non-existing emails

---

## Verification Checklist

### After Phase 1
- [ ] Open DevTools console during login/register — no cookie or user data values logged
- [ ] Check `Application > Cache Storage` — no `/api/user` responses cached
- [ ] Check response headers (Network tab) — CSP, HSTS, and Permissions-Policy present
- [ ] Close and reopen browser — auth session not persisted (if using sessionStorage)

### After Phase 2
- [ ] Submit login form with invalid email format — Zod rejects before API call
- [ ] Run `grep -r 'import axios' app/` — returns zero results
- [ ] Submit forgot-password with non-existent email — shows "If an account exists..." message
- [ ] On reset-password page, check Network tab — no Referer header sent on external navigation

### After Phase 3
- [ ] Put app offline, create a farm, inspect IndexedDB `syncQueue` — only `{ id, entity, action }` stored
- [ ] Trigger two concurrent `ensureCsrf()` calls — only one `/sanctum/csrf-cookie` request in Network tab
- [ ] Check response headers on static assets (JS/CSS) — security headers still present

### After Phase 4
- [ ] Run `npm audit` — zero high/critical vulnerabilities
- [ ] Search codebase: `grep -rn 'console.log' app/` — all wrapped in `import.meta.dev`

---

## Decisions & Scope

| Decision | Rationale |
|----------|-----------|
| **IndexedDB encryption excluded** | CSP prevents XSS (the main IndexedDB threat vector). Encryption adds key management complexity. Revisit if PII/financial data is stored. |
| **Rate limiting is backend-only** | Frontend can debounce buttons, but real rate limiting must be server-side. |
| **IDOR protection is backend-only** | Frontend cannot prevent direct API access. Documented in backend checklist. |
| **Scope: frontend only** | Backend security audit required separately. |

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `app/stores/auth.ts` | Remove cookie/user logging, replace localStorage, cache init promise, sanitize errors |
| `app/composables/useAuth.ts` | Replace axios with $apiFetch entirely |
| `app/composables/useSanctum.ts` | Fix CSRF promise race condition |
| `app/composables/useOfflineData.ts` | Add response validation, minimize sync queue data |
| `app/composables/useOffline.ts` | Guard console.log with import.meta.dev |
| `app/plugins/00.apiFetch.ts` | No changes needed (correct implementation) |
| `app/pages/auth/reset-password.vue` | Add no-referrer meta tag |
| `app/utils/schemas.ts` | **New file** — Zod validation schemas |
| `docker/nginx.conf` | Add CSP, HSTS, Permissions-Policy, fix header inheritance |
| `nuxt.config.ts` | Narrow service worker API cache pattern |
| `package.json` | Add zod, remove axios, remove @nuxtjs/pwa |
| `SECURITY-CHECKLIST.md` | **New file** — Backend security requirements |
