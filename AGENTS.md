# AGENTS.md — Smartven CMS v2 (rmd-cms-v2)

Operating guidelines and architecture standards for AI coding agents and engineers working in **rmd-cms-v2**.

---

## 1. System Overview & Tech Stack

`rmd-cms-v2` is the modern, high-performance revamp of the Smartven Vending CMS, engineered to replace the legacy Nuxt 3 frontend with a clean, lightweight, component-driven Vue 3 architecture.

- **Framework**: Vue 3 (`<script setup lang="ts">`, Composition API only)
- **Bundler & Tooling**: Vite 8, TypeScript 6 (`vue-tsc`), pnpm
- **Styling**: Tailwind CSS v4 (native `@theme` design tokens in `src/styles/main.css`)
- **Routing**: Vue Router 4 (typed route records & navigation guards)
- **Icons**: Custom SVG system via `AppIcon.vue` and `src/assets/icons/index.ts`
- **Security & Session**: JWT session with auto-refresh via `/regenerate-token`, DOMPurify for HTML sanitization

### Repository Resolution & Multi-Developer Workspace Setup

Different developers and environments clone repositories into different folder trees. By standard team convention, the related repositories are cloned as sibling folders under a common parent workspace:

```text
<workspace>/
├── rmd-cms-v2/            # Modern CMS v2 repository (or active worktrees)
├── rmd-cms/               # Legacy Nuxt 3 CMS (authoritative source of truth)
└── rmd-api-cms/           # (Optional) Backend Express/TypeScript API
```

| Role | Relative Path / Location | Purpose |
| :--- | :--- | :--- |
| **Current Repository (v2)** | `.` (active repo or worktree) | Active development workspace for v2 revamp |
| **Legacy CMS (v1 Mirror Target)** | `../rmd-cms` *(or `../../rmd-cms` from worktree)* | **Authoritative source of truth** for business logic, permissions, API contracts, routes, and data structures |
| **Backend API (Reference)** | `../rmd-api-cms` *(or `../../rmd-api-cms`)* | Express/TypeScript backend models and route handlers (`http://localhost:9913`) |

> [!IMPORTANT]
> **Dynamic Path Resolution**: Agents must **never** hardcode machine-specific absolute paths (e.g. `/Users/...` or local username folders).
> Always resolve the legacy codebase by checking:
> 1. Sibling path: `../rmd-cms`
> 2. Parent-sibling path (if in a git worktree): `../../rmd-cms`
> 3. Workspace search: Locate the directory named `rmd-cms` in the parent directory tree.

---

## 2. Core Operating Principles

### Principle 1: Always Mirror to Local `rmd-cms` (V1 Parity Law)
The new CMS v2 is a direct revamp of the legacy CMS. **Never invent endpoints, request payloads, response transformations, permission gates, or UI logic from scratch without inspecting the local `rmd-cms` codebase first.**

Before implementing or modifying any feature:
1. **Find the legacy page/component** in `<legacy-cms>/pages/` or `<legacy-cms>/components/` (e.g. `rmd-cms/pages/stok-vending/index.vue`).
2. **Inspect the API calls & params**: Check query string parameters (`search`, `page`, `itemPerPage`, `sortDir`, `startDate`, `endDate`, etc.), endpoint paths, and body shapes.
3. **Preserve route paths**: Keep identical URLs (`/product`, `/product/categories`, `/vending-sales`, `/stok-vending`, `/histori-stok-ulang`, `/login`, `/lupa-password`, etc.) to preserve bookmarks and deep links.
4. **Mirror permission and role gates**: Inspect `utils/menuItems.ts`, `middleware/01.requirePaket.global.ts`, and role definitions (`packageAllList`, `canSeeNamaInternal`, `subRoleList.ts`, `parentId`, `ownership`).
5. **Verify against backend models**: If legacy frontend code is ambiguous, check the corresponding controller/model in `<rmd-api-cms>/src/`.
6. **Preserve error and toast messaging**: Use natural, user-friendly Indonesian messages matching v1 conventions.

### Principle 2: No YAGNI (You Aren't Gonna Need It)
Build strictly what is needed for the active user stories and Figma specifications.
- **No heavy UI component libraries**: Do **not** install Element Plus, PrimeVue, Vuetify, Ant Design, or SweetAlert2. Build native, lightweight components with Tailwind CSS v4.
- **No premature state management**: Do **not** introduce Pinia or complex store modules unless multi-page global synchronized state truly demands it. Authentication session, URL query params, and lightweight composables are currently sufficient.
- **No speculative abstractions**: Do not write overly generic wrappers, base classes, or unused utility functions. If a utility is only used once, keep it localized.
- **Keep dependencies minimal**: Avoid adding new npm packages. If a 10-line helper can do the job (e.g. date formatting or CSV parsing), write the helper.

### Principle 3: Component As Possible (Deep Modularity)
Never build monolithic screens. Every view must be broken down into small, single-responsibility, highly reusable Vue components.

Follow the **3-Tier Component Hierarchy**:
1. **Base Atomic UI (`src/components/ui/`)**: Pure, domain-agnostic UI widgets (`AppButton`, `AppModal`, `AppCheckbox`, `AppToast`, `ConfirmDialog`, `EntriesPagination`, `EntriesSelect`, `SortHeader`, `StatusBadge`, `StockProgress`, `TextLink`, `IconButton`).
2. **Layout Shell Blocks (`src/components/layout/`)**: Application shell elements (`AppSidebar`, `AppHeader`, `PageHeader`, `SidebarNavGroup`, `UserAvatar`, `SearchInput`).
3. **Domain Feature Components (`src/components/<feature>/`)**: Feature-scoped components (`products/`, `sales/`, `stock/`, `auth/`, `editor/`, `announcement/`, `billing/`, `profile/`, `support/`). These include feature tables, table rows, form modals, detail cards, and specialized filters.
4. **Pages (`src/pages/`) as Pure Orchestrators**:
   - Pages synchronize URL query parameters via `vue-router`.
   - Pages trigger service calls or composables (`useAsyncData`).
   - Pages assemble and bind layout and domain components.
   - Pages must **not** contain hundreds of lines of inline HTML table rows or form controls.

### Principle 4: Strict Type Safety & Quality
- **Zero `any` policy**: Every entity, payload, and query must be strictly typed in `src/types/<domain>.ts`.
- **Compile-time validation**: Before marking any task complete, always execute `pnpm run build` (`vue-tsc -b && vite build`) to verify type correctness and bundler health.

---

## 3. Directory Map & Code Placement

```text
src/
├── assets/                  # Static assets & SVG icons
│   ├── brand/               # Logos, hero images
│   ├── demo/                # Mock/demo assets
│   ├── icons/               # SVG icon definitions & index.ts
│   └── sales/, stock/, ...  # Feature-specific SVGs
├── components/
│   ├── ui/                  # TIER 1: Generic atomic primitives (buttons, modals, pagination, badges)
│   ├── layout/              # TIER 2: App shell components (sidebar, header, page header, search)
│   ├── auth/                # TIER 3: Authentication forms & layouts
│   ├── products/            # TIER 3: Product management tables, cards, and modal forms
│   ├── sales/               # TIER 3: Sales machine tables, date pickers, filters
│   ├── stock/               # TIER 3: Stock tables, progress indicators, restock history
│   ├── dashboard/           # TIER 3: Revenue cards, attention cards, machine status cards
│   ├── announcement/        # TIER 3: Notification menu & announcement cards
│   ├── editor/              # TIER 3: Machine screen editor tools & previews
│   └── <feature>/           # TIER 3: Domain components for new features (profile, billing, support, etc.)
├── composables/             # Reusable reactive logic (useAsyncData, usePageWindow)
├── config/                  # Navigation tree (navigation.ts) and environment constants (env.ts)
├── layouts/                 # Master page layouts (DashboardLayout.vue, AuthLayout.vue)
├── pages/                   # Route-level orchestration views (ProductListPage.vue, StockVendingPage.vue)
├── router/                  # Vue Router configuration, route guards, public route flags
├── services/                # API client transport (api.ts), auth session (auth.ts), and domain APIs
├── styles/                  # Tailwind CSS v4 design tokens and base styles (main.css)
├── types/                   # Strict TypeScript domain interfaces and API envelopes
└── utils/                   # Pure utility functions (formatting, dates, CSV, downloads, validation)
```

---

## 4. Legacy v1 (`rmd-cms`) to v2 Revamp Translation Matrix

When converting legacy v1 features, translate patterns using this reference:

| Legacy Concept (Nuxt 3 v1) | Modern Revamp Pattern (Vue 3 v2) | Notes |
| :--- | :--- | :--- |
| **Framework** | Nuxt 3 (SSR/Hybrid, Auto-imports) | **Vue 3 + Vite** (Explicit imports, SPA) |
| **Component Syntax** | Options API / Pug / `<script>` | **`<script setup lang="ts">`** with standard HTML template |
| **UI Components** | Element Plus (`el-table`, `el-button`, `el-dialog`, `el-pagination`) | **Native Vue + Tailwind v4** (`*Table.vue`, `AppButton.vue`, `AppModal.vue`, `EntriesPagination.vue`) |
| **Alerts & Modals** | `SweetAlert2` (`Swal.fire`) | **`ConfirmDialog.vue`** and **`AppToast.vue`** |
| **Routing** | File-based `pages/**/*.vue` | **`src/router/index.ts`** with explicit lazy-loaded imports and `RouteMeta` |
| **API Transport** | `plugins/fetcher.ts` / `useFetch` / `$fetch` | **`src/services/api.ts`** (`apiGet`, `apiSendJson`, `apiSendForm`, `apiDelete`, `apiDownload`) |
| **Auth & Session** | Pinia store `stores/user.ts` + cookies | **`src/services/auth.ts`** (`getSession`, `saveSession`, `getValidToken`, `login`) |
| **Route Guards** | `middleware/01.requirePaket.global.ts` | **`router.beforeEach`** in `src/router/index.ts` with `to.meta.public` and session checks |
| **Styling** | SCSS + Tailwind v3 config | **Tailwind CSS v4** `@theme` tokens in `src/styles/main.css` |
| **Query Sync** | `useRoute().query` watchers | URL query parameter sync with `router.replace({ query })` to preserve filters |
| **File Exports** | Direct window open / Blob plugins | **`apiDownload()`** in `src/services/api.ts` using `Content-Disposition` header |

---

## 5. Coding & Implementation Guidelines

### 1. Single File Component (SFC) Anatomy
Every `.vue` file must follow this exact order:
```vue
<script setup lang="ts">
// 1. Comments referencing Figma node and legacy v1 source path
// 2. Vue & Vue Router imports
// 3. Asset/Icon imports
// 4. Component imports (Layout -> Domain -> UI)
// 5. Services & Types imports
// 6. Props & Emits definitions
// 7. Reactive state (ref, shallowRef, computed)
// 8. Lifecycle & Async functions
</script>

<template>
  <!-- Clean semantic markup styled exclusively with Tailwind CSS v4 design tokens -->
</template>
```

### 2. Component Props and Emits
Always use pure TypeScript types for `defineProps` and `defineEmits`:
```vue
<script setup lang="ts">
import type { StockMachine } from '@/types/stock'

withDefaults(
  defineProps<{
    machines: StockMachine[]
    loading?: boolean
  }>(),
  {
    loading: false,
  },
)

const emit = defineEmits<{
  select: [machine: StockMachine]
  refresh: []
}>()
</script>
```

### 3. Reactivity Performance Best Practices
- **Use `shallowRef` for large API collections**: Tables, machine lists, and log arrays do not require deep reactive proxies. Using `shallowRef<T[]>([])` significantly boosts rendering speed.
- **Use `ref` for primitives and form state**: Strings, booleans, page numbers, and modal states.
- **Use `computed` for derived lists and formatting**: Filtering, pagination windows, and badge styling.

### 4. API Calls & Service Layer Rules
Keep all HTTP calls inside `src/services/<domain>.ts`. Never call `fetch()` directly in components.
```ts
// src/services/stock.ts
import { apiGet, apiDownload } from './api'
import type { StockMachine, StockQuery } from '@/types/stock'

export async function fetchStockMachines(query: StockQuery): Promise<{ data: StockMachine[]; pagination: Pagination }> {
  const params = new URLSearchParams({
    page: String(query.page),
    itemPerPage: String(query.itemPerPage),
    sortDir: query.sortDir,
  })
  if (query.search) params.set('search', query.search)
  const body = await apiGet<{ data: StockMachine[]; pagination: Pagination } | undefined>(`/vending-stock?${params}`)
  return {
    data: body?.data ?? [],
    pagination: body?.pagination ?? { page: 1, itemPerPage: query.itemPerPage, totalItem: 0, totalPage: 1 },
  }
}
```

### 5. Asynchronous Data & Race Condition Protection
When searching or changing pagination, ensure late-resolving requests do not overwrite newer user interactions:
```ts
let requestId = 0
async function load() {
  const id = ++requestId
  loading.value = true
  error.value = null
  try {
    const result = await fetchStockMachines(...)
    if (id !== requestId) return // Superseded by a newer request
    machines.value = result.data
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat data.'
  } finally {
    if (id === requestId) loading.value = false
  }
}
```

### 6. Design Tokens & Styling (Tailwind v4)
All styling must strictly use the design tokens configured in `src/styles/main.css`:
- **Colors**:
  - Brand: `bg-primary`, `hover:bg-primary-hover`, `bg-primary-soft`, `text-primary`, `bg-brand`
  - Surfaces: `bg-canvas` (app backdrop), `bg-surface` (white card), `bg-surface-muted`, `bg-surface-hover`
  - Borders: `border-line`, `border-line-soft`, `border-line-strong`
  - Typography: `text-ink`, `text-ink-strong`, `text-ink-heading`, `text-ink-muted`, `text-ink-subtle`
  - Status: `bg-success-soft text-success-strong`, `bg-danger-soft text-danger-strong`, `bg-warning-soft text-warning-strong`
- **Shadows**: `shadow-card`, `shadow-hairline`, `shadow-primary`, `shadow-glow-success`
- **Border Radius**: Cards standard `rounded-2xl` or `rounded-[32px]`, buttons `rounded-xl`, inputs `rounded-lg`

### 7. Icon System
- Icons are defined in `src/assets/icons/index.ts`.
- Render icons using `<AppIcon name="icon-name" class="..." />`.
- Certain Figma vector exports require vertical mirroring (`-scale-y-100`); `AppIcon.vue` handles this via `isFlippedGlyph(name)`. Always register new icons in `src/assets/icons/index.ts`.

---

## 6. Standard Development Workflow

### Step 1: Research & Mirror from Legacy v1
1. Locate the equivalent page and components in the local `<legacy-cms>/` repository (e.g. `../rmd-cms/pages/` or `../../rmd-cms/pages/`).
2. Inspect the API endpoints, methods, parameters, and response structures.
3. Check authorization requirements (`requiredPackages`, `requiredRoles`, or `subRole`).

### Step 2: Define Types & Services
1. Add strict domain interfaces in `src/types/<domain>.ts`.
2. Add API transport functions in `src/services/<domain>.ts`.

### Step 3: Build Reusable Components
1. If primitive widgets are missing, add to `src/components/ui/`.
2. Build domain-specific cards, tables, rows, and modal dialogs in `src/components/<domain>/`.

### Step 4: Assemble Page & Wire Router
1. Create or update the page orchestrator in `src/pages/<Feature>Page.vue`.
2. Bind URL query params for pagination, filters, and searches.
3. Register the route in `src/router/index.ts`.

### Step 5: Verification & Quality Gate
Run the build script to ensure zero TypeScript or template errors:
```bash
pnpm run build
```
Check that:
- Type checking passes with zero errors (`vue-tsc -b`).
- Vite production bundle compiles cleanly.
- No `any` types were introduced.
- Existing legacy route paths and query parameters are preserved.

---

## 7. Useful Agent Commands

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Full TypeScript check and production build (MANDATORY before completion)
pnpm run build

# Preview production build locally
pnpm run preview
```
