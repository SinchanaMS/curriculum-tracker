# Garbage Collection

## Why Learn Garbage Collection?

JavaScript manages memory automatically. When you create objects, arrays, functions, DOM nodes, closures, and other values, the JavaScript engine allocates memory for them.

You normally don't write code like:

```c
free(object);
```

Instead, the JavaScript engine has a **Garbage Collector (GC)** that determines which objects are no longer reachable and can safely have their memory reclaimed.

Understanding garbage collection is important because **automatic memory management does not mean memory leaks are impossible**.

You can still accidentally keep objects alive for much longer than intended.

This matters especially in frontend applications because long-running applications such as dashboards, SPAs, editors, and admin tools can stay open for hours or days.

Understanding GC helps you:

- understand why objects are eventually freed
- understand what "reachable" means
- recognize memory leaks
- understand closures and event listeners more deeply
- use `WeakMap`, `WeakSet`, `WeakRef`, and `FinalizationRegistry` correctly
- diagnose growing memory usage in Chrome DevTools
- reason about React component cleanup
- answer frontend performance interview questions

> **Key question:** How does JavaScript decide that an object is no longer needed?

The answer is primarily based on **reachability**.

---

# 1. What Is Garbage Collection?

Garbage Collection is the process by which the JavaScript engine identifies objects that are no longer reachable and reclaims the memory associated with them.

For example:

```javascript
function createUser() {
  const user = {
    name: "Alice",
    age: 25
  };

  return user;
}

const user = createUser();

console.log(user.name);

```

At this point, the object is reachable through `user`.

If later:

```javascript
let user = createUser();

user = null;
```

there is no longer a reference from your JavaScript program to that object.

The object becomes **unreachable**.

The important distinction is:

```text
Unreachable
    ↓
Eligible for garbage collection
    ↓
May eventually be collected
```

It does **not** mean:

```text
Unreachable
    ↓
Immediately deleted from memory
```

GC timing is controlled by the JavaScript engine.

---

# 2. Automatic Memory Management

A simplified memory lifecycle looks like this:

```text
        Your JavaScript code
                │
                ▼
       ┌─────────────────┐
       │ Allocate memory │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Objects remain  │
       │ reachable       │
       └────────┬────────┘
                │
                ▼
       Object becomes
       unreachable
                │
                ▼
       ┌─────────────────┐
       │ Garbage         │
       │ Collector       │
       └────────┬────────┘
                │
                ▼
       Memory can be
       reclaimed
```

You control **references**.

The engine controls **collection**.

That distinction is important.

---

# 3. Reachability — The Core Concept

The most important concept in garbage collection is:

> **An object can be garbage collected when it is no longer reachable from the GC's roots.**

Think of memory as a graph.

Objects are nodes.

References are edges.

```text
Root
 │
 ▼
Object A
 │
 ├──────► Object B
 │           │
 │           ▼
 │        Object C
 │
 └──────► Object D
```

Everything reachable by following references from a root is considered reachable.

If an object has no path from any root:

```text
Root
 │
 ▼
Object A ───► Object B

Object X ───► Object Y
```

`X` and `Y` are unreachable.

They are candidates for garbage collection.

---

# 4. What Are GC Roots?

A **GC root** is something the garbage collector starts from when determining reachability.

The exact implementation details vary between JavaScript engines, but conceptually roots include things such as:

- global objects and globally reachable state
- currently executing JavaScript contexts
- active stack references
- certain engine/runtime structures
- live references maintained by the host environment

A useful mental model is:

```text
                  GC ROOTS
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
       Global     Active      Runtime /
       state      execution   host refs
          │          │
          └────┬─────┘
               ▼
          Reachable objects
```

You don't need to memorize every internal root used by V8.

For interviews, the important idea is:

> GC starts from roots and follows references. Objects that cannot be reached from those roots are eligible for collection.

---

# 5. Reachability Example

Consider:

```javascript
let user = {
  name: "Alice"
};

let admin = {
  user: user
};
```

The reference graph is roughly:

```text
Global scope
     │
     ├──────► user ──────► { name: "Alice" }
     │
     └──────► admin ─────► { user: ... }
```

Now:

```javascript
user = null;
```

You might initially think the user object can now be collected.

But it is still reachable:

```text
Global scope
     │
     └──────► admin ─────► user object
```

So the object stays alive.

Only after:

```javascript
admin = null;
```

does the object become unreachable.

This is why simply setting one variable to `null` does not necessarily make an object collectible.

---

# 6. Reachability vs Reference Count

A common beginner mistake is to think:

> "If nothing obvious is pointing to an object, it must be deleted."

The engine instead reasons about whether there is **a path from a root**.

This is why cycles can be handled by tracing garbage collectors.

For example:

```javascript
const a = {};
const b = {};

a.other = b;
b.other = a;
```

The objects reference each other:

```text
a ─────► b
▲        │
└────────┘
```

If nothing else references them, they are still a cycle — but there is no path from a GC root.

Therefore:

```text
No root
  ↓
No path to a/b
  ↓
Unreachable
  ↓
Eligible for GC
```

This becomes especially important when comparing mark-and-sweep with historical reference counting.

---

# 7. Mark-and-Sweep

Modern JavaScript engines use **tracing garbage collection**, with mark-and-sweep as a fundamental concept.

The simplified algorithm has two major phases:

```text
1. MARK
2. SWEEP
```

## Phase 1: Mark

The collector starts from GC roots.

It follows references and marks every reachable object.

Example:

```text
Root
 │
 ▼
 A ─────► B
 │
 ▼
 C

 D ─────► E
```

The collector marks:

```text
Root → A ✓ → B ✓
       │
       └──→ C ✓

D → E
```

`D` and `E` are not reachable from a root.

They remain unmarked.

---

## Phase 2: Sweep

The collector goes through memory and reclaims objects that were not marked.

```text
Before:

[A ✓] [D ×] [B ✓] [E ×] [C ✓]

After:

[A] [free] [B] [free] [C]
```

So the simplified model is:

```text
GC roots
   │
   ▼
MARK
Find everything reachable
   │
   ▼
SWEEP
Reclaim unreachable objects
```

Real engines perform many optimizations around this basic idea.

---

# 8. Does Garbage Collection Happen in Exactly Two Steps?

Not in a real modern JavaScript engine.

"Mark and sweep" is a useful conceptual model.

Real engines use sophisticated strategies such as:

- generational collection
- incremental collection
- concurrent work
- compaction
- write barriers
- remembered sets
- different strategies for different heap regions

So in an interview, avoid saying:

> "JavaScript always does exactly mark, then sweep."

A better answer is:

> "JavaScript engines use tracing garbage collection. Mark-and-sweep is the fundamental model: determine which objects are reachable from roots and reclaim unreachable objects. Modern engines optimize this using techniques such as generational, incremental, and concurrent collection."

---

# 9. Generational Garbage Collection

One of the most important optimizations is **generational GC**.

The idea is based on an empirical observation:

> **Most objects die young.**

For example:

```javascript
function calculateTotal(items) {
  const filtered = items.filter(...);
  const mapped = filtered.map(...);
  const result = { total: ... };

  return result;
}
```

Several temporary arrays and objects may be created.

Many of them become unreachable shortly after the function finishes.

It would be inefficient to scan the entire heap every time.

So engines divide memory into generations/regions with different collection strategies.

A simplified mental model:

```text
                 JavaScript Heap
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
   Young / New objects       Old / Long-lived objects
          │                         │
          ▼                         ▼
     Collected often           Collected less often
```

---

# 10. Young Generation

Newly allocated objects generally begin in a young area.

Many objects die quickly:

```javascript
function process() {
  const temp = {
    value: 123
  };

  // use temp
}
```

After the function finishes, `temp` may no longer be reachable.

Collecting these short-lived objects frequently can be efficient.

This is often called **minor GC** or, in V8 terminology, a **scavenge** for the young generation.

Conceptually:

```text
New object
    │
    ▼
Young generation
    │
    ├── dies quickly ──► collected
    │
    └── survives
             │
             ▼
       promoted / tenured
```

---

# 11. Old Generation

Objects that survive multiple collections may eventually be promoted to an older generation.

Examples might include:

- long-lived application state
- caches
- objects referenced by global state
- long-lived data structures

These objects are assumed to have longer lifetimes.

Therefore, collection of old-generation memory generally happens less frequently and can involve more work.

The important mental model is:

```text
Young generation
→ collect frequently

Old generation
→ collect less frequently
```

Do not treat this as a rigid rule that every object follows in exactly the same way. The actual implementation is engine-specific.

---

# 12. Why Generational GC Helps

Imagine an application has:

```text
10,000,000 total objects

9,500,000 are short-lived
500,000 are long-lived
```

If the engine had to repeatedly analyze everything, collection could be expensive.

Instead, it can focus more frequently on the region where many objects are likely to have died.

This is one reason JavaScript can efficiently handle large numbers of temporary allocations.

---

# 13. Reference Counting — Historical Approach

An older memory-management strategy is **reference counting**.

The idea is simple:

> Keep track of how many references point to each object.

Example:

```javascript
let obj1 = {
  data: "hello"
};
```

Conceptually:

```text
Object
  ↑
  │
obj1

Reference count = 1
```

Then:

```javascript
let obj2 = obj1;
```

Now:

```text
obj1 ──┐
       ├──► Object
obj2 ──┘

Reference count = 2
```

Then:

```javascript
obj1 = null;
```

The count becomes:

```text
Reference count = 1
```

Finally:

```javascript
obj2 = null;
```

The count becomes:

```text
Reference count = 0
```

The object can be reclaimed.

---

# 14. The Problem With Reference Counting: Cycles

Reference counting struggles with circular references.

```javascript
function createCycle() {
  const a = {};
  const b = {};

  a.other = b;
  b.other = a;
}

createCycle();
```

The relationship is:

```text
a ─────► b
▲        │
└────────┘
```

Even after `createCycle()` returns, `a` and `b` reference each other.

Their internal reference counts may still be greater than zero.

But neither is reachable from the outside world.

```text
GC roots

   ✕

   a ◄────► b

No path from a root
```

A tracing collector can recognize that the entire cycle is unreachable.

This is one of the key advantages of reachability-based GC.

---

# 15. Common Memory Leak Patterns

Garbage collection prevents you from having to manually free ordinary unreachable objects.

But it **cannot know that you intended to stop using an object if your program still keeps a reference to it**.

This is the heart of most JavaScript memory leaks:

```text
You no longer need object
          │
          ▼
But some reference still exists
          │
          ▼
Object is still reachable
          │
          ▼
GC cannot collect it
```

Let's look at common patterns.

---

# 16. Memory Leak Pattern #1: Forgotten Timers

Consider:

```javascript
function startPolling() {
  const data = new Array(1000000).fill("data");

  setInterval(() => {
    console.log(data.length);
  }, 1000);
}
```

The callback closes over `data`.

The interval keeps the callback registered.

The callback keeps the closure/environment alive.

The closure keeps `data` reachable.

Conceptually:

```text
Timer
  │
  ▼
Callback
  │
  ▼
Closure
  │
  ▼
Large data
```

Even if `startPolling()` has finished, `data` can remain alive.

## Fix

Store the timer ID:

```javascript
function startPolling() {
  const data = new Array(1000000).fill("data");

  const intervalId = setInterval(() => {
    console.log(data.length);
  }, 1000);

  return () => {
    clearInterval(intervalId);
  };
}

const stopPolling = startPolling();

// Later
stopPolling();
```

The important principle is:

> **Anything you start that has a lifecycle should generally have corresponding cleanup.**

This applies to:

- `setInterval`
- `setTimeout` when long-lived or no longer needed
- subscriptions
- observers
- event listeners
- WebSocket connections

---

# 17. Memory Leak Pattern #2: Detached DOM Nodes

A DOM node can be removed from the document but still remain in JavaScript memory.

For example:

```javascript
let detachedNode;

function createAndRemove() {
  const div = document.createElement("div");

  document.body.appendChild(div);

  detachedNode = div;

  document.body.removeChild(div);
}
```

The DOM no longer contains `div`.

But:

```text
JavaScript variable
       │
       ▼
    <div>
       X
       │
       └── not connected to document
```

The node is **detached**, but still reachable through `detachedNode`.

Therefore GC cannot collect it.

If the node is no longer needed:

```javascript
detachedNode = null;
```

Now, assuming there are no other references:

```text
No root
  ↓
Detached node becomes unreachable
  ↓
Eligible for GC
```

### Important nuance

Removing a DOM node does **not automatically mean there is a leak**.

A detached node can be perfectly harmless if nothing retains it.

The leak is:

> **A detached object remains reachable through an unintended reference.**

---

# 18. Memory Leak Pattern #3: Event Listener Leaks

Event listeners are a very common source of leaks in long-running web applications.

Consider:

```javascript
class Component {
  constructor() {
    this.data = new Array(10000).fill("data");

    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  handleResize() {
    console.log(this.data.length);
  }
}
```

Suppose:

```javascript
let component = new Component();

component = null;
```

You might think the component is gone.

But the listener is still registered on `window`.

The listener's callback can keep references to the component alive.

Conceptually:

```text
window
  │
  ▼
event listener
  │
  ▼
callback / closure
  │
  ▼
component
  │
  ▼
large data
```

The component remains reachable.

---

# 19. Event Listener Cleanup

The listener should be removed when the component is no longer needed.

One safe pattern is to keep the exact function reference:

```javascript
class Component {
  constructor() {
    this.data = new Array(10000).fill("data");

    this.handleResize = this.handleResize.bind(this);

    window.addEventListener("resize", this.handleResize);
  }

  handleResize() {
    console.log(this.data.length);
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
  }
}
```

Then:

```javascript
const component = new Component();

component.destroy();
```

The important API rule is:

```javascript
addEventListener(type, handler);
removeEventListener(type, handler);
```

The handler reference needs to match.

This will **not** work:

```javascript
window.addEventListener("resize", () => {
  console.log("resize");
});

window.removeEventListener("resize", () => {
  console.log("resize");
});
```

Those are two different function objects.

---

# 20. React Connection: Event Listener Cleanup

The same principle appears in React:

```javascript
useEffect(() => {
  const handleResize = () => {
    console.log(window.innerWidth);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

The cleanup function runs when the effect is torn down.

This is not specifically a "React garbage collection feature."

React is simply giving you a lifecycle point where you can remove the reference that would otherwise keep resources or callbacks alive.

The browser/JavaScript engine still performs the actual memory management.

---

# 21. Memory Leak Pattern #4: Closures Holding References

Closures are not inherently memory leaks.

They become a problem when a long-lived closure retains data that no longer needs to be kept.

Example:

```javascript
function createHandler() {
  const largeData = new Array(1000000).fill("data");

  return function handler() {
    console.log(largeData.length);
  };
}

const handler = createHandler();
```

The returned function retains access to its lexical environment.

Conceptually:

```text
handler
   │
   ▼
closure environment
   │
   ▼
largeData
```

As long as `handler` remains reachable, `largeData` may remain reachable too.

---

# 22. The Important Lesson About Closures

Do not memorize:

> "Closures cause memory leaks."

That is incorrect.

Closures are a normal and essential JavaScript feature.

The correct statement is:

> **A long-lived closure can retain references to values that it closes over. If those values are large or no longer needed, the closure can contribute to memory retention.**

For example:

```javascript
function createHandler() {
  const largeData = new Array(1000000).fill("data");
  const length = largeData.length;

  return function handler() {
    console.log(length);
  };
}
```

The intention here is to retain only what the callback actually needs.

However, don't assume that rewriting code this way always guarantees a particular engine-level memory layout. JavaScript engines perform their own optimizations.

The practical principle is:

> Avoid unnecessarily retaining large object graphs in long-lived closures.

---

# 23. Memory Leak Pattern #5: Global References

Global objects live for a very long time.

If you put data on global state, it may remain reachable for the lifetime of the page.

For example:

```javascript
window.cache = {};

function addData(id, data) {
  window.cache[id] = data;
}
```

If entries are continually added and never removed:

```text
window
  │
  ▼
cache
  │
  ├──► data 1
  ├──► data 2
  ├──► data 3
  ├──► data 4
  └──► ...
```

Those objects remain reachable.

In older/sloppy JavaScript, accidentally assigning to an undeclared variable could also create a global:

```javascript
function leak() {
  leakedValue = "oops";
}
```

Use:

```javascript
"use strict";
```

and always declare variables with:

```javascript
const
let
```

---

# 24. A Better Mental Model for Memory Leaks

Instead of memorizing a list of leaks, ask:

> **What is keeping this object reachable?**

For example:

```text
Component is supposedly destroyed
              │
              ▼
        Still in memory
              │
              ▼
       Find the retainer
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
   Timer   Listener   Global
      │       │        │
      ▼       ▼        ▼
   Closure  Closure   Cache
      │       │
      └───┬───┘
          ▼
       Component
```

This way of thinking is much more useful than memorizing "five types of leaks."

---

# 25. Weak References

Sometimes you want to associate information with an object **without keeping that object alive solely because of the association**.

This is where weak references are useful.

JavaScript provides:

- `WeakMap`
- `WeakSet`
- `WeakRef`
- `FinalizationRegistry`

They solve different problems.

---

# 26. WeakMap

A `WeakMap` stores key-value associations where the keys are objects.

Example:

```javascript
const cache = new WeakMap();

function process(user) {
  if (cache.has(user)) {
    return cache.get(user);
  }

  const result = expensiveCalculation(user);

  cache.set(user, result);

  return result;
}
```

Now:

```javascript
let user = {
  name: "Alice"
};

process(user);

user = null;
```

If the `WeakMap` is the only thing keeping the object reachable, the object can be garbage collected.

The important idea is:

```text
Map
────────────────────

Map ─────► object
            ▲
            │
         keeps alive


WeakMap
────────────────────

WeakMap - - -► object
                ▲
                │
       does NOT by itself
       keep object alive
```

The weak association is intentionally not something you can enumerate.

---

# 27. Why Doesn't WeakMap Expose Its Keys?

Consider:

```javascript
const cache = new WeakMap();

cache.set(object, expensiveResult);
```

If JavaScript allowed you to enumerate all keys, it could reveal whether an object had already been garbage collected.

But garbage collection timing is nondeterministic.

That would create observable GC-dependent behavior.

Therefore:

```javascript
cache.keys()
cache.values()
cache.entries()
```

do not exist for `WeakMap`.

You use it as an association mechanism, not as an iterable collection.

---

# 28. WeakMap vs Map

This is a very common interview question.

### Map

```javascript
const cache = new Map();

let user = {};
cache.set(user, "data");

user = null;
```

The `Map` still contains a strong reference to the object.

Therefore:

```text
Map
 │
 └────► user object
```

The object remains reachable through the map.

### WeakMap

```javascript
const cache = new WeakMap();

let user = {};
cache.set(user, "data");

user = null;
```

The weak association does not prevent collection.

### Interview answer

> "A `Map` strongly references its keys, so a key remains reachable while it is stored in the map. A `WeakMap` does not prevent its object keys from being garbage collected, which makes it useful for object-associated caches or metadata where the lifetime should follow the object."

---

# 29. WeakSet

A `WeakSet` is useful when you want to track objects without preventing them from being collected.

Example:

```javascript
const visited = new WeakSet();

function visit(node) {
  if (visited.has(node)) {
    return;
  }

  visited.add(node);

  // Process node...
}
```

If:

```javascript
let node = {
  id: 1
};

visit(node);

node = null;
```

and there are no other references, the object can be collected.

Use `WeakSet` when you care about:

> "Have I seen this object?"

rather than:

> "What values are in this collection?"

---

# 30. WeakRef

`WeakRef` gives you a weak reference to an object.

Example:

```javascript
let object = {
  data: "hello"
};

const weak = new WeakRef(object);
```

You can attempt to retrieve the object:

```javascript
const value = weak.deref();

if (value) {
  console.log(value.data);
}
```

But the object may have been collected.

Therefore:

```javascript
const value = weak.deref();

if (value) {
  // Object is currently available
}
```

is the correct pattern.

Do not write application logic that assumes:

```text
I created a WeakRef
        ↓
The object will definitely remain available
```

That defeats the purpose of the weak reference.

---

# 31. When Would You Use WeakRef?

`WeakRef` is an advanced API.

Potential use cases include:

- memory-sensitive caches
- optional caches of expensive objects
- situations where keeping an object alive is undesirable

But most application code does **not** need it.

If you can solve the problem with explicit lifecycle management, that is usually easier to reason about.

For example:

```javascript
cache.delete(key);
```

is usually easier to understand than introducing weak references and GC-dependent behavior.

---

# 32. FinalizationRegistry

`FinalizationRegistry` allows you to register a callback that may run after an object has been garbage collected.

Example:

```javascript
const registry = new FinalizationRegistry((id) => {
  console.log(`Object ${id} was collected`);
});

let user = {
  name: "Alice"
};

registry.register(user, "user-1");

user = null;
```

Eventually, if the object is collected, the callback may run.

But there is a very important rule:

> **You cannot rely on FinalizationRegistry running at a particular time — or even within a particular period.**

GC is nondeterministic.

Therefore, this is dangerous:

```javascript
registry.register(resource, () => {
  closeImportantResource();
});
```

if correctness depends on the callback running promptly.

Use explicit cleanup for resources whose lifetime matters.

---

# 33. WeakRef / FinalizationRegistry Rules

Remember:

### WeakRef

```text
May let you observe whether an object is still available.
```

### FinalizationRegistry

```text
May notify you after an object has been collected.
```

Neither gives you deterministic lifecycle management.

A good interview statement is:

> "`WeakRef` and `FinalizationRegistry` are advanced memory-management primitives. Their behavior depends on garbage collection, whose timing is nondeterministic, so they should not be used for correctness-critical cleanup."

---

# 34. Memory Profiling in Chrome DevTools

Knowing how GC works is useful.

But in real frontend debugging, you also need to answer:

> **How do I prove that my application is leaking memory?**

Chrome DevTools provides a **Memory** panel for this.

Common tools include:

- Heap Snapshot
- Allocation instrumentation on timeline
- Allocation sampling

The exact UI can evolve between Chrome versions, but the underlying workflow is the important part.

---

# 35. Heap Snapshots

A heap snapshot gives you a view of objects currently retained in the JavaScript heap.

Typical workflow:

```text
Open DevTools
      ↓
Memory
      ↓
Heap snapshot
      ↓
Take snapshot
      ↓
Inspect retained objects
```

You can investigate:

- object counts
- memory size
- retained size
- references/retainers
- constructors
- closures
- detached DOM nodes

---

# 36. Shallow Size vs Retained Size

This distinction is important when reading heap snapshots.

### Shallow size

The memory associated directly with an object.

### Retained size

An approximation of the memory that would become collectible if that object were no longer retained, considering objects that depend on it.

Example:

```text
Object A
  │
  ├──► Object B
  │       │
  │       └──► Large Array
  │
  └──► Object C
```

`A` itself may be small.

But if `A` is the reason `B` and the large array remain reachable, its retained size can be much larger.

This is why looking only at the size of an individual object can be misleading.

---

# 37. Retainer Paths

One of the most useful concepts in memory debugging is the **retainer path**.

Suppose you see a component that should have been destroyed but is still present.

You want to ask:

```text
Why is this object still reachable?
```

DevTools can help show the chain of references that keeps it alive.

For example:

```text
Window
  ↓
EventListener
  ↓
Callback
  ↓
Closure
  ↓
Component
  ↓
Large Array
```

That path tells you what needs to be cleaned up.

---

# 38. Finding a Memory Leak With Snapshots

Suppose you suspect that opening and closing a component leaks memory.

Use a repeated workflow:

```text
Snapshot A
   ↓
Open component
   ↓
Use component
   ↓
Close/unmount component
   ↓
Force/allow normal GC as appropriate
   ↓
Snapshot B
   ↓
Repeat several times
   ↓
Compare snapshots
```

You are looking for objects that should have disappeared but continue accumulating.

For example:

```text
After 1 mount/unmount:
10 Component objects

After 5 mount/unmount cycles:
50 Component objects
```

That strongly suggests something is retaining them.

---

# 39. Why "Memory Went Up" Does Not Automatically Mean a Leak

This is an important debugging distinction.

JavaScript engines may:

- allocate memory ahead of time
- retain memory for reuse
- delay collection
- resize internal structures
- move objects during GC
- optimize allocation patterns

Therefore:

```text
Memory usage increased
```

does not automatically mean:

```text
Memory leak
```

A stronger signal is:

> **Memory keeps growing after repeated identical operations, and objects that should have become unreachable remain retained.**

---

# 40. A Practical Leak Investigation

Imagine a dashboard has:

- customer table
- filters
- charts
- WebSocket updates
- event listeners
- polling
- React components

Users report:

> "After leaving the dashboard open for several hours, Chrome becomes sluggish."

Don't immediately start rewriting code.

First ask:

```text
Is memory actually growing?
          ↓
Which objects are growing?
          ↓
Why are they retained?
          ↓
What reference is keeping them alive?
          ↓
Where should that reference be removed?
```

Then inspect:

- timers
- subscriptions
- WebSockets
- event listeners
- DOM nodes
- caches
- closures
- global state

---

# 41. React-Specific Memory Leak Checklist

When a React component unmounts, inspect whether it created long-lived resources.

### Event listeners

```javascript
useEffect(() => {
  const handler = () => {};

  window.addEventListener("resize", handler);

  return () => {
    window.removeEventListener("resize", handler);
  };
}, []);
```

### Intervals

```javascript
useEffect(() => {
  const id = setInterval(() => {
    // ...
  }, 1000);

  return () => clearInterval(id);
}, []);
```

### Subscriptions

```javascript
useEffect(() => {
  const unsubscribe = store.subscribe(() => {
    // ...
  });

  return unsubscribe;
}, []);
```

### Observers

```javascript
useEffect(() => {
  const observer = new ResizeObserver(() => {
    // ...
  });

  observer.observe(element);

  return () => {
    observer.disconnect();
  };
}, []);
```

### WebSockets

```javascript
useEffect(() => {
  const socket = new WebSocket(url);

  return () => {
    socket.close();
  };
}, []);
```

The general pattern is:

```text
Create resource
      ↓
Use resource
      ↓
Component lifecycle ends
      ↓
Cleanup resource
```

---

# 42. Memory Leak vs High Memory Usage

These are not exactly the same.

## High memory usage

The application genuinely needs a lot of memory.

Example:

```text
Large dataset
+
Large images
+
Large in-memory cache
```

The memory may eventually stabilize.

## Memory leak

Memory continues to grow because objects that should have become unreachable are still retained.

```text
Operation 1 → 100 MB
Operation 2 → 150 MB
Operation 3 → 200 MB
Operation 4 → 250 MB
...
```

If the same operation repeatedly causes retained objects to accumulate, investigate a leak.

---

# 43. Common Mistakes to Avoid

## Mistake 1: "Setting a variable to null immediately frees memory."

Not necessarily.

```javascript
let a = {};
let b = a;

a = null;
```

The object is still reachable through `b`.

---

## Mistake 2: "Removing a DOM node means it is gone from memory."

Not necessarily.

```javascript
const node = document.querySelector(".item");

node.remove();
```

If another reference still exists, the object can remain alive.

---

## Mistake 3: "Closures cause memory leaks."

No.

Closures are normal.

The issue is **unintended retention by long-lived closures**.

---

## Mistake 4: "WeakMap is just a faster Map."

No.

The key difference is memory semantics.

```text
Map
→ strong references

WeakMap
→ weak object-key references
```

---

## Mistake 5: "FinalizationRegistry is cleanup."

Not for deterministic cleanup.

GC timing is unpredictable.

Use explicit cleanup for resources such as:

- subscriptions
- sockets
- timers
- observers
- event listeners

---

## Mistake 6: "GC immediately runs when an object becomes unreachable."

No.

The object becomes **eligible** for collection.

The engine decides when and how to collect it.

---

# 44. The Full Mental Model

Put everything together:

```text
                JavaScript Application
                         │
                         ▼
                  Objects allocated
                         │
                         ▼
                  References created
                         │
                         ▼
                ┌──────────────────┐
                │   Reachability   │
                └────────┬─────────┘
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
        Reachable                 Unreachable
             │                       │
             │                       ▼
             │                 Eligible for GC
             │                       │
             │                       ▼
             │                 Garbage Collector
             │                       │
             │                       ▼
             │                 Memory reclaimed
             │
             ▼
      Object remains alive
```

The most important debugging question is:

> **Why is this object still reachable?**

---

# 45. Interview-Ready Answers

## "How does garbage collection work in JavaScript?"

A strong answer:

> "JavaScript uses automatic garbage collection. The engine determines which objects are reachable from GC roots and which are not. Modern engines use tracing collectors, with mark-and-sweep as a fundamental model: reachable objects are marked and unreachable objects can be reclaimed. Engines optimize this with techniques such as generational, incremental, and concurrent GC."

---

## "What is reachability?"

> "Reachability means whether an object can be reached by following references from the garbage collector's roots. If there is no path from any root to an object, the object is unreachable and becomes eligible for garbage collection."

---

## "What is mark and sweep?"

> "The collector starts from GC roots and marks all objects it can reach. It then identifies unmarked objects as unreachable and reclaims their memory. Real JavaScript engines use more sophisticated optimized versions of this basic tracing model."

---

## "What is generational garbage collection?"

> "Generational GC is based on the observation that most objects die young. New objects are collected more frequently, while objects that survive collections can be promoted to an older generation and collected less frequently. This reduces the amount of work needed for frequent collections."

---

## "Can JavaScript have memory leaks even though it has garbage collection?"

> "Yes. Garbage collection only removes objects that are unreachable. If application code accidentally keeps a reference to an object that it no longer needs—for example through an event listener, timer, global cache, subscription, detached DOM node, or long-lived closure—the object remains reachable and cannot be collected."

---

## "How can closures cause memory leaks?"

> "Closures retain access to their lexical environment. A closure itself isn't a leak, but if a long-lived callback retains references to large data or objects that are no longer needed, those objects can remain reachable for as long as the callback does."

---

## "Map vs WeakMap?"

> "`Map` strongly references its keys, so storing an object as a key keeps that object reachable. `WeakMap` uses weak object-key references, so the association does not prevent the key from being garbage collected. This makes WeakMap useful for object-associated metadata and caches where the cache should not control the object's lifetime."

---

## "How would you debug a memory leak?"

> "I'd first reproduce the suspected workflow repeatedly and observe whether memory keeps growing rather than stabilizing. Then I'd use Chrome DevTools' Memory panel to take heap snapshots and compare them. I'd look for objects that should have been released but are still retained, inspect their retainer paths, and trace those references back to things like event listeners, timers, subscriptions, caches, closures, or detached DOM nodes."

---

# 46. Interview Traps

### Trap: "Every object has a reference count."

Not as the primary GC model in modern JavaScript engines.

Think:

```text
Reachability / tracing
```

rather than:

```text
Reference count = 0
```

---

### Trap: "WeakMap values are weak too."

The important weak relationship is the **object key**.

```javascript
weakMap.set(objectKey, value);
```

The key is weakly held.

Do not casually generalize this to "everything inside a WeakMap is weak."

---

### Trap: "WeakRef guarantees access to the object."

No.

```javascript
weakRef.deref()
```

may return `undefined` because the object may already have been collected.

---

### Trap: "FinalizationRegistry tells you exactly when GC happens."

No.

Its callback timing is nondeterministic.

---

### Trap: "Memory leak means an object is huge."

No.

A tiny object that keeps a huge object graph alive can be the important retainer.

This is why **retained size and retainer paths** matter.

---

# 47. Self-Assessment Questions

Try answering these without looking back.

### Fundamentals

1. What problem does garbage collection solve?
2. What does "reachable" mean?
3. What are GC roots?
4. Why doesn't setting one variable to `null` necessarily free an object?
5. What is the relationship between reachability and garbage collection?

### Algorithms

6. Explain mark and sweep.
7. Why can mark-and-sweep collect circular references?
8. What is generational garbage collection?
9. Why are young objects collected more frequently?
10. Why isn't "mark and sweep" a complete description of what modern engines do internally?

### Memory leaks

11. How can a timer keep data alive?
12. How can an event listener keep a component alive?
13. What is a detached DOM node?
14. Are closures themselves memory leaks?
15. Why can global caches cause memory leaks?

### Weak references

16. Why would you use WeakMap instead of Map?
17. Why can't you iterate over WeakMap keys?
18. What is WeakSet useful for?
19. What does `WeakRef.deref()` return?
20. Why shouldn't FinalizationRegistry be used for deterministic cleanup?

### Debugging

21. How would you investigate a suspected memory leak in Chrome?
22. What is the difference between shallow size and retained size?
23. What is a retainer path?
24. Why doesn't increasing memory usage automatically prove a leak?
25. How would you investigate a React component that appears to remain in memory after unmounting?

---

# 48. What You Should Remember

If you remember only these ideas, remember these:

### 1. GC is based on reachability

```text
Root → reachable object
```

If no root can reach an object:

```text
Object → unreachable → eligible for GC
```

### 2. Modern engines use tracing GC

Mark-and-sweep is the foundational mental model:

```text
Mark reachable
      ↓
Sweep unreachable
```

Real engines optimize this heavily.

### 3. Generational GC exploits object lifetimes

```text
Most objects die young
        ↓
Collect young objects frequently
        ↓
Spend less work scanning long-lived objects
```

### 4. Memory leaks are usually retention problems

Ask:

> **What reference is keeping this object alive?**

Common retainers:

```text
Timer
Event listener
Subscription
WebSocket
Global state
Cache
Closure
Detached DOM reference
```

### 5. WeakMap is about object lifetime

```text
Map
→ keeps key strongly reachable

WeakMap
→ does not keep object key alive
```

### 6. WeakRef and FinalizationRegistry are advanced tools

GC is nondeterministic.

Don't use them as replacements for explicit cleanup.

### 7. DevTools helps you find the retainer

The useful debugging chain is:

```text
Object that should be gone
          ↓
Why is it still reachable?
          ↓
Retainer path
          ↓
Find the unintended reference
          ↓
Remove/cleanup that reference
```

> **Core mental model:** Garbage collection does not ask "Does the programmer still want this object?" It asks whether the object is still reachable. Your job as a developer is to manage the references and lifecycles so objects that are no longer needed are allowed to become unreachable.
