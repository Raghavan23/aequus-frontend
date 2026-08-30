# CLAUDE.md — Finz Frontend

This file gives Claude (and any engineer) the context needed to work on this
codebase safely and consistently. Read this before making changes.

## What this is

Angular SPA for Finz V1 — a simple personal financial-record tracker.
Register/login → Home → Financial Records → choose Income/Expense → choose
category → enter amount → save. This is **V1** — deliberately simple. Do not
add dashboards, charts, or analytics screens without being explicitly asked.

## Tech stack

- Angular 19, TypeScript, SCSS
- Standalone components only — **no NgModules**
- Angular Router, Reactive Forms, HttpClient
- No NgRx / no external state management library

## Commands

```bash
npm install       # first-time setup
npm start         # ng serve, http://localhost:4200
npm run build      # production build → dist/finz-frontend
npm test           # unit tests
npm audit           # dependency vulnerability check — run before adding deps
```

The API base URL is set in `src/environments/environment.ts` (dev) and
`environment.production.ts` (prod, swapped in via `angular.json`
`fileReplacements`). Don't hardcode API URLs in services or components.

## Architecture

```
src/app/
├── layout/         authenticated shell (sidebar + router-outlet)
├── pages/           routed screens: home, login, register, financial-records
├── components/       small reusable presentational components
├── services/         auth, financial-record, storage — one responsibility each
├── guards/            authGuard, guestGuard
├── interceptors/       authInterceptor (attaches JWT), errorInterceptor (401 → logout)
├── models/             TypeScript interfaces matching backend DTOs
├── enums/               FinancialType, FinancialCategory (must mirror backend enums exactly)
└── validators/           shared reactive-form validators
```

Rules:
- Only create folders/files this app actually uses. Don't scaffold empty
  `directives/`, `pipes/`, `config/`, etc. "for consistency" if nothing lives
  there yet.
- Components stay standalone; import only what they use in the `imports`
  array — don't import `CommonModule`/`FormsModule` into a component that
  doesn't need pipes/`ngModel`.
- Services are the only place that calls `HttpClient`. Components never call
  `HttpClient` directly.
- `models/` and `enums/` must stay in lockstep with the backend's DTOs and
  Java enums. If you change one, check the other.

## Security rules — non-negotiable

1. **Never store the JWT anywhere but `StorageService`.** Don't sprinkle
   `localStorage.getItem`/`setItem` calls elsewhere — go through the
   abstraction so token handling stays centralized and auditable.
2. **The auth token is attached only by `authInterceptor`.** Don't manually
   set `Authorization` headers in individual service calls — that leads to
   inconsistency and leaked tokens in code that forgets to strip them.
3. **Never log the JWT or password values** to the console, even in "just
   for debugging" code. Remove any `console.log` of form values before
   committing.
4. **Trust nothing from the URL/query params for authorization.** Route
   guards (`authGuard`) protect navigation, but the backend is the actual
   authority — never assume a hidden route is "protected" client-side only.
5. **Angular's built-in sanitization handles XSS for interpolated content**
   — don't use `[innerHTML]` with unsanitized data, and don't bypass
   sanitization (`bypassSecurityTrustHtml`, etc.) unless you have a specific,
   reviewed reason.
6. **Validate on the client for UX, but never trust it as the real
   validation.** The backend re-validates everything — client-side
   `Validators.required` etc. are there to give fast feedback, not to
   replace server checks.
7. **Dependencies**: run `npm audit` before adding a new package, and don't
   pull in a package for something Angular's built-ins (forms, HttpClient,
   Router) already handle.
8. **Never commit `.env`-equivalent secrets.** This frontend shouldn't hold
   any secrets at all — if a task seems to need one client-side, stop and
   reconsider the design (it likely belongs in the backend).

## Reliability & correctness

- `errorInterceptor` logs the user out and redirects to `/login` on any
  `401`. Don't add ad-hoc 401-handling in individual components — extend the
  interceptor if new behavior is needed.
- Forms use Reactive Forms with explicit validators — don't switch to
  template-driven forms for consistency.
- Every API call in a component subscribes with both `next` and `error`
  handlers — don't leave `.subscribe(data => ...)` with no error path; a
  failed request should never leave the UI silently stuck (e.g. an infinite
  "Saving..." button).
- Guard against `null`/`undefined` amounts and empty selections before
  calling the API (see `FinancialRecordsComponent.save()`), matching backend
  validation so users get instant feedback instead of a round-trip error.

## Maintainability & readability

- Keep components' `.ts` files focused on state + event handlers; keep
  markup in `.html`, styles in `.scss` — don't inline large templates in the
  `@Component` decorator except for tiny components like `AppComponent`.
- Name things after the domain (`FinancialRecordService`, not
  `DataService`/`ApiService` with a dozen unrelated methods).
- Keep services small and composable — don't grow one "god service" that
  does auth, records, and storage.
- Favor Angular's new control-flow syntax (`@if`, `@for`) over `*ngIf`/`*ngFor`
  for new templates, consistent with the rest of this codebase.
- Use `signal()` for simple reactive state (see `AuthService.currentUser`)
  rather than introducing a state-management library for V1-scale state.

## Scalability

- Routes are lazy-loaded via `loadComponent` — keep new routes lazy too, so
  the initial bundle doesn't grow unbounded as pages are added.
- `FinancialRecordService.getAll()` currently fetches everything — if record
  volume grows, this needs pagination support (matching a backend change,
  see backend `CLAUDE.md`). Flag this rather than silently building it, since
  it changes the API contract.
- Avoid premature abstraction (generic `CrudService<T>`, dynamic form
  builders, etc.) until at least three real use cases justify it.

## Testing expectations

- Guards (`authGuard`, `guestGuard`) and interceptors (`authInterceptor`,
  `errorInterceptor`) are prime candidates for unit tests — they're small,
  pure, and security-relevant.
- Form validators (`passwordsMatchValidator`) should have tests covering the
  match/mismatch/empty cases.
- Prefer testing components through their public behavior (form submit →
  service called with right payload) over testing internal implementation
  details.

## Before you open a PR / finish a task

- [ ] Did I go through a service for any HTTP call, not `HttpClient` directly
      in a component?
- [ ] Did I handle the error case for every new API call?
- [ ] Did I avoid introducing a new state-management pattern/library?
- [ ] Do my new models/enums still match the backend exactly?
- [ ] Did I check this doesn't reintroduce something from the "out of scope"
      list in the backend `CLAUDE.md`?
