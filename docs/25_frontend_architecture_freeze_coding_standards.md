# LIMS-DOC-25 — Frontend Architecture Freeze & Coding Standards

This document establishes the official architecture freeze and frontend coding contract for the Microbiology LIMS. Every subsequent sprint—starting with Sprint 4 (Authentication)—must adhere strictly to these rules. Any changes to frozen boundaries require an approved Architecture Decision Record (ADR).

---

## 1. Directory Structure Blueprint

The frontend code follows a modular, layer-separated structure:

```
d:\Projects\Micro_Lab\
├── docs/                      # Architectural specs and registers (frozen)
├── shared/                    # Shared code consumed by both frontend and future backend
│   ├── enums/                 # Domain enums (e.g. SpecimenStatus, Role)
│   ├── errors/                # Unified error code dictionaries
│   └── models/                # Domain type interfaces (e.g. Patient, Specimen)
└── frontend/                  # React application root
    ├── src/
    │   ├── components/        # Reusable component library (Sprint 2)
    │   │   ├── Foundation/    # Basic items (Button, Typography, Badge, Divider)
    │   │   ├── Form/          # Input controls (TextInput, NumberInput, Select, Switch)
    │   │   ├── Layout/        # Containers (Card, Panel, Tabs, Stepper)
    │   │   ├── Data/          # Grids & indicators (DataTable, Pagination, KpiCard)
    │   │   ├── Overlay/       # Floating panels (Modal, Drawer, CommandPalette)
    │   │   └── Laboratory/    # Clinical visuals (AstMatrix, SpecimenStatusBadge)
    │   ├── infrastructure/    # Core system frameworks (Sprint 3)
    │   │   ├── config/        # Tiered configuration context & providers
    │   │   ├── logger/        # Structured diagnostic logger
    │   │   ├── errors/        # Global error boundary & error mappings
    │   │   ├── http/          # Fetch client, interceptors, mock adapters
    │   │   ├── notifications/ # Pub/sub alert service and toaster notification
    │   │   ├── permissions/   # Bitmask-based role permission guard
    │   │   ├── dialogs/       # Awaitable promise modals
    │   │   ├── featureFlags/  # Configuration overrides
    │   │   └── search/        # Decoupled global search registry
    │   ├── layouts/           # AppLayout shell
    │   ├── pages/             # Route-level views (LoginPage, ComponentPlaybook)
    │   ├── providers/         # Global state caching
    │   ├── routes/            # Route configuration & route guards
    │   ├── types/             # Shared typescript definitions
    │   ├── index.css          # Token design tokens & layout baseline styling
    │   └── main.tsx           # Entry point
```

---

## 2. Strict Fast Refresh & Import Rules

To ensure Vite's Fast Refresh compiles hot updates without page invalidations, the following rules are **mandatory**:

1. **Decoupled React Contexts**:
   - Do **NOT** export a React Context in the same file as a React Provider component.
   - All contexts must reside in separate files named `<Name>Context.ts` (e.g., [LoggerContext.ts](file:///d:/Projects/Micro_Lab/frontend/src/infrastructure/logger/LoggerContext.ts)).
2. **Decoupled Custom Hooks**:
   - All custom hooks must reside in standalone files named `use<HookName>.ts` (e.g., [useLogger.ts](file:///d:/Projects/Micro_Lab/frontend/src/infrastructure/logger/useLogger.ts)).
3. **No Circular Imports**:
   - Subsystem folders must remain decoupled. A component in `infrastructure/errors` must not import anything from `infrastructure/http` unless explicitly designed as an abstraction bridge.
4. **Barrel Index Exports**:
   - Folders must export public APIs via `index.ts` files to simplify imports.

---

## 3. Approved Naming Conventions

- **React Components**: PascalCase (e.g. `Button.tsx`, `PermissionGuard.tsx`).
- **Stylesheets**: PascalCase or category-scoped (e.g. `Foundation.css`, `Form.css`).
- **React Contexts**: PascalCase ending in `Context` (e.g. `DialogContext.ts`).
- **Custom Hooks**: camelCase starting with `use` (e.g. `usePermission.ts`).
- **Types and Interfaces**: PascalCase (e.g. `AppError`, `RequestOptions`).
- **Files/Modules**: kebab-case or PascalCase (matching folders, e.g. `httpClient.ts`, `mockAdapter.ts`).
- **Constants**: UPPER_SNAKE_CASE (e.g. `TOAST_DEFAULT_DURATION_MS`).

---

## 4. Frozen Provider Hierarchy

The application context hierarchy must be composed in this exact sequence to ensure proper dependencies:

```typescript
import React from 'react';
import { ErrorBoundary } from '../infrastructure/errors/ErrorBoundary';
import { ConfigProvider } from '../infrastructure/config/ConfigProvider';
import { LoggerProvider } from '../infrastructure/logger/LoggerProvider';
import { FeatureFlagProvider } from '../infrastructure/featureFlags/FeatureFlagProvider';
import { NotificationProvider } from '../infrastructure/notifications/NotificationProvider';
import { DialogProvider } from '../infrastructure/dialogs/DialogProvider';
import { SearchProvider } from '../infrastructure/search/SearchProvider';
import { GlobalStateProvider, useGlobalState } from './GlobalStateProvider';
import { PermissionProvider } from '../infrastructure/permissions/PermissionProvider';

// Composition order
<ErrorBoundary>
  <ConfigProvider>
    <LoggerProvider>
      <FeatureFlagProvider>
        <NotificationProvider>
          <DialogProvider>
            <SearchProvider>
              <GlobalStateProvider>
                <PermissionBridge> {/* Bridges state role to permissions */}
                  {children}
                </PermissionBridge>
              </GlobalStateProvider>
            </SearchProvider>
          </DialogProvider>
        </NotificationProvider>
      </FeatureFlagProvider>
    </LoggerProvider>
  </ConfigProvider>
</ErrorBoundary>
```

---

## 5. State Management Contracts

1. **Local State (`useState` / `useRef`)**: Reserved exclusively for layout interactions (e.g. open/closed accordions, inputs, sorting columns, tab indexes).
2. **Framework State (React Context)**: Reserved for application-level behaviors managed by infrastructure providers (e.g. active feature overrides, current toast queue).
3. **Domain Cache State (`GlobalStateProvider`)**: Acts as a client-side database mock, storing collections of patients, specimens, and active orders.

---

## 6. CSS & Design Tokens

- Do **NOT** write arbitrary pixel overrides in style blocks.
- Use the CSS variables defined in [index.css](file:///d:/Projects/Micro_Lab/frontend/src/index.css) (colors, spacing tokens, border radiuses, typography sizes).
- Component styling must reside in category stylesheets (`src/components/Foundation/Foundation.css`, `src/components/Form/Form.css`, etc.).
- Density (Comfortable vs. Compact vs. High) and Theme (Light vs. Dark) shifts are controlled via class assignments at the top-level app wrapper, modifying token spacing/color variables dynamically.

---

## 7. Mock API Conventions

When testing endpoints during dev mode, mock data must be registered via the [mockAdapter](file:///d:/Projects/Micro_Lab/frontend/src/infrastructure/http/mockAdapter.ts):
- Use the `mockAdapter.register(method, path, handler, options)` pattern.
- Always provide structured responses conforming to the models in `/shared/models/`.
- Ensure latency is configured (`latencyMs`) to emulate real-world loading indicator verifications.

---

## 8. Verification Expectations

- **Linter Checks**: Code must pass `npm run lint` (`oxlint` rules) cleanly before any commit.
- **Type Compiler**: Bundles must build successfully via `npm run build` (`tsc -b && vite build`) without a single compiler error.
- **Visual Auditing**: Every new form or data display component must render on a sandbox route or component playbook page displaying all active and interactive visual states.
