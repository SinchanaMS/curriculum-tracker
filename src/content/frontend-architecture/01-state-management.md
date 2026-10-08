# State Management Patterns

## Why It Matters

State management is one of the most important parts of frontend architecture.

A frontend application can have many different kinds of state:

- Temporary UI state
- Shared client state
- Server-owned data
- URL/navigation state
- Form state
- Complex workflow state

The goal is **not** to put everything into a global store.

The goal is to answer:

> **Where should this state live, who owns it, who needs it, and how long should it exist?**

Good state architecture gives you:

- Lower coupling
- A clear source of truth
- Predictable data flow
- Fewer unnecessary re-renders
- Easier testing and debugging
- Better caching and synchronization
- Easier feature evolution

---

# 1. The Core Mental Model

Before choosing Redux, Zustand, Context, or another library, classify the state.

```text
                         APPLICATION STATE
                                |
        +-----------------------+-----------------------+
        |                       |                       |
     UI/Client              Server State            URL State
        |                       |                       |
   modal open              API data/cache          search
   selected tab             users/products          filters
   sidebar state             loading/error           pagination
        |
        +--------------------+
        |
     Form State
        |
   values/errors
   dirty/touched
   validation
```

The first question should be:

> **What kind of state is this?**

Not:

> "Which state-management library should I use?"

---

# 2. The State Decision Tree

Use this as the primary interview mental model.

```text
I have some state.
        |
        v
Is it owned by the server?
        |
     +--+--+
    YES    NO
     |      |
     v      v
React     Is it navigation/
Query     shareable state?
              |
           +--+--+
          YES    NO
           |      |
           v      v
          URL   Is it form state?
                       |
                    +--+--+
                   YES    NO
                    |      |
                    v      v
                  Form   Is it needed
                  state  by multiple components?
                              |
                           +--+--+
                          NO     YES
                           |       |
                           v       v
                         Local   Can lifting
                         state   solve it?
                                  |
                               +--+--+
                              YES    NO
                               |      |
                               v      v
                             Lift   Shared
                             state  client state
                                     |
                               Zustand / Redux /
                               Jotai / etc.
```

Separately ask:

```text
Does this state represent a complex
workflow with explicit valid transitions?
                 |
                YES
                 |
                 v
           State Machine
```

---

# 3. Local Component State

## What Is It?

State owned by a single component.

```javascript
const [isOpen, setIsOpen] = useState(false);
```

Typical examples:

- Modal open/close
- Dropdown open/close
- Selected tab
- Accordion expansion
- Hover state
- Temporary input state
- Loading state for a small local interaction

---

## Example

```jsx
function SearchDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        Search
      </button>

      {isOpen && <SearchOptions />}
    </div>
  );
}
```

Only `SearchDropdown` cares about `isOpen`.

There is no reason to put it into Redux or Zustand.

---

## Why Prefer Local State?

Keeping state close to where it is used gives:

- Lower coupling
- Easier reasoning
- Smaller global state
- Fewer consumers
- Easier testing
- Less accidental sharing

### Principle

> **Keep state as close as possible to where it is needed.**

---

## When Should You NOT Keep It Local?

When another component needs the same source of truth.

For example:

```text
        SearchPage
        /        \
 SearchInput   SearchResults
```

Both need:

```text
query
```

Keeping `query` inside `SearchInput` makes sharing difficult.

This leads to **lifting state**.

---

# 4. Lifting State

## What Is It?

Moving state to the nearest common ancestor so multiple components can share it.

Instead of:

```text
SearchInput
   |
  query
```

we use:

```text
SearchPage
   |
  query
 /     \
Input  Results
```

---

## Example

```jsx
function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <>
      <SearchInput
        query={query}
        onChange={setQuery}
      />

      <SearchResults query={query} />
    </>
  );
}
```

Now there is a single source of truth.

---

## Why Is This Important?

Without lifting:

```text
SearchInput → query A
SearchResults → query B
```

You can create synchronization problems.

With lifting:

```text
             query
               |
        +------+------+
        |             |
      Input         Results
```

Both components derive their behavior from the same state.

---

## The Problem: Prop Drilling

Suppose:

```text
App
 └── Dashboard
      └── Page
           └── Section
                └── Search
```

and `query` has to be passed through every level.

```jsx
<App query={query}>
  <Dashboard query={query}>
    <Page query={query}>
      <Section query={query}>
        <Search query={query} />
      </Section>
    </Page>
  </Dashboard>
</App>
```

At this point, Context or a shared store may become useful.

---

# 5. Global / Shared Client State

## What Is It?

State that is intentionally shared across distant parts of the application.

Examples:

```text
Current user
Current organization
Theme
Feature flags
Permissions
Shopping cart
Application-wide UI preferences
```

Architecture:

```text
                   Shared Store
                       |
        +--------------+--------------+
        |              |              |
      Header       Dashboard       Sidebar
```

---

## Important Principle

Global state does NOT mean:

> "Anything used by more than one component belongs in Redux."

Instead ask:

> **Is this genuinely application-scoped state?**

Good candidates:

```text
currentOrganization
currentUser
theme
permissions
cart
```

Usually bad candidates:

```text
isDropdownOpen
isTooltipVisible
temporaryInputValue
hoveredRow
```

Those should generally remain local.

---

# 6. Server State

## What Is Server State?

Server state is data whose source of truth is the backend.

Examples:

```text
Users
Products
Orders
Projects
Messages
Analytics
```

For example:

```text
GET /api/users
```

returns:

```json
[
  { "id": 1, "name": "Alice" }
]
```

The frontend does not truly own this data.

It maintains a local representation/cache of remote data.

---

## Why Is Server State Different?

Server state has special concerns:

- Asynchronous fetching
- Loading
- Errors
- Caching
- Stale data
- Refetching
- Retries
- Pagination
- Invalidation
- Synchronization
- Mutations
- Optimistic updates

Trying to manage all of this manually with `useState` and `useEffect` becomes difficult.

---

# 7. React Query / TanStack Query

A server-state library such as TanStack Query provides infrastructure for remote data.

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

Architecture:

```text
                 Backend
                    |
                  HTTP
                    |
                    v
            React Query Cache
             /      |      \
            v       v       v
         Page A   Page B   Page C
```

Multiple components can consume the same cached server state.

---

## Query

A query reads/fetches server data.

```jsx
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

---

## Mutation

A mutation changes server data.

```jsx
useMutation({
  mutationFn: createUser,
});
```

---

## Query Keys

Query keys identify a specific piece of server state.

```javascript
["users"]
```

With parameters:

```javascript
["users", organizationId]
```

For a filtered list:

```javascript
[
  "customers",
  {
    search: "acme",
    plan: "pro",
    page: 2
  }
]
```

Different query keys represent different cached data.

---

## Caching

Suppose the user visits:

```text
Customers → Page 1
```

Then:

```text
Customers → Page 2
```

Then returns to:

```text
Customers → Page 1
```

A server-state library can reuse the cached Page 1 data depending on its freshness configuration.

---

## Invalidation

After a mutation:

```text
Update customer
      |
      v
Invalidate ["customers"]
      |
      v
Fetch fresh server state
```

This helps ensure the backend remains the source of truth.

---

# 8. Server State vs Client State

This distinction is extremely important in interviews.

### Server state

```text
users
products
orders
analytics
```

Owned by backend.

Use:

```text
React Query / SWR
```

### Client state

```text
sidebarOpen
selectedTab
theme
temporary UI preferences
```

Owned by frontend.

Use:

```text
useState
Context
Zustand
Redux
etc.
```

A common architectural mistake is putting all API data into Redux simply because it is "application state."

---

# 9. URL State

## What Is It?

State represented by the URL.

Examples:

```text
/products?search=react
```

```text
/products?category=books&page=2
```

```text
/dashboard?tab=analytics
```

```text
/customers/123
```

---

## Why Use URL State?

The URL is:

- Shareable
- Bookmarkable
- Refresh-safe
- Browser-history aware
- Navigable

For example:

```text
/products?category=books&sort=price&page=3
```

A user can:

- Refresh the page
- Bookmark it
- Share it
- Use browser Back/Forward

and the state is preserved.

---

## Good URL State Candidates

- Search
- Filters
- Sorting
- Pagination
- Selected resource
- View mode
- Tab when it represents navigation
- Date range when it should be shareable

---

## Bad URL State Candidates

Do not put things like:

```text
isTooltipOpen
isDropdownOpen
animationState
temporary internal component state
passwords
```

The URL is not a replacement for all state management.

---

# 10. URL State + Server State

These patterns often work together.

For example:

```text
URL
 |
 +-- search
 +-- filters
 +-- page
 +-- dateRange
 |
 v
React Query queryKey
 |
 v
API
 |
 v
Server data
```

Example:

```javascript
const filters = {
  search,
  plan,
  region,
  page
};

useQuery({
  queryKey: ["customers", filters],
  queryFn: () => fetchCustomers(filters)
});
```

This is a powerful frontend architecture pattern.

---

# 11. Form State

Forms have their own state model.

A form contains more than just field values:

```text
Form State
├── values
├── errors
├── touched
├── dirty
├── valid
├── submitting
└── submitted
```

---

## Simple Form

For a small form:

```jsx
const [name, setName] = useState("");
```

is perfectly reasonable.

---

## Complex Form

Consider:

```text
Create Campaign
├── Basic Information
├── Audience
├── Schedule
├── Budget
├── Channels
└── Advanced Settings
```

Now you may have:

- Dozens of fields
- Nested fields
- Conditional fields
- Validation
- Dirty tracking
- Submission state
- Dynamic fields

A form library such as React Hook Form can help manage this complexity.

---

## Architecture Principle

Form state should usually remain scoped to the form.

Do not make:

```text
email = "user@example.com"
```

global just because multiple components exist on the page.

---

# 12. Context

## What Is Context?

React Context allows a value to be consumed by descendants without explicitly passing it through every component.

```jsx
<AuthContext.Provider value={user}>
  <App />
</AuthContext.Provider>
```

Then:

```jsx
const user = useContext(AuthContext);
```

---

## Good Use Cases

Context is particularly useful for cross-cutting concerns:

```text
Theme
Authentication
Locale
Permissions
Configuration
```

Example:

```text
App
 |
 +-- AuthProvider
      |
      +-- Header
      +-- Dashboard
      +-- Settings
```

---

## Context Is Not Automatically a Global State Manager

A common interview mistake is saying:

> "Context is React's global state management."

More accurately:

> **Context is a mechanism for making values available to a subtree without prop drilling.**

It can carry state, but it does not inherently solve all state-management problems.

---

## Context Re-render Consideration

If a provider's value changes, consumers of that context may re-render.

For example:

```text
GlobalContext
     |
     +-- Component A
     +-- Component B
     +-- Component C
     +-- Component D
```

If the context contains many unrelated values and changes frequently, it can cause unnecessary work.

Possible strategies:

- Split contexts by concern
- Keep rapidly changing state out of broad contexts
- Memoize provider values where appropriate
- Use a dedicated state library when the state model becomes complex

---

# 13. Redux

Redux is a centralized state-management architecture based around explicit state transitions.

Basic flow:

```text
Component
   |
   | dispatch(action)
   v
Redux Store
   |
   v
Reducer
   |
   v
New State
   |
   v
Components
```

---

## Example

```javascript
dispatch({
  type: "cart/itemAdded",
  payload: product
});
```

Reducer:

```javascript
function cartReducer(state, action) {
  switch (action.type) {
    case "cart/itemAdded":
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    default:
      return state;
  }
}
```

---

# 14. Redux Toolkit

For modern Redux applications, know Redux Toolkit.

Example:

```javascript
const cartSlice = createSlice({
  name: "cart",

  initialState: {
    items: []
  },

  reducers: {
    addItem(state, action) {
      state.items.push(action.payload);
    }
  }
});
```

Redux Toolkit uses Immer internally, allowing reducer code that looks mutable while producing immutable state updates.

---

## When Is Redux Useful?

Redux can be a strong choice when you have:

### 1. Complex shared client state

Many parts of the application consume and modify the same state.

### 2. Complex state transitions

State changes are easier to reason about as explicit actions.

```text
USER_SELECTED
FILTER_CHANGED
CART_ITEM_ADDED
CHECKOUT_STARTED
```

### 3. Strong conventions

Large teams may benefit from standardized patterns.

### 4. Middleware / tooling requirements

Redux has a mature ecosystem for:

- Middleware
- Debugging
- Persistence
- Logging
- Testing patterns
- DevTools

---

## When Should Redux NOT Be Your Default?

Do not use Redux simply because:

> "The application is large."

For example:

```text
isModalOpen
```

does not become Redux state because the application has 200 components.

Choose the smallest mechanism that solves the problem.

---

# 15. Zustand

Zustand provides a simple shared store with relatively little boilerplate.

```javascript
const useStore = create((set) => ({
  count: 0,

  increment: () =>
    set(state => ({
      count: state.count + 1
    }))
}));
```

Consume only what you need:

```javascript
const count = useStore(state => state.count);
```

---

## Strengths

- Low boilerplate
- Simple mental model
- Easy adoption
- Convenient shared client state
- Fine-grained subscriptions

Good use cases:

```text
Shared UI state
Application preferences
Complex page-level client state
Medium-sized client state
```

---

# 16. Jotai

Jotai uses an **atomic state** model.

Instead of one large store:

```text
Store
├── user
├── cart
├── theme
└── filters
```

you define independent atoms:

```text
userAtom
cartAtom
themeAtom
filtersAtom
```

Components consume the atoms they need.

Mental model:

> **State is split into small, independently consumable pieces.**

This can be useful when state is highly composable and fine-grained.

---

# 17. Recoil

Recoil also uses an atomic state model.

Important concepts:

```text
Atoms
Selectors
```

Example:

```text
firstNameAtom
lastNameAtom
      |
      v
fullNameSelector
```

The important interview-level concept is:

> Recoil models state as atoms and derived state rather than one traditional centralized state tree.

You generally do not need to memorize its API for an SDE2 frontend interview.

---

# 18. Redux vs Zustand vs Jotai vs Recoil

| | Redux Toolkit | Zustand | Jotai | Recoil |
|---|---|---|---|---|
| Model | Central store | Central store | Atoms | Atoms |
| Boilerplate | Medium | Low | Low | Low |
| Main mental model | Actions/reducers | Store | Atoms | Atoms/selectors |
| Complex state | Excellent | Good | Good/Excellent | Good |
| Ecosystem | Very mature | Smaller | Smaller | Smaller |
| Debugging/tooling | Excellent | Good | Good | Good |
| Main reason to choose | Predictability + ecosystem | Simplicity | Fine-grained atoms | Atom-based derived state |

### Interview answer

> "I wouldn't choose the library first. I'd first classify the state. If I need shared client state, Zustand is attractive when simplicity and low boilerplate are priorities. Redux Toolkit becomes more compelling when explicit state transitions, conventions, middleware, and mature tooling are important. Jotai is useful when an atomic model fits the state structure."

---

# 19. State Machines

Some UI state is better represented as a **finite set of states and transitions**.

Consider a payment flow.

```text
idle
 |
 | SUBMIT
 v
processing
 |       |
 |       |
 v       v
success  error
           |
           | RETRY
           v
       processing
```

---

## The Boolean Problem

A naive implementation might use:

```javascript
const [isLoading, setIsLoading] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
const [isError, setIsError] = useState(false);
```

This theoretically allows:

```text
isLoading = true
isSuccess = true
isError = true
```

which is an impossible state.

---

## State Machine

Instead, define explicit states:

```text
idle
loading
success
error
```

and valid transitions:

```text
idle → loading
loading → success
loading → error
error → loading
```

This makes impossible combinations harder to represent.

---

# 20. XState

XState is a state-machine/statechart library.

Mental model:

```text
              +-------+
              | idle  |
              +---+---+
                  |
                SUBMIT
                  |
                  v
              +-------+
              |loading|
              +---+---+
               /     \
          SUCCESS     ERROR
             /         \
            v           v
        +-------+    +-------+
        |success|    | error |
        +-------+    +-------+
```

---

## When Are State Machines Useful?

Particularly useful for:

- Authentication flows
- Payments
- Checkout
- Multi-step onboarding
- File uploads
- Media processing
- Complex modals
- Voice/call workflows
- Multi-step configuration
- Permission workflows

### Interview rule

> Use a state machine when the complexity comes from **many valid states and transitions**, rather than simply from having a lot of data.

---

# 21. Optimistic Updates

An optimistic update changes the UI **before the server confirms the mutation**.

Traditional:

```text
User action
   |
   v
API request
   |
   v
Server response
   |
   v
Update UI
```

Optimistic:

```text
User action
   |
   +------------------+
   |                  |
   v                  v
Update UI         API request
immediately           |
                      v
                +-----+-----+
                |           |
              success      error
                |           |
                v           v
             confirm      rollback
```

---

## Example

Current:

```text
Likes: 10
```

User clicks Like.

Immediately:

```text
Likes: 11
```

Then:

```text
POST /posts/123/like
```

If successful:

```text
11 ✓
```

If it fails:

```text
10
```

---

## Good Use Cases

- Likes
- Follows
- Marking notifications read
- Simple toggles
- Reordering
- Small edits
- Deletes where rollback is possible

---

# 22. Optimistic Updates with React Query

Conceptually:

```javascript
useMutation({
  mutationFn: updateCustomer,

  onMutate: async (updatedCustomer) => {
    // Save previous data
    // Update query cache optimistically
  },

  onError: () => {
    // Roll back to previous data
  },

  onSettled: () => {
    // Invalidate/refetch
  }
});
```

Architecture:

```text
User edit
    |
    v
Optimistic cache update
    |
    v
UI immediately changes
    |
    v
API mutation
   / \
  /   \
OK     FAIL
 |       |
 v       v
Keep   Rollback
 |
 v
Invalidate/refetch
```

---

## Why Invalidate After Success?

The server is the final source of truth.

The server may:

- Transform the submitted value
- Apply business rules
- Modify additional fields
- Reject part of the operation
- Update related records

Therefore:

```text
Optimistic update
      ↓
Server mutation
      ↓
Invalidate/refetch
      ↓
Authoritative server state
```

is a robust pattern.

---

# 23. A Complete Architecture Example

Consider a customer analytics dashboard.

Requirements:

- Customer list from API
- Search
- Filters
- Pagination
- Date range
- Analytics charts
- Edit customer modal
- Sidebar
- User permissions
- Customer selection in URL

A good state architecture might be:

```text
                     Customer Dashboard
                            |
        +-------------------+-------------------+
        |                   |                   |
     URL State          Server State        Client/UI State
        |                   |                   |
     search             customers          modalOpen
     filters            analytics          sidebarOpen
     pagination         chart data         temporary UI
     date range         mutations
     selected customer
        |                   |
        |              React Query
        |                   |
        +---------+---------+
                  |
                 API
```

Form:

```text
Edit Customer Modal
        |
   Form State
        |
        v
    Mutation
        |
        v
React Query Cache
        |
   optimistic update
        |
   success → invalidate
   failure → rollback
```

Permissions:

```text
Auth / Permission Context
            |
            +--- Header
            +--- Sidebar
            +--- CustomerList
            +--- EditCustomer
```

---

# 24. State Ownership

A powerful architectural question is:

> **Who owns this state?**

Examples:

### Backend owns it

```text
customers
orders
analytics
```

→ Server state

### Browser/navigation owns it

```text
search
filters
page
selected customer
```

→ URL state

### Component owns it

```text
modalOpen
dropdownOpen
hoveredRow
```

→ Local state

### Form owns it

```text
email
name
validation
dirty
touched
```

→ Form state

### Application owns it

```text
currentUser
theme
organization
permissions
```

→ Context / global client state

### Workflow owns it

```text
idle
loading
success
error
```

→ State machine when complexity warrants it

---

# 25. State Normalization

For complex shared client state, avoid unnecessary duplication.

Bad:

```javascript
{
  customers: [...],
  selectedCustomer: {
    id: 1,
    name: "Alice"
  }
}
```

The same customer data now exists in multiple places.

If the customer changes, those copies can become inconsistent.

A normalized structure can look like:

```javascript
{
  customersById: {
    1: {
      id: 1,
      name: "Alice"
    }
  },

  customerIds: [1, 2, 3],

  selectedCustomerId: 1
}
```

Now:

```text
selectedCustomerId
        |
        v
customersById[id]
```

There is one source of truth for the customer.

This becomes more important as client state becomes relational.

---

# 26. Derived State

Avoid storing state that can be calculated from existing state.

Bad:

```javascript
const [items, setItems] = useState([]);
const [itemCount, setItemCount] = useState(0);
```

Now you have two sources of truth.

Better:

```javascript
const [items, setItems] = useState([]);

const itemCount = items.length;
```

Similarly:

```javascript
const completedTasks = tasks.filter(
  task => task.completed
);
```

### Principle

> **Store source data; derive values whenever practical.**

This reduces synchronization bugs.

---

# 27. State Colocation

Colocation means keeping state near the components that use it.

Instead of:

```text
Global Store
├── modalA
├── modalB
├── sidebar
├── dropdown
├── temporarySearch
└── tooltip
```

prefer:

```text
Page
├── local modal state
├── local sidebar state
└── local search state
```

unless another architectural requirement requires those values to be shared.

### Interview phrase

> "I prefer colocating state and only promoting it when the sharing requirements justify it."

---

# 28. Avoiding Duplicate Sources of Truth

A common source of bugs is storing the same logical value in multiple places.

Bad:

```text
Redux
  ↓
selectedCustomer

Component
  ↓
selectedCustomer
```

Now both can diverge.

Prefer:

```text
URL
 ↓
selectedCustomerId
 ↓
server query
```

or:

```text
Global store
 ↓
selectedCustomerId
```

but avoid unnecessary duplication.

---

# 29. Server State vs Global Client State

A common architecture:

```text
                    Application
                         |
             +-----------+-----------+
             |                       |
       Server State             Client State
             |                       |
       React Query             Zustand/Redux
             |                       |
       API data                  UI/app state
```

For example:

```text
React Query:
  users
  projects
  analytics
  orders

Zustand:
  sidebar
  selected view
  local preferences
```

This separation keeps responsibilities clear.

---

# 30. URL State + Local State

Not everything about a filter belongs in the URL.

For example:

```text
URL:
  plan=pro
  region=us

Local:
  filterDropdownOpen=true
```

The selected filter is meaningful application/navigation state.

Whether the dropdown is currently open is temporary UI state.

Keep them separate.

---

# 31. Choosing Between Context and a Global Store

Use Context when:

- The value is cross-cutting
- Consumers are mostly descendants of one provider
- Updates are relatively straightforward
- You don't need sophisticated state transitions

Examples:

```text
Theme
Locale
Auth
Permissions
```

Consider a global store when:

- State is shared across distant branches
- There are many independent updates
- State transitions are more complex
- Fine-grained subscriptions matter
- You need stronger state-management conventions

### Important

The number of components alone should not determine the choice.

Think about:

- Ownership
- Update frequency
- Sharing topology
- Complexity
- Performance
- Existing application architecture

---

# 32. Performance Considerations

State architecture affects rendering performance.

Common problems:

### 1. Overly broad Context

```text
Large Context
     |
Many consumers
```

Frequent changes can cause unnecessary work.

### 2. Globalizing local state

A tiny state change can affect a large subscription graph.

### 3. Unstable object references

```javascript
<Provider value={{ user, theme }}>
```

The object can be recreated on each render.

### 4. Storing derived state

Unnecessary state creates extra updates and synchronization.

### 5. Large server responses

Even with caching, rendering thousands of records can be expensive.

Server-state caching solves network/data-fetching work; it does not automatically solve rendering performance.

---

# 33. State Management and Component Architecture

State placement should influence component boundaries.

For example:

```text
Dashboard
├── Filters
├── CustomerList
│    └── CustomerRow
├── Analytics
│    └── Charts
└── EditCustomerModal
```

A possible ownership model:

```text
Dashboard
  |
  +-- URL filters
  |
  +-- React Query
  |      |
  |      +-- CustomerList
  |      +-- Analytics
  |
  +-- Edit modal local state
  |
  +-- Form state
```

This keeps responsibilities clear.

---

# 34. Real-Time Data

Server state can become stale while the user is on the page.

Examples:

- Another user changes a record
- WebSocket event arrives
- Background process completes
- Campaign status changes

Possible architecture:

```text
WebSocket / SSE
      |
      v
Server-state cache
      |
      v
Invalidate/update relevant query
      |
      v
React components
```

Do not automatically create a second global store for real-time server data.

The server-state cache can remain the source used by components.

---

# 35. Autosave Architecture

Consider an editor with autosave.

```text
User types
   |
   v
Local/form draft state
   |
   | debounce 2 seconds
   v
Mutation
   |
   v
Server
   |
   +---- success
   |
   +---- failure
```

Important concerns:

- Debouncing
- Request ordering
- Race conditions
- Retry
- Error indication
- Unsaved state
- Conflict resolution

A particularly important problem:

```text
Request A starts
Request B starts
Request B finishes first
Request A finishes later
```

If A overwrites B, newer edits can be lost.

Solutions may include:

- Request cancellation
- Mutation serialization
- Version numbers
- Server-side optimistic concurrency
- Last-write/version checks

---

# 36. Concurrent Editing

If multiple users can edit the same resource:

```text
User A → Campaign 1
User B → Campaign 1
```

you cannot assume the local copy is authoritative.

Possible approaches:

### Version numbers

```text
Campaign version: 12
```

Client sends:

```text
Update campaign where version = 12
```

If server is already at version 13:

```text
Conflict
```

### Optimistic concurrency

Server rejects stale writes.

### Real-time updates

WebSocket/SSE informs clients about changes.

### Conflict resolution

For more advanced collaborative applications, use specialized approaches such as CRDTs or operational transformation.

---

# 37. Common Anti-Patterns

## Anti-pattern 1: Everything in Redux

```text
Redux
├── modalOpen
├── tooltipOpen
├── inputValue
├── users
├── products
└── filters
```

Problem:

- Global coupling
- Harder reasoning
- More boilerplate
- Unnecessary shared state

---

## Anti-pattern 2: Everything in Context

Context is not automatically a replacement for Redux/Zustand or server-state libraries.

---

## Anti-pattern 3: API data duplicated into global client state

```text
API
 ↓
Redux
 ↓
React components
```

when the application really needs:

```text
API
 ↓
React Query
 ↓
React components
```

---

## Anti-pattern 4: Storing derived state

```javascript
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);
```

Prefer:

```javascript
const count = items.length;
```

---

## Anti-pattern 5: Making everything global because prop drilling exists

Before introducing a global store, consider:

1. Can I lift the state?
2. Can I improve component boundaries?
3. Would Context solve the actual sharing problem?
4. Is this genuinely application state?

---

## Anti-pattern 6: Treating URL state and UI state as the same thing

```text
filter=pro       → URL
dropdownOpen=true → local
```

Keep their responsibilities separate.

---

# 38. Interview Framework

When an interviewer gives you a state-management problem, answer in this order.

### Step 1: Identify ownership

> "Is this server-owned or client-owned?"

### Step 2: Identify scope

> "Does one component need it, a subtree, or the entire application?"

### Step 3: Identify lifetime

> "Should it survive navigation or refresh?"

### Step 4: Identify synchronization requirements

> "Does it need caching, refetching, invalidation, or real-time updates?"

### Step 5: Identify complexity

> "Are these simple values or a complex workflow with explicit transitions?"

### Step 6: Choose the smallest appropriate mechanism

```text
useState
↓
lift state
↓
Context
↓
URL
↓
React Query
↓
Zustand / Redux / Jotai
↓
State machine
```

This is not a strict hierarchy. It is a decision process.

---

# 39. Example Interview Answer

### Question

> How do you approach state management in a frontend application?

### Strong SDE2 Answer

> "I first classify state rather than choosing a state-management library upfront.
>
> For purely local UI state, I'd keep it in the component. If multiple nearby components need the same state, I'd lift it to their common parent.
>
> For server-owned data such as users, products, or analytics, I'd use a server-state library such as TanStack Query because it handles caching, synchronization, invalidation, loading and mutations.
>
> For state that represents navigation or should be shareable and survive refreshes, such as search, filters, pagination, and selected resources, I'd consider URL state.
>
> Form values and validation would usually remain scoped to the form, potentially using a form library for complex forms.
>
> For genuinely shared client state, I'd consider something like Zustand or Redux Toolkit depending on the complexity and requirements. Redux is useful when explicit state transitions, conventions, middleware, and mature tooling are important.
>
> I'd use Context for cross-cutting values such as authentication, theme, locale, or permissions, rather than treating Context as a universal global store.
>
> Finally, for complex workflows with many valid states and transitions, I'd consider a state machine. For latency-sensitive mutations, I'd use optimistic updates with rollback and then reconcile with the server."

---

# 40. Self-Assessment Questions

<details>
<summary>1. What is the first question you should ask before choosing Redux or Zustand?</summary>

What kind of state is this, who owns it, who needs it, and how long should it live?

</details>

<details>
<summary>2. When should state remain local?</summary>

When only one component needs it and it does not need to survive outside that component.

</details>

<details>
<summary>3. What is lifting state?</summary>

Moving state to the nearest common ancestor so multiple components can share a single source of truth.

</details>

<details>
<summary>4. What is server state?</summary>

Data whose source of truth is a remote server, such as users, products, orders, and analytics.

</details>

<details>
<summary>5. Why use React Query for server state?</summary>

It provides caching, stale-data management, refetching, invalidation, mutations, retries, and synchronization patterns.

</details>

<details>
<summary>6. When is URL state useful?</summary>

For navigation-related or shareable state such as search, filters, pagination, sorting, date ranges, and selected resources.

</details>

<details>
<summary>7. Is Context a complete global state-management solution?</summary>

No. Context primarily provides a way to make values available to descendants without prop drilling. It can carry state but does not automatically provide the full capabilities of a dedicated state-management library.

</details>

<details>
<summary>8. When might Redux be preferable to Zustand?</summary>

When explicit state transitions, strong conventions, middleware, mature tooling, and predictable architecture are important.

</details>

<details>
<summary>9. When is a state machine useful?</summary>

When a UI has a complex workflow with explicit states and valid transitions and you want to prevent impossible state combinations.

</details>

<details>
<summary>10. What is an optimistic update?</summary>

Updating the UI/cache before the server confirms a mutation, then confirming or rolling back based on the server result.

</details>

<details>
<summary>11. Why invalidate a query after an optimistic mutation?</summary>

Because the server is the final source of truth and may transform or modify data beyond what the client predicted.

</details>

<details>
<summary>12. What is derived state?</summary>

A value that can be calculated from existing state rather than needing its own stored state.

</details>

---

# 41. Common Interview Questions

1. How do you decide where state should live?
2. Local state vs global state?
3. What is lifting state?
4. What is prop drilling?
5. When would you use Context?
6. Context vs Redux?
7. Redux vs Zustand?
8. What is server state?
9. Why use React Query instead of Redux for API data?
10. What is caching?
11. What is query invalidation?
12. What is a query key?
13. What is optimistic updating?
14. How would you rollback an optimistic update?
15. What belongs in URL state?
16. When should filters be stored in the URL?
17. How would you manage complex form state?
18. When would you use a state machine?
19. How do you prevent unnecessary re-renders caused by state?
20. How do you avoid duplicate sources of truth?
21. What is state normalization?
22. How would you handle real-time server updates?
23. How would you design autosave?
24. How would you handle concurrent edits?
25. How would you decide between Context and a global store?

---

# 42. Scenario Practice

For each scenario, decide where the state belongs and explain why.

### Scenario 1

A dropdown is open/closed.

```text
Answer: Local state
```

### Scenario 2

Search input and results need the same search query.

```text
Answer: Lift state or URL state depending on whether it should be navigation/shareable state.
```

### Scenario 3

The backend returns the current user's projects.

```text
Answer: Server state
```

### Scenario 4

The user filters a product list and wants to share the filtered page.

```text
Answer: URL state + server state
```

### Scenario 5

The application theme is consumed throughout the app.

```text
Answer: Context or global client state
```

### Scenario 6

A checkout has:

```text
cart → payment → processing → success/error
```

```text
Answer: State machine may be appropriate.
```

### Scenario 7

A Like button should feel instantaneous.

```text
Answer: Optimistic update
```

### Scenario 8

A complex form has 30 fields, nested validation, dirty tracking and dynamic fields.

```text
Answer: Dedicated form state/library
```

---

# 43. Final Cheat Sheet

```text
LOCAL UI STATE
→ useState
→ modal, dropdown, tab, temporary UI

LIFTED STATE
→ nearest common parent
→ shared by nearby components

CONTEXT
→ cross-cutting descendant access
→ auth, theme, locale, permissions

SERVER STATE
→ React Query / TanStack Query / SWR
→ API data, caching, invalidation, synchronization

URL STATE
→ search, filters, pagination, selected resource
→ shareable + bookmarkable + refresh-safe

FORM STATE
→ values, validation, dirty/touched, submission
→ local/form library

GLOBAL CLIENT STATE
→ Zustand / Redux Toolkit / Jotai
→ genuinely shared application state

REDUX
→ explicit transitions, conventions, middleware, tooling

ZUSTAND
→ simple shared client state, low boilerplate

JOTAI
→ atomic state model

RECOIL
→ atoms + selectors

STATE MACHINE
→ complex states + explicit transitions
→ XState

OPTIMISTIC UPDATE
→ update UI/cache immediately
→ API request
→ confirm or rollback
→ reconcile with server
```

---

# 44. The Golden Rule

> **Do not ask "Which state-management library should I use?" first.**
>
> Ask:
>
> **1. Who owns this state?**
>
> **2. Who needs it?**
>
> **3. How long should it live?**
>
> **4. Does it need to be shareable/bookmarkable?**
>
> **5. Is it server-owned?**
>
> **6. Does it need caching/synchronization?**
>
> **7. Is it a complex workflow?**
>
> **8. What is the simplest mechanism that solves the problem?**

If you can consistently reason through those questions, you are demonstrating **frontend architecture skill**, rather than just knowledge of React state APIs.
