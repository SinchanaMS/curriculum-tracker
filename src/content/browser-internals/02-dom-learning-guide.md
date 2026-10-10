# The Document Object Model (DOM) — A First-Principles Learning and Interview Guide

> **Goal:** Learn the DOM from first principles—not just memorize API definitions. Each major concept should help you answer: what problem does this solve, why does the solution work, how does the browser behave, when should I use it, and what trade-offs or pitfalls should I know for interviews?

---

## How to use this guide

Don't try to memorize every API name at once. For each concept, aim to answer four questions:

1. **What is it?**
2. **What problem does it solve?**
3. **What happens when I use it?**
4. **What can go wrong, and how would I recognize or fix it?**

The DOM is easiest to understand when you connect it to the browser's job: taking a document, representing it as objects, displaying it, and allowing scripts to change it.

# 1. Start with the big picture: what is the DOM?

DOM stands for **Document Object Model**. It is the browser's object-based representation of a document, such as an HTML page.

Consider this HTML:

```html
<!doctype html>
<html>
  <body>
    <h1>Hello</h1>
    <p>Welcome to my page.</p>
  </body>
</html>
```

HTML is text written according to a markup language. JavaScript needs a way to refer to parts of that document as objects. The browser parses the HTML and builds an in-memory structure that scripts and browser features can work with.

A simplified view of that structure is:

```text
document
└── html
    └── body
        ├── h1
        │   └── Text: "Hello"
        └── p
            └── Text: "Welcome to my page."
```

Each box represents a **node**. The relationships between nodes matter: a node can have a parent, children, and siblings. This hierarchy is called a **tree**.

## 1.1 HTML, DOM, and rendered pixels are not the same thing

These terms are related, but they mean different things:

- **HTML source:** The markup text the browser receives or the markup in a file.
- **DOM:** The browser's parsed, in-memory object representation of the document.
- **CSS:** Rules describing how elements should look.
- **Rendered page:** What the browser ultimately displays on screen.

A useful simplified pipeline is:

```text
HTML bytes/text
    ↓ parse
DOM tree ─────────┐
                  ├─ style calculation → layout → paint → compositing
CSS bytes/text    │
    ↓ parse       │
CSSOM ────────────┘
```

This is a model, not a promise that the browser completes each stage once in a perfectly separate sequence. Browsers can process resources incrementally, and changes may cause some stages to run again.

### Why the distinction matters

If you change the DOM, you change the document's structure or content. That does **not** mean every mutation necessarily causes a full page repaint. The browser determines what work is required.

For example:

```js
const heading = document.querySelector("h1");
heading.textContent = "Hello again";
```

This changes the text represented in the DOM. The browser may need to recalculate styles or layout and paint the changed area, depending on what changed and the surrounding page.

## 1.2 Why frontend engineers need to understand the DOM

Even when you use React, Vue, or another UI framework, the browser still displays a DOM-based page. DOM knowledge helps you understand:

- why `querySelector()` sometimes returns `null`;
- why `children` and `childNodes` are different;
- why assigning `innerHTML` can be dangerous;
- why a DOM collection might change while you're looping over it;
- why a mutation observer callback does not run at the exact line that changed the DOM;
- why repeated layout reads and writes can make animations janky;
- why React generally should be the owner of the DOM it renders.

---

# 2. How HTML becomes a DOM tree

The browser does not merely split HTML on angle brackets. HTML parsing follows defined rules and has to recover from imperfect markup.

## 2.1 From characters to nodes

Take this example:

```html
<p>Hello <strong>there</strong>!</p>
```

The parser identifies the opening paragraph, text, opening `strong`, its text, the closing `strong`, more text, and the closing paragraph.

The resulting structure is approximately:

```text
P element
├── Text node: "Hello "
├── STRONG element
│   └── Text node: "there"
└── Text node: "!"
```

Notice that the text is not all one indivisible string in the tree. It is represented by text nodes positioned between element nodes.

JavaScript can inspect the resulting structure:

```js
const paragraph = document.querySelector("p");

console.log(paragraph.nodeName);            // "P"
console.log(paragraph.childNodes.length);   // likely 3 for this markup
console.log(paragraph.textContent);         // "Hello there!"
```

The exact `childNodes` count can be affected by whitespace and comments in the markup. Treat the tree as a structure, not as a count you can infer without examining the actual source.

## 2.2 The parser repairs malformed HTML

Browsers are designed to process real-world HTML, including markup that is incomplete or incorrectly nested.

For example, developers may write:

```html
<p>First paragraph
<p>Second paragraph
```

A browser's HTML parser knows that a paragraph cannot contain another paragraph in the ordinary way and implicitly closes the first paragraph when appropriate. The resulting DOM is not simply a literal reflection of the missing closing tags.

Likewise, the parser can insert structural elements such as `html`, `head`, or `body` when needed.

**Important:** The DOM is the result of parsing rules, not necessarily a character-for-character copy of the HTML source.

## 2.3 What happens with scripts?

When a browser encounters a script, when it executes the script depends on how it is loaded and whether it is deferred, asynchronous, a module, or dynamically inserted. A classic parser-blocking script can pause HTML parsing while it is fetched and executed. `defer` and module scripts generally allow parsing to continue and execute after parsing is complete (with details depending on script type and loading mode).

Examples:

```html
<script src="/classic.js"></script>
<script defer src="/deferred.js"></script>
<script type="module" src="/app.js"></script>
```

At a high level:

- A classic external script without `async` or `defer` can block parsing while the browser fetches and executes it.
- `defer` scripts execute after HTML parsing, in document order, before `DOMContentLoaded`.
- Module scripts are deferred by default unless configured otherwise.
- `async` scripts execute when available and do not preserve the same document-order guarantee as deferred scripts.

Why should a frontend engineer care? If a script runs before the element it queries has been parsed, this can happen:

```js
const button = document.querySelector("#save");
console.log(button); // null if #save has not been parsed yet
```

One common solution is to put the script after the relevant markup, use `defer`, or wait for the appropriate document lifecycle event when necessary.

## 2.4 `DOMContentLoaded` and `load`

These events describe different milestones.

```js
document.addEventListener("DOMContentLoaded", () => {
  // HTML has been parsed, and deferred/module scripts have executed.
});

window.addEventListener("load", () => {
  // The page's load event waits for dependent resources such as images
  // and stylesheets to finish loading, subject to browser event rules.
});
```

Don't treat either event as "every possible future resource and application task is complete." Single-page applications can continue fetching data and rendering after these events.

---

# 3. The DOM tree and node types

A **node** is a general unit in the DOM tree. An element is one type of node, but not every node is an element.

Common node types include:

| Node type | Example | What it represents |
|---|---|---|
| `Document` | `document` | The whole document |
| `Element` | `<button>` | An HTML or other markup element |
| `Text` | `Hello` inside a paragraph | Text content |
| `Comment` | `<!-- note -->` | A comment in the document |
| `DocumentType` | `<!doctype html>` | The document type declaration |
| `DocumentFragment` | A fragment created by JavaScript | A lightweight container for a subtree |

## 3.1 Element nodes

An element node represents a tag and its attributes:

```html
<button id="save" class="primary">Save</button>
```

```js
const button = document.getElementById("save");

console.log(button.tagName);             // "BUTTON"
console.log(button.id);                  // "save"
console.log(button.className);            // "primary"
console.log(button.getAttribute("class")); // "primary"
```

The `button` variable refers to an element object. It is not the HTML string itself.

## 3.2 Text nodes

Text between tags is represented by text nodes:

```html
<p>Hello <em>world</em></p>
```

The paragraph has a text node (`"Hello "`), an `EM` element, and that element has a text node (`"world"`).

```js
const paragraph = document.querySelector("p");

console.log(paragraph.firstChild.nodeType === Node.TEXT_NODE); // true
console.log(paragraph.firstChild.nodeValue); // "Hello "
```

`textContent` is usually more convenient than manually walking text nodes when all you need is the combined text.

## 3.3 Comment nodes

Comments are part of the DOM:

```html
<div>
  <!-- This is a comment -->
  <span>Visible text</span>
</div>
```

A comment does not normally render as visible page content, but it can be found while traversing `childNodes`.

## 3.4 The `Document` node

The global `document` object is the entry point for many DOM APIs.

```js
document.documentElement; // the <html> element
document.head;            // the <head> element, when present
document.body;            // the <body> element, when present
```

The `Document` node and the `<html>` element are not the same object. `document` represents the document; `document.documentElement` refers to the root HTML element.

## 3.5 `nodeType`, `nodeName`, and `tagName`

These properties answer related but different questions:

```js
const paragraph = document.querySelector("p");

console.log(paragraph.nodeType); // 1: ELEMENT_NODE
console.log(paragraph.nodeName); // "P"
console.log(paragraph.tagName);  // "P" for an HTML element
```

For text nodes, `nodeName` is `"#text"` and `tagName` is not available in the same way because a text node is not an element. When your code expects an element, check or select elements rather than assuming every node is one.

---

# 4. Finding elements: selectors and lookup APIs

DOM lookup APIs let JavaScript find nodes so it can read them, attach listeners, or modify them.

## 4.1 `getElementById()`

Use it when you know the element's ID:

```html
<button id="save">Save</button>
```

```js
const saveButton = document.getElementById("save");
```

It returns the matching element or `null` if no matching element is found in that document.

An ID is intended to identify one element in a document. Duplicate IDs are invalid HTML authoring practice and can make behavior confusing.

## 4.2 `querySelector()`

`querySelector()` accepts a CSS selector and returns the **first matching element**:

```js
document.querySelector("#save");
document.querySelector(".primary");
document.querySelector("form button");
document.querySelector("input[type='email']");
```

Because it accepts CSS selector syntax, it is flexible. That flexibility is not always needed for a simple ID lookup.

## 4.3 `querySelectorAll()`

Use it to select all elements matching a CSS selector:

```js
const buttons = document.querySelectorAll("button");

buttons.forEach((button) => {
  console.log(button.textContent);
});
```

It returns a **static `NodeList`**. "Static" means the collection does not automatically update its membership when the DOM changes later.

## 4.4 Lookup failures: `null`

This is a common beginner bug:

```js
const button = document.querySelector("#save");
button.addEventListener("click", save); // throws if button is null
```

Possible causes include:
- the element does not exist or the selector is misspelled;
- the script ran before the element was parsed;
- the element is inside a shadow root, so a document-level query cannot cross that boundary;
- the code is querying a different document or subtree.

A defensive approach can be appropriate:

```js
const button = document.querySelector("#save");

if (button) {
  button.addEventListener("click", save);
}
```

Optional chaining (`button?.addEventListener(...)`) avoids the exception too, but it can also silently hide a bug if the element was supposed to exist. Choose based on whether absence is expected.

## 4.5 `getElementById()` versus `querySelector()`: performance

A good interview answer is not "one is always dramatically faster."

- `getElementById()` expresses a direct ID lookup.
- `querySelector()` supports arbitrary CSS selectors.
- Browsers optimize both.
- For ordinary applications, the difference is rarely the main performance bottleneck.

Choose the API that expresses the query clearly. If profiling shows repeated lookups inside a hot loop, reduce unnecessary repeated work rather than relying on tiny micro-optimizations.

## 4.6 `closest()` and scoped queries

`closest()` walks from an element upward through its ancestors and returns the nearest element matching a selector:

```js
const button = document.querySelector(".delete-button");
const row = button?.closest("[data-row-id]");
```

This is useful for event delegation and locating a containing component.

You can also query within a known element instead of the whole document:

```js
const table = document.querySelector("#orders");
const firstAction = table?.querySelector(".row-action");
```

Scoping a query can make the intended search area clearer and avoid accidentally matching an unrelated element elsewhere on the page.

---

# 5. DOM collections: `NodeList` and `HTMLCollection`

When an API returns multiple nodes, it often returns a collection rather than a regular array.

## 5.1 Static versus live is the key distinction

Two common collection types are:

- **Static `NodeList`:** membership is a snapshot of matches at the time the collection was created.
- **Live `HTMLCollection`:** membership reflects matching changes to the DOM over time.

Examples:

```js
const staticItems = document.querySelectorAll(".item");
const liveItems = document.getElementsByClassName("item");
```

Suppose the page initially contains two `.item` elements. Both collections report two items. Then:

```js
const newItem = document.createElement("div");
newItem.className = "item";
document.body.append(newItem);
```

Now `staticItems.length` remains `2`, but `liveItems.length` reflects the new matching element and becomes `3`.

The existing static collection is not refreshed automatically. Call `querySelectorAll()` again if you need a new set of matches.

## 5.2 Why live collections can break loops

Consider:

```js
const items = document.getElementsByClassName("item");

for (let i = 0; i < items.length; i++) {
  items[i].remove();
}
```

At the start, imagine `items` contains three elements:

```text
index 0 → A
index 1 → B
index 2 → C
```

The loop removes A. Because the collection is live, it immediately becomes:

```text
index 0 → B
index 1 → C
```

Then `i` increments to 1, so the loop removes C. B has shifted to index 0 and is skipped. The loop ends with B still present.

Safer pattern: make a copy first.

```js
const items = [...document.getElementsByClassName("item")];

for (const item of items) {
  item.remove();
}
```

The array is a fixed list of references, so removing one element does not change the array's membership.

## 5.3 Converting a collection to an array

You can use spread syntax or `Array.from()`:

```js
const nodes1 = [...document.querySelectorAll(".item")];
const nodes2 = Array.from(document.getElementsByClassName("item"));
```

This is useful when you want array methods such as `map`, `filter`, or `reduce`, or when you want stable membership while modifying the DOM.

## 5.4 Don't assume every collection is live or static

Learn the return behavior of the API you are using. For common cases:
- `querySelectorAll()` returns a static `NodeList`.
- `getElementsByClassName()` returns a live `HTMLCollection`.
- `getElementsByTagName()` returns a live `HTMLCollection`.
- `children` is a live `HTMLCollection`.
- `childNodes` is a live `NodeList`.

---

# 6. Traversing the tree: parents, children, and siblings

DOM relationships let you move around the tree after finding one node.

```js
const item = document.querySelector(".item");

item.parentNode;       // parent node; may not be an Element
item.parentElement;    // parent Element, or null
item.children;         // element children only
item.childNodes;       // all child nodes, including text/comments
item.firstElementChild;
item.lastElementChild;
item.nextElementSibling;
item.previousElementSibling;
```

## 6.1 `children` versus `childNodes`

Given:

```html
<div id="box">
  Hello
  <span>world</span>
  <!-- note -->
</div>
```

`box.children` includes only element children: the `SPAN`.

`box.childNodes` includes nodes representing whitespace/text, the `SPAN`, and the comment. Newlines and indentation in HTML source can create text nodes containing whitespace.

This distinction explains why code like this can fail:

```js
const first = box.childNodes[0];
first.classList.add("active"); // may fail: first could be a Text node
```

If you need elements, use `children`, `firstElementChild`, or an element selector. If you intentionally need every node type, use `childNodes` and check node types.

## 6.2 `parentNode` versus `parentElement`

- `parentNode` returns a parent node, which may be a `Document`, `DocumentFragment`, or `Element`.
- `parentElement` returns the parent only if that parent is an element; otherwise it returns `null`.

For everyday HTML element traversal, `parentElement` often expresses intent better.

## 6.3 Traversal and performance

Moving to a known parent or sibling is generally straightforward. Problems tend to arise when code repeatedly scans large portions of the document or repeats work unnecessarily.

Instead of repeatedly searching the whole document from inside a loop, keep a reference to the relevant container and search within it when appropriate:

```js
const list = document.querySelector("#list");

for (const itemData of data) {
  // Create nodes and work with known references.
  // Avoid repeatedly querying the entire document for the same container.
}
```

Do not turn this into a rule to cache every DOM lookup forever. The goal is clear, maintainable code and avoiding demonstrably repeated work in hot paths.

---

# 7. Creating, inserting, replacing, and removing nodes

JavaScript can build or alter a document by calling DOM methods.

## 7.1 Create an element and add it

```html
<ul id="tasks"></ul>
```

```js
const list = document.getElementById("tasks");

const item = document.createElement("li");
item.textContent = "Review DOM fundamentals";

list.append(item);
```

Step by step:
1. `createElement("li")` creates an element object. It is not yet in the document.
2. `textContent` sets its text.
3. `append(item)` inserts it as a child of the list.
4. Once inserted, it becomes part of the document tree and can be displayed according to the browser's rendering rules.

## 7.2 Common insertion methods

```js
parent.append(newNode);       // add at the end
parent.prepend(newNode);      // add at the beginning
parent.appendChild(newNode);  // add one Node at the end; returns the node
parent.insertBefore(newNode, referenceNode);
oldNode.replaceWith(newNode);
node.remove();
```

`append()` accepts multiple nodes and strings. `appendChild()` accepts a node and returns the appended node. Both are useful; choose based on the behavior and return value you need.

Example:

```js
const list = document.querySelector("ul");
const secondItem = list.children[1];
const newItem = document.createElement("li");
newItem.textContent = "Inserted before item two";

list.insertBefore(newItem, secondItem);
```

If the reference node is `null`, `insertBefore(newNode, null)` inserts at the end. Otherwise, the reference node must belong to the parent.

## 7.3 Moving an existing node

A node cannot occupy two positions in the DOM at once. Appending an existing node to another parent moves it:

```js
const item = document.querySelector("#item");
const destination = document.querySelector("#destination");

destination.append(item);
```

This removes `item` from its previous parent and places it inside `destination`. If you need a duplicate, clone it with `cloneNode()`, while remembering that cloning has details: `cloneNode(true)` copies descendants, but it does not copy event listeners registered with `addEventListener()`.

## 7.4 `textContent` versus `innerHTML`

These properties can both change content, but they have very different meanings.

### `textContent`: treat the value as text

```js
const message = document.querySelector("#message");
message.textContent = "<strong>Hello</strong>";
```

The page displays the literal characters `<strong>Hello</strong>`. The string is not interpreted as markup.

### `innerHTML`: parse the value as HTML

```js
message.innerHTML = "<strong>Hello</strong>";
```

The browser parses the string and creates a `STRONG` element containing text.

Use `innerHTML` when you genuinely need to parse trusted or properly sanitized HTML. For plain text, prefer `textContent`.

### Security: why untrusted `innerHTML` is dangerous

Imagine a comment field where a user can submit arbitrary text. If the application inserts that text as HTML, an attacker may supply markup containing executable event handlers or other injection payloads.

Risky pattern:

```js
message.innerHTML = userSuppliedComment;
```

Safer for plain text:

```js
message.textContent = userSuppliedComment;
```

If the product needs to support a subset of user-authored HTML, use a reputable sanitizer configured for the allowed markup. Do not assume that escaping a few characters manually is a complete sanitizer.

### Existing descendants and listeners

Setting `innerHTML` replaces the element's existing child content with newly parsed nodes. References to removed child nodes can still exist in JavaScript, but those nodes are no longer children of the parent. Event listeners attached to the old nodes do not magically transfer to the replacement nodes.

## 7.5 Attributes, properties, and classes

For an element:

```js
const input = document.querySelector("input");

input.getAttribute("type");
input.setAttribute("aria-label", "Search");
input.classList.add("invalid");
input.classList.remove("invalid");
input.classList.toggle("active");
input.classList.contains("active");
```

Some HTML attributes correspond to JavaScript properties, but the concepts are not identical in every case. For example, `input.getAttribute("value")` reads the attribute value in markup, while `input.value` generally represents the input's current value. When the user types, the current property value can change without the original attribute being rewritten.

Use the property when you mean the current interactive state, and an attribute API when you specifically need to inspect or change an attribute.

---

# 8. `DocumentFragment`: building a subtree before insertion

A `DocumentFragment` is a lightweight container for a group of nodes. It lets you build a subtree separately and then insert that subtree into the document.

## 8.1 Without a fragment

```js
const list = document.querySelector("#results");

for (const name of names) {
  const li = document.createElement("li");
  li.textContent = name;
  list.append(li);
}
```

This is valid code. Modern browsers optimize DOM work, so repeated `append()` calls are not automatically disastrous. However, for some workloads it can be cleaner to prepare a group of nodes before inserting them.

## 8.2 With a fragment

```js
const list = document.querySelector("#results");
const fragment = document.createDocumentFragment();

for (const name of names) {
  const li = document.createElement("li");
  li.textContent = name;
  fragment.append(li);
}

list.append(fragment);
```

The fragment acts as a temporary container:

```text
Create fragment
    ↓
Build <li> nodes inside it
    ↓
Append fragment to the live list
    ↓
Its children move into the list
```

After the fragment is appended, the fragment itself does not become a permanent wrapper element in the page. Its children are moved into the destination, leaving the fragment empty.

## 8.3 What problem does it solve?

The key benefit is **separating construction from insertion**. It can make code easier to reason about and may reduce repeated interaction with the live document in some workloads.

Don't claim that a fragment always makes code faster. Browsers can batch and optimize DOM work, and actual performance depends on the task. If performance matters, measure the real implementation.

## 8.4 When might a fragment be unnecessary?

For a tiny list, direct appends may be perfectly clear and fast enough. Use a fragment when it makes the construction process clearer or helps with a measured performance issue—not as a ritual for every insertion.

---

# 9. `MutationObserver`: being notified when the DOM changes

Sometimes your code needs to know when another piece of code changes a DOM subtree. For example, you might be integrating with a third-party widget that inserts elements, or maintaining a browser extension that observes a page.

A `MutationObserver` watches a configured node and reports matching changes.

## 9.1 Basic example

```js
const target = document.querySelector("#target");

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    console.log(mutation.type, mutation);
  }
});

observer.observe(target, {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true
});
```

The options determine what kinds of changes are recorded:

- `childList`: children were added or removed.
- `attributes`: an attribute changed.
- `characterData`: text data in a text node changed.
- `subtree`: observe matching changes in descendants as well as the target itself.

You must provide at least one relevant observation option. Choose only the options you need; observing every type of mutation across a huge subtree can generate unnecessary work.

## 9.2 What is in a mutation record?

The callback receives an array-like list of `MutationRecord` objects. Depending on the mutation, a record can tell you:
- the mutation type;
- the node whose children, attributes, or character data changed;
- added nodes and removed nodes;
- which attribute changed, when observing attributes;
- the old value if the appropriate `attributeOldValue` or `characterDataOldValue` option was enabled.

For example:

```js
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      console.log("Added:", mutation.addedNodes);
      console.log("Removed:", mutation.removedNodes);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

## 9.3 Why is it asynchronous?

The observer callback does not run inline at the exact statement that mutates the DOM. Mutation records are queued and observer callbacks are delivered asynchronously at a microtask checkpoint. This lets the browser collect multiple changes before calling the observer.

Example:

```js
const target = document.querySelector("#target");

const observer = new MutationObserver(() => {
  console.log("Observer callback");
});

observer.observe(target, { childList: true });

target.append(document.createElement("span"));
console.log("After append");
```

The ordinary synchronous log (`"After append"`) occurs before the observer callback. Do not depend on an observer callback running synchronously after every mutation.

## 9.4 Why not poll?

Polling repeatedly checks for a change even when nothing has happened:

```js
setInterval(() => {
  // Repeatedly inspect the DOM to see whether something changed.
}, 100);
```

A `MutationObserver` is often a better fit when the need is specifically to respond to DOM mutations. It lets the browser notify your code when matching changes occur instead of requiring a recurring check.

Polling is not universally wrong; it can be appropriate when the condition isn't represented by observable DOM mutations. Choose the mechanism that matches the problem.

## 9.5 Disconnect when finished

```js
observer.disconnect();
```

This stops the observer from watching. If you no longer need it, disconnecting avoids unnecessary callbacks and helps release references associated with your own observation logic.

If you need to stop observing only temporarily, you can disconnect and later call `observe()` again. `takeRecords()` can retrieve queued records that have not yet been delivered.

## 9.6 Common pitfalls

- **Observing too much:** `document.body` with `subtree: true` can produce many records on a busy page.
- **Creating feedback loops:** An observer callback changes the same subtree it observes, which creates more mutations and can repeatedly trigger the callback.
- **Forgetting cleanup:** An observer may remain active longer than intended.
- **Using it for ordinary application state:** If you own the code making the change, update your state directly rather than trying to infer state by watching your own DOM mutations.

In React, a `MutationObserver` can be appropriate when integrating with external DOM code, but it is not a substitute for React state or props.

---

# 10. Shadow DOM: building components with their own internal DOM tree

This topic is easier to understand if you first forget the term *Shadow DOM* and start with the problem it solves.

## 10.1 The problem: reusable components can accidentally interfere with the page

Imagine you are building a reusable payment widget. A different team will embed it into many websites. Your widget contains a button, an input, and a small error message.

Your component's author wants the button to be purple:

```css
button {
  background: rebeccapurple;
  color: white;
}
```

But the website embedding your widget already has a global rule:

```css
button {
  background: red;
  color: white;
  border-radius: 0;
}
```

In a normal document, both the website and the widget participate in the same DOM and CSS environment. Depending on selector specificity, source order, and other CSS rules, the website's styles can affect the widget's internal button. The reverse problem can also happen: a broad selector in a widget's stylesheet may unexpectedly affect elements outside the widget.

This is called **style leakage** or **style collision**. It becomes more difficult to manage when a component is developed by one team and embedded into a page controlled by another.

### Why is ordinary CSS not always enough?

You can reduce collisions by using carefully namespaced class names:

```css
.payment-widget__button {
  background: rebeccapurple;
}
```

That is a useful and common technique. But it relies on conventions: every author must use unique names, avoid overly broad selectors, and keep the CSS organized. It also does not create a separate DOM tree. The component's elements still live in the document's ordinary tree.

What if the browser gave the component a separate internal tree and a CSS boundary, so ordinary page selectors would not simply reach into the component's internals?

**That is the central idea behind Shadow DOM.**

Shadow DOM is a browser feature that lets an element host a separate internal DOM subtree. It is often used with Web Components to make reusable UI widgets more self-contained.

## 10.2 First understand the two trees: light DOM and shadow DOM

Start with a regular element:

```html
<div id="payment-widget">
  <button>Pay now</button>
</div>
```

Here, the button is a normal child of the `div`. It belongs to the document's ordinary tree, often called the **light DOM**.

Conceptually:

```text
document
└── div#payment-widget
    └── button "Pay now"
```

Now imagine that the `div` is the outside shell of a component, and the component creates a separate internal tree attached to that shell. That internal tree is the **shadow tree**.

```text
document (ordinary/light DOM)
└── div#payment-widget          ← shadow host
    └── #shadow-root             ← boundary
        ├── style
        └── button "Pay now"     ← internal shadow-tree button
```

This drawing is conceptual: the shadow root is not just another ordinary element child. It is a separate tree attached to a host element through the browser's Shadow DOM API.

The important distinction is:

- **Light DOM:** ordinary DOM content in the document, including the host element and its normal children.
- **Shadow DOM / shadow tree:** the separate internal subtree attached to the host.
- **Shadow host:** the ordinary element that owns or hosts the shadow tree.
- **Shadow root:** the root object through which the shadow tree is accessed.

A host can have ordinary light-DOM children and a shadow tree. They are different relationships, even though they are associated with the same host.

## 10.3 Build the smallest possible example

Suppose the HTML page contains only this host element:

```html
<div id="payment-widget"></div>
```

At this point, it is just an empty `div`. It has no shadow tree yet.

First, select the host:

```js
const host = document.querySelector("#payment-widget");
```

`host` is a reference to the ordinary `div` in the page.

Next, ask the browser to attach a shadow root:

```js
const shadowRoot = host.attachShadow({ mode: "open" });
```

Let's unpack this line:

- `attachShadow(...)` is a browser API on an element.
- It creates and attaches a shadow root to that host.
- `{ mode: "open" }` means the root will be available through `host.shadowRoot`.
- The returned `shadowRoot` variable is a reference to the new root.

The host now has a shadow root, but the root is empty. We can put elements into it.

```js
shadowRoot.innerHTML = `
  <style>
    button {
      background: rebeccapurple;
      color: white;
      padding: 12px 16px;
      border: 0;
      border-radius: 8px;
    }
  </style>

  <button>Pay now</button>
`;
```

The markup is parsed inside the shadow root. The `<style>` element and `<button>` belong to the shadow tree, not to the document's ordinary light-DOM tree.

The complete example is:

```html
<div id="payment-widget"></div>

<script>
  const host = document.querySelector("#payment-widget");
  const shadowRoot = host.attachShadow({ mode: "open" });

  shadowRoot.innerHTML = `
    <style>
      button {
        background: rebeccapurple;
        color: white;
        padding: 12px 16px;
        border: 0;
        border-radius: 8px;
      }
    </style>
    <button>Pay now</button>
  `;
</script>
```

In a real application, the script must run after the host exists in the document. Production code may also create nodes with DOM APIs instead of assigning an HTML string, depending on where the markup comes from and the security requirements.

### What did we gain?

The page can still see and lay out the host element, `div#payment-widget`. The browser renders the shadow tree's button as part of that component's UI. But the button is not an ordinary descendant that a normal document-level selector can freely traverse into.

That boundary is the useful part: the component's internals can be managed separately from the surrounding page.

## 10.4 The key use case: preventing ordinary CSS selectors from crossing the boundary

Imagine the embedding page has this CSS:

```css
button {
  background: red;
  color: yellow;
  font-size: 32px;
}
```

And the shadow tree has this CSS:

```css
button {
  background: rebeccapurple;
  color: white;
  font-size: 16px;
}
```

For ordinary selectors, the page's `button` rule does not select the button inside the shadow tree. Likewise, the shadow tree's ordinary `button` rule does not select buttons outside the shadow tree.

That means the page's global `button` rule does not simply override the internal button's purple styling. The shadow-tree button is styled by CSS that applies inside its own tree.

Compare the two situations:

**Without Shadow DOM**

```text
Page CSS:       button { background: red }
Widget CSS:     button { background: purple }
DOM:            page and widget elements share the ordinary tree
Risk:            broad selectors may collide
```

**With Shadow DOM**

```text
Page CSS:       button { background: red }
Widget CSS:     button { background: purple }
DOM:            widget button is inside the widget's shadow tree
Result:          ordinary page selector does not select the internal button
```

This is not a claim that *nothing* can ever cross the boundary. Shadow DOM has deliberate exceptions and styling mechanisms, discussed below. The practical rule is that ordinary selectors are scoped by the shadow boundary.

### Does the host itself still receive page styles?

Yes. The host (`#payment-widget`) is an ordinary element in the page's DOM, so page CSS can style it:

```css
#payment-widget {
  display: block;
  margin: 24px;
}
```

This can control the component's position and its outer box. Shadow DOM is not a way to hide the host from the rest of the page; it provides a boundary around the internal tree.

## 10.5 Why document-level queries cannot find the internal button

This is another important part of the concept: Shadow DOM affects DOM traversal as well as styling.

Given the previous example, try:

```js
document.querySelector("#payment-widget button");
```

You might expect it to find the button because the button appears visually inside the payment widget. But it returns `null`.

Why? `document.querySelector()` searches the document's ordinary tree. It does not automatically enter every shadow root it encounters. The internal button belongs to a separate tree.

With an **open** shadow root, query through the host:

```js
const host = document.querySelector("#payment-widget");
const button = host.shadowRoot.querySelector("button");

console.log(button.textContent); // "Pay now"
```

Step by step:

1. `document.querySelector("#payment-widget")` finds the ordinary host.
2. `host.shadowRoot` gives you the open shadow root.
3. `shadowRoot.querySelector("button")` searches inside that shadow tree.
4. The query succeeds because you are searching in the tree that contains the button.

This is a useful debugging rule: if DevTools shows an element under `#shadow-root`, a document-level selector may not find it. Find the host, then query its shadow root if it is open.

## 10.6 Open versus closed shadow roots

When creating a shadow root, you choose a mode:

```js
const root = host.attachShadow({ mode: "open" });
```

or:

```js
const root = host.attachShadow({ mode: "closed" });
```

### Open mode

With `mode: "open"`, outside code that has the host can access the root through `host.shadowRoot`:

```js
host.shadowRoot.querySelector("button");
```

Open mode is often convenient for debugging, integration, and tooling.

### Closed mode

With `mode: "closed"`, `host.shadowRoot` returns `null` to ordinary outside code:

```js
const root = host.attachShadow({ mode: "closed" });

console.log(host.shadowRoot); // null
```

The code that called `attachShadow()` still has the `root` reference returned by that call, so it can work with the tree internally.

### Is closed mode security?

No. Do not use closed mode to protect passwords, payment secrets, authorization decisions, or other sensitive data. It restricts a common access path; it is not a security boundary against code that already runs with sufficient privileges on the page. Security must be enforced through appropriate application and server-side controls, not by hiding a DOM reference.

Choose open or closed mode as an API and encapsulation decision, not as an authentication or data-protection mechanism.

## 10.7 What is isolated—and what is not?

A common oversimplification is: “Shadow DOM completely isolates a component.” A better statement is: **Shadow DOM creates a DOM-tree boundary and scopes ordinary CSS selectors, reducing accidental coupling.**

Some styling behavior is intentionally able to cross or interact with the boundary:

- **Inherited CSS properties:** Certain properties, such as `color` and `font-family`, can inherit from the host into the shadow tree when the internal element does not specify its own value.
- **CSS custom properties:** Variables declared on the host can be consumed inside the shadow tree. This is a common way to make a component themeable.
- **Slots:** A component can define places where content supplied by the page is displayed inside its shadow-tree structure.
- **`::part`:** A component can deliberately expose selected internal elements as styling hooks, allowing outside CSS to style those parts through an explicit interface.
- **JavaScript and events:** Shadow DOM changes tree boundaries and event behavior, but it does not mean the component has no interaction with the rest of the application. Events can cross boundaries, and event retargeting can affect which element outside listeners see as the event target.

For example, a component might intentionally allow the host page to set its accent color:

```css
payment-widget {
  --payment-accent: rebeccapurple;
}
```

Inside the shadow tree:

```css
button {
  background: var(--payment-accent, royalblue);
}
```

The custom property provides a deliberate styling interface. The component still controls its internal markup, while the host page can configure a supported design choice.

This is often a better design than either extreme: exposing every internal detail to the page or refusing all customization.

## 10.8 Shadow DOM, slots, and supplied content

A Web Component may need to provide a reusable frame while letting the consumer supply some content. For example, a reusable card might own its border and spacing but let the page choose the heading.

A **slot** is a placeholder in a shadow tree where light-DOM content can be rendered.

Conceptual example:

```html
<profile-card>
  <span slot="name">Asha</span>
</profile-card>
```

Inside the component's shadow tree, the component could contain:

```html
<div class="card">
  <h2><slot name="name"></slot></h2>
</div>
```

The supplied `span` remains light-DOM content, but the slot allows it to appear at the designated position in the component's rendered composition. This is called **slotting** or **content projection**.

Why is this useful? The component controls its structure and presentation, while consumers can supply content without having to rewrite the component's internals.

Slots are a Web Components concept that works with Shadow DOM; they are not the same thing as React's `props.children`, although they solve a related composition problem.

## 10.9 Shadow DOM versus React components

These concepts are related, but they are not interchangeable.

A **React component** is an application-level abstraction. It helps organize UI into reusable functions or classes, pass data through props, manage state, and describe what should render.

```jsx
function PayButton() {
  return <button className="pay-button">Pay now</button>;
}
```

This component does **not** automatically create a shadow root. By default, its button is rendered into the ordinary DOM managed by React. Global CSS and other styles can affect it according to normal CSS rules.

**Shadow DOM** is a browser platform feature. It creates a separate internal DOM tree and a CSS scoping boundary.

A useful comparison:

| Question | React component | Shadow DOM |
|---|---|---|
| What is it? | UI abstraction in application code | Browser feature for a separate DOM subtree |
| Does it manage React state and props? | Yes, when used in React | Not by itself |
| Does it create a shadow root automatically? | No | It is the feature used to create one |
| Does it scope ordinary CSS selectors? | Not by itself | Yes, across the shadow boundary |
| Can they be used together? | Yes | Yes; React can render into a shadow root |

You might use React for most of your application and still use Shadow DOM for a Web Component that needs to be embedded in unrelated websites or frameworks. Conversely, most ordinary React components do not need Shadow DOM just to be reusable.

## 10.10 Real-world use cases: when would you choose Shadow DOM?

### Use case 1: A third-party widget embedded on many websites

A company provides a customer-support chat widget that other companies embed in their websites. Each host website may have its own global CSS and design system. Shadow DOM can reduce the risk that the host page accidentally restyles the widget's internal buttons, inputs, and layout.

### Use case 2: A reusable design-system component distributed across teams

A component library is used by several teams or even across different frameworks. Shadow DOM can help keep the component's internal styles scoped, so a host application's generic selectors do not unexpectedly change its internal controls.

The trade-off is that the component must provide deliberate styling hooks and integration APIs; encapsulation can make casual overrides less convenient.

### Use case 3: A browser-native-style control or complex custom element

A custom date picker or similar widget may have internal markup that the author wants to keep separate from the page's ordinary DOM traversal and styling. Shadow DOM provides a boundary for that internal implementation.

### When might you not need it?

If you are building a normal React application whose components are all developed and styled within one codebase, regular React components, CSS Modules, scoped naming, or another styling strategy may be sufficient. Shadow DOM adds platform concepts and integration details that may not provide enough benefit for every component.

Do not choose Shadow DOM merely because a component should be reusable. First identify the actual problem: is it accidental CSS leakage, integration across independently developed systems, or a need for Web Components? If not, a normal component abstraction may be simpler.

## 10.11 Common mistakes and misconceptions

**Mistake: “The shadow tree is just a normal child of the host.”**  
It is a separate tree attached through a shadow root. This is why ordinary document traversal does not simply walk into it.

**Mistake: “`document.querySelector()` can find any visible element.”**  
Visibility on screen does not mean the element belongs to the document's ordinary tree. Query the relevant open shadow root.

**Mistake: “Closed mode makes the contents secure.”**  
It does not. It limits `host.shadowRoot` access; it is not a security mechanism.

**Mistake: “No CSS can cross a shadow boundary.”**  
Ordinary selectors are scoped, but inherited properties, CSS custom properties, slots, and explicit styling APIs make the overall model more nuanced.

**Mistake: “React components already use Shadow DOM.”**  
They do not by default. React's component model and the browser's Shadow DOM feature solve different problems.

**Mistake: “Every component should use Shadow DOM.”**  
No. It is most useful when a genuine DOM/CSS encapsulation boundary is valuable enough to justify the extra complexity.

## 10.12 Interview-ready answer

**Question: What is Shadow DOM, and why would you use it?**

A strong answer:

> Shadow DOM is a browser feature that lets an element host a separate internal DOM tree. It is commonly used with Web Components to encapsulate component markup and scope ordinary CSS selectors, reducing accidental styling and DOM coupling between a component and the page that embeds it. For example, a third-party payment widget can keep its internal button styles from being affected by broad global button selectors. The boundary is not absolute: inherited properties and CSS custom properties can still be used for intentional theming, and features such as slots and `::part` provide controlled integration points. Shadow DOM is different from React components, which do not create a shadow root by default.

Likely follow-up questions:

- What are the shadow host, shadow root, and shadow tree?
- Why does `document.querySelector()` not find a button inside a shadow root?
- What is the difference between open and closed mode?
- Is closed Shadow DOM secure?
- How can a host page customize the appearance of a shadow component?
- How is Shadow DOM different from CSS Modules or a React component?
- What are slots used for?

## 10.13 Check your understanding

Try answering these before reading the explanations.

**Question 1:** The page has `button { background: red; }`. A button inside a shadow tree has an internal rule `button { background: purple; }`. Which ordinary selector matches the internal button?

**Answer:** The page's ordinary `button` selector does not cross into the shadow tree. The internal button is styled by applicable rules inside that shadow tree, subject to Shadow DOM's specific styling and inheritance rules.

**Question 2:** Why does `document.querySelector("#payment-widget button")` return `null` when the button is inside the widget's shadow root?

**Answer:** `document.querySelector()` searches the document's ordinary tree; it does not automatically cross into shadow roots. Find the host and query its open `shadowRoot`.

**Question 3:** Does `mode: "closed"` mean the browser encrypts or protects the widget's internal data?

**Answer:** No. It restricts access through `host.shadowRoot`. It is not a security boundary.

**Question 4:** You are building a private React app, and all components are styled by your own team. Should you automatically use Shadow DOM?

**Answer:** No. Identify the problem first. If normal component boundaries and your styling strategy already provide the needed reuse and isolation, Shadow DOM may add complexity without enough benefit.

**Question 5:** If a host page cannot use an ordinary selector to style the internal button, how could the component still let the host choose an accent color?

**Answer:** It can deliberately expose a styling API, such as a CSS custom property consumed inside the shadow tree, or expose a part through `::part`.

### Shadow DOM mental model

Think of the host as the **outer shell** of a component and the shadow tree as its **internal room**. The page can position and style the outer shell. Ordinary page CSS selectors do not walk freely into the internal room, and internal ordinary selectors do not walk freely out. The component can still open deliberate doors—such as custom properties, slots, and `::part`—for supported customization.

# 11. DOM events and event delegation

DOM events are an important part of interacting with elements. A user clicks a button, types into an input, submits a form, or presses a key; the browser dispatches events that JavaScript can handle.

## 11.1 Adding and removing listeners

```js
function handleClick(event) {
  console.log("Clicked", event.currentTarget);
}

const button = document.querySelector("#save");
button?.addEventListener("click", handleClick);

// Later, if needed:
button?.removeEventListener("click", handleClick);
```

For removal, the event type, callback function reference, and relevant options must match. This is why a named function can be easier to clean up than a new anonymous function.

This will not remove the original listener:

```js
button.addEventListener("click", () => console.log("clicked"));
button.removeEventListener("click", () => console.log("clicked"));
```

Those two arrow expressions create different function objects.

## 11.2 Event bubbling

Many events bubble from the target element up through its ancestors.

```html
<div id="parent">
  <button id="child">Click</button>
</div>
```

```js
document.querySelector("#parent").addEventListener("click", () => {
  console.log("Parent handler");
});

document.querySelector("#child").addEventListener("click", () => {
  console.log("Child handler");
});
```

Clicking the button typically logs the child handler first, then the parent handler as the event bubbles upward.

Useful event properties:
- `event.target`: the element where the event originated (or the relevant retargeted target at a boundary).
- `event.currentTarget`: the element whose listener is currently executing.

These can differ. In a delegated listener on a list, `target` may be a nested icon while `currentTarget` is the list.

## 11.3 Event delegation

Suppose you render 1,000 buttons. You could attach a separate listener to every button, or attach one listener to a common parent and inspect which child was clicked.

```html
<ul id="tasks">
  <li><button data-action="complete" data-id="1">Complete</button></li>
  <li><button data-action="complete" data-id="2">Complete</button></li>
</ul>
```

```js
const list = document.querySelector("#tasks");

list.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const button = target.closest('button[data-action="complete"]');

  if (!button || !list.contains(button)) return;

  console.log("Complete task:", button.dataset.id);
});
```

Why this works:
1. The click bubbles up to the list.
2. The listener examines the originating target.
3. `closest()` finds the relevant button, even if the user clicked a nested icon inside it.
4. The containment check ensures the button belongs to the intended list.

Event delegation can reduce the number of listeners and works well for children inserted later. It is not automatically better for every event: not every event bubbles, and delegation can add selector logic. Use it when it simplifies a collection of similar interactive children.

---

# 12. DOM changes and browser rendering

A DOM mutation can affect what the browser needs to display. To understand performance, connect DOM operations to the rendering pipeline.

A simplified model:

```text
DOM + CSSOM
    ↓
Style calculation
    ↓
Layout (geometry)
    ↓
Paint (drawing instructions)
    ↓
Compositing (combine layers)
    ↓
Pixels on screen
```

Not every mutation triggers every stage. The browser tries to do only the necessary work and may defer it until rendering is needed.

## 12.1 Style calculation

The browser determines which CSS rules apply to elements and computes the resulting styles.

Changing a class can change which rules match:

```js
element.classList.add("expanded");
```

If `.expanded` changes color only, the browser may need style recalculation and paint but not necessarily layout. If it changes width, height, font size, or another geometry-affecting property, layout may also be required.

## 12.2 Layout

Layout determines the size and position of elements. A change to content, font, width, or display can affect geometry.

Examples of properties that often affect layout include `width`, `height`, `margin`, `padding`, `font-size`, and `display`. The full effect depends on the document and CSS rules.

## 12.3 Paint and compositing

- **Paint** determines how elements should be drawn: text, backgrounds, borders, shadows, and so on.
- **Compositing** combines painted layers into the final display.

Some visual changes can be handled largely during compositing, but don't assume that a particular CSS property is guaranteed to be "GPU-only" in every browser and scenario.

## 12.4 A useful rule: mutation cost is downstream work too

A DOM operation is not costly only because of the JavaScript line itself. It can invalidate information the browser uses for styling or layout. When diagnosing slowness, consider both:
- JavaScript time to create/query/mutate nodes;
- rendering work caused by those changes.

A page with thousands of unnecessary nodes may also cost more to style, lay out, and paint. Reducing unnecessary DOM and rendering work can matter more than micro-optimizing a selector.

---

# 13. Layout thrashing and forced synchronous layout

One of the most useful DOM performance concepts is **layout thrashing**: repeatedly alternating between changes that invalidate layout and reads that require up-to-date layout information.

## 13.1 Why can reading a value cause work?

Suppose JavaScript changes an element's width. The browser may defer layout until it needs the result. If JavaScript immediately asks for a geometry value such as `offsetWidth`, the browser may have to calculate layout synchronously so it can return a correct answer.

Example:

```js
element.style.width = "500px";
const width = element.offsetWidth;
```

The read is not inherently bad. The problem is when this pattern is repeated many times, causing the browser to repeatedly update layout information.

## 13.2 The bad pattern

```js
const items = document.querySelectorAll(".item");

for (const item of items) {
  item.style.width = "200px";      // write: may invalidate layout
  console.log(item.offsetWidth);   // read: may force layout
}
```

For a large number of elements, the browser may have to recalculate layout repeatedly as the loop alternates between writes and reads.

## 13.3 A better pattern: group reads and writes

```js
const items = [...document.querySelectorAll(".item")];

// Read phase
const widths = items.map((item) => item.offsetWidth);

// Write phase
for (const item of items) {
  item.style.width = "200px";
}
```

This example demonstrates the structure rather than a universal solution; if the widths need to be measured after a particular change, the algorithm must preserve that requirement. The broader principle is to avoid forcing the browser to recalculate layout between every mutation.

A practical pattern is:

```text
Read the layout values you need
             ↓
Calculate in JavaScript
             ↓
Apply DOM/style changes in a batch
```

For animation-heavy work, `requestAnimationFrame()` can help coordinate visual updates with the browser's rendering cycle. It does not magically make every DOM operation fast; you still need to avoid unnecessary forced layouts.

## 13.4 Common layout-sensitive reads

These can require current layout information depending on circumstances:

- `offsetWidth`, `offsetHeight`;
- `clientWidth`, `clientHeight`;
- `getBoundingClientRect()`;
- some uses of `getComputedStyle()`.

The important phrase is **can require**. The browser may already have up-to-date data, so don't assume every read forces layout every time. Profiling helps establish whether forced layout is happening.

---

# 14. Performance principles for DOM-heavy interfaces

When an interface feels slow, don't immediately assume `querySelector()` is the problem. Start with the work being performed.

## 14.1 Avoid unnecessary nodes

A table with 20,000 rendered rows can be expensive because the browser has to manage, style, and lay out a large tree. Depending on the UI, pagination or virtualization may help. Virtualization renders only the visible region (plus a buffer) rather than every row at once.

## 14.2 Avoid repeated global work

Bad:

```js
for (const item of data) {
  const container = document.querySelector("#container");
  // ...
}
```

Clearer:

```js
const container = document.querySelector("#container");

for (const item of data) {
  // Reuse the known reference.
}
```

This is mainly about avoiding needless repeated work and making intent clearer—not a claim that every selector call is expensive.

## 14.3 Batch where it helps

Build related nodes before inserting them when it improves the code or measured performance. `DocumentFragment` is one option. Another is updating a parent in a controlled way, depending on the task and framework.

## 14.4 Avoid layout thrashing

Group geometry reads and style writes where possible. If you must measure after changing styles, make that dependency explicit and minimize repeated read/write alternation.

## 14.5 Measure rather than guess

Useful tools include:
- Chrome DevTools **Performance** panel for scripting, style recalculation, layout, and paint;
- **Elements** panel for inspecting DOM structure and computed styles;
- **Rendering** tools for visualizing layout shifts or paint activity;
- performance recordings around the specific user action that feels slow.

A senior-level answer starts with measurement, identifies the expensive stage, and chooses a fix based on evidence.

---

# 15. DOM and React: who owns the rendered elements?

React lets you describe UI declaratively. Instead of manually creating and updating every DOM node, you describe the desired UI based on props and state, and React coordinates updates to the real DOM.

## 15.1 Declarative versus imperative

Imperative DOM manipulation says:

```js
const heading = document.querySelector("h1");
heading.textContent = "Updated";
```

You explicitly tell the browser what to change.

Declarative React says:

```jsx
function Greeting() {
  const [name, setName] = useState("Alex");

  return <h1>Hello, {name}</h1>;
}
```

You describe what the UI should look like for the current state. When state changes, React updates the rendered result.

Neither style is universally bad. Imperative APIs are useful for browser capabilities such as focus, selection, measurement, and integration with non-React libraries. The key is to avoid having two independent systems fight over the same DOM subtree.

## 15.2 Why manual mutations can conflict with React

Imagine React renders:

```jsx
function Panel() {
  return <div className="panel">Hello</div>;
}
```

Then outside React you run:

```js
document.querySelector(".panel").remove();
```

React's own state and rendering logic still describe a panel that should exist. A later React render may recreate or update it in ways that make the manual mutation surprising. Direct changes can also be overwritten because they were not represented in React state.

General rule: **let React manage the DOM it renders**. Do not manually remove or rewrite React-owned elements as an alternative to updating state.

## 15.3 When refs are appropriate

Refs give you a reference to a DOM node for imperative operations that React does not express directly.

```jsx
import { useRef } from "react";

function SearchBox() {
  const inputRef = useRef(null);

  function focusInput() {
    inputRef.current?.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus search</button>
    </>
  );
}
```

Here React still renders and owns the input. The ref is used for the specific browser operation of moving focus.

Other legitimate uses include:
- measuring an element with `getBoundingClientRect()`;
- scrolling an element into view;
- integrating a third-party imperative widget;
- managing text selection or a canvas;
- attaching an observer when observing an external system is necessary.

## 15.4 Effects and cleanup

When an effect attaches an event listener or creates an observer, clean it up when the component no longer needs it.

```jsx
import { useEffect, useRef } from "react";

function WatchedPanel() {
  const panelRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const observer = new MutationObserver((records) => {
      console.log("Observed mutations:", records.length);
    });

    observer.observe(panel, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <div ref={panelRef}>Panel content</div>;
}
```

This example is appropriate when you genuinely need to observe DOM mutations. If the same component itself controls the data and rendering, React state is usually the better source of truth than observing the resulting DOM.

---

# 16. DOM security and safe content insertion

DOM APIs can be security-sensitive when they interpret strings as markup or executable content.

## 16.1 Text versus markup

Use `textContent` when inserting plain text:

```js
element.textContent = userComment;
```

Be careful with APIs that parse strings as HTML, especially `innerHTML`, when the string contains user-controlled data:

```js
element.innerHTML = userComment; // dangerous if untrusted HTML is not sanitized
```

This is a common route to cross-site scripting (XSS): malicious input becomes active markup or script-triggering content in the page.

## 16.2 Avoid simplistic "sanitization"

Replacing only `<` or `>` manually is not a reliable general-purpose HTML sanitizer. If the requirement is rich user-generated HTML, use a maintained sanitizer and configure the permitted elements and attributes for the product's needs.

## 16.3 Other safe habits

- Prefer text APIs when you need text.
- Validate URLs before placing untrusted values into navigation or resource attributes.
- Be cautious with event-handler attributes and untrusted strings.
- Treat third-party HTML as untrusted unless its trust and sanitization are established.
- Use the browser's security mechanisms (including a correctly configured Content Security Policy) as defense in depth, not as a substitute for safe DOM handling.

---

# 17. Common misconceptions to correct

### "The DOM is the HTML source."

No. The DOM is the parsed, in-memory object representation. Parsing can normalize or repair markup, and JavaScript can change the DOM without changing the original response text.

### "Every child is an element."

No. `childNodes` can include text and comment nodes, including whitespace text nodes.

### "`querySelector()` is always slow and `getElementById()` is always fast."

This is an unhelpful absolute. They have different purposes, and browsers optimize lookups. Use the clear API and profile if lookups are genuinely a bottleneck.

### "`DocumentFragment` always makes insertion much faster."

No. It provides a useful construction pattern and may help for some workloads. Modern browser optimizations mean the speedup is not guaranteed.

### "MutationObserver is synchronous."

No. Mutation records are queued and callbacks run asynchronously at a microtask checkpoint.

### "Closed Shadow DOM is secure."

No. Closed mode restricts the normal `host.shadowRoot` access path; it is not a security boundary against sufficiently privileged code.

### "Every DOM mutation triggers a complete layout and repaint."

No. The browser invalidates and recalculates the work needed for the particular change. Some changes require more rendering work than others.

### "React means there is no DOM."

No. React renders to the real DOM in the browser. React provides an abstraction for describing and updating UI.

---

# 18. Worked example: build a list safely

This example brings together querying, creating elements, text insertion, and batching.

```html
<ul id="results"></ul>
```

```js
const results = document.getElementById("results");

const names = [
  "Understand DOM nodes",
  "Practice selectors",
  "Learn event delegation"
];

const fragment = document.createDocumentFragment();

for (const name of names) {
  const li = document.createElement("li");
  li.textContent = name;
  fragment.append(li);
}

results.append(fragment);
```

Walkthrough:

1. Find the existing list.
2. Create a fragment that is not yet part of the visible document tree.
3. For each item, create an `li` element.
4. Assign the label through `textContent`, so the value is text rather than parsed HTML.
5. Append each item to the fragment.
6. Append the fragment to the list, moving its children into the live DOM.

If `names` contained a string like `"<img src=x onerror=alert(1)>"`, `textContent` would show it as text rather than interpreting it as an image element.

For a short list, direct appends would also be reasonable. The fragment is shown to demonstrate a clean batching pattern, not to promise a universal performance improvement.

---

# 19. Worked example: remove matching items safely

Suppose you need to remove every element with class `completed`.

```js
const completedItems = document.querySelectorAll(".completed");

completedItems.forEach((item) => {
  item.remove();
});
```

This works well because `querySelectorAll()` returns a static `NodeList`. Its membership does not change as each item is removed.

If instead you use a live collection:

```js
const completedItems = document.getElementsByClassName("completed");
```

then removing elements changes the collection as you iterate. Copy it first:

```js
const completedItems = [
  ...document.getElementsByClassName("completed")
];

for (const item of completedItems) {
  item.remove();
}
```

The lesson is not that one selector is universally better. It is that **the collection's live/static behavior affects how you should safely iterate while mutating the DOM**.

---

# 20. Interview questions with answer frameworks

These answers are starting points. Understand the reasoning so you can adapt them to follow-up questions.

## Q1. What is the DOM?

**Answer:** The DOM is the browser's object representation of a document. The HTML parser builds a tree of nodes such as elements and text nodes. JavaScript can query and modify that tree through DOM APIs, and the browser updates the affected rendering work as needed.

**Possible follow-up:** Is the DOM identical to the HTML source?

**Answer:** No. The parser can normalize or repair markup, and scripts can mutate the DOM after parsing.

## Q2. What is the difference between a node and an element?

**Answer:** A node is the general DOM concept. An element is one node type representing markup such as a `div` or `button`. Text, comments, the document, and document fragments are also nodes.

## Q3. What is the difference between `children` and `childNodes`?

**Answer:** `children` returns element children. `childNodes` returns all child nodes, including text and comment nodes. Whitespace in the HTML source can create text nodes, so the first item in `childNodes` is not guaranteed to be an element.

## Q4. What is the difference between `querySelector()` and `querySelectorAll()`?

**Answer:** `querySelector()` returns the first matching element or `null`. `querySelectorAll()` returns a static `NodeList` containing all matching elements at the time of the query.

## Q5. What is the difference between a live and a static collection?

**Answer:** A live collection updates its membership as the DOM changes; a static collection does not. This matters when modifying nodes while iterating, because removing an item can shift indexes in a live collection. Copying a live collection to an array gives you stable membership for the loop.

## Q6. Is `getElementById()` faster than `querySelector()`?

**Answer:** It is specialized for ID lookup, while `querySelector()` accepts general CSS selectors. I would use the API that communicates intent clearly. I would profile before treating the difference as a meaningful bottleneck.

## Q7. What is a `DocumentFragment`?

**Answer:** It is a lightweight container for a group of nodes. I can build a subtree inside the fragment and then insert its children into the document together. This can make batch construction cleaner and may help some workloads, but I would not claim it is always faster.

## Q8. What is `MutationObserver`?

**Answer:** It asynchronously reports configured DOM mutations, such as child additions/removals, attribute changes, or text changes. It is useful when I need to observe changes made by another system. I would configure it narrowly and disconnect it when it is no longer needed.

## Q9. What is Shadow DOM?

**Answer:** Shadow DOM provides an encapsulated subtree attached to a host element. It is commonly used by Web Components to reduce unintended coupling between component internals and the surrounding document, especially for DOM structure and CSS.

## Q10. What is layout thrashing?

**Answer:** Layout thrashing occurs when code repeatedly changes layout-affecting styles and then reads geometry that requires up-to-date layout. Those reads can force synchronous layout calculations. I would try to group reads and writes, then use performance tools to confirm the issue.

## Q11. Why should React generally own the DOM it renders?

**Answer:** React maintains its own model of the UI based on props and state. If other code independently removes or rewrites React-managed nodes, the actual DOM can diverge from what React expects, and later renders can overwrite or conflict with those changes. I use refs for focused imperative needs such as focusing or measuring an element.

## Q12. How would you investigate a slow DOM-heavy page?

**Answer framework:**
1. Reproduce the slow interaction.
2. Record it in the Performance panel.
3. Determine whether time is spent in JavaScript, style recalculation, layout, paint, or other work.
4. Inspect whether the DOM is unnecessarily large or updates are repeated.
5. Look for forced layout caused by alternating writes and geometry reads.
6. Make one targeted change and profile again to verify the result.

---

# 21. Practice exercises

Try each exercise before reading the suggested approach. The goal is to connect APIs to behavior rather than memorize definitions.

## Exercise 1: Inspect the tree

Given:

```html
<div id="sample">
  Hello
  <strong>DOM</strong>
  <!-- note -->
</div>
```

Predict:
1. What does `sample.children.length` return?
2. How does that differ from `sample.childNodes.length`?
3. Why might whitespace affect the second answer?

**Suggested approach:** `children` counts element children. `childNodes` includes text nodes for text and whitespace, the `strong` element, and the comment node. Count the actual nodes produced by the markup rather than assuming every line is an element.

## Exercise 2: Explain the output

```js
const all = document.querySelectorAll(".item");
const live = document.getElementsByClassName("item");

const div = document.createElement("div");
div.className = "item";
document.body.append(div);

console.log(all.length);
console.log(live.length);
```

**Suggested approach:** `all` is static and retains the earlier number of matches. `live` reflects the new matching element.

## Exercise 3: Find the bug

```js
const items = document.getElementsByClassName("remove-me");

for (let i = 0; i < items.length; i++) {
  items[i].remove();
}
```

**Suggested approach:** The collection is live. Removing one element shifts later items and can cause elements to be skipped. Copy the collection to an array first, or use a static query result.

## Exercise 4: Choose a safe API

You want to display a username supplied by a user. Should you use `textContent` or `innerHTML`?

**Suggested approach:** Use `textContent` if the value is plain text. `innerHTML` parses markup and can create an injection vulnerability if untrusted content is inserted without appropriate sanitization.

## Exercise 5: Diagnose a performance pattern

```js
for (const card of document.querySelectorAll(".card")) {
  card.style.width = "300px";
  console.log(card.getBoundingClientRect().width);
}
```

**Suggested approach:** This alternates a style write with a geometry read. Depending on browser state and the changes, the read can force layout. Consider whether you need to measure after every write and whether reads and writes can be grouped without changing the required behavior.

## Exercise 6: Decide whether MutationObserver is appropriate

A React component knows exactly when its `items` state changes. Should it observe its own rendered DOM to figure out when the list changes?

**Suggested approach:** Usually not. The component already has the source of truth in React state. Use a mutation observer when you need to observe external or otherwise imperative DOM changes.

---

# 22. A practical DOM debugging checklist

When code that interacts with the DOM behaves unexpectedly, ask:

1. **Does the element exist yet?** Check script timing and whether the selector is correct.
2. **Could the query return `null`?** Handle expected absence, and investigate unexpected absence.
3. **Am I selecting in the correct tree?** Document-level queries do not automatically cross into a shadow root.
4. **Am I assuming every node is an element?** `childNodes` includes text and comments.
5. **Is this collection live?** Its membership may change during a loop.
6. **Am I replacing children with `innerHTML`?** This reparses markup and removes existing descendants.
7. **Is the inserted content untrusted?** Use text APIs or a suitable sanitizer.
8. **Who owns this DOM?** Avoid competing mutations with a framework such as React.
9. **Am I forcing layout repeatedly?** Look for alternating style writes and geometry reads.
10. **Have I measured the actual bottleneck?** Use DevTools rather than guessing.

---

# 23. Final mental model

Keep this sequence in mind:

```text
HTML source
    ↓
HTML parser
    ↓
DOM tree of node objects
    ↓
JavaScript queries, traverses, and modifies nodes
    ↓
Browser determines which style/layout/paint work is needed
    ↓
Updated pixels appear on screen
```

The most useful principles are:

- **Structure:** The DOM is a tree, and elements are only one kind of node.
- **Selection:** Use the right lookup API and account for `null`.
- **Collections:** Know whether a collection is live or static before mutating while iterating.
- **Mutation:** Create, insert, move, replace, and remove nodes deliberately.
- **Safety:** Treat plain text as text; don't casually interpret untrusted strings as HTML.
- **Batching:** `DocumentFragment` can make grouped construction clearer, but measure performance claims.
- **Observation:** Use `MutationObserver` for external DOM changes, configure it narrowly, and clean it up.
- **Encapsulation:** Shadow DOM gives Web Components a separate subtree and styling boundary, not a security wall.
- **Performance:** DOM changes can trigger downstream rendering work; repeated forced layout is often more important than tiny selector differences.
- **Framework ownership:** In React, let React manage the DOM it renders and use refs for focused imperative tasks.

## The one question to ask when solving a DOM problem

> **What part of the DOM am I trying to find or change, what assumptions am I making about its nodes and collections, and what additional browser work might that change trigger?**
