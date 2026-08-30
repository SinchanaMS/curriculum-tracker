# Memory Management

## Why It Matters

JavaScript automatically manages memory, but understanding how it works helps you:

- Avoid memory leaks
- Optimize application performance
- Debug memory-related issues
- Write more efficient code
- Pass senior-level interviews

> **Key Question:** How does JavaScript allocate, use, and release memory?

---

## Memory Life Cycle

All programs follow the same memory life cycle:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MEMORY LIFE CYCLE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   1. ALLOCATE           2. USE                3. RELEASE                │
│   ───────────           ───                   ───────                   │
│   Reserve memory        Read/Write            Free memory               │
│   for variables         to memory             when done                 │
│                                                                         │
│   ┌─────────────┐     ┌─────────────┐      ┌─────────────┐             │
│   │             │     │  ████████   │      │             │             │
│   │  Allocate   │ ──▶ │  ████████   │ ──▶  │   Release   │             │
│   │             │     │  ████████   │      │             │             │
│   └─────────────┘     └─────────────┘      └─────────────┘             │
│                                                                         │
│   In JavaScript:                                                        │
│   - Allocation: Automatic when you create variables                     │
│   - Use: Obvious (reading/writing values)                               │
│   - Release: Automatic (Garbage Collection) ← Tricky part!             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Stack vs Heap Memory

JavaScript uses two types of memory:

### Stack Memory (Fast, Limited)

- Stores **primitive values** and **function calls**
- Fixed size, very fast
- LIFO (Last In, First Out)
- Automatically cleaned when function returns

```javascript
function example() {
  const a = 10;        // Stack: number stored directly
  const b = "hello";   // Stack: small string
  const c = true;      // Stack: boolean

  return a + b;
}  // Stack memory for a, b, c is automatically freed
```

### Heap Memory (Larger, Slower)

- Stores **objects, arrays, functions**
- Dynamically sized
- Managed by Garbage Collector
- Can cause memory leaks if mismanaged

```javascript
const user = {        // Object stored in HEAP
  name: "Alice",      // Heap: object properties
  scores: [1, 2, 3]   // Heap: array
};

// 'user' is a REFERENCE stored on stack
// pointing to the object in heap
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│          STACK                          HEAP                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐              ┌──────────────────────────┐        │
│   │ user: 0x001 ────┼──────────────▶│ { name: "Alice",        │        │
│   ├─────────────────┤              │   scores: 0x002 ─────────┼──┐     │
│   │ count: 42       │              │ }                        │  │     │
│   ├─────────────────┤              └──────────────────────────┘  │     │
│   │ name: "Bob"     │                                            │     │
│   ├─────────────────┤              ┌──────────────────────────┐  │     │
│   │ isActive: true  │              │ [1, 2, 3]                │◀─┘     │
│   └─────────────────┘              └──────────────────────────┘        │
│                                                                         │
│   Primitives stored           Objects/Arrays stored                     │
│   directly by VALUE           by REFERENCE                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Primitive vs Reference Types

### Primitives (Stored by Value)

```javascript
let a = 10;
let b = a;      // Copies the VALUE

a = 20;
console.log(b); // 10 - b has its own copy
```

**Primitives:** `number`, `string`, `boolean`, `null`, `undefined`, `symbol`, `bigint`

### References (Stored by Reference)

```javascript
let obj1 = { name: "Alice" };
let obj2 = obj1;  // Copies the REFERENCE (not the object!)

obj1.name = "Bob";
console.log(obj2.name);  // "Bob" - both point to same object!
```

**Reference types:** `Object`, `Array`, `Function`, `Date`, `RegExp`, etc.

**Visual:**

```
Primitive Copy:                    Reference Copy:
─────────────────                  ─────────────────

let a = 10                         let obj1 = {name: "Alice"}
let b = a                          let obj2 = obj1

Stack:                             Stack:           Heap:
┌─────────────┐                    ┌─────────────┐  ┌─────────────────┐
│ a: 10       │                    │obj1: 0x001 ─┼──┤{name: "Alice"}  │
├─────────────┤                    ├─────────────┤  │    ↓            │
│ b: 10       │ ← Own copy         │obj2: 0x001 ─┼──┤{name: "Bob"}    │
└─────────────┘                    └─────────────┘  └─────────────────┘
                                         ↑
                                    Both point to
                                    same object!
```

---

## Shallow Copy vs Deep Copy

### Shallow Copy (Copies First Level Only)

```javascript
const original = {
  name: "Alice",
  scores: [1, 2, 3],
  address: { city: "Seattle" }
};

// Shallow copies
const spread = { ...original };
const assigned = Object.assign({}, original);

// First level is copied
spread.name = "Bob";
console.log(original.name);  // "Alice" ✓

// Nested objects are still references!
spread.scores.push(4);
console.log(original.scores);  // [1, 2, 3, 4] ✗ Modified!

spread.address.city = "Portland";
console.log(original.address.city);  // "Portland" ✗ Modified!
```

### Deep Copy

```javascript
// Method 1: JSON (limited - loses functions, dates, etc.)
const deepCopy1 = JSON.parse(JSON.stringify(original));

// Method 2: structuredClone (modern, supports more types)
const deepCopy2 = structuredClone(original);

// Method 3: Lodash cloneDeep
const deepCopy3 = _.cloneDeep(original);

// Now nested changes don't affect original
deepCopy2.scores.push(4);
console.log(original.scores);  // [1, 2, 3] ✓ Unchanged
```

### Structured Clone API

`structuredClone()` (ES2022) is the modern way to deep copy:

```javascript
const original = {
  date: new Date(),
  regex: /test/g,
  array: [1, [2, 3]],
  map: new Map([['a', 1]]),
  set: new Set([1, 2, 3])
};

const clone = structuredClone(original);

// Works with: Date, RegExp, Map, Set, ArrayBuffer, etc.
// Does NOT work with: Functions, DOM nodes, Error objects
```

### JSON.parse/stringify Limitations

```javascript
const obj = {
  date: new Date(),          // Becomes string
  func: () => {},            // Lost
  undef: undefined,          // Lost
  nan: NaN,                  // Becomes null
  infinity: Infinity,        // Becomes null
  regex: /test/,             // Becomes {}
  circular: null             // Would throw if circular ref
};

obj.circular = obj;  // Circular reference

JSON.stringify(obj);  // TypeError: Converting circular structure to JSON

// Safe JSON clone (without circular)
delete obj.circular;
const clone = JSON.parse(JSON.stringify(obj));
console.log(clone.date);  // "2024-01-01T..." (string, not Date!)
console.log(clone.func);  // undefined (lost!)
```

---

## Object Spread Limitations

```javascript
// ❌ Only copies enumerable own properties
const proto = { inherited: true };
const obj = Object.create(proto);
obj.own = true;

const spread = { ...obj };
console.log(spread.inherited);  // undefined (not copied!)
console.log(spread.own);        // true

// ❌ Doesn't copy property descriptors
const original = {};
Object.defineProperty(original, 'readonly', {
  value: 42,
  writable: false
});

const copy = { ...original };
copy.readonly = 100;  // Works! Descriptor not preserved
```

---

## ArrayBuffer and TypedArrays

For working with binary data:

```javascript
// ArrayBuffer - raw binary data
const buffer = new ArrayBuffer(16);  // 16 bytes

// TypedArray - view into the buffer
const int32View = new Int32Array(buffer);  // 4 x 32-bit integers
int32View[0] = 42;

const uint8View = new Uint8Array(buffer);  // 16 x 8-bit integers
console.log(uint8View[0]);  // 42 (same memory, different view)

// Common TypedArrays:
// Int8Array, Uint8Array, Int16Array, Uint16Array
// Int32Array, Uint32Array, Float32Array, Float64Array
```

**Use cases:**
- WebGL graphics
- Audio processing
- File manipulation
- WebSocket binary data
- Web Workers data transfer

---

## SharedArrayBuffer

Allows sharing memory between main thread and Web Workers:

```javascript
// Main thread
const sharedBuffer = new SharedArrayBuffer(1024);
const sharedArray = new Int32Array(sharedBuffer);

// Send to worker
worker.postMessage({ buffer: sharedBuffer });

// Worker can now access same memory!
// Use Atomics for thread-safe operations:
Atomics.add(sharedArray, 0, 1);  // Atomic increment
Atomics.load(sharedArray, 0);    // Atomic read
```

**Note:** Requires cross-origin isolation (COOP/COEP headers) due to Spectre mitigations.

---

## Memory-Efficient Patterns

### 1. Object Pools

Reuse objects instead of creating new ones:

```javascript
class ObjectPool {
  constructor(createFn, size = 10) {
    this.createFn = createFn;
    this.pool = Array.from({ length: size }, createFn);
  }

  acquire() {
    return this.pool.pop() || this.createFn();
  }

  release(obj) {
    this.pool.push(obj);
  }
}

// Usage
const particlePool = new ObjectPool(() => ({ x: 0, y: 0, velocity: 0 }));

const particle = particlePool.acquire();
// Use particle...
particlePool.release(particle);  // Return to pool, no GC needed
```

### 2. Avoid Creating Objects in Loops

```javascript
// ❌ BAD - Creates new object every iteration
for (let i = 0; i < 10000; i++) {
  const point = { x: i, y: i * 2 };
  processPoint(point);
}

// ✅ GOOD - Reuse object
const point = { x: 0, y: 0 };
for (let i = 0; i < 10000; i++) {
  point.x = i;
  point.y = i * 2;
  processPoint(point);
}
```

### 3. Use Appropriate Data Structures

```javascript
// For large numeric data, use TypedArrays
// ❌ Regular array
const points = [];
for (let i = 0; i < 1000000; i++) {
  points.push(i);
}

// ✅ TypedArray - more memory efficient
const points = new Float64Array(1000000);
for (let i = 0; i < 1000000; i++) {
  points[i] = i;
}
```

---

## Self-Assessment Questions

1. **What's the difference between stack and heap memory?**
   <details>
   <summary>Answer</summary>
   Stack: Fast, fixed-size, stores primitives and function calls, auto-cleaned.
   Heap: Larger, dynamic, stores objects/arrays, managed by garbage collector.
   </details>

2. **Why does changing a copied object affect the original?**
   <details>
   <summary>Answer</summary>
   Objects are stored by reference. Copying an object copies the reference (pointer), not the actual data. Both variables point to the same object in memory.
   </details>

3. **What's the difference between shallow and deep copy?**
   <details>
   <summary>Answer</summary>
   Shallow copy: Copies first-level properties, nested objects remain as references.
   Deep copy: Recursively copies all levels, creating completely independent objects.
   </details>

4. **When would you use structuredClone vs JSON?**
   <details>
   <summary>Answer</summary>
   structuredClone: Supports more types (Date, RegExp, Map, Set), handles circular references.
   JSON: Works everywhere but loses functions, undefined, and converts Dates to strings.
   </details>

---

## Common Interview Questions

1. **How is memory allocated in JavaScript?**
2. **What's the difference between primitive and reference types?**
3. **How do you create a deep copy of an object?**
4. **What are the limitations of JSON.parse/stringify for copying?**
5. **What is a TypedArray and when would you use it?**

---

## Related Topics

- [Garbage Collection](./12-garbage-collection.md) - How memory is released
- [Closures](./05-closures.md) - How closures affect memory

---

## External Resources

- [MDN: Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [JavaScript.info: Garbage Collection](https://javascript.info/garbage-collection)
- [V8: Memory Management](https://v8.dev/blog/trash-talk)
- [Deep vs Shallow Copy](https://www.freecodecamp.org/news/copying-stuff-in-javascript-how-to-differentiate-between-deep-and-shallow-copies/)
