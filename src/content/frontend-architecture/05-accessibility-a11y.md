# Accessibility (a11y) — Frontend Interview Guide

## Why It Matters

Accessibility means designing and building digital products so people with different abilities can perceive, understand, navigate, and interact with them. It includes people who use screen readers, keyboards, voice control, magnification, captions, switch devices, or other assistive technologies—and it also improves usability for many people in temporary or situational constraints.

At an SDE2 / senior frontend level, accessibility is not just adding ARIA attributes. It is a set of engineering decisions across semantics, interaction, focus, visual design, routing, testing, and team practices.

The core principle:

> **Start with semantic HTML, preserve expected browser behavior, and add ARIA only when native HTML does not express the required meaning or state.**

Accessibility is not a final QA pass. It should be part of component APIs, design-system defaults, acceptance criteria, and automated/manual testing.

## Learning Map

```text
Accessibility
├── Standards and conformance (WCAG)
├── Semantic structure (HTML + ARIA)
├── Interaction
│   ├── Keyboard navigation
│   ├── Focus management
│   ├── Skip links
│   ├── Dialogs and modals
│   └── Accessible routing
├── Perceivable UI
│   ├── Color contrast
│   ├── Text alternatives
│   └── Visual states
└── Verification
    ├── Screen readers
    ├── Automated tools
    └── Manual keyboard testing
```

---

# 1. WCAG 2.1 Guidelines

## What is WCAG?

The **Web Content Accessibility Guidelines (WCAG)** are published by the W3C. They provide testable success criteria for making web content more accessible. WCAG 2.1 builds on WCAG 2.0 and adds criteria addressing areas such as mobile accessibility, low vision, and cognitive or learning disabilities.

WCAG conformance levels are:

- **Level A** — the most basic requirements.
- **Level AA** — adds further requirements and is the level commonly targeted by accessibility policies and product teams.
- **Level AAA** — more demanding criteria; it is not generally feasible to meet every AAA criterion for all content.

A product should identify the applicable legal, contractual, and organizational requirements rather than assuming one conformance level automatically applies everywhere.

## The four POUR principles

WCAG organizes its principles around POUR:

1. **Perceivable** — information and UI components must be presented in ways users can perceive. Examples: text alternatives for meaningful images, captions for relevant media, sufficient contrast.
2. **Operable** — users must be able to operate controls and navigate. Examples: keyboard support, visible focus, enough time to complete tasks.
3. **Understandable** — information and interaction should be understandable and predictable. Examples: clear labels, helpful validation messages, consistent navigation.
4. **Robust** — content should work reliably with browsers and assistive technologies. Examples: valid semantic markup, correct accessible names and states.

A practical way to use POUR is to check every feature from all four angles, not to treat accessibility as a single checkbox.

## WCAG 2.1 criteria worth knowing for frontend interviews

| Area | What to remember |
|---|---|
| Text alternatives | Meaningful non-text content needs an appropriate text alternative (1.1.1). |
| Captions | Prerecorded synchronized media generally needs captions (1.2.2). |
| Info and relationships | Structure conveyed visually should also be programmatically determinable (1.3.1). |
| Use of color | Color must not be the only way to convey information (1.4.1). |
| Contrast | Normal text generally needs 4.5:1 contrast; large text generally needs 3:1 (1.4.3). |
| Resize text | Text should be resizable up to 200% without loss of content or functionality (1.4.4). |
| Reflow | At the relevant WCAG 2.1 AA conditions, content should reflow at a width equivalent to 320 CSS pixels without requiring two-dimensional scrolling for ordinary content (1.4.10). |
| Keyboard | Functionality must be operable through a keyboard interface (2.1.1). |
| No keyboard trap | Keyboard focus must not get stuck in a component (2.1.2). |
| Bypass blocks | Provide a way to bypass repeated content, commonly a skip link (2.4.1). |
| Focus order | Focus order must preserve meaning and operability (2.4.3). |
| Focus visible | Keyboard focus needs a visible indicator (2.4.7). |
| Labels/instructions | Inputs need labels or instructions where needed (3.3.2). |
| Name, role, value | UI component names, roles, and states should be programmatically determinable (4.1.2). |

WCAG 2.1 AA also includes requirements for orientation, input modalities, target size/spacing in specified contexts, and other criteria. Learn the principle and know where to verify exact criteria instead of relying on memory alone.

### How to answer “What is WCAG?”

> “WCAG is the W3C’s set of testable guidelines for web accessibility. It is organized around four principles: perceivable, operable, understandable, and robust. For frontend work, I translate those into concrete requirements like semantic markup, keyboard operability, visible focus, text alternatives, sufficient contrast, accessible forms, and testing with assistive technology. I also confirm which conformance level and criteria apply to the product.”

---

# 2. Semantic HTML: Why It Matters

## What is semantic HTML?

Semantic HTML uses elements according to their meaning and purpose, rather than choosing elements only for their default appearance.

Prefer:

```html
<button type="button">Save changes</button>
<a href="/settings">Settings</a>
<nav aria-label="Primary">...</nav>
<main>...</main>
<article>...</article>
```

over:

```html
<div onclick="save()">Save changes</div>
<div onclick="navigate()">Settings</div>
<div class="nav">...</div>
```

A native `<button>` already provides a button role, keyboard activation, focus behavior, and browser interaction conventions. A clickable `<div>` does not automatically provide those things. Recreating them manually is error-prone.

## Choose elements by behavior and meaning

- Use `<button>` for an action: save, open a menu, delete, submit.
- Use `<a href="...">` for navigation to a URL or location.
- Use `<input>`, `<select>`, and `<textarea>` for form controls.
- Use `<label>` to associate text with a form control.
- Use headings (`<h1>`–`<h6>`) to represent the document outline and sections.
- Use lists (`<ul>`, `<ol>`, `<li>`) for list content.
- Use `<nav>` for a navigation region, `<main>` for the primary content, and `<header>` / `<footer>` for appropriate page or section landmarks.
- Use `<table>` for tabular data, with proper header cells—not to lay out a page.

Semantic HTML gives browsers and assistive technology a reliable structure. It also improves keyboard behavior, maintainability, and automated testing.

## Example: a real button

```tsx
function SaveButton({ onSave }: { onSave: () => void }) {
  return (
    <button type="button" onClick={onSave}>
      Save changes
    </button>
  );
}
```

For a form submission, use `type="submit"` inside the form. For an action that should not submit a form, explicitly use `type="button"`; otherwise a button inside a form defaults to submit behavior.

## Heading structure

Headings help screen-reader users navigate by section. Use heading levels to reflect the content hierarchy rather than selecting a heading because its default font size looks right.

```html
<h1>Account settings</h1>
<section aria-labelledby="security-heading">
  <h2 id="security-heading">Security</h2>
  <h3>Two-factor authentication</h3>
</section>
```

A page does not have to contain exactly one `<h1>` in every technical scenario, but it should have a clear, meaningful hierarchy. Style headings with CSS rather than misusing their semantic level.

## Links versus buttons

Use a link when the user is going somewhere; use a button when the user is doing something.

```tsx
<a href="/reports">View reports</a>
<button type="button" onClick={refreshReports}>Refresh reports</button>
```

This distinction affects keyboard interaction, context menus, opening links in new tabs, copying link addresses, and expectations for assistive technology.

### Interview takeaway

> “Semantic HTML is my first accessibility tool. Native elements expose built-in roles and behaviors to browsers and assistive technologies. ARIA can clarify semantics, but it does not automatically add keyboard interaction or other native behavior.”

---

# 3. ARIA Roles and Attributes

## What is ARIA?

**Accessible Rich Internet Applications (ARIA)** is a set of attributes that communicates roles, names, states, and relationships to assistive technologies. It is especially useful for custom widgets and dynamic interfaces.

ARIA does not change how an element looks, and it usually does not implement behavior. Adding `role="button"` to a `<div>` does not automatically make it keyboard-operable.

## The first rule of ARIA

> **Use native HTML when an appropriate native element exists.**

Prefer:

```html
<button type="button" disabled>Save</button>
```

over:

```html
<div role="button" aria-disabled="true">Save</div>
```

The custom version would require focusability, keyboard activation, disabled interaction handling, and other behavior to be implemented correctly.

## Three useful ARIA concepts

### 1. Role

Communicates what something is.

```html
<div role="status">Saved successfully.</div>
```

Use native elements when they already provide the correct role. Do not override a native role without a sound reason.

### 2. Accessible name

Communicates what a control is called.

```html
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

An icon-only button needs an accessible name. If visible text already provides a good name, an extra `aria-label` is usually unnecessary.

### 3. State and properties

Communicate current state or relationships.

```tsx
<button
  type="button"
  aria-expanded={isOpen}
  aria-controls="filters-panel"
  onClick={() => setIsOpen((open) => !open)}
>
  Filters
</button>

<div id="filters-panel" hidden={!isOpen}>
  ...
</div>
```

Here:
- `aria-expanded` reports whether the controlled region is expanded.
- `aria-controls` identifies the region controlled by the button.
- The actual open/closed behavior still comes from React and HTML.

Other common attributes include:
- `aria-labelledby` — names an element using the text of another element or elements.
- `aria-describedby` — points to supplementary description or instructions.
- `aria-invalid` — indicates an invalid input value.
- `aria-live` — identifies a region whose updates may need to be announced.
- `aria-hidden="true"` — hides content from the accessibility tree; it does not visually hide it.
- `aria-current="page"` — identifies the current page or item in a set.

## Labeling example

```tsx
function EmailField() {
  const helpId = "email-help";

  return (
    <div>
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        aria-describedby={helpId}
      />
      <p id={helpId}>We’ll use this for account notifications.</p>
    </div>
  );
}
```

A visible label is generally preferable to relying on placeholder text, because placeholders disappear when users type and often have lower visual contrast.

## Common ARIA mistakes

- Adding ARIA roles when native HTML already expresses the correct meaning.
- Assuming a role automatically adds keyboard behavior.
- Using `aria-label` to conceal a missing visible label when a visible label is needed.
- Referencing an ID that does not exist.
- Setting `aria-expanded` or `aria-selected` without updating it to match the real UI state.
- Using `aria-hidden="true"` on focusable content or an ancestor containing focused controls.
- Adding `role="presentation"` / `role="none"` to meaningful content without understanding the effect.

### Interview answer: “When would you use ARIA?”

> “I first look for a native HTML element. I use ARIA when I need to communicate a role, name, state, or relationship that native HTML does not adequately expose—for example, the expanded state of a custom disclosure or the accessible name of an icon-only button. I treat ARIA as metadata, not behavior, so I separately implement and test keyboard interaction and state changes.”

---

# 4. Focus Management

## What is focus?

Keyboard focus identifies which interactive element receives keyboard input. Users who navigate without a mouse rely on focus order and a visible indication of where they are.

A good focus strategy answers:
- Where does focus start?
- In what order does it move?
- Is the current focus visible?
- What happens when content appears or disappears?
- Where does focus go after an action completes?

## Native focus order

Interactive native elements such as links, buttons, and form controls are usually included in sequential keyboard navigation in document order. Avoid positive `tabindex` values such as `tabindex="5"` because they create a custom order that is difficult to maintain.

- `tabindex="0"` — makes an otherwise non-sequentially-focusable element reachable in normal tab order.
- `tabindex="-1"` — allows programmatic focus but excludes the element from normal Tab navigation.
- Positive `tabindex` — generally avoid.

Do not make every static element focusable. Add programmatic focus to a non-interactive element only when there is a clear interaction need, such as moving focus to a newly displayed page heading after client-side navigation.

## Focus should not disappear

When a focused element is removed from the DOM, focus may fall back to the document body or another browser-dependent location. This can disorient keyboard users.

Example: after deleting a row, move focus to a logical surviving control, such as the next row’s action button or the table heading if no rows remain.

## React example: focus after an action

```tsx
import { useRef } from "react";

function SearchPanel() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  function showResults() {
    // Update application state to render results first.
    // Then focus the heading after it exists in the DOM.
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  return (
    <section>
      <button type="button" onClick={showResults}>
        Show results
      </button>

      <h2 ref={headingRef} tabIndex={-1}>
        Search results
      </h2>
    </section>
  );
}
```

This is illustrative: in a real React component, tie focus to the state transition and DOM lifecycle (for example, with an effect) rather than assuming a frame always guarantees the correct render timing. Move focus only when it helps preserve context; do not steal focus during ordinary background updates.

## Visible focus indicator

Never remove the browser outline without providing an equally clear alternative.

```css
:focus-visible {
  outline: 3px solid var(--focus-ring, #145ee8);
  outline-offset: 3px;
}
```

`:focus-visible` lets browsers apply focus indication based on input modality heuristics, often showing the ring for keyboard navigation while avoiding it for some pointer interactions. Test the actual contrast and appearance against surrounding surfaces.

## Focus trap versus focus order

A focus trap intentionally keeps focus inside a modal dialog while it is open. It is appropriate for a modal, not for the whole page or a non-modal popover. A focus trap must not become a keyboard trap: users must have an expected way to close the modal and leave it.

### Interview takeaway

> “I treat focus as application state for significant UI transitions. I preserve native tab order, maintain a visible focus indicator, move focus when a workflow would otherwise leave users disoriented, and restore focus when a temporary interface such as a modal closes.”

---

# 5. Keyboard Navigation

## Core principle

Every functionality available by pointer should also be operable through a keyboard, unless the underlying action inherently depends on a movement path that cannot be reproduced through a keyboard interface.

Test using **Tab**, **Shift+Tab**, **Enter**, **Space**, **Escape**, and arrow keys where the widget pattern expects them.

Typical native behavior:
- **Tab / Shift+Tab** — move forward / backward through sequential focusable elements.
- **Enter** — activate links and buttons; submit forms in common form contexts.
- **Space** — activate buttons and toggle native checkboxes; on a focused page it may scroll, so avoid custom handling that breaks native behavior.
- **Escape** — often closes a dialog, menu, or popover if the pattern supports it.
- **Arrow keys** — navigate within certain composite widgets, such as radio groups, tabs, menus, and listboxes, according to the relevant interaction pattern.

Do not implement custom keyboard handling for a native control unless necessary. For custom composite widgets, follow a well-defined pattern (for example, the WAI-ARIA Authoring Practices Guide).

## Common failure: clickable `div`

Bad:

```tsx
<div onClick={save}>Save</div>
```

Better:

```tsx
<button type="button" onClick={save}>Save</button>
```

If you must build a custom widget, you need to provide appropriate focusability, role, keyboard handling, states, and assistive-technology support. This is usually more work and risk than using native HTML.

## Keyboard testing checklist

1. Can I reach every interactive control with the keyboard?
2. Can I activate each control without a mouse?
3. Is the focus indicator visible and unobscured?
4. Does focus move in a logical order?
5. Can I escape overlays and custom widgets?
6. Does any component trap focus unintentionally?
7. Does sticky UI or a fixed header obscure the focused element?
8. Does the UI still work at high zoom and on a small viewport?

---

# 6. Skip Links

A skip link lets keyboard users bypass repeated content—often a site header and primary navigation—and move directly to the main content.

```html
<a class="skip-link" href="#main-content">Skip to main content</a>

<header>
  <!-- Repeated site navigation -->
</header>

<main id="main-content">
  <h1>Reports</h1>
  ...
</main>
```

A common styling pattern keeps the link off-screen until it receives focus:

```css
.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  padding: 0.75rem 1rem;
  background: white;
  color: #111;
  transform: translateY(-150%);
}

.skip-link:focus {
  transform: translateY(0);
}
```

Important details:
- Place the link near the start of the document so it is one of the first keyboard stops.
- Ensure it becomes visible when focused.
- Ensure the target ID exists and is unique.
- Account for fixed headers so the destination is not obscured.
- Test that activation moves the user to the intended content. Depending on browser and markup, you may need to make the target programmatically focusable or manage focus to ensure a reliable result.

### Interview takeaway

> “A skip link is a low-cost way to meet the bypass-blocks principle. It reduces repetitive keyboard navigation by letting users jump past common navigation directly to the main content.”

---

# 7. Screen Reader Testing

## What does a screen reader do?

A screen reader announces information exposed through the browser’s accessibility tree, such as names, roles, states, structure, and relevant updates. It does not simply read the pixels on the screen.

Examples include:
- NVDA on Windows (commonly paired with Firefox or Chrome).
- JAWS on Windows.
- VoiceOver on macOS and iOS.
- TalkBack on Android.

You do not need to assume all screen readers behave identically. Browser/assistive-technology combinations can differ, so test the combinations relevant to the audience and product.

## What to test

### Structure
- Can users navigate by headings and landmarks?
- Are heading levels meaningful?
- Are tables and lists announced with the correct structure?

### Controls
- Does every control have a clear accessible name?
- Is its role clear?
- Are disabled, checked, selected, expanded, and invalid states communicated accurately?

### Forms
- Is the label announced with the field?
- Are instructions and errors associated with the right input?
- Can the user understand which fields are required?

### Dynamic updates
- Is a meaningful status announced when data saves or results update?
- Are live announcements useful rather than excessively noisy?
- Does opening a dialog move focus appropriately?

## Status message example

```tsx
function SaveStatus({ saved }: { saved: boolean }) {
  return (
    <p role="status">
      {saved ? "Changes saved." : ""}
    </p>
  );
}
```

`role="status"` is a polite live region in common usage. Use it for non-urgent status updates; do not turn every changing piece of text into a live announcement. For urgent alerts, `role="alert"` may be appropriate, but excessive use can interrupt users.

## Screen reader testing is not “listen once”

Use it to test meaningful tasks:
1. Navigate to a page using headings or landmarks.
2. Find and operate the primary action.
3. Fill out and submit a form with invalid data.
4. Open and close a dialog.
5. Trigger an asynchronous update.
6. Verify that names, roles, values, and messages make sense.

Also inspect the browser accessibility tree when needed, but do not treat a correct tree as proof that the entire experience works. Manual interaction remains essential.

---

# 8. Color Contrast Requirements

## Contrast ratios

Contrast compares the relative luminance of foreground and background colors. WCAG contrast ratios range from 1:1 (no contrast) to 21:1 (maximum black/white contrast).

For WCAG 2.1 AA:
- **Normal text:** at least **4.5:1**.
- **Large text:** at least **3:1**. “Large” generally means at least 18 pt (24 CSS px) regular, or 14 pt (about 18.67 CSS px) bold.
- **User-interface components and meaningful graphical objects:** generally at least **3:1** against adjacent colors when the relevant non-text contrast criterion applies.

Some exceptions apply, including certain logos and inactive controls. Do not assume every faint border needs the same contrast rule as text; assess the relevant criterion.

## Color cannot be the only signal

Bad:

```text
Red field = invalid
Green field = valid
```

Better:
- Use color plus a visible message or icon.
- Associate the error text with the input.
- Identify the error in text, not only by a border color.

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && <p id="email-error">Enter a valid email address.</p>}
```

## Contrast in component states

Check:
- Default text and background.
- Links and surrounding text.
- Placeholder text where it conveys necessary information.
- Focus rings.
- Error, success, and warning states.
- Disabled states according to applicable criteria.
- Light and dark themes.
- Hover and selected states.
- Charts, icons, borders, and meaningful graphical controls where non-text contrast applies.

Do not judge contrast by eye alone. Use a contrast checker and verify the actual rendered colors, including transparency and overlays.

---

# 9. Form Accessibility

Forms are among the most common places where accessibility fails.

## Labels, instructions, and grouping

Use a visible `<label>` connected to the control with matching `htmlFor` / `id` (or nest the input in the label). Use `<fieldset>` and `<legend>` to group related controls such as a set of radio buttons.

```tsx
<fieldset>
  <legend>Preferred contact method</legend>

  <label>
    <input type="radio" name="contact" value="email" />
    Email
  </label>

  <label>
    <input type="radio" name="contact" value="phone" />
    Phone
  </label>
</fieldset>
```

## Required fields

Do not communicate that a field is required only through color or an unexplained asterisk. Provide a clear instruction and, when appropriate, use the native `required` attribute.

```tsx
<label htmlFor="name">Full name (required)</label>
<input id="name" name="name" autoComplete="name" required />
```

Native validation can be useful, but custom validation must also communicate errors accessibly.

## Error handling

A useful validation experience:
1. Detect the invalid value.
2. Explain the problem in text.
3. Associate the error with the field, commonly using `aria-describedby`.
4. Set `aria-invalid="true"` while invalid.
5. On submit, provide a summary or move focus to a useful place when appropriate.
6. Preserve valid input so the user does not need to re-enter everything.

```tsx
function EmailInput({ error }: { error?: string }) {
  return (
    <div>
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "email-error" : undefined}
      />
      {error && (
        <p id="email-error">
          {error}
        </p>
      )}
    </div>
  );
}
```

For more than one error, consider a summary that identifies each problem and links to the relevant field. If focus moves to the summary, make sure it can receive focus programmatically and that the transition is helpful rather than surprising.

## Helpful form practices

- Use the correct input type (`email`, `tel`, `password`, etc.) and autocomplete tokens where suitable.
- Do not rely on placeholders as the only label.
- Explain expected formats before users make mistakes.
- Make errors specific: “Enter a date in DD/MM/YYYY format” is more useful than “Invalid input.”
- Ensure error messages remain available after the user returns to the field.
- Use native browser validation carefully; its presentation and announcements vary by browser.
- Do not erase all form state after a failed submission.
- Make validation timing predictable; avoid announcing an error on every keystroke unless there is a strong reason.

### Interview takeaway

> “For accessible forms, I associate visible labels with controls, provide instructions before errors occur, expose invalid state programmatically, connect errors through `aria-describedby`, and ensure submit-time feedback helps users find and correct each problem.”

---

# 10. Modal and Dialog Accessibility

A modal is not just a box drawn above the page. It changes the interaction context, so it needs careful focus and keyboard behavior.

## Expected modal behavior

A properly implemented modal dialog generally needs to:
1. Have an accessible name, commonly through `aria-labelledby` pointing to its title.
2. Optionally have a description through `aria-describedby` when a concise description is useful.
3. Move focus into the dialog when opened.
4. Keep keyboard focus within the modal while it is modal.
5. Make the background content unavailable for interaction while the modal is active.
6. Support an expected close mechanism, commonly a visible close button and Escape where appropriate.
7. Return focus to the invoking control when closed, unless that control no longer exists or another destination is more logical.
8. Keep focus visible and avoid obscuring the focused control.

Do not use `aria-modal="true"` unless the dialog really behaves modally. The attribute communicates modality; it does not itself trap focus or disable background interaction.

## Native `<dialog>` versus a custom dialog

The native HTML `<dialog>` element can be opened modally with `showModal()` and provides useful browser behavior. A custom dialog built from generic elements must implement much more of the interaction model correctly. Native support still needs testing for the product’s browser and assistive-technology combinations.

Illustrative native example:

```tsx
import { useRef } from "react";

function ConfirmDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
    triggerRef.current?.focus();
  }

  return (
    <>
      <button ref={triggerRef} type="button" onClick={openDialog}>
        Delete account
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="dialog-title"
      >
        <h2 id="dialog-title">Delete account?</h2>
        <p>This action cannot be undone.</p>

        <button type="button" onClick={closeDialog}>
          Cancel
        </button>
        <button type="button" onClick={closeDialog}>
          Confirm deletion
        </button>
      </dialog>
    </>
  );
}
```

This example illustrates the concepts, not a complete production deletion flow. A production implementation must also handle the dialog’s native close events, confirmation behavior, focus restoration when the trigger disappears, and any application-specific cancellation rules. The browser’s native modal dialog behavior handles many details, but it should still be tested.

## Modal checklist

- Is the dialog titled accessibly?
- Does opening it put focus in a useful place?
- Can the user navigate all controls with a keyboard?
- Does Tab remain within a modal dialog?
- Does Escape close it when appropriate?
- Is background content truly unavailable while modal?
- Is focus restored logically after closing?
- Can screen-reader users understand the dialog’s purpose and actions?
- Does a long dialog work at high zoom and on small screens?

## Modal versus non-modal popover

A modal blocks interaction with the rest of the page until dismissed. A non-modal popover or disclosure should not automatically trap focus or claim modal semantics. Match the behavior to the pattern rather than choosing ARIA attributes based only on appearance.

---

# 11. Accessible Routing in Single-Page Applications

Client-side routing changes content without a traditional full-page load. As a result, the browser may not automatically move focus or announce the new page in a way that users expect.

## What can go wrong?

- The URL changes but focus remains on a navigation link far above the new content.
- A screen-reader user is not clearly informed that a new view has loaded.
- The page title remains unchanged.
- Back/forward navigation produces confusing focus behavior.
- A route transition causes focus to land on a removed element.

## Practical approach

When implementing client-side navigation:
1. Keep navigation as real links wherever possible.
2. Update the document title for the new route.
3. Ensure the new view has a meaningful heading and landmark structure.
4. Decide whether and when to move focus to the new page heading or main region.
5. Avoid moving focus for every tiny state update or query change.
6. Respect back/forward navigation and avoid unexpected focus jumps.
7. Announce route changes when needed, without duplicating announcements or overwhelming users.

Example pattern:

```tsx
import { useEffect, useRef } from "react";

function ReportsPage() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = "Reports | Acme";
    headingRef.current?.focus();
  }, []);

  return (
    <main>
      <h1 ref={headingRef} tabIndex={-1}>Reports</h1>
      {/* Route content */}
    </main>
  );
}
```

This illustrates a route-level focus strategy. In a real application, use the router’s navigation lifecycle and account for whether navigation was a new route, a history traversal, or a small in-page update. If the page is server-rendered on each navigation, native document navigation already provides some context that differs from a client-side transition.

## Announcing route changes

A live region can announce a concise route status, but avoid blindly making the entire page a live region. The heading focus, document title, and live announcement should work together rather than repeatedly announcing the same content.

### Interview takeaway

> “For a single-page app, I don’t assume changing the URL is enough. I update the document title, keep semantic page structure, and define a predictable focus/announcement strategy for route transitions. I test both direct navigation and browser back/forward behavior with keyboard and screen-reader users in mind.”

---

# 12. Accessibility Testing Tools and Workflow

No single automated tool can prove that a page is accessible. Use a layered approach.

## Automated checks

Useful tools include:
- **axe DevTools / axe-core** — detects many common accessibility violations in rendered UI.
- **Lighthouse** — includes automated accessibility audits, alongside other audit categories.
- **WAVE** — visual feedback for many accessibility issues.
- **Accessibility Insights** — automated checks and guided manual assessment.
- **Browser developer tools** — inspect accessible names, roles, states, and the accessibility tree.
- **Jest / Vitest with Testing Library** — test accessible queries and user-observable behavior in component tests.
- **Playwright or Cypress** — run browser-level flows; these can be paired with accessibility checks and manual test scenarios.

Automated tools can catch issues such as missing accessible names, invalid ARIA patterns, some contrast problems, and certain structural errors. They cannot reliably decide whether content is understandable, focus order makes sense for a real workflow, a chart has an adequate text equivalent, or a screen-reader announcement is useful.

## Example: testing by role and accessible name

```tsx
render(<button type="button">Save changes</button>);

expect(
  screen.getByRole("button", { name: "Save changes" })
).toBeInTheDocument();
```

Testing Library’s role-and-name queries encourage tests that align with how users and assistive technologies identify controls. Avoid selecting elements only through brittle implementation details when a semantic query is available.

## A practical testing pyramid

```text
                 Manual AT testing
              (screen reader, zoom)
                         ▲
                Keyboard workflows
                         ▲
              Browser/integration tests
                         ▲
               Component behavior tests
                         ▲
               Automated static checks
```

This is not a strict hierarchy of importance. It is a reminder that automated checks, component tests, and manual testing catch different classes of problems.

## Suggested workflow for a feature

1. **During design:** check reading order, contrast, text alternatives, error and focus states, and keyboard interaction.
2. **During implementation:** choose semantic HTML, accessible component primitives, labels, names, and state attributes.
3. **During component testing:** test keyboard operation, state changes, and accessible names.
4. **During integration testing:** test real flows, including dialogs, validation, loading, and routing.
5. **Before release:** run automated checks, complete keyboard testing, and test representative screen-reader workflows.
6. **After release:** treat reported accessibility barriers as product defects and feed fixes back into shared components.

## Testing checklist

- [ ] Every interactive control has an accessible name.
- [ ] Semantic elements match their purpose.
- [ ] All functionality works with a keyboard.
- [ ] Focus is visible and follows a logical order.
- [ ] No unintended keyboard traps exist.
- [ ] Focus is managed when dialogs, menus, and routes change.
- [ ] Forms have labels, instructions, and associated errors.
- [ ] Color contrast meets the relevant criteria.
- [ ] Color is not the sole way to communicate meaning.
- [ ] Images and non-text content have appropriate alternatives.
- [ ] Dynamic status messages are communicated where needed.
- [ ] Page titles, headings, and landmarks are meaningful.
- [ ] Automated checks are supplemented by manual testing.

---

# 13. Accessibility in a Design System

A shared component library is a high-leverage place to build accessibility in by default. A fix to a reusable primitive can benefit every product that consumes it.

Examples of accessible component contracts:

### Button
- Uses a native `<button>` for actions.
- Has a clear accessible name.
- Supports disabled and loading states correctly.
- Keeps a visible focus indicator.
- Does not rely on color alone to communicate state.

### Input
- Has an associated label.
- Exposes invalid state when appropriate.
- Associates help and error text with `aria-describedby`.
- Uses appropriate native input types and attributes.

### Dialog
- Has an accessible title.
- Moves and restores focus appropriately.
- Supports expected keyboard behavior.
- Prevents interaction with background content when modal.

### Tabs
- Follow an established tabs interaction pattern, including roles, selected state, keyboard navigation, and panel relationships.
- Do not use `role="tab"` on arbitrary elements without implementing the expected behavior.

The key principle:

> **Make accessible behavior the default, document the component contract, and test it centrally.**

However, a design-system component cannot guarantee an entire product is accessible. Product teams still need meaningful content, correct labels, suitable interaction choices, and end-to-end testing.

---

# 14. Common Interview Scenarios

## Scenario 1: “How would you make a custom dropdown accessible?”

A strong answer should clarify what “dropdown” means: a native select, a listbox, a menu button, or an autocomplete combobox have different interaction models.

Then:
1. Prefer native `<select>` if it meets the product requirements.
2. If custom UI is necessary, choose the correct WAI-ARIA pattern rather than inventing a hybrid.
3. Define the accessible name, role, state, and relationships.
4. Implement the expected keyboard model (for example, arrow-key behavior for a listbox).
5. Manage focus and selected/active state consistently.
6. Support type-ahead where required by the chosen pattern.
7. Test with keyboard and representative screen readers.

Do not simply add `role="listbox"` and assume the widget is accessible.

## Scenario 2: “A modal opens, but keyboard users cannot use it. What do you check?”

- Is focus moved into the modal on open?
- Can Tab and Shift+Tab reach all relevant controls?
- Is focus contained while it is modal?
- Can Escape close it when appropriate?
- Is there a visible close/cancel control?
- Is the background unavailable for interaction?
- Does focus return to the opener or a logical replacement?
- Does the dialog have an accessible name and correct modal semantics?

## Scenario 3: “How do you handle validation errors?”

- Provide visible, specific error text.
- Associate the error with the relevant control.
- Expose invalid state programmatically.
- Provide a useful error summary for complex forms.
- On submit, guide users to the first error or summary when appropriate.
- Preserve the user's entered values.
- Verify the messages are announced usefully with assistive technology.

## Scenario 4: “How do you test accessibility in CI?”

- Add automated axe-based checks to component or browser tests for regressions.
- Test key workflows and accessible names with Testing Library and browser automation.
- Treat automated checks as a safety net, not certification.
- Include manual keyboard and screen-reader testing for representative critical flows.
- Fix recurring primitive-level issues in the design system.

## Scenario 5: “How would you make an SPA accessible?”

- Preserve native links and semantic structure.
- Update the document title on route changes.
- Use meaningful headings and landmarks.
- Implement a consistent focus strategy for navigation.
- Avoid duplicate or noisy live announcements.
- Test direct route loads, in-app navigation, and browser history.

## Scenario 6: “ARIA or semantic HTML—which do you prefer?”

> “Semantic HTML by default. Native elements already provide much of the role and interaction behavior. I add ARIA when it communicates a missing name, state, relationship, or widget role, and I separately implement any required behavior.”

---

# 15. Common Mistakes to Avoid

1. **Using a clickable `<div>` instead of a button or link.** This discards native behavior and creates extra work.
2. **Treating ARIA as a fix for everything.** ARIA does not automatically implement keyboard support or focus management.
3. **Removing outlines globally.** Keyboard users may lose their location.
4. **Using positive `tabindex` values.** This creates fragile focus ordering.
5. **Relying on color alone.** Add text, icons, patterns, or other clear indicators as appropriate.
6. **Using placeholders as labels.** The field may become hard to identify once filled.
7. **Opening a modal without managing focus.** The visual overlay can look right while the interaction remains broken.
8. **Forgetting focus after route changes or deleting content.** Users may lose context.
9. **Overusing live regions.** Too many announcements can make the experience noisy.
10. **Assuming Lighthouse or axe proves conformance.** Automated tests detect only a subset of barriers.
11. **Testing only with a mouse.** Keyboard testing is essential.
12. **Treating accessibility as an individual component’s job only.** Content, design, routing, and end-to-end flows matter too.

---

# 16. Quick Decision Cheat Sheet

```text
Need an action?
    ↓
Use <button>

Need to navigate?
    ↓
Use <a href="...">

Need a form control?
    ↓
Use native input/select/textarea + a label

Need a custom role/state/name?
    ↓
Use ARIA only if native HTML is insufficient
    ↓
Implement behavior separately

Need to bypass repeated navigation?
    ↓
Add a visible-on-focus skip link

Need to open a modal?
    ↓
Accessible name + initial focus + focus containment
+ background inertness + close behavior + focus restoration

Need to announce a non-urgent update?
    ↓
Consider role="status" / a polite live region

Need to validate a form?
    ↓
Visible specific message + association + invalid state
+ useful focus/error-summary behavior

Need to support SPA routing?
    ↓
Document title + semantic page structure
+ deliberate focus/announcement strategy

Need confidence?
    ↓
Automated checks + keyboard tests + screen-reader tests
```

---

# 17. Questions You Should Be Able to Answer

## Fundamentals
1. What is web accessibility, and who benefits?
2. What is WCAG?
3. What do POUR stand for?
4. What is the difference between WCAG A, AA, and AAA?
5. Why is semantic HTML important?
6. When should you use a button versus a link?
7. What is ARIA, and what does it not do?
8. What is an accessible name?
9. What are roles, states, and properties?

## Interaction and focus
10. How do you test a website using only a keyboard?
11. What is a keyboard trap?
12. What is focus management?
13. When should focus be moved programmatically?
14. What does `tabindex="0"` mean versus `tabindex="-1"`?
15. What is a skip link?
16. What keyboard behavior should a modal support?

## Visual and forms
17. What contrast ratios does WCAG 2.1 AA require for normal and large text?
18. Why can’t color be the only signal?
19. How do you make forms and validation errors accessible?
20. How should labels, instructions, and errors be associated?

## React and architecture
21. How would you make a reusable component accessible?
22. How do you manage focus after an SPA route change?
23. How should dynamic status messages be announced?
24. How do you make a dialog accessible in React?
25. How would you test accessibility in CI?
26. What can automated accessibility tools catch, and what can they miss?
27. How does a design system help accessibility?
28. How would you debug a screen-reader issue?

---

# 18. Interview-Ready Summary

A strong frontend engineer should be able to explain that:

- Accessibility is a core product and engineering requirement, not a polish step.
- WCAG is organized around perceivable, operable, understandable, and robust experiences.
- Semantic HTML should be preferred because native elements provide built-in meaning and behavior.
- ARIA communicates roles, names, states, and relationships; it does not automatically create interaction behavior.
- Every interactive workflow should be operable by keyboard, with logical order and visible focus.
- Focus must be managed deliberately when dialogs open and close, content is removed, or client-side routes change.
- Skip links help users bypass repeated navigation.
- Normal text generally needs a 4.5:1 contrast ratio, and large text generally needs 3:1 under WCAG 2.1 AA.
- Color should not be the only way to communicate status or meaning.
- Forms need visible labels, instructions, associated errors, and helpful error recovery.
- Modal dialogs need accessible names, appropriate focus behavior, keyboard support, and genuine modal behavior.
- Single-page applications need a strategy for titles, focus, and announcements on route transitions.
- Automated tools are valuable but cannot replace keyboard and screen-reader testing.
- Shared design-system components should make accessible behavior the default and include accessibility in their test contract.

## The Core Interview Mental Model

When reviewing any UI, ask:

```text
Can the user perceive the information?
        ↓
Can the user operate every control?
        ↓
Can the user understand the structure and feedback?
        ↓
Does it work with browsers and assistive technology?
        ↓
How do I verify it with automation and manual testing?
```

That reasoning is more valuable than memorizing a list of ARIA attributes. In an interview, explain the user problem, the native HTML choice, the keyboard/focus behavior, the relevant WCAG principle, and how you would test the result.
