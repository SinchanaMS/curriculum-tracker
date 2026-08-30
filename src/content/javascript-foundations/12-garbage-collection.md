# Garbage Collection

## Why It Matters

JavaScript automatically frees memory that's no longer needed through **Garbage Collection (GC)**. Understanding GC helps you:

- Avoid memory leaks
- Write memory-efficient code
- Debug performance issues
- Use DevTools memory profiler
- Understand WeakMap/WeakSet/WeakRef

> **Key Question:** How does JavaScript know when to free memory?

---

## What is Garbage Collection?

**Garbage Collection** is the automatic process of finding memory that's no longer being used and freeing it. You can't manually free memory in JavaScript - GC does it for you.

```javascript
function example() {
  const bigData = new Array(1000000).fill('data');
  // bigData is used here...
}

example();
// After function returns, bigData is no longer reachable
// GC will eventually free this memory
```

---

## Reachability Concept

The main concept of memory management in JavaScript is **reachability**. Memory is kept as long as it's "reachable" from roots.

### Roots (Always Reachable)

- Global variables
- Currently executing functions and their local variables
- References in the call stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REACHABILITY                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ROOTS (always reachable)                                              │
│   ┌─────────────────────┐                                              │
│   │ Global variables    │                                              │
│   │ Call stack          │                                              │
│   │ Active closures     │                                              │
│   └─────────┬───────────┘                                              │
│             │                                                           │
│             ▼                                                           │
│   ┌─────────────────────┐      ┌─────────────────────┐                 │
│   │ Object A            │──────│ Object B            │                 │
│   │ (reachable from     │      │ (reachable via A)   │                 │
│   │  global)            │      │                     │                 │
│   └─────────────────────┘      └──────────┬──────────┘                 │
│                                           │                             │
│                                           ▼                             │
│                                ┌─────────────────────┐                 │
│                                │ Object C            │                 │
│                                │ (reachable via B)   │                 │
│                                └─────────────────────┘                 │
│                                                                         │
│   ┌─────────────────────┐                                              │
│   │ Object D            │  ← NOT reachable from any root!              │
│   │ (garbage)           │  ← Will be collected                         │
│   └─────────────────────┘                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### When Objects Become Unreachable

```javascript
let user = { name: "Alice" };

// user references the object
// Object is reachable

user = null;

// Now nothing references { name: "Alice" }
// Object is unreachable → will be garbage collected
```

---

## Mark and Sweep Algorithm

Modern JavaScript engines use **Mark and Sweep** (with optimizations):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MARK AND SWEEP                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   PHASE 1: MARK                                                         │
│   ─────────────                                                         │
│   Start from roots, mark all reachable objects                          │
│                                                                         │
│   Global ──▶ [Object A ✓] ──▶ [Object B ✓]                             │
│                    │                                                    │
│                    └────────▶ [Object C ✓]                             │
│                                                                         │
│   [Object D] ← No mark (unreachable)                                    │
│   [Object E] ← No mark (unreachable)                                    │
│                                                                         │
│                                                                         │
│   PHASE 2: SWEEP                                                        │
│   ──────────────                                                        │
│   Free all unmarked objects                                             │
│                                                                         │
│   Memory: [A ✓][D ×][B ✓][E ×][C ✓]                                    │
│                ↓        ↓                                               │
│           [freed]   [freed]                                             │
│                                                                         │
│   Result: [A][free][B][free][C]                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### V8's Generational GC

V8 (Chrome, Node.js) uses generational GC based on the observation that **most objects die young**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                V8 GENERATIONAL GARBAGE COLLECTION                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   YOUNG GENERATION (Nursery)         OLD GENERATION (Tenured)           │
│   ──────────────────────────         ────────────────────────          │
│   Small, collected frequently        Large, collected rarely            │
│                                                                         │
│   ┌─────────────────────────┐        ┌─────────────────────────┐       │
│   │ New objects created     │        │ Objects that survived   │       │
│   │ here                    │  ───▶  │ multiple GC cycles      │       │
│   │                         │        │                         │       │
│   │ Most die quickly        │        │ Assumed to live long    │       │
│   │ (function locals, etc.) │        │ (global state, caches)  │       │
│   └─────────────────────────┘        └─────────────────────────┘       │
│                                                                         │
│   Scavenge (Minor GC)                Major GC (Full)                   │
│   - Very fast                        - More expensive                  │
│   - Runs frequently                  - Runs less often                 │
│   - Only checks young gen            - Checks entire heap              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Reference Counting (Historical)

Older GC approach (not used in modern JS engines for main GC):

```javascript
// Reference counting tracks how many references point to an object

let obj1 = { data: "hello" };  // refCount: 1
let obj2 = obj1;               // refCount: 2

obj1 = null;                   // refCount: 1
obj2 = null;                   // refCount: 0 → can be freed
```

### Circular Reference Problem

Reference counting fails with circular references:

```javascript
function createCycle() {
  const objA = {};
  const objB = {};

  objA.ref = objB;  // A references B
  objB.ref = objA;  // B references A

  // Both have refCount > 0 forever!
  // But neither is reachable from roots
}

createCycle();
// With reference counting: Memory leak!
// With mark-and-sweep: Correctly collected ✓
```

---

## Common Memory Leak Patterns

### 1. Forgotten Timers

```javascript
// ❌ LEAK - Timer keeps callback (and its closure) alive
function startPolling() {
  const data = fetchLargeData();

  setInterval(() => {
    console.log(data.length);  // Closure keeps 'data' alive
  }, 1000);
}

// ✅ FIX - Store interval ID and clear when done
function startPolling() {
  const data = fetchLargeData();

  const intervalId = setInterval(() => {
    console.log(data.length);
  }, 1000);

  // Later, when done:
  return () => clearInterval(intervalId);
}

const stopPolling = startPolling();
// When component unmounts:
stopPolling();
```

### 2. Detached DOM Nodes

```javascript
// ❌ LEAK - DOM node removed but still referenced
let detachedNode;

function leak() {
  const div = document.createElement('div');
  document.body.appendChild(div);

  detachedNode = div;  // Save reference

  document.body.removeChild(div);  // Removed from DOM
  // But 'detachedNode' still references it!
}

// ✅ FIX - Clear references when removing
function noLeak() {
  const div = document.createElement('div');
  document.body.appendChild(div);

  detachedNode = div;

  document.body.removeChild(div);
  detachedNode = null;  // Clear reference
}
```

### 3. Event Listener Leaks

```javascript
// ❌ LEAK - Listeners not removed
class Component {
  constructor() {
    this.data = new Array(10000).fill('data');

    window.addEventListener('resize', () => {
      this.handleResize();  // Closure captures 'this'
    });
  }

  handleResize() {
    console.log(this.data.length);
  }
}

// Creating and "destroying" components leaks memory
let comp = new Component();
comp = null;  // Component gone, but listener still attached!

// ✅ FIX - Remove listeners on cleanup
class Component {
  constructor() {
    this.data = new Array(10000).fill('data');
    this.handleResize = this.handleResize.bind(this);

    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    console.log(this.data.length);
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}

let comp = new Component();
comp.destroy();  // Properly clean up
comp = null;
```

### 4. Closures Holding References

```javascript
// ❌ LEAK - Closure keeps large data alive
function createHandler() {
  const largeData = new Array(1000000).fill('data');

  return function handler() {
    // largeData is in closure, kept alive as long as handler exists
    console.log(largeData.length);
  };
}

const handler = createHandler();
// largeData can't be GC'd while handler exists

// ✅ FIX - Only close over what you need
function createHandler() {
  const largeData = new Array(1000000).fill('data');
  const length = largeData.length;  // Extract what you need

  return function handler() {
    console.log(length);  // Only 'length' in closure now
  };
}
// largeData can be GC'd after createHandler returns
```

### 5. Global Variables

```javascript
// ❌ LEAK - Accidental globals
function leak() {
  leakedVar = "I'm global now!";  // No let/const/var!
}

// ✅ FIX - Always declare variables
"use strict";  // Throws error on accidental globals

function noLeak() {
  const localVar = "I'm properly scoped";
}
```

---

## WeakMap, WeakSet, WeakRef

These allow references that **don't prevent garbage collection**.

### WeakMap

Keys must be objects, and don't prevent GC:

```javascript
const cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }

  const result = expensiveCalculation(obj);
  cache.set(obj, result);
  return result;
}

let user = { name: "Alice" };
process(user);  // Cached

user = null;
// The cache entry for user is automatically removed!
// No memory leak, no manual cleanup needed
```

### WeakSet

```javascript
const visited = new WeakSet();

function visit(obj) {
  if (visited.has(obj)) {
    console.log("Already visited");
    return;
  }

  visited.add(obj);
  // Process obj...
}

let node = { id: 1 };
visit(node);
visit(node);  // "Already visited"

node = null;
// Entry automatically removed from WeakSet
```

### WeakRef and FinalizationRegistry

```javascript
// WeakRef - Weak reference to an object
let obj = { data: "important" };
const weakRef = new WeakRef(obj);

// Later, check if still alive
const deref = weakRef.deref();
if (deref) {
  console.log(deref.data);  // Object still exists
} else {
  console.log("Object was garbage collected");
}

// FinalizationRegistry - Callback when object is GC'd
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object with ID ${heldValue} was collected`);
});

let obj = { data: "test" };
registry.register(obj, "my-object-id");

obj = null;
// Eventually logs: "Object with ID my-object-id was collected"
```

**Warning:** WeakRef and FinalizationRegistry should be used sparingly. GC timing is unpredictable.

---

## Memory Profiling in DevTools

### Taking Heap Snapshots

1. Open DevTools → Memory tab
2. Select "Heap snapshot"
3. Click "Take snapshot"
4. Analyze object retention

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DevTools Memory Panel                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [● Take heap snapshot]                                                 │
│                                                                         │
│  Snapshot 1                           Objects    Shallow    Retained    │
│  ├─ (closure)                         1,234      48 KB      156 KB     │
│  ├─ Array                             456        12 KB      89 KB      │
│  ├─ Object                            789        8 KB       45 KB      │
│  │   ├─ MyComponent                   12         2 KB       15 KB     │
│  │   │   └─ @123456 (retainer path)                                    │
│  │   └─ ...                                                            │
│  └─ (string)                          2,345      128 KB     128 KB     │
│                                                                         │
│  Views: Summary | Comparison | Containment | Dominators                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Finding Memory Leaks

1. Take snapshot before action
2. Perform the suspected leaking action
3. Take another snapshot
4. Compare snapshots to find retained objects

```javascript
// Example: Finding a leak
class LeakyComponent {
  constructor() {
    this.data = new Array(100000).fill('leak');
    window.addEventListener('scroll', this.onScroll);
  }

  onScroll = () => {
    console.log(this.data.length);
  }

  // Missing cleanup!
}

// Create and "destroy" multiple times
for (let i = 0; i < 10; i++) {
  let comp = new LeakyComponent();
  comp = null;  // Doesn't clean up event listener!
}

// Memory grows with each iteration
// DevTools will show retained LeakyComponent instances
```

---

## Self-Assessment Questions

1. **How does JavaScript know what memory to free?**
   <details>
   <summary>Answer</summary>
   JavaScript uses reachability. Memory is freed when objects are no longer reachable from "roots" (global variables, call stack, closures).
   </details>

2. **What is the Mark and Sweep algorithm?**
   <details>
   <summary>Answer</summary>
   GC traverses from roots marking all reachable objects. Then it sweeps through memory, freeing any unmarked (unreachable) objects.
   </details>

3. **What are common causes of memory leaks?**
   <details>
   <summary>Answer</summary>
   Forgotten timers/intervals, detached DOM nodes, event listeners not removed, closures holding large data, accidental globals.
   </details>

4. **When would you use WeakMap over Map?**
   <details>
   <summary>Answer</summary>
   When you want to associate data with objects without preventing garbage collection. Common for caches, private data, or tracking objects.
   </details>

---

## Common Interview Questions

1. **How does garbage collection work in JavaScript?**
2. **What is reachability?**
3. **What are common memory leak patterns?**
4. **Explain the difference between WeakMap and Map**
5. **How do you profile memory in DevTools?**
6. **What is the generational garbage collection?**

---

## Related Topics

- [Memory Management](./11-memory-management.md) - Stack vs Heap, primitives vs references
- [Closures](./05-closures.md) - How closures can cause memory leaks

---

## External Resources

- [MDN: Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [JavaScript.info: Garbage Collection](https://javascript.info/garbage-collection)
- [V8 Blog: Trash Talk](https://v8.dev/blog/trash-talk) - V8's GC explained
- [Chrome DevTools: Fix Memory Problems](https://developer.chrome.com/docs/devtools/memory-problems/)
- [Debugging Memory Leaks](https://www.youtube.com/watch?v=Fk4Llhxb-xo) - Video tutorial
