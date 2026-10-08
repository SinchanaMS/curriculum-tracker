# DOM

## Why It Matters

The DOM is the browser's in-memory representation of an HTML document.

As a frontend engineer, you should understand not just:

> "The DOM is a tree."

but:

- How HTML becomes a DOM
- What kinds of nodes exist
- How JavaScript reads and modifies the DOM
- Why some DOM operations are more expensive than others
- How to batch DOM updates
- How observers work
- What Shadow DOM changes
- Why live collections can be surprising

A useful mental model is:

```text
HTML
 ↓
HTML Parsing
 ↓
DOM Tree
 ↓
JavaScript ↔ DOM
 ↓
Style / Layout / Paint
```

---

# 1. DOM Tree Construction

The browser receives HTML as text:

```html
<!doctype html>
<html>
  <body>
    <h1>Hello</h1>
    <p>World</p>
  </body>
</html>
```

The HTML parser converts that text into nodes.

Conceptually:

```text
Document
└── html
    └── body
        ├── h1
        │   └── "Hello"
        └── p
            └── "World"
```

This in-memory structure is the **Document Object Model**.

---

## Parsing Is Not Just String Splitting

The HTML parser has to understand:

- Start tags
- End tags
- Attributes
- Text
- Comments
- Nesting rules
- Malformed HTML
- Browser parsing rules

For example:

```html
<p>Hello <strong>world</strong></p>
```

becomes approximately:

```text
p
├── "Hello "
└── strong
    └── "world"
```

The DOM preserves relationships such as:

```text
parent
child
sibling
```

---

# 2. Node Types

Everything in the DOM is represented using nodes.

Common node types include:

```text
Document
Element
Text
Comment
DocumentType
```

---

## Element Nodes

HTML elements are represented as element nodes.

```html
<button>Save</button>
```

creates an element:

```text
BUTTON
```

JavaScript:

```js
const button = document.querySelector("button");
```

---

## Text Nodes

The text inside an element is represented separately.

```html
<p>Hello</p>
```

Conceptually:

```text
P
└── Text("Hello")
```

You can inspect:

```js
const p = document.querySelector("p");

console.log(p.firstChild.nodeType);
```

A text node has:

```js
Node.TEXT_NODE
```

---

## Comment Nodes

HTML comments are also nodes:

```html
<!-- Important section -->
```

Conceptually:

```text
Comment
└── " Important section "
```

You can encounter these while traversing the DOM even though they are not rendered as visible content.

---

## Document Node

The top-level document is:

```js
document
```

It represents the document itself.

For example:

```js
document.documentElement
```

returns the `<html>` element.

---

# 3. DOM Manipulation Methods

JavaScript can modify the DOM.

Common operations:

```js
createElement()
append()
appendChild()
prepend()
remove()
replaceWith()
insertBefore()
```

Example:

```js
const li = document.createElement("li");

li.textContent = "New item";

document.querySelector("ul").append(li);
```

This creates:

```text
ul
└── li
    └── "New item"
```

---

## textContent vs innerHTML

### textContent

```js
element.textContent = "Hello";
```

Treats the value as text.

### innerHTML

```js
element.innerHTML = "<strong>Hello</strong>";
```

Parses the string as HTML.

The difference matters for:

- Parsing
- Security
- Performance
- Existing child nodes

Never insert untrusted strings through `innerHTML` without appropriate sanitization.

---

# 4. querySelector vs getElementById

Both can find DOM elements.

```js
document.getElementById("save");
```

and:

```js
document.querySelector("#save");
```

---

## getElementById

It specifically looks up an element by ID.

```js
const button = document.getElementById("save");
```

It communicates intent clearly.

---

## querySelector

It accepts a CSS selector:

```js
document.querySelector(".button");
```

or:

```js
document.querySelector("#save");
```

or:

```js
document.querySelector("form button");
```

---

## Performance

It is tempting to say:

> "`getElementById` is always much faster."

That is not a useful modern interview answer.

In practice:

- `getElementById` is specialized
- `querySelector` supports general CSS selectors
- Browsers heavily optimize DOM lookup
- The performance difference is usually irrelevant compared with the broader cost of application rendering

For a direct ID lookup, prefer:

```js
getElementById()
```

because it expresses intent.

For arbitrary selectors:

```js
querySelector()
```

is appropriate.

---

# 5. querySelectorAll

To retrieve multiple matching elements:

```js
const buttons = document.querySelectorAll("button");
```

This returns a:

```text
NodeList
```

For example:

```js
buttons.forEach(button => {
  console.log(button.textContent);
});
```

---

# 6. Live vs Static NodeLists

This is an important DOM interview topic.

Not all DOM collections behave the same way.

---

## Static Collection

`querySelectorAll()` returns a **static NodeList**.

```js
const items = document.querySelectorAll(".item");
```

If the DOM later changes:

```js
newItem.classList.add("item");
```

the existing `items` collection does not automatically update.

Conceptually:

```text
querySelectorAll()
       ↓
snapshot-like collection
       ↓
does not automatically reflect later matching changes
```

---

## Live Collection

Some DOM APIs return live collections.

Examples include:

```js
document.getElementsByClassName("item");
document.getElementsByTagName("div");
```

Suppose:

```js
const items = document.getElementsByClassName("item");

console.log(items.length);
```

Then:

```js
const div = document.createElement("div");
div.className = "item";

document.body.append(div);
```

The collection can now report a larger length:

```js
console.log(items.length);
```

because it is live.

---

## Why Does This Matter?

Live collections can produce surprising behavior:

```js
const items = document.getElementsByClassName("item");

for (let i = 0; i < items.length; i++) {
  items[i].remove();
}
```

Because the collection changes while you iterate, elements can be skipped.

A safer approach can be:

```js
const items = [
  ...document.getElementsByClassName("item")
];

for (const item of items) {
  item.remove();
}
```

---

# 7. DocumentFragment

A `DocumentFragment` is a lightweight container for building a DOM subtree before inserting it.

Instead of repeatedly modifying the live DOM:

```js
for (const item of items) {
  const li = document.createElement("li");
  li.textContent = item;
  list.append(li);
}
```

you can construct a fragment:

```js
const fragment = document.createDocumentFragment();

for (const item of items) {
  const li = document.createElement("li");
  li.textContent = item;
  fragment.append(li);
}

list.append(fragment);
```

Conceptually:

```text
Build off-DOM
     ↓
DocumentFragment
     ↓
Single insertion into live DOM
```

---

## Why Batch DOM Work?

The important principle is:

> **Avoid unnecessary interaction with the live DOM when you can prepare work first.**

A fragment can make large batches of DOM creation cleaner and can reduce the number of live-tree updates.

However, don't blindly claim:

> "DocumentFragment always makes rendering 10x faster."

Modern browsers optimize DOM operations heavily, and the exact performance benefit depends on the workload.

The architectural idea is **batching**.

---

# 8. DOM Traversal

You can traverse the DOM using:

```js
parentNode
parentElement
children
childNodes
firstChild
lastChild
nextSibling
previousSibling
```

Example:

```js
const item = document.querySelector(".item");

console.log(item.parentElement);
console.log(item.children);
```

---

## children vs childNodes

This distinction is important.

### children

Returns element children:

```js
element.children
```

### childNodes

Returns all child nodes:

```js
element.childNodes
```

So:

```html
<div>
  Hello
  <span>World</span>
</div>
```

may have:

```text
childNodes
├── Text("Hello")
├── Text(whitespace)
└── SPAN

children
└── SPAN
```

This is why code that assumes every child node is an element can fail.

---

# 9. DOM Traversal Performance

DOM traversal itself is usually cheap for small trees.

The problem is repeated, unnecessary traversal over large structures.

Bad pattern:

```js
for (const row of rows) {
  document.querySelector(".table .row .cell");
}
```

This repeatedly searches the document.

Prefer keeping references when appropriate:

```js
const table = document.querySelector(".table");

for (const row of rows) {
  // work relative to known references
}
```

---

## Avoid Repeated Global Queries

Instead of:

```js
document.querySelector("#app");
document.querySelector("#app");
document.querySelector("#app");
```

you can retain:

```js
const app = document.getElementById("app");
```

and reuse it.

This is not about obsessing over tiny lookup differences.

The important performance principle is:

> **Avoid unnecessary repeated work, especially inside large loops or frequent event handlers.**

---

# 10. MutationObserver

`MutationObserver` lets you observe changes to the DOM.

Example:

```js
const observer = new MutationObserver(mutations => {
  console.log(mutations);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

Now DOM changes can be observed.

---

## What Can It Observe?

Depending on configuration:

```text
childList
attributes
characterData
subtree
```

Example:

```js
observer.observe(element, {
  attributes: true
});
```

observes attribute changes.

---

## Example

```js
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    console.log(mutation.type);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

const div = document.createElement("div");

document.body.append(div);
```

The observer receives information about the mutation.

---

## Why Is MutationObserver Better Than Polling?

Bad approach:

```js
setInterval(() => {
  // check whether DOM changed
}, 100);
```

This wastes work even when nothing changed.

MutationObserver is event-driven:

```text
DOM changes
    ↓
MutationObserver callback
```

---

## MutationObserver Is Asynchronous

Mutation observer callbacks are not invoked synchronously at the exact line of mutation.

The browser batches mutation records and invokes observer callbacks asynchronously.

This makes it useful for observing changes without forcing every DOM mutation to synchronously execute observer logic.

---

## Disconnecting

If you no longer need the observer:

```js
observer.disconnect();
```

This matters especially in application code.

If you create observers repeatedly and never disconnect them, you can keep unnecessary work and references alive.

---

# 11. Shadow DOM

Shadow DOM allows a component to have an encapsulated DOM subtree.

Conceptually:

```text
Host Element
    |
    +── Shadow Root
          |
          ├── internal DOM
          └── internal styles
```

Example:

```js
const host = document.querySelector("#app");

const shadowRoot = host.attachShadow({
  mode: "open"
});

shadowRoot.innerHTML = `
  <style>
    button {
      color: red;
    }
  </style>

  <button>Save</button>
`;
```

---

## Why Shadow DOM?

It provides encapsulation.

Without Shadow DOM:

```text
Application CSS
     ↓
Component DOM
     ↓
Potential style collisions
```

With Shadow DOM:

```text
Application
     |
     +── Component Host
             |
             +── Shadow Root
                    |
                    +── Encapsulated DOM
                    +── Encapsulated styles
```

---

# 12. Open vs Closed Shadow Root

You can create:

```js
attachShadow({ mode: "open" });
```

or:

```js
attachShadow({ mode: "closed" });
```

With `open`, the shadow root is accessible through:

```js
element.shadowRoot
```

With `closed`, it is not exposed through that property.

This does **not** mean "perfect security."

Closed Shadow DOM is primarily an encapsulation/API decision, not a security boundary against a fully privileged environment.

---

# 13. Shadow DOM and CSS

Styles inside a shadow root are scoped to that shadow tree.

This helps prevent accidental global CSS collisions.

Conceptually:

```text
Global CSS
    ↓
Document tree

Shadow CSS
    ↓
Shadow tree
```

This is one reason Shadow DOM is useful for reusable web components.

---

# 14. DOM APIs and React

React applications still ultimately render to the DOM in the browser.

Normally, you should not manually manipulate React-managed DOM nodes:

```js
document.querySelector(".button").remove();
```

while React believes that element should exist.

This creates two competing sources of truth:

```text
React state
     ↓
React rendering

Manual DOM mutation
     ↓
Actual DOM
```

Instead, React should generally own the DOM.

Use refs for imperative operations that genuinely need them:

```js
const inputRef = useRef(null);

inputRef.current?.focus();
```

The distinction is:

```text
Declarative UI
    ↓
React state/props

Imperative browser APIs
    ↓
Refs / controlled DOM escape hatches
```

---

# 15. DOM and Rendering Cost

Changing the DOM can trigger downstream browser work.

Conceptually:

```text
DOM mutation
    ↓
Style recalculation
    ↓
Layout
    ↓
Paint
    ↓
Composite
```

Not every DOM mutation triggers every stage, and browsers optimize aggressively.

But the mental model is useful.

For example:

```js
element.style.width = "500px";
```

can affect layout.

Repeated layout-sensitive operations can create performance problems.

---

# 16. Layout Thrashing

A common performance problem occurs when code repeatedly alternates between:

```text
Write
Read
Write
Read
```

For example:

```js
element.style.width = "500px";

const width = element.offsetWidth;

element.style.height = "200px";

const height = element.offsetHeight;
```

Some DOM reads require the browser to have up-to-date layout information.

This can force synchronous layout work.

A better pattern is often to batch writes and reads:

```text
Read
Read
Read

Write
Write
Write
```

rather than:

```text
Write
Read
Write
Read
```

This is commonly called avoiding **layout thrashing**.

---

# 17. DOM Performance Checklist

When investigating DOM performance:

```text
1. Is the DOM unnecessarily large?
2. Are we repeatedly querying the document?
3. Are we traversing large subtrees unnecessarily?
4. Are DOM mutations being batched?
5. Are we causing forced synchronous layout?
6. Are we creating unnecessary observers?
7. Are live collections causing unexpected behavior?
8. Is React and the DOM being mutated from competing sources?
```

---

# 18. Interview Scenario: "querySelector vs getElementById"

Answer:

> "`getElementById` is specialized for ID lookup, while `querySelector` supports arbitrary CSS selectors. For a direct ID lookup I'd normally use `getElementById` because it expresses intent, but I wouldn't make micro-optimizing the lookup method a major performance strategy. In real applications, rendering, layout, JavaScript execution, and network work are usually much more significant."

---

# 19. Interview Scenario: "How Would You Insert 10,000 DOM Nodes?"

A good answer:

> "I'd avoid repeatedly manipulating the live DOM if I can batch the work. I could create the nodes in a `DocumentFragment` and append the fragment once. I'd also measure the actual workload because modern browsers optimize DOM operations and the best approach depends on the use case."

---

# 20. Interview Scenario: "What Is MutationObserver?"

Answer:

> "`MutationObserver` is an asynchronous DOM observation API. It lets us observe changes such as child additions/removals, attribute changes, and character-data changes. The browser batches mutation records and invokes the callback asynchronously, which is preferable to repeatedly polling the DOM."

---

# 21. Interview Scenario: "What Is Shadow DOM?"

Answer:

> "Shadow DOM provides an encapsulated DOM subtree attached to a host element. It gives reusable components stronger boundaries for their internal DOM and styles, which helps prevent CSS and DOM implementation details from leaking into the surrounding application."

---

# 22. Senior-Level Mental Model

Do not memorize:

```text
DOM = HTML
querySelector = slow
getElementById = fast
DocumentFragment = always faster
Shadow DOM = security
MutationObserver = synchronous listener
```

Instead think:

```text
HTML
 ↓
Parser
 ↓
DOM tree
 ↓
JavaScript manipulates DOM
 ↓
Browser recalculates affected rendering state
 ↓
Layout / Paint / Composite
```

And for performance:

```text
Can I avoid the work?
        ↓
Can I batch the work?
        ↓
Can I avoid repeated traversal?
        ↓
Can I avoid forced layout?
        ↓
Can I keep ownership of the DOM clear?
```

---

# 23. Quick Decision Cheat Sheet

```text
Need one element by ID?
        ↓
getElementById()


Need CSS selector matching?
        ↓
querySelector / querySelectorAll


Need multiple element children?
        ↓
children


Need all child nodes including text/comments?
        ↓
childNodes


Need to batch DOM construction?
        ↓
DocumentFragment


Need to observe DOM mutations?
        ↓
MutationObserver


Need encapsulated DOM/styles?
        ↓
Shadow DOM


Need a stable collection?
        ↓
querySelectorAll() → static NodeList


Need a collection that reflects later DOM changes?
        ↓
Live HTMLCollection APIs
```

---

# 24. Questions You Should Be Able to Answer

## Basic

1. What is the DOM?
2. How is the DOM constructed?
3. What is a DOM node?
4. What is an element node?
5. What is a text node?
6. What is a comment node?
7. What does `querySelector` do?
8. What does `getElementById` do?
9. What is a NodeList?
10. What is an HTMLCollection?

## Intermediate

11. What is the difference between `children` and `childNodes`?
12. What is the difference between live and static collections?
13. Why can live collections be dangerous while iterating?
14. What is a `DocumentFragment`?
15. What is `MutationObserver`?
16. Why is MutationObserver preferable to polling?
17. What is Shadow DOM?
18. What is the difference between open and closed Shadow DOM?
19. What is layout thrashing?
20. Why can DOM reads sometimes cause layout work?

## Senior-Level

21. How would you optimize rendering of a large DOM?
22. How would you batch DOM updates?
23. How would you investigate a DOM-related performance issue?
24. How does DOM manipulation interact with layout and paint?
25. Why should React generally own the DOM?
26. When is imperative DOM manipulation appropriate?
27. What problem does Shadow DOM solve architecturally?

---

# 25. Final Interview Summary

The DOM:

- Is the browser's object representation of the document.
- Is constructed by parsing HTML into nodes and relationships.
- Contains element, text, comment, document, and other node types.
- Can be queried and manipulated through browser APIs.
- Provides specialized and general lookup APIs such as `getElementById` and `querySelector`.
- Has both live and static collection APIs.
- Can use `DocumentFragment` to batch DOM construction.
- Provides `MutationObserver` for asynchronous DOM mutation observation.
- Provides Shadow DOM for encapsulated component trees and styles.
- Can trigger downstream style, layout, paint, and compositing work when modified.
- Should generally be owned by the UI framework in React applications rather than mutated independently.

## The Core Question

> **"What DOM work am I causing, can I avoid or batch it, and what rendering work will that mutation trigger?"**
