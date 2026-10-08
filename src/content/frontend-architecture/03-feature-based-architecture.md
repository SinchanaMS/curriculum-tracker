# Feature-Based Architecture

## Why It Matters

As a frontend application grows, organizing code only by technical type (`components/`, `hooks/`, `utils/`, `services/`) becomes difficult to maintain.

Feature-based architecture organizes code around **business capabilities** instead:

```text
features/
├── customers/
├── campaigns/
├── billing/
└── authentication/
```

This helps us achieve:

- High cohesion — related code lives together
- Low coupling — features depend on each other less
- Clear ownership — each feature owns its business logic
- Easier navigation — developers can find everything related to a feature
- Safer refactoring — implementation details can change behind a boundary
- Better scalability — the architecture continues to work as the application grows
- Easier testing and removal of features

> **Key Question:** How do we organize a frontend so that business capabilities remain cohesive, independently maintainable, and loosely coupled as the application grows?

---

# 1. Feature-Based vs Type-Based Architecture

## Type-Based Architecture

A common small application structure is:

```text
src/
├── components/
├── hooks/
├── services/
├── utils/
├── pages/
└── store/
```

This organizes code by **what kind of code it is**.

For example:

```text
components/
  CustomerTable.tsx
  CampaignTable.tsx

hooks/
  useCustomers.ts
  useCampaigns.ts

services/
  customerService.ts
  campaignService.ts
```

This works well initially.

But as the application grows, working on one feature requires jumping between many directories.

---

## Feature-Based Architecture

Instead, organize around business capabilities:

```text
src/
├── app/
├── features/
│   ├── customers/
│   ├── campaigns/
│   └── billing/
└── shared/
```

A feature can contain the technical pieces it needs:

```text
features/
└── customers/
    ├── components/
    ├── hooks/
    ├── api/
    ├── state/
    ├── types.ts
    ├── utils.ts
    └── index.ts
```

The important idea is NOT the exact folder structure.

> **The important idea is that code that belongs to the same business capability and tends to change together should be kept together.**

---

# 2. Feature Folder Structure

A practical React/TypeScript application might look like:

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── features/
│   ├── customers/
│   │   ├── components/
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── CustomerFilters.tsx
│   │   │   └── CustomerCard.tsx
│   │   ├── hooks/
│   │   │   └── useCustomers.ts
│   │   ├── api/
│   │   │   └── customers.api.ts
│   │   ├── state/
│   │   │   └── customerStore.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   │
│   ├── campaigns/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── billing/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       └── types.ts
│
├── shared/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── DataTable.tsx
│   ├── hooks/
│   ├── utils/
│   └── types/
│
└── main.tsx
```

### What belongs in a feature?

Feature-specific:

```text
CustomerTable
CustomerFilters
useCustomers
customer API calls
CustomerStatus
Customer types
customer-specific validation
```

### What belongs in shared?

Business-agnostic:

```text
Button
Modal
Tooltip
useDebounce
formatCurrency
generic pagination types
generic DataTable
```

---

## High Cohesion

A good feature should have **high cohesion**.

Things that change together should generally live together.

For example:

```text
customers/
├── CustomerTable
├── CustomerFilters
├── useCustomers
├── customers.api
└── Customer
```

If the customer domain changes, these files are likely to change together.

That makes the feature easier to understand and maintain.

---

# 3. Colocation Principle

> **Keep code close to the code that consumes it.**

Suppose a helper is only used by `CustomerTable`.

Instead of:

```text
features/customers/
├── components/
│   └── CustomerTable.tsx
└── utils/
    └── formatCustomer.ts
```

we could colocate it:

```text
features/customers/
└── components/
    └── CustomerTable/
        ├── CustomerTable.tsx
        ├── formatCustomer.ts
        └── CustomerTable.test.tsx
```

Now everything relevant to that component is together.

---

## Colocation Can Include Tests

```text
CustomerTable/
├── CustomerTable.tsx
├── CustomerTable.test.tsx
├── CustomerTable.module.css
└── useCustomerColumns.ts
```

This is often easier to navigate than having separate global directories for:

```text
components/
tests/
styles/
hooks/
```

---

## Don't Over-Colocate

Colocation does NOT mean every piece of code must live in the smallest possible folder.

If:

```text
formatCurrency()
```

is used by:

```text
Customers
Campaigns
Billing
Reports
```

it is a legitimate candidate for:

```text
shared/utils/formatCurrency.ts
```

The rule is:

> **Keep implementation details close to their consumers until there is a real reason to share them.**

---

## Interview Answer

> "I prefer colocating code with its consumer. Feature-specific components, hooks, tests and utilities should stay close to the feature or component that owns them. Once something is genuinely reused across multiple features, I would promote it to a shared layer."

---

# 4. Barrel Exports (`index.ts`)

An `index.ts` can act as the **public API of a feature**.

Example:

```ts
// features/customers/index.ts

export { CustomerTable } from "./components/CustomerTable";
export { CustomerFilters } from "./components/CustomerFilters";
export { useCustomers } from "./hooks/useCustomers";
export type { Customer } from "./types";
```

Consumers can now write:

```ts
import {
  CustomerTable,
  CustomerFilters,
} from "@/features/customers";
```

instead of:

```ts
import { CustomerTable }
  from "@/features/customers/components/CustomerTable";

import { CustomerFilters }
  from "@/features/customers/components/CustomerFilters";
```

---

## Why Use a Public API?

The feature can hide its internal structure.

Today:

```text
customers/components/CustomerTable.tsx
```

Tomorrow:

```text
customers/ui/table/CustomerTable.tsx
```

Consumers still use:

```ts
import { CustomerTable } from "@/features/customers";
```

The internal structure can change without forcing every consumer to change.

This is **encapsulation at the module/feature level**.

---

## Don't Export Everything

Avoid blindly doing:

```ts
export * from "./components";
export * from "./hooks";
export * from "./utils";
export * from "./internal";
```

That makes implementation details part of the public API.

Prefer intentional exports:

```ts
export { CustomerTable } from "./components/CustomerTable";
export { useCustomers } from "./hooks/useCustomers";
export type { Customer } from "./types";
```

> **A barrel file should expose the feature's public contract, not its entire implementation.**

---

## Barrel Export Tradeoffs

Barrel files can also introduce:

- Accidental public APIs
- Circular dependencies
- Large dependency graphs
- Harder-to-understand imports
- Potential bundling implications depending on tooling

Therefore:

> Use barrel exports intentionally rather than treating `index.ts` as mandatory for every folder.

---

# 5. Feature Boundaries

A feature boundary answers:

> **What is this feature allowed to expose, and what should remain private?**

Imagine:

```text
features/
├── customers/
├── campaigns/
└── billing/
```

The internals of Customers should not be freely accessed by Campaigns.

### Bad

```ts
import { customerStore }
  from "@/features/customers/state/customerStore";
```

Campaigns now knows how Customers internally manages its state.

### Better

```ts
import { CustomerTable }
  from "@/features/customers";
```

Or expose an intentional domain operation through the public API.

---

## Feature as a Module

Think of a feature like this:

```text
┌──────────────────────────────────┐
│            Customers             │
│                                  │
│  Components                      │
│  Hooks                           │
│  API                             │
│  State                           │
│  Utils                           │
│                                  │
│       ┌──────────────────┐       │
│       │    Public API    │───────┼──→ Other code
│       └──────────────────┘       │
│                                  │
└──────────────────────────────────┘
```

Everything behind the boundary is an implementation detail.

---

# 6. Shared vs Feature Code

This is a common interview question.

## Feature Code

Feature code contains business/domain-specific behavior.

```text
features/customers/
├── CustomerTable
├── CustomerFilters
├── CustomerStatusBadge
├── useCustomers
└── customerApi
```

These concepts are specifically about customers.

---

## Shared Code

Shared code should be business-agnostic.

```text
shared/
├── components/
│   ├── Button
│   ├── Modal
│   └── Tooltip
├── hooks/
│   └── useDebounce
└── utils/
    └── formatCurrency
```

These concepts should not need to know about a particular business feature.

---

## The Reusability Test

Ask:

> **Could I move this code to another product without changing its business meaning?**

If yes, it is probably shared.

```text
useDebounce()       → Shared
Modal               → Shared
formatCurrency()    → Shared

useCustomerFilters() → Feature
CustomerTable        → Feature
CustomerStatus       → Feature
```

---

## Avoid Premature Abstraction

Suppose:

```text
CustomerCard
CampaignCard
```

look similar.

Don't immediately create:

```tsx
<GenericCard
  variant="customer"
  showStatus
  campaignMode
  compact
  ...
/>
```

This can create a "god component" with many unrelated configuration options.

A better approach:

1. Keep the implementations separate initially.
2. Observe what is actually common.
3. Extract the genuinely reusable primitive.
4. Keep domain-specific behavior inside the feature.

> **Duplication is sometimes cheaper than the wrong abstraction.**

---

# 7. Dependency Direction

Feature architecture becomes much more powerful when we define **dependency direction**.

A simple architecture is:

```text
              APP
               │
               ↓
            FEATURES
               │
               ↓
             SHARED
```

Meaning:

```text
app      → features
app      → shared
features → shared
```

But:

```text
shared ✕→ features
shared ✕→ app
```

And ideally:

```text
feature A ✕→ feature B internals
```

---

## Why Dependency Direction Matters

Without rules, you can end up with:

```text
Customers
   ↓
Campaigns
   ↓
Billing
   ↓
Customers
```

This creates a tangled dependency graph.

A change to one feature can unexpectedly affect several others.

With clear direction:

```text
app
 ↓
features
 ↓
shared
```

the architecture becomes easier to reason about.

---

# 8. Can We Actually Enforce Dependency Direction?

**Yes.**

This is an important distinction:

> JavaScript/TypeScript allows imports, but architectural tooling can prevent invalid imports.

You can define rules such as:

```text
app
 ├── can import features
 └── can import shared

features
 ├── can import shared
 ├── cannot import app
 └── cannot import another feature's internals

shared
 ├── cannot import features
 └── cannot import app
```

---

## Enforcing It With ESLint

Tools commonly used include:

- ESLint
- `eslint-plugin-boundaries`
- `eslint-plugin-import`
- Monorepo dependency constraints
- TypeScript project/package boundaries

For example, an architectural rule could reject:

```ts
// shared/components/DataTable.tsx

import { Customer } from "@/features/customers";
// ❌ shared depends on a feature
```

It can also reject:

```ts
// Campaigns

import { customerStore }
  from "@/features/customers/state/customerStore";
// ❌ reaching into another feature's internals
```

while allowing:

```ts
import { Customer } from "@/features/customers";
// ✓ intentional public API
```

---

## Interview Answer

> "Yes. I would define the dependency direction at the architecture level and enforce it using linting or package-level constraints. The goal isn't just to document that shared can't depend on features; we want tooling to catch violations during development."

This is a strong SDE2-level answer because you're talking about **enforcement**, not just conventions.

---

# 9. Feature-to-Feature Dependencies

Sometimes a relationship between features is legitimate.

For example:

```text
Orders → Products
```

An order naturally references products.

But avoid:

```ts
import { productReducer }
  from "@/features/products/state/productReducer";
```

because Orders now knows the internal implementation of Products.

Prefer:

```ts
import { getProduct }
  from "@/features/products";
```

if a public API is appropriate.

---

## Even Better: Orchestration

Sometimes the relationship belongs at a higher level.

Instead of:

```text
Customers → Campaigns
```

use:

```text
          CustomerCampaignPage
              /          \
             ↓            ↓
        Customers      Campaigns
```

Example:

```tsx
function CustomerCampaignPage() {
  const [customerId, setCustomerId] = useState<string>();

  return (
    <>
      <CustomerList
        selectedId={customerId}
        onSelect={setCustomerId}
      />

      <CampaignList customerId={customerId} />
    </>
  );
}
```

Neither feature needs to know how the other works internally.

> **Prefer coordination at an orchestration layer when two features need to work together but shouldn't become tightly coupled.**

---

# 10. Cross-Feature Communication

When two features need to communicate, first identify **what kind of data is being shared**.

## Option 1: Parent/Container Orchestration

Use when the relationship is local to a page or workflow.

```text
CustomerCampaignPage
       │
       ├── CustomerList
       │
       └── CampaignList
```

```tsx
function CustomerCampaignPage() {
  const [customerId, setCustomerId] = useState<string>();

  return (
    <CustomerList
      selectedId={customerId}
      onSelect={setCustomerId}
    />
    <CampaignList customerId={customerId} />
  );
}
```

Good for explicit, local coordination.

---

## Option 2: URL State

Use when state should be:

- Shareable
- Bookmarkable
- Navigable
- Restored on refresh

Example:

```text
/customers?customerId=123&status=active&page=2
```

Good candidates:

```text
search
filters
pagination
selected entity
tabs
sorting
```

The URL becomes the communication mechanism:

```text
Customer feature
       ↓
      URL
       ↓
Campaign feature
```

---

## Option 3: Server State

If both features need the same backend data, don't necessarily copy that data into a global client store.

Use a server-state solution such as:

```text
React Query
SWR
```

The backend remains the source of truth.

This provides:

- Caching
- Deduplication
- Invalidation
- Refetching
- Loading/error state

---

## Option 4: Shared Client State

Use when the state truly has application-wide ownership.

Examples:

```text
authenticated user
theme
application preferences
global UI state
```

But don't put every piece of state into Redux/Zustand/etc.

> **State should live at the lowest level that legitimately owns it.**

---

## Option 5: Events

For loosely coupled workflows:

```text
Customer feature
      │
      ↓
customer:selected
      │
      ↓
Campaign feature
```

Conceptually:

```ts
eventBus.emit("customer:selected", customerId);
```

Events can be useful when producers should not know their consumers.

But they have tradeoffs:

- Control flow becomes less explicit
- Debugging becomes harder
- Event names become implicit contracts
- Dependencies can become difficult to discover

Therefore:

> **Use events intentionally, not as the default communication mechanism.**

---

# 11. Feature Flags Architecture

Feature flags let us control whether functionality is available without necessarily deploying separate code versions.

Example:

```text
new-customer-dashboard = true
```

A basic implementation:

```tsx
const enabled = useFeatureFlag("new-customer-dashboard");

return enabled
  ? <NewDashboard />
  : <OldDashboard />;
```

---

## Recommended Architecture

Instead of scattering flag logic everywhere:

```text
Feature Flag Service / Backend
             ↓
       Flag configuration
             ↓
        Frontend client
             ↓
      useFeatureFlag()
             ↓
           Feature
```

Example:

```ts
const enabled = useFeatureFlag("new-customer-dashboard");
```

The feature consumes the result; it doesn't need to understand how the flag was evaluated.

---

## Why Centralize Evaluation?

The flag may depend on:

```text
user
organization
environment
percentage rollout
experiment group
subscription
region
```

For example:

```text
newDashboard = true
only if:
    environment === production
    AND organization is in beta
```

That evaluation logic should not be duplicated across components.

---

# 12. Types of Feature Flags

Not every boolean configuration is the same.

## Release Flag

Used to gradually release functionality.

```text
new-customer-dashboard
```

Usually temporary.

---

## Experiment Flag

Used for A/B testing.

```text
dashboard-layout-experiment
```

May select:

```text
A → old layout
B → new layout
```

---

## Permission / Entitlement

Example:

```text
canExportReports
```

This is often an authorization/entitlement decision rather than a temporary feature flag.

The distinction matters because permissions generally shouldn't be treated like temporary release toggles.

---

# 13. Feature Flag Debt

Temporary flags should eventually be removed.

Bad:

```tsx
if (newDashboard) {
  return <NewDashboard />;
}

return <OldDashboard />;
```

If the new dashboard has been fully released and the old one is removed, keeping the condition creates unnecessary complexity.

Over time:

```text
flag1
flag2
flag3
flag4
flag5
...
```

creates **feature flag debt**.

When a rollout is complete:

1. Remove the flag.
2. Remove the old implementation.
3. Remove dead branches.
4. Remove flag-specific tests/configuration.

> **A feature flag should have an owner and, ideally, a removal plan.**

---

# 14. Monorepo Considerations

Feature-based architecture also works inside a monorepo.

Example:

```text
repo/
├── apps/
│   ├── customer-web/
│   └── admin/
│
├── packages/
│   ├── ui/
│   ├── design-system/
│   ├── utilities/
│   ├── eslint-config/
│   └── tsconfig/
│
└── package.json
```

Inside an application:

```text
apps/customer-web/
└── src/
    ├── features/
    │   ├── customers/
    │   ├── campaigns/
    │   └── billing/
    └── shared/
```

---

## What Belongs in Packages?

Things that are genuinely reusable across applications:

```text
packages/ui/
packages/design-system/
packages/utilities/
packages/eslint-config/
packages/tsconfig/
```

For example:

```text
packages/ui/Button
packages/ui/Modal
packages/ui/DatePicker
```

could be consumed by:

```text
customer-web
admin
```

---

## What Should Stay Inside an App?

Application-specific business features:

```text
customer-web/
└── features/
    ├── customers/
    ├── campaigns/
    └── billing/
```

Don't create a package merely because something can technically be imported by another application.

Bad:

```text
packages/
├── customer-table
├── customer-filter
├── customer-modal
└── customer-hook
```

if these are specific to one product.

This creates unnecessary package boundaries and maintenance overhead.

---

# 15. Monorepo Dependency Direction

Monorepos make dependency enforcement even more useful.

For example:

```text
apps/customer-web
        │
        ↓
packages/ui
packages/utils
```

Allowed:

```text
customer-web → ui
customer-web → utils
```

Not allowed:

```text
packages/ui → customer-web
```

because reusable packages should not depend on applications.

You can enforce this using:

- Workspace/package boundaries
- ESLint rules
- TypeScript configuration
- Nx dependency constraints
- Build tooling
- CI checks

The exact tool can vary.

The architectural principle is:

> **Dependencies should flow in one intentional direction.**

---

# 16. A Complete Dependency Model

A mature feature-based frontend might look like:

```text
                         ┌───────────────┐
                         │      APP      │
                         │ Router/Pages  │
                         └───────┬───────┘
                                 │
                    ┌────────────┴────────────┐
                    ↓                         ↓
             ┌─────────────┐           ┌─────────────┐
             │  Customers  │           │  Campaigns  │
             └──────┬──────┘           └──────┬──────┘
                    │                         │
                    └────────────┬────────────┘
                                 ↓
                         ┌───────────────┐
                         │    SHARED     │
                         │ UI / Utils    │
                         │ Generic Hooks │
                         └───────────────┘
```

The rules could be:

```text
APP
 ├── → Features
 └── → Shared

FEATURE
 └── → Shared

SHARED
 └── ✕ Features
```

And between features:

```text
Feature A
   ✕
Feature B internals
```

If communication is necessary:

```text
Feature A
   ↓
Public API / Orchestrator / URL / Server State
   ↓
Feature B
```

---

# 17. What Does "Dependency" Actually Mean?

In architecture, dependency doesn't only mean:

```ts
import something from "./something";
```

A dependency exists whenever one module needs another module's behavior or knowledge.

Examples:

### Code dependency

```ts
import { Button } from "@/shared/components/Button";
```

### Data dependency

```text
Campaigns need customerId
```

### State dependency

```text
Feature B reads Feature A's store
```

### Runtime dependency

```text
Feature B expects Feature A to initialize something first
```

### Architectural dependency

```text
Billing assumes Customers owns subscription information
```

A good architecture tries to make these dependencies:

- Explicit
- Minimal
- Stable
- Easy to reason about

---

# 18. Common Mistakes

## Mistake 1: "Everything reusable belongs in shared"

Not necessarily.

```text
CustomerTable
```

may technically be reusable but still be a customer-domain component.

Reuse alone isn't enough.

---

## Mistake 2: Global state for everything

```text
Redux
  ├── modal
  ├── form input
  ├── table selection
  ├── URL filter
  └── API cache
```

This creates unnecessary coupling.

Choose state ownership based on the nature of the state.

---

## Mistake 3: Features importing feature internals

```ts
import { customerStore }
  from "@/features/customers/state/customerStore";
```

This bypasses the boundary.

---

## Mistake 4: Giant shared components

```text
GenericTable
GenericModal
GenericForm
GenericCard
```

with dozens of feature-specific props.

This usually means feature-specific logic has been pushed into a supposedly generic abstraction.

---

## Mistake 5: Circular dependencies

```text
Customers → Campaigns
Campaigns → Billing
Billing → Customers
```

These make the system difficult to reason about.

---

## Mistake 6: Too many packages in a monorepo

Not every reusable file deserves its own package.

Packages have:

- Versioning implications
- Build implications
- Ownership implications
- Dependency management overhead

Create a package when it represents a meaningful reusable boundary.

---

## Mistake 7: Never removing feature flags

Temporary flags become permanent complexity.

---

# 19. Feature-Based Architecture vs Component Architecture

These are NOT competing concepts.

You can have:

```text
Feature architecture
        ↓
Customers
        ↓
Component architecture
        ↓
CustomerTable
CustomerFilters
CustomerCard
```

Feature architecture answers:

> **Where does this business capability belong?**

Component architecture answers:

> **How should the UI inside that capability be structured?**

You need both.

---

# 20. Feature Architecture and State Management

Feature architecture does not dictate one state-management library.

You could have:

```text
features/customers/
├── api/
├── components/
├── hooks/
└── state/
    └── customerStore.ts
```

But the state could be:

```text
Local state
Context
Zustand
Redux
React Query
URL state
```

depending on the type of state.

A useful ownership model:

```text
Local UI state
      ↓
Component

Feature-local client state
      ↓
Feature

Server state
      ↓
Query/cache layer

Shareable navigation state
      ↓
URL

Application-wide client state
      ↓
Global store/context
```

Feature architecture answers **where the code belongs**.

State architecture answers **where the state should live and who owns it**.

---

# 21. Feature Architecture and Component Design

Inside a feature, you can still use good component architecture patterns:

```text
features/customers/
└── components/
    ├── CustomerTable/
    ├── CustomerFilters/
    └── CustomerDetails/
```

For complex components, you can use:

- Compound components
- Container/presentational separation
- Custom hooks
- Render props where appropriate
- Configuration-driven rendering where appropriate

Feature-based architecture operates at a **higher architectural level** than individual component patterns.

---

# 22. Feature Architecture and Code Splitting

Features can also provide natural boundaries for lazy loading.

For example:

```tsx
const BillingPage = lazy(
  () => import("@/features/billing/BillingPage")
);
```

If Billing is not needed immediately, its code can be loaded later.

This can improve:

- Initial bundle size
- Initial load time
- Route-level performance

This is another benefit of having meaningful feature boundaries.

---

# 23. How to Decide Where Something Belongs

When adding a new piece of code, ask these questions:

```text
1. Is it business-specific?
       │
       ├── YES → Which feature owns it?
       │
       └── NO
            ↓
       Could it genuinely be shared?
            │
            ├── YES → shared
            └── NO → keep it local
```

Then ask:

```text
Does another feature need it?
        │
        ↓
Can we expose a stable public API?
        │
        ↓
Would orchestration be cleaner?
        │
        ↓
Is this actually shared state?
```

Finally:

```text
Does this create a backwards dependency?
        │
        └── YES → Reconsider the boundary
```

---

# 24. Interview Scenario

### Question

> "You have Customers and Campaigns. Selecting a customer should update the campaign list. How would you architect this?"

### Weak answer

> "I'd put the selected customer in Redux."

Why is this weak?

Because it immediately chooses a technology without discussing ownership.

### Better reasoning

First ask:

> Does the selection need to be shareable/bookmarkable?

If yes:

```text
URL state
```

For example:

```text
/customers?customerId=123
```

If it is only needed within the page:

```text
CustomerCampaignPage
       │
       ├── CustomerList
       │
       └── CampaignList
```

The parent owns `customerId`.

If several unrelated areas need the selection globally:

```text
Shared application state
```

If both features need backend customer data:

```text
Server-state cache
```

The important thing is:

> **Choose the communication mechanism based on state ownership, not based on which state library you happen to use.**

---

# 25. Interview Scenario: Shared Component

### Question

> "You have a CustomerCard and CampaignCard. They look almost identical. Would you put them in shared?"

### Strong answer

> "Not immediately. I'd first determine whether the commonality represents a genuine domain-agnostic UI primitive or whether we're just seeing superficial similarity. If the common behavior is stable and business-agnostic, I'd extract a shared primitive. Otherwise, I'd keep the components within their features. I generally prefer avoiding premature abstractions because an overly generic component can become more complex than the duplicated implementations."

---

# 26. Interview Scenario: Feature Boundaries

### Question

> "How do you prevent developers from importing internal files from another feature?"

### Strong answer

> "I'd establish an explicit public API for each feature, typically through controlled exports from its entry point. Developers should import from the feature's public API rather than its internal paths. I'd also enforce the rule with linting or dependency-boundary tooling so the architecture isn't dependent purely on developer discipline."

---

# 27. Interview Scenario: Dependency Direction

### Question

> "Can you enforce dependency direction?"

### Answer

> "Yes. I'd first define the allowed dependency graph, for example app → features → shared. Then I'd enforce it using ESLint dependency rules, boundary plugins, or package-level constraints in a monorepo. This prevents things like shared code importing a feature or one feature reaching into another feature's internals."

---

# 28. Interview Scenario: Feature Flags

### Question

> "How would you architect feature flags?"

### Strong answer

> "I'd centralize flag evaluation rather than having components implement their own user or rollout logic. The frontend would consume something like `useFeatureFlag('new-dashboard')`. The evaluation could depend on environment, user, organization, rollout percentage, or experiment assignment. I'd also distinguish temporary release flags from permissions and experiments, and I'd remove temporary flags after rollout to avoid flag debt."

---

# 29. Interview Scenario: Monorepo

### Question

> "What would you put into a shared package in a monorepo?"

### Strong answer

> "I'd put things that have a genuine cross-application ownership boundary there—for example a design system, generic UI primitives, shared tooling, or business-agnostic utilities. I wouldn't extract application-specific features merely because they could technically be imported elsewhere. Every package adds dependency and ownership overhead, so I'd create packages intentionally."

---

# 30. The 30-Second Interview Answer

If an interviewer asks:

> **"What is feature-based architecture?"**

You can say:

> "Feature-based architecture organizes a frontend around business capabilities rather than technical types. For example, instead of having global components, hooks and services folders, I'd have features such as customers, campaigns and billing, with each feature owning its components, hooks, API logic and state. I'd keep genuinely business-agnostic primitives in a shared layer.
>
> I'd use colocation to keep feature-specific implementation close to its consumers, and expose a small public API so other parts of the application don't reach into feature internals. I'd also define dependency direction—typically app → features → shared—and enforce those boundaries with linting or package constraints.
>
> For cross-feature communication, I'd choose an explicit mechanism based on state ownership, such as parent orchestration, URL state, server state, shared state, or events when loose coupling is actually required."

---

# 31. The Mental Model to Remember

Don't memorize the folder tree.

Remember these five questions:

```text
┌──────────────────────────────────────────────┐
│  1. WHO OWNS THIS CODE?                      │
│     → Feature or shared?                     │
├──────────────────────────────────────────────┤
│  2. WHO OWNS THIS STATE?                     │
│     → Component / feature / URL / server?    │
├──────────────────────────────────────────────┤
│  3. WHAT IS THE PUBLIC API?                  │
│     → What should other code be allowed to   │
│       know about?                             │
├──────────────────────────────────────────────┤
│  4. WHICH WAY SHOULD THE DEPENDENCY FLOW?    │
│     → app → features → shared                │
├──────────────────────────────────────────────┤
│  5. CAN THE BOUNDARY BE ENFORCED?            │
│     → ESLint / package constraints / CI      │
└──────────────────────────────────────────────┘
```

If you can reason through those five questions, you can handle most feature-architecture interview questions without memorizing a prescribed folder structure.

---

# Self-Assessment Questions

<details>
<summary>1. What problem does feature-based architecture solve?</summary>

It organizes code around business capabilities rather than technical types, improving cohesion, discoverability, ownership and maintainability as the application grows.

</details>

<details>
<summary>2. What is colocation?</summary>

Keeping code close to the code that consumes it. Feature-specific helpers, tests, styles and hooks can stay near the component or feature that owns them.

</details>

<details>
<summary>3. When should something move to shared?</summary>

When it is genuinely reused and its behavior is business-agnostic. Don't move code to shared merely because it could theoretically be reused.

</details>

<details>
<summary>4. What is the purpose of a feature's index.ts?</summary>

It can act as the feature's public API, exposing intentional exports while hiding internal implementation details.

</details>

<details>
<summary>5. Should features directly import each other's internals?</summary>

Generally no. Prefer public APIs or a higher-level orchestration mechanism.

</details>

<details>
<summary>6. What is a good default dependency direction?</summary>

```text
app → features → shared
```

Shared should not depend on features or the application.

</details>

<details>
<summary>7. Can dependency direction actually be enforced?</summary>

Yes. ESLint boundary rules, import rules, monorepo dependency constraints, TypeScript/package boundaries and CI checks can enforce architectural rules.

</details>

<details>
<summary>8. How should Customers and Campaigns communicate?</summary>

It depends on ownership: parent orchestration for local coordination, URL state for shareable navigation state, server state for backend data, shared state for genuinely global client state, or events for intentionally loose coupling.

</details>

<details>
<summary>9. Why shouldn't everything go into Redux/Zustand?</summary>

Because different kinds of state have different owners. Local UI state, URL state, server state and global client state have different requirements. Globalizing everything increases coupling.

</details>

<details>
<summary>10. What is feature flag debt?</summary>

Complexity caused by old or temporary feature flags remaining in the codebase after their rollout is complete.

</details>

<details>
<summary>11. What belongs in a monorepo package?</summary>

Genuinely reusable code with a meaningful cross-application boundary, such as a design system, generic UI primitives or shared tooling.

</details>

<details>
<summary>12. What is the difference between feature architecture and component architecture?</summary>

Feature architecture organizes the application around business capabilities. Component architecture determines how UI and behavior are structured within those capabilities.

</details>

---

# Common Interview Questions

1. What is feature-based architecture?
2. Why would you choose feature-based over type-based architecture?
3. How would you structure a large React application?
4. What is the colocation principle?
5. What belongs in `shared/`?
6. When should code move from a feature into shared?
7. What are barrel exports?
8. What are the downsides of barrel files?
9. How do you define feature boundaries?
10. How do you prevent features from importing each other's internals?
11. Can dependency direction be enforced?
12. How would you enforce architectural boundaries in ESLint?
13. How should two features communicate?
14. When would you use URL state for cross-feature communication?
15. When would you use a global store?
16. When would you use an event bus?
17. How would you architect feature flags?
18. What's the difference between a feature flag and a permission?
19. What is feature flag debt?
20. How does feature architecture work in a monorepo?
21. What belongs in a shared package?
22. How would you avoid circular dependencies?
23. How would you design a feature that needs functionality from another feature?
24. How would you lazy-load features?
25. How do feature architecture and state management interact?

---

# Final Interview Checklist

Before considering this topic complete, make sure you can explain each of these without notes:

- [ ] Why feature-based architecture exists
- [ ] Feature-first folder structure
- [ ] High cohesion
- [ ] Colocation principle
- [ ] Feature vs shared code
- [ ] Avoiding premature abstractions
- [ ] Barrel exports
- [ ] Public API vs internal implementation
- [ ] Feature boundaries
- [ ] Dependency direction
- [ ] Enforcing dependency direction
- [ ] Feature-to-feature dependencies
- [ ] Parent-level orchestration
- [ ] URL state as a communication mechanism
- [ ] Server state vs client state
- [ ] Event-based communication
- [ ] Feature flag architecture
- [ ] Release vs experiment vs permission
- [ ] Feature flag debt
- [ ] Monorepo structure
- [ ] Package boundaries
- [ ] Feature-level code splitting
- [ ] Relationship between feature and component architecture
- [ ] State ownership

---

# One-Line Summary

> **Feature-based architecture keeps business capabilities cohesive, exposes small public APIs, controls dependency direction, minimizes coupling, and moves only genuinely generic code into shared layers.**

