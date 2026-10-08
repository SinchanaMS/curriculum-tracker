# Component Architecture

## Why It Matters

Component architecture is about designing UI components so they are:

- Reusable
- Composable
- Easy to understand
- Easy to test
- Easy to extend
- Resistant to becoming "god components"
- Flexible without accumulating dozens of props and conditionals

At an SDE2 / senior frontend level, the goal is **not** to memorize patterns.

The important question is:

> **How do I separate behavior, state, and presentation while keeping the component API easy to use?**

---

# 1. Component Architecture Mental Model

A useful way to think about a component is:

```text
                    COMPONENT
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
       Behavior       State       Presentation
          │             │             │
       Events        Selection      Markup
       Logic         Open/close     Styling
       Validation    Loading        Layout
       Keyboard      Data           Visuals
```

Good component architecture tries to keep these responsibilities clear.

For example, a reusable `Select` may own:

- Open/close behavior
- Selected value
- Keyboard navigation
- Focus management
- Option selection

But the consumer may decide:

- What the trigger looks like
- How an option is displayed
- Whether an option contains an avatar, icon, badge, or extra text
- Whether options are grouped

This distinction leads to several patterns covered in this document.

---

# 2. Presentational vs Container Components

## The Basic Idea

Historically, React applications often separated components into:

### Presentational components

Responsible mainly for:

- Rendering UI
- Receiving data through props
- Calling callbacks for events

```jsx
function UserCard({ user, onEdit }) {
  return (
    <div>
      <img src={user.avatar} />
      <h3>{user.name}</h3>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}
```

This component does not decide where the user data comes from.

---

### Container components

Responsible mainly for:

- Fetching data
- Managing state
- Handling business logic
- Passing data/actions to presentational components

```jsx
function UserCardContainer() {
  const { data: user } = useUser();

  const handleEdit = () => {
    // business logic
  };

  return (
    <UserCard
      user={user}
      onEdit={handleEdit}
    />
  );
}
```

The relationship is:

```text
Container
   │
   ├── owns/fetches data
   ├── owns business logic
   │
   ↓
Presentational Component
   │
   └── renders UI
```

## Why Was This Pattern Useful?

It created a clear separation:

> **Container = what the component does**

> **Presentational = how the component looks**

This made components easier to reuse and test.

---

## Is This Still a Strict Rule?

No.

Modern React commonly uses:

- Custom hooks
- Server-state libraries
- Composition
- Feature-based architecture

So instead of:

```text
Container Component
        ↓
Presentational Component
```

you may have:

```text
Component
   ↑
Custom Hook
   ↑
Data / Business Logic
```

Example:

```jsx
function UserList() {
  const { users, isLoading } = useUsers();

  if (isLoading) {
    return <Spinner />;
  }

  return users.map(user => (
    <UserCard key={user.id} user={user} />
  ));
}
```

The data logic is extracted into `useUsers()` rather than a separate container component.

### Interview takeaway

> "The container/presentational pattern is still useful as a separation-of-concerns principle, but I wouldn't force every component into a container/presentational pair. Modern React often achieves the same separation with custom hooks and composition."

---

# 3. Compound Components

## The Problem

Imagine a reusable `Select`.

A simple version might be:

```jsx
<Select
  items={items}
  variant="avatar"
  grouped
  showStatus
/>
```

As requirements grow, the component can accumulate:

```text
variant
grouped
showIcon
showAvatar
showStatus
customTrigger
customOption
...
```

Internally, it may become:

```jsx
if (variant === "avatar") {
  // ...
}

if (grouped) {
  // ...
}

if (showStatus) {
  // ...
}

if (customTrigger) {
  // ...
}
```

The component now has to understand every possible presentation.

This is where compound components can help.

---

## What Are Compound Components?

Compound components are a group of related components that work together as one logical component.

Example:

```jsx
<Select>
  <Select.Trigger>
    Choose user
  </Select.Trigger>

  <Select.Menu>
    <Select.Option value="1">
      Sinchana
    </Select.Option>

    <Select.Option value="2">
      Rahul
    </Select.Option>
  </Select.Menu>
</Select>
```

The components form one system:

```text
Select
 ├── Trigger
 ├── Menu
 ├── Option
 └── Group
```

The parent `Select` owns shared behavior/state.

The child components consume that shared behavior.

---

# 4. What Is the Shared State?

This is an important question.

For a `Select`, the parent might own:

```jsx
const [open, setOpen] = useState(false);
const [value, setValue] = useState(null);
```

It may also own:

- Active option
- Focus state
- Keyboard navigation
- Selection behavior

Then:

```text
Select
  │
  ├── open
  ├── selected value
  ├── keyboard state
  └── focus state
       │
       ├── Trigger reads/changes it
       ├── Menu reads it
       └── Option reads/changes it
```

---

# 5. Context Is Often Used to Implement Compound Components

Compound components do **not** require Context.

But Context is a common implementation technique because the children need access to shared state.

```jsx
const SelectContext = createContext(null);

function Select({ children }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        setValue
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}
```

`Trigger` can consume it:

```jsx
function Trigger({ children }) {
  const { open, setOpen } = useContext(SelectContext);

  return (
    <button onClick={() => setOpen(!open)}>
      {children}
    </button>
  );
}
```

`Menu` can consume it:

```jsx
function Menu({ children }) {
  const { open } = useContext(SelectContext);

  if (!open) {
    return null;
  }

  return <div>{children}</div>;
}
```

`Option` can consume it:

```jsx
function Option({ value, children }) {
  const {
    setValue,
    setOpen
  } = useContext(SelectContext);

  const handleClick = () => {
    setValue(value);
    setOpen(false);
  };

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
}
```

### Important distinction

```text
Compound Components = API / architecture pattern

Context = one possible implementation mechanism
```

Do not say:

> "Compound components are Context."

Instead:

> "Compound components expose a group of related components that share behavior. Context is commonly used to wire their shared state together without prop drilling."

---

# 6. Compound Components Still Work With Configuration/Data

Compound components do **not** mean manually writing every item.

You can still map an array:

```jsx
const users = [
  {
    id: 1,
    name: "Sinchana",
    avatar: "/sinchana.png"
  },
  {
    id: 2,
    name: "Rahul",
    avatar: "/rahul.png"
  }
];

<Select>
  <Select.Trigger>
    Select user
  </Select.Trigger>

  <Select.Menu>
    {users.map(user => (
      <Select.Option
        key={user.id}
        value={user.id}
      >
        <Avatar src={user.avatar} />
        {user.name}
      </Select.Option>
    ))}
  </Select.Menu>
</Select>
```

The data still comes from configuration.

The difference is **who decides how that data is composed into UI**.

---

# 7. Config-Driven vs Compound Components

## Config-Driven

```jsx
<Select
  variant="avatar"
  items={users}
/>
```

The component decides how to interpret the configuration.

```text
Consumer
   │
   │ data/config
   ↓
Select
   │
   └── decides rendering
```

This is excellent when the variations are:

- Small
- Predictable
- Finite
- Well-defined

---

## Compound

```jsx
<Select>
  <Select.Menu>
    {users.map(user => (
      <Select.Option value={user.id}>
        <Avatar src={user.avatar} />
        {user.name}
        <Badge>{user.status}</Badge>
      </Select.Option>
    ))}
  </Select.Menu>
</Select>
```

The consumer decides the structure.

```text
Consumer
   │
   │ composition
   ↓
Select
   │
   └── provides behavior
```

This is useful when presentation needs to be flexible.

---

# 8. When Should You Use Compound Components?

Compound components are especially useful when:

1. Components share behavior/state.
2. Consumers need control over composition.
3. There are many presentation variations.
4. You want to avoid a large number of variant props.
5. The component is a reusable design-system primitive.

### Good example

A reusable `Select` supporting:

- Plain text options
- Avatar + text
- Icon + text
- Status badges
- Groups
- Custom option layouts
- Custom trigger content

The behavior stays the same while presentation varies.

### Poor example

A simple dropdown:

```jsx
<Dropdown items={items} />
```

If there are only two fixed layouts, introducing:

```jsx
<Dropdown.Trigger>
<Dropdown.Menu>
<Dropdown.Item>
```

may create unnecessary complexity.

### Architectural principle

> **Do not use a pattern because the pattern exists. Use it when the requirements justify it.**

---

# 9. Specialized Components Built on Compound Primitives

A powerful architecture is:

```text
Generic Primitive
        │
        ├── AvatarSelect
        ├── GroupedSelect
        └── ProductSelect
```

The base `Select` owns generic behavior.

A specialized component provides a recurring composition.

Example:

```jsx
function AvatarSelect({
  users,
  value,
  onChange
}) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <Select.Trigger>
        Select user
      </Select.Trigger>

      <Select.Menu>
        {users.map(user => (
          <Select.Option
            key={user.id}
            value={user.id}
          >
            <Avatar src={user.avatar} />
            {user.name}
          </Select.Option>
        ))}
      </Select.Menu>
    </Select>
  );
}
```

Consumer:

```jsx
<AvatarSelect
  users={users}
  value={selectedUser}
  onChange={setSelectedUser}
/>
```

### Why is this useful?

You get multiple levels:

```text
Select
  ↓
generic behavior

AvatarSelect
  ↓
reusable product-specific composition

Application
  ↓
simple API
```

You avoid duplicating the complex Select behavior.

### Don't overdo it

Don't create a new component for every tiny combination:

```text
AvatarSelect
AvatarStatusSelect
AvatarIconSelect
AvatarStatusIconSelect
...
```

Create specialized components when the pattern is:

- Repeated
- Meaningful
- Stable
- Used across the product

---

# 10. Render Props

## The Core Idea

A render prop is a prop whose value is a function that determines what gets rendered.

The component owns behavior/data.

The consumer owns the UI.

Example:

```jsx
function MouseTracker({ render }) {
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });

  return render(position);
}
```

Usage:

```jsx
<MouseTracker
  render={({ x, y }) => (
    <p>
      Mouse: {x}, {y}
    </p>
  )}
/>
```

The flow is:

```text
MouseTracker
    │
    ├── owns behavior
    │
    └── gives data
           ↓
       render(...)
           ↓
       Consumer UI
```

---

## Why Use Render Props?

The useful idea is:

> **Share behavior without forcing consumers to share the same UI.**

For example, a component could handle:

- Fetching
- Mouse tracking
- Permissions
- Drag/drop state

while the consumer decides how to render the result.

---

## Render Props vs Compound Components

### Render props

```jsx
<DataFetcher
  render={data => (
    <UserList data={data} />
  )}
/>
```

Behavior/data is exposed through a function.

### Compound

```jsx
<Select>
  <Select.Trigger />
  <Select.Menu />
  <Select.Option />
</Select>
```

Behavior/state is exposed through a component composition API.

### Modern React

Custom hooks often replace render props for logic reuse:

```jsx
const {
  data,
  isLoading
} = useUsers();
```

Then the component owns rendering normally.

### Interview answer

> "Render props are useful for sharing behavior while allowing consumers to control rendering. In modern React, I'd often prefer custom hooks when I only need to share logic, because hooks are generally simpler and avoid deeply nested render-prop APIs."

---

# 11. Higher-Order Components (HOC)

## Definition

A Higher-Order Component is a function that takes a component and returns an enhanced component.

```jsx
const EnhancedComponent =
  withSomething(Component);
```

Example:

```jsx
function withLoading(Component) {
  return function WithLoading({
    isLoading,
    ...props
  }) {
    if (isLoading) {
      return <Spinner />;
    }

    return <Component {...props} />;
  };
}
```

Usage:

```jsx
const UserListWithLoading =
  withLoading(UserList);
```

---

## HOC Mental Model

```text
Original Component
        │
        ↓
     HOC
        │
        ↓
Enhanced Component
```

A HOC adds behavior without modifying the original component.

---

# 12. Problems With HOCs

HOCs can become difficult when many are composed:

```jsx
withAuth(
  withLogging(
    withLoading(
      withPermissions(
        UserList
      )
    )
  )
);
```

Potential problems:

- Wrapper nesting
- Harder debugging
- Props being injected from unknown places
- Naming complexity
- Possible prop collisions
- Harder component trees

---

# 13. Custom Hooks vs HOCs

In modern React, custom hooks are often preferable for **logic reuse**.

### HOC

```jsx
const EnhancedUserList =
  withPermissions(UserList);
```

### Hook

```jsx
function UserList() {
  const {
    canEdit,
    canDelete
  } = usePermissions();

  return (
    ...
  );
}
```

### Important distinction

Custom hooks reuse **logic**.

HOCs wrap **components**.

Use a custom hook when:

> "I need to reuse stateful/business logic."

Use an HOC when:

> "I specifically need to enhance/wrap components."

### Interview answer

> "For new React code, I'd generally prefer custom hooks for reusable behavior because they avoid wrapper components and make dependencies explicit. HOCs are still useful in some library or legacy patterns where component enhancement is the actual requirement."

---

# 14. Controlled vs Uncontrolled Components

This is one of the most important concepts for reusable components.

The question is:

> **Who owns the state?**

---

## Controlled

The parent owns the value.

```jsx
const [value, setValue] = useState("");

<Input
  value={value}
  onChange={e =>
    setValue(e.target.value)
  }
/>
```

Flow:

```text
Parent
  │
  │ value
  ↓
Input
  │
  │ onChange
  ↓
Parent
```

The parent is the source of truth.

---

## Uncontrolled

The component/DOM owns the current value.

```jsx
<Input defaultValue="Hello" />
```

For a native input:

```jsx
<input
  defaultValue="Hello"
  ref={inputRef}
/>
```

The DOM maintains the current value.

---

## When Is Controlled Useful?

Use controlled state when:

- Parent needs the current value
- Other UI depends on it
- Validation is external
- State needs to be synchronized
- You need programmatic control
- You need predictable state transitions

Example:

```jsx
<SearchInput
  value={search}
  onChange={setSearch}
/>
```

---

## When Is Uncontrolled Useful?

Use uncontrolled state when:

- The parent does not need every change
- You want a simpler API
- The state is local to the component
- You can read the value only when needed

Example:

```jsx
<Form>
  <input name="email" />
</Form>
```

---

# 15. Supporting Both Controlled and Uncontrolled

Good reusable components often support both.

```jsx
<Select
  value={value}
  onValueChange={setValue}
/>
```

or:

```jsx
<Select
  defaultValue="frontend"
/>
```

Conceptually:

```text
Controlled:
value !== undefined
        ↓
parent is source of truth

Uncontrolled:
value === undefined
        ↓
component owns internal state
```

A simplified implementation:

```jsx
function Select({
  value,
  defaultValue,
  onValueChange
}) {
  const [
    internalValue,
    setInternalValue
  ] = useState(defaultValue);

  const isControlled =
    value !== undefined;

  const selectedValue =
    isControlled
      ? value
      : internalValue;

  const setSelectedValue = nextValue => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  // ...
}
```

### Important

Don't switch a component from controlled to uncontrolled during its lifetime.

Avoid:

```jsx
<Select value={condition ? value : undefined} />
```

unless the component is deliberately designed to support that transition.

---

# 16. Composition Over Inheritance

React generally favors composition over class inheritance for UI reuse.

Instead of:

```text
BaseButton
   ↓
PrimaryButton
   ↓
DangerButton
```

you can compose behavior and presentation:

```jsx
<Button variant="primary">
  Save
</Button>

<Button variant="danger">
  Delete
</Button>
```

Or compose components:

```jsx
<Card>
  <Card.Header>
    User
  </Card.Header>

  <Card.Body>
    ...
  </Card.Body>
</Card>
```

---

## Why Composition?

Composition lets you combine smaller pieces instead of creating a deep inheritance hierarchy.

```text
Small reusable pieces
        │
        ├── combine
        ↓
Larger component
```

### Interview principle

> "I prefer composition because it keeps relationships explicit and avoids rigid inheritance hierarchies. Components can be combined in different ways without creating a new subclass for every variation."

---

# 17. Component API Design

A component API is the way consumers interact with your component.

For example:

```jsx
<Select
  value={value}
  onValueChange={setValue}
  disabled
/>
```

or:

```jsx
<Select>
  <Select.Trigger />
  <Select.Menu>
    ...
  </Select.Menu>
</Select>
```

A good API should be:

- Predictable
- Consistent
- Easy to discover
- Flexible where needed
- Difficult to misuse
- Small enough to understand

---

# 18. Avoid Prop Explosion

A warning sign:

```jsx
<Component
  size="large"
  variant="primary"
  showIcon
  iconPosition="left"
  loading
  disabled
  bordered
  rounded
  compact
  fullWidth
  ...
/>
```

Not every prop is bad.

The problem is when many independent props create a combinatorial number of states.

For example:

```text
3 sizes
× 4 variants
× 2 icon states
× 2 loading states
× 2 border states
= 96 possible combinations
```

You may not actually want to support/test all of them.

---

# 19. Props Interface Design

## Prefer Meaningful Props

Good:

```jsx
<Button
  variant="danger"
  size="small"
/>
```

Less clear:

```jsx
<Button
  red
  tiny
/>
```

---

## Prefer Consistent Naming

For callbacks:

```jsx
onChange
onOpenChange
onValueChange
onSubmit
onSelect
```

For state:

```jsx
value
open
selected
disabled
```

For defaults:

```jsx
defaultValue
defaultOpen
```

Consistency matters especially in a design system.

---

# 20. Boolean Props

Boolean props are useful for simple toggles:

```jsx
<Button disabled />
```

But too many boolean props can create unclear combinations.

Avoid APIs like:

```jsx
<Button
  primary
  secondary
  danger
/>
```

What happens if all three are true?

Prefer:

```jsx
<Button variant="danger" />
```

A discriminated/enum-like API communicates that the variants are mutually exclusive.

---

# 21. Prefer Composition When UI Structure Varies

Suppose a component can have:

```text
icon + title
avatar + title + subtitle
avatar + title + badge
icon + title + status + action
```

You could create:

```jsx
<Component
  showAvatar
  showSubtitle
  showBadge
  showAction
/>
```

But this creates many combinations.

Composition can be cleaner:

```jsx
<ListItem>
  <Avatar />
  <div>
    <Title />
    <Subtitle />
  </div>
  <Badge />
  <Action />
</ListItem>
```

The component can provide layout/behavior while the consumer supplies content.

---

# 22. Default Props Patterns

For function components, JavaScript/TypeScript default parameters are a simple pattern:

```jsx
function Button({
  size = "medium",
  variant = "primary"
}) {
  // ...
}
```

Or:

```jsx
function Input({
  disabled = false
}) {
  // ...
}
```

---

## Defaults Should Be Sensible

A component should work with the smallest reasonable API:

```jsx
<Button>
  Save
</Button>
```

rather than requiring:

```jsx
<Button
  size="medium"
  variant="primary"
  disabled={false}
>
  Save
</Button>
```

Good defaults reduce cognitive load.

---

# 23. Don't Hide Important Behavior Behind Too Many Defaults

Defaults are useful, but consumers should be able to clearly override meaningful behavior.

For example:

```jsx
<Select
  defaultValue="frontend"
/>
```

is clear.

A component silently making network requests, choosing a data source, or changing business behavior through hidden defaults is usually harder to reason about.

---

# 24. Component API: Data vs Composition

A useful architectural decision is:

> **Should this variation be represented as data/configuration, or as composition?**

### Use configuration when:

The variation is:

- Simple
- Finite
- Predictable
- Data-driven

Example:

```jsx
<Button
  variant="danger"
  size="small"
/>
```

### Use composition when:

The variation is:

- Structural
- Rich
- Open-ended
- Likely to evolve

Example:

```jsx
<Select>
  <Select.Option>
    <Avatar />
    <div>
      <strong>Sinchana</strong>
      <span>Frontend Engineer</span>
    </div>
  </Select.Option>
</Select>
```

This distinction is extremely useful in architecture interviews.

---

# 25. Controlled + Compound Components

These patterns can be combined.

For example:

```jsx
<Select
  value={selectedUser}
  onValueChange={setSelectedUser}
>
  <Select.Trigger>
    Select user
  </Select.Trigger>

  <Select.Menu>
    {users.map(user => (
      <Select.Option
        key={user.id}
        value={user.id}
      >
        <Avatar src={user.avatar} />
        {user.name}
      </Select.Option>
    ))}
  </Select.Menu>
</Select>
```

Here:

```text
Compound API
    +
Controlled value
    +
Data-driven mapping
```

There is no rule that says these patterns must be used independently.

---

# 26. A Practical Component Architecture

For a reusable design-system Select:

```text
Select/
│
├── Select.tsx
├── SelectTrigger.tsx
├── SelectMenu.tsx
├── SelectOption.tsx
├── SelectGroup.tsx
├── select-context.ts
└── index.ts
```

Conceptually:

```text
Select
 │
 ├── state
 │    ├── open
 │    ├── value
 │    └── active option
 │
 ├── behavior
 │    ├── selection
 │    ├── keyboard navigation
 │    ├── focus
 │    └── accessibility
 │
 └── composition API
      ├── Trigger
      ├── Menu
      ├── Option
      └── Group
```

Then:

```text
Application
    │
    ├── <Select>...</Select>
    │
    ├── <AvatarSelect />
    │
    └── <GroupedSelect />
```

This creates a useful layering:

```text
Primitive
   ↓
Reusable composed component
   ↓
Feature-specific component
   ↓
Page
```

---

# 27. Avoid the "God Component"

A component becomes a problem when it knows too much.

Warning signs:

```text
500+ lines
20+ props
many unrelated states
many API calls
many variants
many conditional branches
business logic + UI + data fetching + formatting
```

Instead, separate responsibilities.

Example:

```text
CustomerDashboard
│
├── useCustomers()
├── CustomerFilters
├── CustomerTable
├── CustomerDetails
└── CustomerActions
```

The goal isn't:

> "Every component must be tiny."

The goal is:

> **Each component should have a coherent responsibility.**

---

# 28. How to Decide Which Pattern to Use

Use this decision process.

## Question 1: Am I sharing logic?

Consider:

```text
Custom Hook
```

Example:

```jsx
const {
  data,
  isLoading
} = useCustomers();
```

---

## Question 2: Am I enhancing an existing component?

Consider:

```text
HOC
```

Especially in existing/legacy/library patterns.

---

## Question 3: Do consumers need different UI while behavior stays the same?

Consider:

```text
Compound Components
```

or composition.

---

## Question 4: Is the variation simple and finite?

Consider:

```text
Props / configuration
```

Example:

```jsx
<Button variant="danger" />
```

---

## Question 5: Does the parent need to own the state?

Use:

```text
Controlled component
```

---

## Question 6: Is the state local and doesn't need external synchronization?

Consider:

```text
Uncontrolled component
```

---

# 29. Pattern Comparison

| Pattern | Main Purpose | Consumer Controls | Modern Use |
|---|---|---|---|
| Presentational/Container | Separate UI from logic/data | Depends | Useful principle |
| Compound Components | Flexible composition + shared behavior | Structure | Very useful |
| Render Props | Share behavior + custom rendering | Rendering function | Less common |
| HOC | Enhance components | Wrapped component | Mostly legacy/specific cases |
| Custom Hook | Reuse stateful logic | Logic consumption | Very common |
| Controlled | Parent owns state | State | Very common |
| Uncontrolled | Component/DOM owns state | Less external state | Useful |
| Composition | Combine reusable pieces | Structure | Fundamental |

---

# 30. Common Mistakes

## Mistake 1: Using patterns because they sound advanced

Bad reasoning:

> "I'll use compound components because it's a design pattern."

Better:

> "The component has stable interaction behavior but highly variable presentation, so composition gives consumers flexibility without adding many variant props."

---

## Mistake 2: Assuming compound components eliminate configuration

They don't.

You can still:

```jsx
items.map(...)
```

inside:

```jsx
<Select.Option />
```

Compound components control **composition**, not data sourcing.

---

## Mistake 3: Thinking Context and compound components are the same

They aren't.

```text
Compound components
       ↓
architecture/API pattern

Context
       ↓
state-sharing mechanism
```

---

## Mistake 4: Creating too many specialized components

Avoid:

```text
AvatarSelect
AvatarStatusSelect
AvatarStatusIconSelect
...
```

unless these are real recurring product patterns.

---

## Mistake 5: Overusing controlled components

Controlled state is powerful, but don't lift every piece of local UI state into the parent.

Keep state close to where it is needed.

---

# 31. Interview Scenarios

## Scenario 1: Design a reusable Select

### Strong answer

> "I'd start with the interaction model rather than the visual variants. The Select should own common behavior such as open/close, selection, keyboard navigation, focus management, and accessibility. Since different consumers may need plain text, avatars, icons, groups, or custom option layouts, I'd expose a compound API such as Select.Trigger, Select.Menu, Select.Option, and Select.Group. Context is a reasonable way to share the internal state between those pieces. For common product-specific compositions, I'd build higher-level components such as AvatarSelect on top of the primitive rather than putting every variant into the base Select."

---

## Scenario 2: The component has 15 props and many conditionals

Ask:

1. Are these truly independent variations?
2. Are some props mutually exclusive?
3. Is presentation changing while behavior stays the same?
4. Can composition remove conditional branches?
5. Should some logic become a custom hook?
6. Should a recurring pattern become a specialized component?

---

## Scenario 3: Parent needs complete control over state

Use a controlled API:

```jsx
<Component
  value={value}
  onChange={setValue}
/>
```

Explain:

> "The parent becomes the source of truth."

---

## Scenario 4: Component only needs local state

Use internal/uncontrolled state when appropriate.

Explain:

> "There's no need to lift state if no external consumer needs to coordinate it."

---

# 32. Interview Questions

## Basic

1. What is component composition?
2. What are presentational and container components?
3. What are compound components?
4. What problem do compound components solve?
5. What is a render prop?
6. What is a higher-order component?
7. What is a custom hook?
8. What is a controlled component?
9. What is an uncontrolled component?
10. What is the difference between composition and inheritance?

---

## Intermediate

11. When would you choose compound components over prop-based configuration?
12. How would you design a reusable Select?
13. How does Context commonly support compound components?
14. What are the problems with prop explosion?
15. How do you decide whether a variation should be a prop or a composed child?
16. When would you use a custom hook instead of an HOC?
17. Can compound components still be data-driven?
18. How would you support both controlled and uncontrolled usage?
19. How would you create a specialized component on top of a reusable primitive?
20. How do you prevent a reusable component from becoming a god component?

---

# 33. Questions You Should Be Able to Answer in an Interview

### "Why not just add a `variant` prop?"

Answer:

> "If the variations are small and finite, I would. But if the component has many presentation combinations, variant props and conditionals can grow quickly. When behavior is stable but the structure needs to be flexible, composition or compound components gives the consumer control over the structure without making the base component aware of every combination."

---

### "Does compound component mean every child has to be manually written?"

Answer:

> "No. The children can still be generated from configuration or API data using map. The difference is that the consumer controls how each piece is composed."

---

### "Why would you create an AvatarSelect instead of always using Select?"

Answer:

> "If the avatar-based composition is a recurring product pattern, I'd create AvatarSelect as a higher-level abstraction over the generic Select. That keeps application code simple while reusing the primitive's behavior. I wouldn't create specialized components for one-off combinations."

---

### "Why not use a render prop?"

Answer:

> "Render props are useful when I want to share behavior while letting the consumer control the rendered output. If I'm building a structured component such as Select with several related pieces, compound components provide a more natural API. If I only need to share logic, I'd generally prefer a custom hook."

---

# 34. Senior-Level Mental Model

Don't memorize:

```text
Compound = good
HOC = bad
Props = bad
Hooks = good
```

Instead, think in terms of **responsibility and coupling**.

Ask:

```text
Who owns the state?
        ↓
Who owns the behavior?
        ↓
Who owns the presentation?
        ↓
How much flexibility does the consumer need?
        ↓
How many variations exist?
        ↓
Are those variations finite or open-ended?
        ↓
Will this API become difficult to maintain?
```

Then choose the simplest architecture that satisfies those requirements.

---

# 35. Quick Decision Cheat Sheet

```text
Need to reuse stateful logic?
        ↓
     Custom Hook


Need to enhance/wrap components?
        ↓
       HOC
  (especially existing/legacy patterns)


Same behavior, flexible UI structure?
        ↓
Compound Components / Composition


Small, finite visual variation?
        ↓
Props / Configuration


Parent must own the state?
        ↓
Controlled


State can remain internal?
        ↓
Uncontrolled


Recurring specialized composition?
        ↓
Build a higher-level component
on top of the primitive
```

---

# 36. Final Interview Summary

A strong component architecture should:

- Keep responsibilities clear.
- Keep state close to where it belongs.
- Separate reusable behavior from presentation when useful.
- Prefer composition when UI structure needs flexibility.
- Use configuration for simple, finite variations.
- Avoid excessive variant props and boolean combinations.
- Use compound components when several pieces form one logical system.
- Use Context as an implementation mechanism when compound children need shared state.
- Prefer custom hooks for reusable stateful logic.
- Use controlled components when the parent needs to own the source of truth.
- Use uncontrolled components when state can remain local.
- Build specialized components on top of generic primitives when recurring patterns justify them.
- Avoid abstractions that add more complexity than they remove.

## The Core Question

> **"Where should this responsibility live, and how much control should the consumer have?"**

That question is more important than any individual component pattern.
