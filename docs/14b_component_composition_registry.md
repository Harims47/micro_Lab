# Document Metadata
*   **Document ID**: LIMS-DOC-14B
*   **Title**: Component Composition Registry
*   **Version**: 1.0.0
*   **Status**: Approved
*   **Last Updated**: 2026-07-04
*   **Dependencies**: [LIMS-DOC-14: Component Library]

---

## Purpose
This document provides the rationale, supported behaviors, limitations, and reuse guidance for components defined in LIMS-DOC-14 that are deliberately implemented via composition using existing primitives, rather than as separate, standalone React component files.

---

## Layer 1: Foundations

### CMP-106: Spacer
*   **Rationale**: Direct implementation of spacer components adds unnecessary React node depth. CSS Flexbox `gap` and utility margin classes handle layout more performantly.
*   **Supported Behaviors**: `var(--spacing-*)` variables.
*   **Limitations**: Cannot be targeted via React refs.
*   **Reuse Guidance**: Use CSS `gap` on flex containers.

### CMP-107: Container
*   **Rationale**: Wrappers that only enforce `max-width` do not need dedicated components.
*   **Reuse Guidance**: Use CSS class `.lims-container` on `div` elements.

### CMP-108: Surface
*   **Rationale**: Backdrops are styled via CSS tokens.
*   **Reuse Guidance**: Use CSS class `.lims-surface` or `Card` component.

### CMP-109: Elevation
*   **Rationale**: Drop shadows are purely visual tokens.
*   **Reuse Guidance**: Use CSS classes `.lims-elevation-1`, `.lims-elevation-2`, etc.

---

## Layer 2: Primitives

### CMP-203: Link
*   **Rationale**: Standard HTML `<a>` tags or router `<Link>` components are already accessible and standard.
*   **Reuse Guidance**: Apply `.lims-link` class to native links.

### CMP-207: Label
*   **Rationale**: HTML `<label>` is intrinsically accessible when combined with `htmlFor`. No separate React abstraction is needed.
*   **Reuse Guidance**: Apply `.lims-form-label` to native `<label>`.

---

## Layer 3: Forms

### CMP-303: Number Input
*   **Rationale**: Semantic HTML provides `<input type="number">`.
*   **Supported Behaviors**: Min/max boundaries, step increments.
*   **Limitations**: Spinners vary by browser.
*   **Reuse Guidance**: Use `<TextInput type="number" />`.

### CMP-306: Date Time Picker
*   **Rationale**: Browser-native `<input type="datetime-local">` is robust and accessible.
*   **Reuse Guidance**: Use `<TextInput type="datetime-local" />` or compose `DatePicker` and `TimePicker` side-by-side.

### CMP-309: Typeahead
*   **Rationale**: A `TextInput` with an HTML `<datalist>` or a filtered `SelectDropdown` covers this use case without duplicating logic.
*   **Reuse Guidance**: Use `<TextInput list="options-id" />`.

### CMP-310: Controlled Vocabulary Selector
*   **Rationale**: A specialized instance of `Select` or `Typeahead` bound to a specific API endpoint.
*   **Reuse Guidance**: Use `Select` and populate `options` from the vocabulary API.

### CMP-312: Signature Field
*   **Rationale**: Signing requires authenticating the user; this is composed of a `Password Field` and a Submit `Button` inside a `Critical Dialog`.
*   **Reuse Guidance**: Construct using `Modal` and `TextInput type="password"`.

### CMP-313: Search Box
*   **Rationale**: A `TextInput` with a search icon and `type="search"`.
*   **Reuse Guidance**: Use `<TextInput type="search" />`.

### CMP-314: Password Field
*   **Rationale**: Native `<input type="password">` provides the necessary masking.
*   **Reuse Guidance**: Use `<TextInput type="password" />`.

### CMP-316: Form Section
*   **Rationale**: A structural element mapping to `<fieldset>` or a `Card`.
*   **Reuse Guidance**: Wrap form groups in a `Card` or `<fieldset className="lims-form-section">`.

### CMP-317: Form Wizard
*   **Rationale**: Stateful orchestration of multiple `Form Sections` combined with a `Workflow Progress` indicator.
*   **Reuse Guidance**: Compose using `Stepper` and stateful rendering of sections.

### CMP-318: Action Bar
*   **Rationale**: A sticky layout element containing `Button` elements.
*   **Reuse Guidance**: Use a sticky `div` with flex-end alignment.

---

## Layer 4: Data Display

### CMP-404: Statistic Card
*   **Rationale**: A simplified `KPI Card` without the trend indicator.
*   **Reuse Guidance**: Use `<KpiCard>` and omit the `trend` prop.

### CMP-407: Loading State
*   **Rationale**: Consists of `Spinner` or `Skeleton` components.
*   **Reuse Guidance**: Conditionally render `<Skeleton />`.

### CMP-409: Information Card
*   **Rationale**: A `Card` displaying `Typography` key-value pairs.
*   **Reuse Guidance**: Compose `Card` and CSS Grid.

### CMP-410: Audit Card / CMP-411: Activity Feed
*   **Rationale**: `Timeline` or `Data Table` variants with specific data bindings.
*   **Reuse Guidance**: Use `Timeline` or list structures.

---

## Layer 5: Workflow

### CMP-501: Approval Panel / CMP-502: Validation Panel
*   **Rationale**: Composed of `Card`, `Data Table` (for items to approve), and `Signature Field`.
*   **Reuse Guidance**: Build layout using core primitives.

### CMP-503: Workflow Progress
*   **Rationale**: Identical in structure to `Stepper`.
*   **Reuse Guidance**: Use `Stepper` component.

### CMP-505: Record Lock / CMP-506: SLA Indicator
*   **Rationale**: Specialized instances of `Alert Banner` and `Badge` respectively.
*   **Reuse Guidance**: Use `<Toast>` or `<Badge>`.

### CMP-507: Task Assign / CMP-508: Quality Review / CMP-509: Exception Panel / CMP-510: Escalation Panel
*   **Rationale**: Domain-specific forms composed of standard `Card`, `Select`, and `TextInput` components.
*   **Reuse Guidance**: Use layout and form primitives.

---

## Layer 6: Navigation

### CMP-607: Quick Actions / CMP-609: Global Search
*   **Rationale**: Implementations composed of `Button` grids and `Search Box` inside the Header/Sidebar.

---

## Layer 7: Overlays

### CMP-703: Wizard / CMP-705: Alert Banner / CMP-706: Confirmation / CMP-707: Delete Dialog / CMP-708: Warning Dialog / CMP-709: Critical Dialog / CMP-710: Preview Drawer
*   **Rationale**: All are specific configurations of `Dialog` (Modal) or `Drawer` with specific typography, icons, and button variants.
*   **Reuse Guidance**: Use `<Modal>` or `<Drawer>` and configure `title` and `footer` buttons.

---

## Layer 8: Laboratory

### CMP-801: Specimen Card / CMP-802: Specimen Timeline / CMP-805: MIC Table / CMP-807: Organism Summary / CMP-808: Colony Counter / CMP-809: Incubation Timer / CMP-811: CAPA Panel / CMP-812: Media Lot Card / CMP-813: Equipment Status
*   **Rationale**: Domain-specific views strictly assembled by composing base components (`Card`, `Typography`, `Badge`, `Number Input`, `Data Table`).
*   **Reuse Guidance**: Build as module-specific views utilizing core components.
