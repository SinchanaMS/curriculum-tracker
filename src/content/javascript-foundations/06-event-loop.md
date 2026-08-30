# Event Loop

## Why It Matters

JavaScript is **single-threaded**, meaning it can only do one thing at a time. Yet it handles async operations like network requests, timers, and user interactions smoothly. How? The **Event Loop**.

Understanding the Event Loop is crucial for:
- Debugging async code
- Understanding why code executes in a certain order
- Optimizing performance
- Avoiding UI freezes
- Writing predictable async code

> **Key Question:** How does JavaScript handle async operations if it only has one thread?

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    JAVASCRIPT RUNTIME ENVIRONMENT                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────────────────────────────────────┐   │
│  │   CALL      │     │              WEB APIs                        │   │
│  │   STACK     │     │  (Browser provides these)                    │   │
│  │             │     │                                              │   │
│  │  ┌───────┐  │     │   setTimeout()    DOM events                │   │
│  │  │ func  │  │     │   fetch()         localStorage              │   │
│  │  ├───────┤  │     │   setInterval()   geolocation              │   │
│  │  │ main  │  │────▶│                                              │   │
│  │  └───────┘  │     └─────────────────────┬───────────────────────┘   │
│  └─────────────┘                           │                           │
│        ▲                                   │                           │
│        │                                   ▼                           │
│        │     ┌─────────────────────────────────────────────────┐       │
│        │     │           CALLBACK QUEUES                        │       │
│        │     │                                                  │       │
│        │     │  ┌─────────────────────────────────────────┐    │       │
│        │     │  │ MICROTASK QUEUE (Job Queue)              │    │       │
│        │     │  │  Promise callbacks, queueMicrotask       │    │       │
│        │     │  │  [callback1] [callback2] ...             │    │       │
│        │     │  └─────────────────────────────────────────┘    │       │
│        │     │                                                  │       │
│        │     │  ┌─────────────────────────────────────────┐    │       │
│        │     │  │ MACROTASK QUEUE (Task Queue)             │    │       │
│        │     │  │  setTimeout, setInterval, I/O, UI        │    │       │
│        │     │  │  [callback1] [callback2] ...             │    │       │
│        │     │  └─────────────────────────────────────────┘    │       │
│        │     └─────────────────────────────────────────────────┘       │
│        │                          │                                     │
│        │                          │                                     │
│        │     ┌────────────────────┴────────────────────┐               │
│        │     │                                         │               │
│        └─────│          EVENT LOOP                     │               │
│              │   "Is the stack empty? Move callback!"  │               │
│              └─────────────────────────────────────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## How the Event Loop Works

The Event Loop has one simple job: **check if the call stack is empty, and if so, move callbacks from the queues to the stack**.

### Step-by-Step Process

```javascript
console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise');
});

console.log('End');
```

**Output:**
```
Start
End
Promise
Timeout
```

**Let's trace through:**

```
═══════════════════════════════════════════════════════════════════════════
STEP 1: console.log('Start') executes
═══════════════════════════════════════════════════════════════════════════

  Call Stack              Web APIs              Queues
  ┌─────────────┐         ┌─────────────┐      Microtask: []
  │console.log  │         │             │      Macrotask: []
  └─────────────┘         └─────────────┘

  Output: "Start"


═══════════════════════════════════════════════════════════════════════════
STEP 2: setTimeout() called - callback sent to Web APIs
═══════════════════════════════════════════════════════════════════════════

  Call Stack              Web APIs              Queues
  ┌─────────────┐         ┌─────────────┐      Microtask: []
  │setTimeout   │ ──────▶ │ Timer (0ms) │      Macrotask: []
  └─────────────┘         └─────────────┘


═══════════════════════════════════════════════════════════════════════════
STEP 3: Promise.resolve().then() - callback goes to MICROTASK queue
═══════════════════════════════════════════════════════════════════════════

  Call Stack              Web APIs              Queues
  ┌─────────────┐         ┌─────────────┐      Microtask: [Promise cb]
  │Promise.then │         │ Timer done  │ ───▶ Macrotask: [Timeout cb]
  └─────────────┘         └─────────────┘


═══════════════════════════════════════════════════════════════════════════
STEP 4: console.log('End') executes
═══════════════════════════════════════════════════════════════════════════

  Call Stack              Web APIs              Queues
  ┌─────────────┐         ┌─────────────┐      Microtask: [Promise cb]
  │console.log  │         │             │      Macrotask: [Timeout cb]
  └─────────────┘         └─────────────┘

  Output: "End"


═══════════════════════════════════════════════════════════════════════════
STEP 5: Stack empty! Event loop checks microtask queue FIRST
═══════════════════════════════════════════════════════════════════════════

  Call Stack              Web APIs              Queues
  ┌─────────────┐         ┌─────────────┐      Microtask: [] (emptied)
  │Promise cb   │ ◀─────────────────────────── Macrotask: [Timeout cb]
  └─────────────┘         └─────────────┘

  Output: "Promise"


═══════════════════════════════════════════════════════════════════════════
STEP 6: Microtask queue empty, now check macrotask queue
═══════════════════════════════════════════════════════════════════════════

  Call Stack              Web APIs              Queues
  ┌─────────────┐         ┌─────────────┐      Microtask: []
  │Timeout cb   │ ◀─────────────────────────── Macrotask: [] (emptied)
  └─────────────┘         └─────────────┘

  Output: "Timeout"


═══════════════════════════════════════════════════════════════════════════
DONE! Final Output: Start → End → Promise → Timeout
═══════════════════════════════════════════════════════════════════════════
```

---

## Microtasks vs Macrotasks

This is **critical** for interview questions!

| Microtasks (Higher Priority) | Macrotasks (Lower Priority) |
|------------------------------|----------------------------|
| Promise callbacks (.then/.catch/.finally) | setTimeout |
| queueMicrotask() | setInterval |
| MutationObserver | setImmediate (Node.js) |
| process.nextTick (Node.js) | I/O operations |
| | UI rendering |
| | requestAnimationFrame |

### Key Rule: Microtasks Run First!

After **every macrotask**, the event loop:
1. Executes **ALL** microtasks in the microtask queue
2. Then moves to the **next** macrotask

```javascript
// Demonstrates microtask priority
setTimeout(() => console.log('timeout 1'), 0);
setTimeout(() => console.log('timeout 2'), 0);

Promise.resolve().then(() => console.log('promise 1'));
Promise.resolve().then(() => console.log('promise 2'));

console.log('sync');

// Output:
// sync
// promise 1
// promise 2
// timeout 1
// timeout 2
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT LOOP CYCLE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. Execute synchronous code (call stack)                  │
│                      ↓                                      │
│   2. Is call stack empty?                                   │
│         │                                                   │
│         ├─ No → Keep executing                              │
│         │                                                   │
│         └─ Yes ↓                                            │
│                                                             │
│   3. Process ALL microtasks ◄─────────────────┐            │
│         │                                     │            │
│         └─ While microtask queue not empty ───┘            │
│                      ↓                                      │
│   4. Process ONE macrotask                                  │
│                      ↓                                      │
│   5. Go back to step 2                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Promise Execution Order

Promises are one of the trickiest parts. Let's break it down:

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => console.log('5'), 0);
});

console.log('6');
```

**Output:** `1, 6, 4, 2, 3, 5`

**Explanation:**

```
Phase 1: Synchronous
─────────────────────
console.log('1')  → Output: 1
setTimeout(cb1)   → Macrotask queue: [cb1]
Promise.then(cb2) → Microtask queue: [cb2]
console.log('6')  → Output: 6

Phase 2: Microtasks (before any macrotask)
─────────────────────
cb2 runs:
  console.log('4') → Output: 4
  setTimeout(cb3)  → Macrotask queue: [cb1, cb3]

Phase 3: First Macrotask (cb1)
─────────────────────
cb1 runs:
  console.log('2') → Output: 2
  Promise.then(cb4) → Microtask queue: [cb4]

Phase 4: Microtasks again (after macrotask)
─────────────────────
cb4 runs:
  console.log('3') → Output: 3

Phase 5: Next Macrotask (cb3)
─────────────────────
cb3 runs:
  console.log('5') → Output: 5

Final: 1, 6, 4, 2, 3, 5
```

---

## setTimeout and setInterval Behavior

### setTimeout is NOT Guaranteed

`setTimeout(fn, 0)` doesn't mean "run immediately" - it means "run as soon as possible after the stack is clear and all microtasks are done."

```javascript
console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

// Simulate heavy work
let i = 0;
while (i < 1000000000) { i++; }

console.log('End');

// Output: Start, End, Timeout
// The timeout callback waits until the sync code (including the loop) finishes
```

### Minimum Delay

Browsers enforce minimum delays:
- Nested setTimeout (after 5 levels): minimum 4ms
- Background tabs: often throttled to 1000ms

```javascript
// Trying to create a "0ms" timer
function nestedTimeout(depth) {
  const start = performance.now();
  setTimeout(() => {
    console.log(`Depth ${depth}: ${performance.now() - start}ms`);
    if (depth < 10) nestedTimeout(depth + 1);
  }, 0);
}

nestedTimeout(1);
// Depth 1: ~0ms
// Depth 2: ~0ms
// ...
// Depth 5+: ~4ms (minimum enforced)
```

---

## requestAnimationFrame Timing

`requestAnimationFrame` runs before the browser repaints (typically 60fps = every ~16.67ms).

```javascript
console.log('Start');

requestAnimationFrame(() => {
  console.log('rAF');
});

setTimeout(() => {
  console.log('Timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise');
});

console.log('End');

// Typical output: Start, End, Promise, Timeout, rAF
// (rAF waits for the paint cycle)
```

**Animation frame timing:**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRAME TIMELINE (~16ms)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tasks │ rAF callbacks │ Style │ Layout │ Paint │ Composite│
│  ──────┼───────────────┼───────┼────────┼───────┼──────────│
│        │               │       │        │       │          │
│  ◄─────────────── 16.67ms (60fps) ─────────────────────►   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## queueMicrotask API

ES2020 introduced `queueMicrotask()` to directly add to the microtask queue:

```javascript
console.log('Start');

queueMicrotask(() => {
  console.log('Microtask');
});

setTimeout(() => {
  console.log('Timeout');
}, 0);

console.log('End');

// Output: Start, End, Microtask, Timeout
```

**Use cases:**
- Scheduling work that must happen before the next render
- Batching state updates
- Ensuring callbacks run in consistent order

---

## Node.js Event Loop Phases

Node.js has a more complex event loop with multiple phases:

```
   ┌───────────────────────────┐
┌─▶│           timers          │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O callbacks deferred
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← internal use
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │◀─────│  connections, │
│  └─────────────┬─────────────┘      │  data, etc.   │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │  ← setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──│      close callbacks      │  ← socket.on('close')
   └───────────────────────────┘

Between each phase: process.nextTick and Promise callbacks run
```

### Node.js Specific: setImmediate vs setTimeout

```javascript
// Order is NOT guaranteed at top level
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

// Inside I/O callback, setImmediate is always first
const fs = require('fs');
fs.readFile('file.txt', () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// Output: immediate, timeout (guaranteed)
```

### process.nextTick

`process.nextTick` runs before any other microtask:

```javascript
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));

// Output: nextTick, promise
```

---

## Interview Practice: Predict the Output

### Challenge 1

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
Promise.resolve().then(() => setTimeout(() => console.log('4'), 0));
Promise.resolve().then(() => console.log('5'));
setTimeout(() => console.log('6'), 0);
console.log('7');
```

<details>
<summary>Answer</summary>

```
1
7
3
5
2
6
4
```

**Explanation:**
1. Sync: `1`, `7`
2. Microtasks: `3`, `5` (also schedules timeout `4`)
3. Macrotasks in order: `2`, `6`, `4`
</details>

### Challenge 2

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => console.log('setTimeout'), 0);

async1();

new Promise(resolve => {
  console.log('promise1');
  resolve();
}).then(() => console.log('promise2'));

console.log('script end');
```

<details>
<summary>Answer</summary>

```
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

**Key insight:** `await` pauses the function and the code after `await` becomes a microtask.
</details>

---

## Self-Assessment Questions

1. **Draw the Event Loop diagram from memory**
   <details>
   <summary>Key Components</summary>
   - Call Stack
   - Web APIs
   - Microtask Queue (Promise callbacks)
   - Macrotask Queue (setTimeout, etc.)
   - Event Loop (moves callbacks to stack when empty)
   </details>

2. **Predict the output order of: setTimeout, Promise.resolve, console.log**
   <details>
   <summary>Answer</summary>
   console.log (sync) → Promise callback (microtask) → setTimeout callback (macrotask)
   </details>

3. **Why do Promises run before setTimeout even if setTimeout is 0?**
   <details>
   <summary>Answer</summary>
   Promise callbacks go to the microtask queue, which has higher priority. After each macrotask (including the initial script), ALL microtasks run before the next macrotask.
   </details>

4. **What's the difference between the task queue and microtask queue?**
   <details>
   <summary>Answer</summary>
   - Microtask queue: Higher priority, emptied completely after each macrotask. Contains Promise callbacks.
   - Task (Macrotask) queue: Lower priority, only one task runs before checking microtasks again. Contains setTimeout callbacks.
   </details>

---

## Common Interview Questions

1. **What is the Event Loop?**
2. **Explain microtasks vs macrotasks**
3. **Why does setTimeout(fn, 0) not run immediately?**
4. **What happens when you nest setTimeout calls?**
5. **How does async/await relate to the Event Loop?**
6. **What's the order of execution for Promise.then vs setTimeout?**

---

## Related Topics

- [Call Stack](./02-call-stack.md) - Where synchronous code runs
- [Promises](./07-promises.md) - Create microtasks
- [Async/Await](./08-async-await.md) - Syntactic sugar for Promises

---

## External Resources

- [Philip Roberts: What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ) - **MUST WATCH**
- [Jake Archibald: In The Loop](https://www.youtube.com/watch?v=cCOL7MC4Pl0) - Deep dive
- [Loupe - Event Loop Visualizer](http://latentflip.com/loupe/) - Interactive tool
- [MDN: Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [JavaScript.info: Event Loop](https://javascript.info/event-loop)
- [Node.js Event Loop Documentation](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
