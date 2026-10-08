# Design Systems

## Why It Matters

A design system is not just a collection of reusable React components.

It is a combination of:

- Design decisions
- Design tokens
- Reusable components
- Component APIs
- Theming
- Documentation
- Accessibility
- Testing
- Usage guidelines

At an SDE2 / senior frontend level, the important question is not:

> "Do we use Storybook or Tailwind?"

The important questions are:

> **How do I create a consistent UI language that scales across teams and applications?**

> **Where should design decisions live, and how do I prevent every feature team from reinventing them?**

A useful mental model is:

```text
                    DESIGN SYSTEM
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
     Foundations      Components       Guidelines
          │               │
          ↓               ↓
   Design Tokens      Component APIs
          │               │
          └───────┬───────┘
                  ↓
              Theming
                  │
                  ↓
          Documentation
                  │
                  ↓
               Testing
```

The goal is to make UI:

- Consistent
- Reusable
- Accessible
- Themeable
- Easy to discover
- Easy to test
- Easy to evolve
- Difficult to misuse

---

# 1. Design Tokens

## What Are Design Tokens?

Design tokens are named representations of design decisions.

Instead of scattering values throughout an application:

```css
.button {
  background: #2563eb;
  padding: 8px 16px;
  border-radius: 6px;
}
```

we can define:

```css
:root {
  --color-primary: #2563eb;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --radius-md: 6px;
}
```

and consume them:

```css
.button {
  background: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}
```

The values now have meaning.

---

## Why Do We Need Tokens?

Imagine an application has:

```text
#2563EB
#2563EB
#2563EB
#2563EB
```

across hundreds of components.

If the brand color changes, you may have to find and modify many unrelated files.

With tokens:

```text
--color-primary
       ↓
   200 components
```

you can change the underlying design decision centrally.

The architecture becomes:

```text
Design decision
      ↓
Design token
      ↓
Reusable component
      ↓
Application
```

rather than:

```text
Developer A → arbitrary value
Developer B → arbitrary value
Developer C → arbitrary value
```

---

## Common Token Categories

### Colors

```css
--blue-500: #3b82f6;
--blue-600: #2563eb;

--gray-100: #f3f4f6;
--gray-900: #111827;
```

### Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
```

### Typography

```css
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 20px;

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-bold: 700;
```

### Other tokens

```text
Border radius
Shadows
Line heights
Z-index
Breakpoints
Animation durations
Motion/easing
```

---

## Primitive vs Semantic Tokens

This distinction is important.

### Primitive Token

```css
--blue-500: #3b82f6;
```

It represents a raw design value.

### Semantic Token

```css
--color-primary: var(--blue-500);
```

It represents the purpose of the value.

A component should generally consume the semantic token:

```css
.button {
  background: var(--color-primary);
}
```

rather than:

```css
.button {
  background: var(--blue-500);
}
```

Why?

Because the meaning of `primary` can change by theme.

```text
Primitive tokens
      ↓
Semantic tokens
      ↓
Components
```

---

## Interview Takeaway

If asked:

> "Why use semantic tokens?"

Answer:

> "Semantic tokens separate design decisions from component implementation. Components consume tokens such as `color-background` or `color-primary` instead of knowing the underlying color value. This makes global changes and theming much easier."

---

# 2. Typography Scale

Typography should also be treated as a system rather than letting every developer choose arbitrary values.

Without a typography scale:

```text
17px
19px
21px
23px
```

Different developers may make visually similar but inconsistent choices.

A typography scale might define:

```text
xs  → 12px
sm  → 14px
md  → 16px
lg  → 18px
xl  → 24px
2xl → 30px
3xl → 36px
```

These can be represented as tokens:

```css
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;
```

---

## Typography Is More Than Font Size

A typography system can define:

```text
Font family
Font size
Font weight
Line height
Letter spacing
```

For example:

```css
--heading-lg-size: 32px;
--heading-lg-line-height: 40px;
--heading-lg-weight: 700;
```

Then:

```css
.heading-lg {
  font-size: var(--heading-lg-size);
  line-height: var(--heading-lg-line-height);
  font-weight: var(--heading-lg-weight);
}
```

---

## Why Does This Matter Architecturally?

You want:

```text
Design rules
      ↓
Tokens
      ↓
Components
      ↓
Applications
```

The design system owns the visual language.

Developers should not need to remember:

> "Our large heading is 31px and has 39px line-height."

They should consume the established system.

---

# 3. Component Variants

Once you have design tokens, you need a way to represent common component variations.

For example, a Button may have:

```text
Primary
Secondary
Danger
Ghost
```

and:

```text
Small
Medium
Large
```

Instead of creating:

```text
PrimaryButton
SecondaryButton
DangerButton
SmallButton
LargeButton
```

you can have one component:

```tsx
<Button variant="primary" size="md">
  Save
</Button>
```

---

## Why Variants?

Variants allow a component to represent a controlled set of design decisions.

```tsx
type ButtonProps = {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
};
```

Usage:

```tsx
<Button variant="danger" size="sm">
  Delete
</Button>
```

The component owns the styling rules.

---

## Don't Turn Every Style Into a Variant

Avoid APIs such as:

```tsx
<Button
  color="blue"
  padding="12px"
  borderRadius="8px"
  fontSize="14px"
/>
```

This exposes implementation details and makes the design system difficult to control.

Prefer:

```tsx
<Button variant="primary" size="md" />
```

The design system decides what `primary` and `md` mean.

---

## When Should Something Become a Variant?

Ask:

> Is this a legitimate, recurring design-system state?

Good:

```tsx
<Button variant="danger" />
```

Potentially bad:

```tsx
<Button variant="slightly-darker-blue-for-this-page" />
```

A one-off product requirement should not automatically become a design-system variant.

---

# 4. Component API Consistency

A design system is much more useful when components follow consistent API conventions.

Consider:

```tsx
<Button disabled />
<Input disabled />
<Select disabled />
```

This is predictable.

You do not want:

```tsx
<Button isDisabled />
<Input disabled />
<Select inactive />
```

for the same concept.

---

## Consistent Naming

For values:

```tsx
value
open
selected
disabled
```

For defaults:

```tsx
defaultValue
defaultOpen
```

For callbacks:

```tsx
onChange
onOpenChange
onValueChange
onSubmit
onSelect
```

The exact conventions can vary, but the system should be internally consistent.

---

## Composition Is Also Part of API Design

Suppose you have a Modal.

A configuration-heavy API might look like:

```tsx
<Modal
  title="Delete user"
  description="Are you sure?"
  confirmText="Delete"
  cancelText="Cancel"
/>
```

This can work for simple, predictable layouts.

But if the structure needs to be flexible, composition may be better:

```tsx
<Modal>
  <Modal.Header>
    Delete user
  </Modal.Header>

  <Modal.Body>
    Are you sure?
  </Modal.Body>

  <Modal.Footer>
    <Button>Cancel</Button>
    <Button variant="danger">Delete</Button>
  </Modal.Footer>
</Modal>
```

A useful rule:

```text
Simple, finite variation
        ↓
Props / configuration

Structural, open-ended variation
        ↓
Composition
```

---

# 5. Theming Architecture

Theming means allowing the same component system to operate under different visual configurations.

Examples:

```text
Light theme
Dark theme
High contrast theme
Brand A
Brand B
```

The key architectural principle is:

> **Components should depend on semantic tokens, not directly on theme-specific values.**

For example:

```css
.button {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
```

The themes provide those values.

### Light

```css
[data-theme="light"] {
  --color-primary: #2563eb;
  --color-on-primary: white;
}
```

### Dark

```css
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-on-primary: #111827;
}
```

The Button itself does not need separate light/dark logic.

---

## The Architecture

```text
Theme
  ↓
Semantic tokens
  ↓
Components
  ↓
Application
```

This is preferable to:

```text
Theme
  ↓
Every component contains special dark-mode logic
```

The second approach causes theme logic to leak throughout the application.

---

## Multi-Brand Theming

The same architecture can support multiple brands.

```text
                  Semantic tokens
                        │
             ┌──────────┼──────────┐
             ↓          ↓          ↓
          Brand A    Brand B    Dark Theme
```

For example:

```css
[data-brand="acme"] {
  --color-primary: #2563eb;
}

[data-brand="another"] {
  --color-primary: #7c3aed;
}
```

The component remains:

```css
background: var(--color-primary);
```

---

# 6. Dark Mode Implementation

Dark mode is a practical application of theming.

A simple architecture uses CSS variables:

```css
:root {
  --background: white;
  --foreground: black;
}

[data-theme="dark"] {
  --background: #111827;
  --foreground: white;
}
```

Then:

```css
body {
  background: var(--background);
  color: var(--foreground);
}
```

Changing:

```html
<html data-theme="dark">
```

changes the values consumed throughout the application.

---

## Why CSS Variables Work Well Here

You do not need:

```tsx
<Button darkMode />
<Card darkMode />
<Input darkMode />
```

Instead:

```text
Root theme
    ↓
CSS variables
    ↓
All components
```

This keeps theme concerns centralized.

---

## React Theme State

An application can maintain a theme preference:

```tsx
const [theme, setTheme] = useState("light");
```

and apply it to the root:

```tsx
document.documentElement.dataset.theme = theme;
```

A mature application might support:

```text
System
Light
Dark
```

where:

```text
System → follows OS preference
Light  → explicitly light
Dark   → explicitly dark
```

---

## System Preference

CSS can respect the user's OS preference:

```css
@media (prefers-color-scheme: dark) {
  /* dark theme values */
}
```

If the product also supports an explicit theme selector, the application needs to define which preference takes precedence.

---

## Interview Takeaway

If asked:

> "How would you implement dark mode?"

Answer:

> "I would avoid putting dark-mode logic into individual components. Components would consume semantic CSS variables such as `--color-background` and `--color-text`, while the light and dark themes provide different values for those variables. The active theme can be controlled through a root attribute such as `data-theme`."

---

# 7. CSS-in-JS vs CSS Modules

This is a styling architecture decision.

## CSS Modules

You write:

```css
.button {
  padding: 8px 16px;
}
```

and:

```tsx
import styles from "./Button.module.css";

<button className={styles.button}>
  Save
</button>
```

The class is locally scoped.

Conceptually:

```text
Button.module.css
        ↓
Scoped CSS
        ↓
Button
```

### Advantages

- Simple
- Familiar CSS
- Local scoping
- Predictable output
- Good separation between styling and component logic
- No need to calculate styles during component rendering

---

# CSS-in-JS

CSS-in-JS represents styles through JavaScript/TypeScript.

Conceptually:

```tsx
const button = css({
  padding: "8px 16px",
});
```

Some libraries also support APIs such as:

```tsx
<Button
  css={{
    padding: 8,
  }}
/>
```

Historically popular solutions include styled-components and Emotion.

---

## Why Use CSS-in-JS?

It can be useful when styling is heavily dependent on:

- Component state
- Theme values
- Dynamic properties
- JavaScript logic

For example:

```tsx
const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
`;
```

---

## Trade-offs

CSS Modules:

```text
CSS
 ↓
Build
 ↓
Generated/scoped class names
```

Some CSS-in-JS approaches may involve:

```text
Component render
 ↓
Style computation
 ↓
CSS generation/injection
```

Depending on the library and implementation, this can affect:

- Runtime performance
- SSR behavior
- Caching
- Debugging
- Bundle size
- Complexity

---

## How Should You Answer in an Interview?

Do not say:

> "CSS Modules are better."

Say:

> "The choice depends on the application's requirements. CSS Modules provide scoped, predictable CSS with minimal runtime styling overhead, while CSS-in-JS can provide a more programmatic styling model and convenient theme integration. For a design system, I would prioritize predictable styling, theming through tokens or CSS variables, SSR compatibility, and performance."

---

# 8. Tailwind for Design Systems

Tailwind provides utility classes:

```tsx
<button className="px-4 py-2 rounded-md bg-blue-600">
  Save
</button>
```

It is primarily a styling tool/framework.

A design system is broader.

It includes:

```text
Tokens
Components
APIs
Patterns
Accessibility
Documentation
Testing
Guidelines
```

So:

> **Tailwind can be used to implement a design system, but Tailwind itself is not the complete design system.**

---

## Tailwind as the Token Layer

A design system can define:

```text
Colors
Spacing
Typography
Breakpoints
Radius
Shadows
```

through the Tailwind configuration.

Then reusable components consume those values.

For example:

```tsx
<Button variant="primary" />
```

might internally use:

```tsx
className="bg-primary text-primary-foreground ..."
```

The application developer does not need to know the actual color value.

---

## Recommended Architecture

```text
Design decisions
      ↓
Design tokens
      ↓
Tailwind configuration
      ↓
Reusable components
      ↓
Applications
```

This is better than asking every developer to manually assemble utility classes for every repeated UI element.

---

## Tailwind's Strengths

- Consistent spacing
- Consistent colors
- Responsive utilities
- Fast development
- Easy token integration
- Less custom CSS

---

## Tailwind's Risk

Uncontrolled usage can produce:

```tsx
className="px-3 py-[13px] bg-[#2384fa] ..."
```

everywhere.

That makes the system harder to control.

A mature design system should encapsulate recurring UI patterns:

```tsx
<Button variant="primary" />
<Card />
<Input />
```

rather than requiring consumers to reproduce the styling themselves.

---

# 9. Storybook for Documentation

Storybook provides an isolated environment for developing, documenting, and testing components.

Instead of:

```text
Application
   ↓
Component
   ↓
Navigate through several screens
```

you can have:

```text
Storybook
│
├── Button
│   ├── Primary
│   ├── Secondary
│   ├── Disabled
│   └── Loading
│
├── Input
│   ├── Default
│   ├── Error
│   └── Disabled
│
└── Modal
```

---

## Why Is Storybook Valuable?

### 1. Documentation

Developers can discover:

```text
What does this component do?
What props does it accept?
What variants exist?
What states are supported?
```

### 2. Isolated Development

You can develop:

```tsx
<Button loading />
```

without navigating through the entire product.

### 3. Visual Testing

You can represent important visual states explicitly.

### 4. Collaboration

Designers and developers have a shared reference for component behavior and appearance.

---

## Stories Represent States

For example:

```tsx
export const Primary = {
  args: {
    variant: "primary",
    children: "Save",
  },
};
```

You can also document:

```text
Default
Hover
Disabled
Loading
Error
Empty
Long content
Mobile
Dark theme
```

depending on the component.

---

## Storybook Is Not the Design System

This is important.

Storybook is:

> **A development, documentation, and testing environment for the design system.**

The design system itself is:

```text
Tokens
+
Components
+
Patterns
+
Guidelines
+
Accessibility expectations
```

Storybook exposes and documents these things.

---

# 10. Component Testing Strategies

A design system needs strong testing because its components are reused widely.

If you break:

```text
Button
```

you may break dozens of applications or hundreds of screens.

So reusable components deserve strong automated tests.

---

# 10.1 Behavioral / Component Tests

Test what the user can observe.

For a Button:

```text
Button
 ├── renders
 ├── calls onClick
 ├── respects disabled
 ├── shows loading state
 └── supports keyboard interaction
```

For example:

```tsx
render(
  <Button onClick={handleClick}>
    Save
  </Button>
);

await user.click(
  screen.getByRole("button", {
    name: "Save"
  })
);

expect(handleClick).toHaveBeenCalled();
```

The testing philosophy should be:

> **Test behavior rather than implementation details.**

---

# 10.2 Accessibility Testing

Design-system components are a particularly good place to enforce accessibility because fixing the primitive benefits every consumer.

Test things such as:

```text
Keyboard navigation
Focus behavior
ARIA semantics
Accessible names
Labels
Contrast
Screen-reader behavior
```

For a Modal, for example:

```text
Open modal
   ↓
Move focus appropriately
   ↓
Allow keyboard interaction
   ↓
Manage background interaction
   ↓
Close
   ↓
Return focus appropriately
```

The exact behavior depends on the component, but accessibility should be part of the component contract.

---

# 10.3 Visual Regression Testing

Visual regression testing catches unintended UI changes.

Imagine someone changes:

```css
--spacing-md: 16px;
```

to:

```css
--spacing-md: 20px;
```

and accidentally changes dozens of components.

A visual testing system can compare:

```text
Expected rendering
        vs
Current rendering
```

and flag differences.

This is especially useful for design systems because a small styling change can have a large blast radius.

---

# 10.4 Integration Tests

Some behavior only makes sense when components interact.

For example:

```text
Select
 +
Form
 +
Validation
```

or:

```text
Modal
 +
Focus management
 +
Application state
```

Component tests verify the primitive itself.

Integration tests verify that multiple pieces work correctly together.

---

# 11. Putting the Architecture Together

A mature design system can look like:

```text
                    DESIGN SYSTEM
                          │
          ┌───────────────┴───────────────┐
          │                               │
     Design Tokens                    Guidelines
          │
    ┌─────┼──────────┐
    │     │          │
 Colors Spacing  Typography
    │
    ↓
Semantic Tokens
    │
    ↓
Theming
    │
    ├── Light
    ├── Dark
    └── Brand themes
    │
    ↓
Component Library
    │
    ├── Button
    ├── Input
    ├── Select
    ├── Modal
    ├── Table
    └── ...
    │
    ↓
Consistent Component APIs
    │
    ↓
Applications
```

Around the component library:

```text
              Component Library
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
   Storybook     Unit Tests   Visual Tests
        │
        ↓
 Documentation
```

---

# 12. A Real-World Example

Imagine a company has five frontend teams building different products.

They all need:

```text
Button
Input
Dropdown
Modal
Table
Badge
Toast
DatePicker
```

Without a design system:

```text
Team A → Button A
Team B → Button B
Team C → Button C
Team D → Button D
Team E → Button E
```

Eventually:

```text
Different spacing
Different colors
Different keyboard behavior
Different accessibility
Different APIs
Different loading states
```

A design system introduces:

### Tokens

```text
Colors
Spacing
Typography
Radius
Shadows
```

### Components

```tsx
<Button variant="primary" />
<Input error />
<Badge variant="success" />
```

### Themes

```text
Light
Dark
```

### Documentation

```text
Storybook
```

### Testing

```text
Behavior
Accessibility
Visual regression
```

Now product teams consume the shared system instead of rebuilding the primitives.

---

# 13. How to Introduce a Design System Into an Existing Company

This is a common architecture interview scenario.

Suppose:

> "Five teams have independently built Buttons, Inputs, Modals and Tables. How would you introduce a design system?"

Do not immediately answer:

> "I'll build a component library."

Start with discovery.

---

## Step 1: Audit Existing Implementations

Understand:

```text
What is actually common?
What differs intentionally?
Which components are heavily reused?
Which implementations are broken?
Which patterns are product-specific?
```

Do not standardize things just because they look similar.

---

## Step 2: Identify Design Foundations

Establish:

```text
Colors
Spacing
Typography
Radius
Shadows
Breakpoints
Motion
```

---

## Step 3: Create Design Tokens

Move common design decisions into tokens.

```text
Primitive tokens
      ↓
Semantic tokens
```

---

## Step 4: Build Foundational Components

Start with high-value primitives:

```text
Button
Input
Typography
Icon
Modal
Select
```

Avoid trying to migrate the entire company at once.

---

## Step 5: Define Consistent APIs

For example:

```tsx
<Button
  variant="primary"
  size="md"
  disabled
/>
```

rather than every team using different prop conventions.

---

## Step 6: Add Accessibility

Make accessibility part of the shared component rather than requiring every product team to solve it independently.

---

## Step 7: Add Documentation

Use Storybook or another documentation system.

Document:

```text
API
Variants
Usage
Do/Don't
Accessibility
Examples
```

---

## Step 8: Add Testing

At minimum:

```text
Behavior
Accessibility
Visual regression where useful
```

---

## Step 9: Publish and Version

The component library can be consumed as a package:

```text
@company/design-system
```

Version it so teams can upgrade deliberately.

---

## Step 10: Migrate Incrementally

Avoid:

```text
"Everyone must migrate everything this sprint."
```

Prefer:

```text
New features → design system

Existing features → migrate when touched

High-risk shared components → prioritize separately
```

This reduces migration risk.

---

# 14. Component Library Architecture

A component library might look like:

```text
design-system/
│
├── tokens/
│   ├── colors.css
│   ├── spacing.css
│   ├── typography.css
│   └── themes.css
│
├── components/
│   ├── Button/
│   ├── Input/
│   ├── Select/
│   ├── Modal/
│   └── Table/
│
├── hooks/
│
├── utilities/
│
├── stories/
│
└── tests/
```

A more mature system might separate:

```text
Foundations
Primitives
Components
Patterns
```

For example:

```text
Foundations
    ↓
Button / Input / Text
    ↓
Form / DataTable / Dialog
    ↓
Product-specific patterns
```

---

# 15. Design System vs Component Library

These terms are often used interchangeably, but they are not exactly the same.

## Component Library

Primarily:

```text
Reusable components
```

Example:

```text
Button
Input
Modal
Table
```

## Design System

Broader:

```text
Design principles
+
Tokens
+
Components
+
Patterns
+
Accessibility
+
Documentation
+
Testing
+
Usage guidelines
```

So:

> **A component library can be one implementation layer of a design system.**

---

# 16. Design Tokens and Theming Together

This is one of the most important architectural connections.

Consider:

```css
:root {
  --blue-600: #2563eb;

  --color-primary: var(--blue-600);
  --color-background: white;
  --color-text: #111827;
}
```

Dark theme:

```css
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-background: #111827;
  --color-text: white;
}
```

The component only sees:

```css
.button {
  background: var(--color-primary);
}

.page {
  background: var(--color-background);
  color: var(--color-text);
}
```

This gives:

```text
Primitive tokens
       ↓
Semantic tokens
       ↓
Theme
       ↓
Components
```

The component does not need to know which theme is active.

---

# 17. Design System and Accessibility

Accessibility should not be treated as an optional layer added at the end.

A shared component is the ideal place to enforce accessibility because the fix propagates to every consumer.

For example, a reusable Button should correctly handle:

```text
Semantic <button>
Keyboard interaction
Disabled state
Accessible name
Focus state
Loading state
```

A reusable Dialog should handle:

```text
Focus management
Keyboard behavior
Accessible labeling
Appropriate ARIA semantics
```

The principle is:

> **Make the accessible behavior the default behavior.**

---

# 18. Design System Governance

A large design system also needs governance.

Imagine a team requests:

> "Can we add 12 new Button variants?"

Someone needs to decide whether those variants belong in the shared system.

Useful questions:

```text
Is this pattern recurring?
Is it used by multiple teams?
Is the design stable?
Does it fit the existing design language?
Will this increase API complexity?
Can composition solve it instead?
```

A design system should evolve carefully because every addition becomes part of the long-term API.

---

# 19. Avoiding Design-System Bloat

A design system can fail in the opposite direction too.

You can end up with:

```text
Button
ButtonV2
ButtonLegacy
PrimaryButton
SecondaryButton
DangerButton
CompactButton
DenseButton
DashboardButton
```

This usually means the abstraction boundaries are unclear.

A good design system should standardize what is genuinely shared while allowing product-specific components where necessary.

The goal is not:

> "Everything must come from the design system."

The goal is:

> **"Shared decisions should be centralized, while product-specific decisions should remain local."**

---

# 20. Design System Versioning

Once multiple applications depend on the design system, changes need to be managed carefully.

For example:

```text
@company/design-system
```

might have:

```text
1.4.0
1.5.0
2.0.0
```

A breaking API change such as:

```tsx
<Button variant="primary" />
```

becoming:

```tsx
<Button intent="primary" />
```

can affect many consumers.

Therefore:

```text
Component API
      ↓
Versioning
      ↓
Migration strategy
```

becomes part of the architecture.

---

# 21. Common Design-System Mistakes

## Mistake 1: Treating Storybook as the design system

Storybook is documentation/development infrastructure.

It is not the design system itself.

---

## Mistake 2: Hardcoding design values

Bad:

```css
color: #2563eb;
```

everywhere.

Better:

```css
color: var(--color-primary);
```

---

## Mistake 3: Too many variants

Bad:

```text
variant="primary"
variant="primary-small"
variant="primary-with-icon"
variant="primary-with-icon-small"
```

Look for composition or orthogonal props.

---

## Mistake 4: Too many boolean props

Bad:

```tsx
<Button
  primary
  secondary
  danger
/>
```

Prefer:

```tsx
<Button variant="danger" />
```

---

## Mistake 5: Allowing arbitrary styling everywhere

Bad:

```tsx
<Button
  backgroundColor="#123456"
  padding="13px"
/>
```

This undermines the design system.

---

## Mistake 6: Standardizing one-off requirements

Not every product-specific UI belongs in the shared system.

---

## Mistake 7: Ignoring accessibility

A visually consistent component library that produces inaccessible UI is still a poor design system.

---

## Mistake 8: No migration strategy

A design system is difficult to adopt if existing teams cannot gradually migrate.

---

# 22. Interview Scenarios

## Scenario 1: "How would you build a design system from scratch?"

Strong reasoning:

```text
1. Understand products and existing UI
        ↓
2. Identify common patterns
        ↓
3. Establish design foundations
        ↓
4. Define tokens
        ↓
5. Define semantic tokens
        ↓
6. Build foundational components
        ↓
7. Establish consistent APIs
        ↓
8. Add accessibility
        ↓
9. Add Storybook/documentation
        ↓
10. Add automated tests
        ↓
11. Publish/version the package
        ↓
12. Migrate applications incrementally
```

---

## Scenario 2: "How would you implement dark mode?"

Answer:

> "I'd implement dark mode at the token layer rather than putting conditional styling into each component. Components would consume semantic CSS variables, while light and dark themes provide different values. The active theme could be controlled through a root attribute such as `data-theme`, with support for system preference if required."

---

## Scenario 3: "How would you prevent teams from creating inconsistent components?"

Answer:

> "I'd provide a shared component library with consistent APIs, documented usage, and strong defaults. I'd also establish contribution and governance guidelines so teams can propose additions rather than independently creating replacements. For existing products, I'd migrate incrementally instead of forcing a risky rewrite."

---

## Scenario 4: "Tailwind is already used. Why do we need a design system?"

Answer:

> "Tailwind solves a styling problem, but a design system is broader. We still need shared design tokens, component APIs, accessibility behavior, documentation, and governance. Tailwind can be one implementation mechanism for the styling layer of the design system."

---

## Scenario 5: "How would you test a Button in a design system?"

Think in layers:

```text
Behavior
    ↓
Accessibility
    ↓
Visual regression
    ↓
Integration where necessary
```

Answer:

> "I'd test user-visible behavior such as click handling, disabled and loading states, keyboard interaction, and accessible semantics. For the design system as a whole, I'd also use visual regression testing for important variants because changes to shared components can have a large visual blast radius."

---

# 23. Questions You Should Be Able to Answer

## Basic

1. What is a design system?
2. What is a design token?
3. What is the difference between a design token and a CSS variable?
4. Why use semantic tokens?
5. What is a typography scale?
6. What are component variants?
7. What makes a good component API?
8. What is theming?
9. How would you implement dark mode?
10. What is Storybook?
11. Why use Storybook?
12. What is Tailwind?
13. What are CSS Modules?
14. What is CSS-in-JS?

---

## Intermediate

15. How would you structure a design system?
16. How do design tokens support theming?
17. How would you support multiple brands?
18. When should something become a component variant?
19. When should you use composition instead of another variant?
20. Tailwind vs CSS Modules?
21. CSS-in-JS vs CSS Modules?
22. How would you test a reusable component?
23. How would you test visual regressions?
24. How would you incorporate accessibility into a design system?
25. How would you introduce a design system into an existing product?
26. How would you version a design system?
27. How would you prevent design-system bloat?
28. How would you govern contributions from multiple teams?

---

# 24. Senior-Level Mental Model

Do not memorize:

```text
Tailwind = good
CSS Modules = good
CSS-in-JS = bad
Storybook = design system
Tokens = CSS variables
Dark mode = media query
```

Those are overly simplistic.

Instead, think in terms of **responsibility, coupling, scalability, and consistency**.

Ask:

```text
Where should this design decision live?
        ↓
Should it be a primitive or semantic token?
        ↓
Should this variation be a component variant?
        ↓
Is the variation finite or open-ended?
        ↓
Should consumers configure it or compose it?
        ↓
Who owns the styling?
        ↓
How will theming work?
        ↓
How will this be documented?
        ↓
How will it be tested?
        ↓
How will changes affect existing consumers?
```

That is the architectural thinking interviewers are looking for.

---

# 25. Quick Decision Cheat Sheet

```text
Need centralized design values?
        ↓
Design Tokens


Need values to change based on purpose/theme?
        ↓
Semantic Tokens


Need a small, finite UI variation?
        ↓
Component Variant


Need structural flexibility?
        ↓
Composition


Need multiple related components sharing behavior?
        ↓
Compound Components


Need multiple themes?
        ↓
Semantic Tokens + Theme Layer


Need isolated component documentation?
        ↓
Storybook


Need consistent utility-based styling?
        ↓
Tailwind


Need scoped traditional CSS?
        ↓
CSS Modules


Need highly programmatic styling?
        ↓
CSS-in-JS
(consider runtime/SSR trade-offs)


Need confidence in reusable components?
        ↓
Behavior + Accessibility + Visual Testing


Need to support multiple applications?
        ↓
Versioned Component Library
```

---

# 26. Final Interview Summary

A strong design system should:

- Centralize design decisions through tokens.
- Prefer semantic tokens for component consumption.
- Establish a consistent typography and spacing system.
- Use variants for finite, intentional component states.
- Avoid exposing arbitrary styling values.
- Keep component APIs consistent across the library.
- Use composition when structural flexibility is required.
- Separate theming from component implementation.
- Implement dark mode at the token/theme layer.
- Choose styling technology based on architectural requirements rather than popularity.
- Use Tailwind as a styling mechanism, not as the entire design system.
- Use Storybook for isolated development, documentation, and component-state exploration.
- Test reusable components for behavior and accessibility.
- Add visual regression testing where the shared UI has a large blast radius.
- Version the component library and manage breaking changes.
- Introduce the system incrementally in existing applications.
- Avoid standardizing one-off product requirements.
- Establish governance so the system does not accumulate unnecessary variants and abstractions.

## The Core Question

> **"Where should this design decision live, and how do I make it reusable without making the system unnecessarily restrictive?"**

If you can reason through that question, you are thinking about design systems at the frontend-architecture level rather than merely memorizing their terminology.
