# Call Stack

## Why It Matters

The **Call Stack** is where Execution Contexts live. It's JavaScript's way of keeping track of **where it is in the code** and **which function called which**. Understanding the call stack is essential for:

- Debugging (reading stack traces)
- Understanding recursion
- Grasping the Event Loop
- Avoiding stack overflow errors

> **Key Question:** How does JavaScript keep track of where it is in the code and which function called which?

---

## What is the Call Stack?

The **Call Stack** is a data structure that records where in the program we are. When we call a function, we push it onto the stack. When we return from a function, we pop it off the stack.

```
┌─────────────────────────────────────────────────────────────┐
│                      CALL STACK                             │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  (empty when no code is running)                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                          ↑                                  │
│                    TOP OF STACK                             │
│               (next to execute/return)                      │
│                                                             │
│  Functions are PUSHED when called                           │
│  Functions are POPPED when they return                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Frames

Each entry in the call stack is called a **stack frame**. A stack frame contains:

1. **Function being executed**
2. **Arguments passed to the function**
3. **Local variables**
4. **Return address** (where to continue after the function returns)

```javascript
function multiply(a, b) {
  return a * b;
}

function square(n) {
  return multiply(n, n);
}

function printSquare(n) {
  const result = square(n);
  console.log(result);
}

printSquare(4);
```

**Stack frame visualization:**

```
┌─────────────────────────────────────────────────────────────┐
│ STACK FRAME for multiply(4, 4)                              │
├─────────────────────────────────────────────────────────────┤
│  Function: multiply                                         │
│  Arguments: a = 4, b = 4                                    │
│  Local variables: (none)                                    │
│  Return address: line in square() after multiply call       │
└─────────────────────────────────────────────────────────────┘
```

---

## LIFO Principle (Last-In, First-Out)

The call stack follows the **LIFO** principle: the last function pushed onto the stack is the first one to be popped off.

```javascript
function first() {
  console.log("First start");
  second();
  console.log("First end");
}

function second() {
  console.log("Second start");
  third();
  console.log("Second end");
}

function third() {
  console.log("Third");
}

first();
```

**Stack evolution:**

```
Step 1: first() is called
┌─────────────────┐
│    first()      │ ← TOP
└─────────────────┘

Step 2: second() is called from first()
┌─────────────────┐
│    second()     │ ← TOP
├─────────────────┤
│    first()      │
└─────────────────┘

Step 3: third() is called from second()
┌─────────────────┐
│    third()      │ ← TOP
├─────────────────┤
│    second()     │
├─────────────────┤
│    first()      │
└─────────────────┘

Step 4: third() returns (popped)
┌─────────────────┐
│    second()     │ ← TOP
├─────────────────┤
│    first()      │
└─────────────────┘

Step 5: second() returns (popped)
┌─────────────────┐
│    first()      │ ← TOP
└─────────────────┘

Step 6: first() returns (popped)
┌─────────────────┐
│    (empty)      │
└─────────────────┘
```

**Output:**
```
First start
Second start
Third
Second end
First end
```

---

## Complete Trace Example

Let's trace through a more complex example:

```javascript
function add(a, b) {
  return a + b;
}

function average(a, b) {
  const sum = add(a, b);
  return sum / 2;
}

function printAverage(x, y) {
  const result = average(x, y);
  console.log("Average:", result);
}

printAverage(10, 20);
```

**Step-by-step stack trace:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  CALL STACK TRACE                                                         ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  1. printAverage(10, 20) called                                           ║
║     ┌─────────────────────────────┐                                       ║
║     │ printAverage(10, 20)        │                                       ║
║     └─────────────────────────────┘                                       ║
║                                                                           ║
║  2. average(10, 20) called from printAverage                              ║
║     ┌─────────────────────────────┐                                       ║
║     │ average(10, 20)             │ ← currently executing                 ║
║     ├─────────────────────────────┤                                       ║
║     │ printAverage(10, 20)        │ ← waiting                             ║
║     └─────────────────────────────┘                                       ║
║                                                                           ║
║  3. add(10, 20) called from average                                       ║
║     ┌─────────────────────────────┐                                       ║
║     │ add(10, 20)                 │ ← currently executing                 ║
║     ├─────────────────────────────┤                                       ║
║     │ average(10, 20)             │ ← waiting                             ║
║     ├─────────────────────────────┤                                       ║
║     │ printAverage(10, 20)        │ ← waiting                             ║
║     └─────────────────────────────┘                                       ║
║                                                                           ║
║  4. add returns 30, popped off stack                                      ║
║     ┌─────────────────────────────┐                                       ║
║     │ average(10, 20)             │ ← resumes with sum = 30               ║
║     ├─────────────────────────────┤                                       ║
║     │ printAverage(10, 20)        │ ← waiting                             ║
║     └─────────────────────────────┘                                       ║
║                                                                           ║
║  5. average returns 15, popped off stack                                  ║
║     ┌─────────────────────────────┐                                       ║
║     │ printAverage(10, 20)        │ ← resumes with result = 15            ║
║     └─────────────────────────────┘                                       ║
║                                                                           ║
║  6. console.log runs, printAverage returns, stack empty                   ║
║     ┌─────────────────────────────┐                                       ║
║     │        (empty)              │                                       ║
║     └─────────────────────────────┘                                       ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## Stack Overflow

A **stack overflow** occurs when the call stack exceeds its maximum size. This typically happens with:

1. **Infinite recursion** (most common)
2. **Very deep recursion** without base case
3. **Mutually recursive functions** without termination

### Example: Infinite Recursion

```javascript
function recurse() {
  recurse();  // Calls itself forever
}

recurse();
// Error: Maximum call stack size exceeded
```

**What happens:**

```
┌─────────────────────────────────────────────────────────────┐
│                      CALL STACK                             │
├─────────────────────────────────────────────────────────────┤
│  recurse()   ← call #10,000+                                │
├─────────────────────────────────────────────────────────────┤
│  recurse()                                                  │
├─────────────────────────────────────────────────────────────┤
│  recurse()                                                  │
├─────────────────────────────────────────────────────────────┤
│  ... (thousands more)                                       │
├─────────────────────────────────────────────────────────────┤
│  recurse()   ← call #1                                      │
└─────────────────────────────────────────────────────────────┘
                    ↓
        💥 STACK OVERFLOW! 💥
```

### How to Prevent Stack Overflow

**1. Always have a base case in recursion:**

```javascript
// ❌ BAD - No base case
function countdown(n) {
  console.log(n);
  countdown(n - 1);
}

// ✅ GOOD - Has base case
function countdown(n) {
  if (n <= 0) {
    console.log("Done!");
    return;  // Base case - stops recursion
  }
  console.log(n);
  countdown(n - 1);
}
```

**2. Use iteration for very deep operations:**

```javascript
// ❌ RISKY - Deep recursion
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
factorial(100000);  // Stack overflow!

// ✅ SAFE - Iterative
function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

**3. Use tail call optimization (where supported):**

```javascript
// Tail-recursive version (optimizable in strict mode)
"use strict";
function factorial(n, accumulator = 1) {
  if (n <= 1) return accumulator;
  return factorial(n - 1, n * accumulator);  // Tail call
}
```

### Maximum Call Stack Size

The maximum varies by environment:

| Environment | Approximate Limit |
|-------------|-------------------|
| Chrome | ~10,000 - 15,000 frames |
| Firefox | ~50,000 - 100,000 frames |
| Node.js | ~10,000 - 15,000 frames |

---

## Debugging with the Call Stack

When an error occurs, JavaScript provides a **stack trace** showing the call stack at the moment of the error.

```javascript
function problematic() {
  throw new Error("Something went wrong!");
}

function middle() {
  problematic();
}

function outer() {
  middle();
}

outer();
```

**Stack trace output:**

```
Error: Something went wrong!
    at problematic (script.js:2:9)
    at middle (script.js:6:3)
    at outer (script.js:10:3)
    at script.js:13:1
```

**Reading the stack trace:**

```
Error: Something went wrong!
    at problematic (script.js:2:9)   ← Error thrown here (top of stack)
    at middle (script.js:6:3)        ← Called from middle()
    at outer (script.js:10:3)        ← Called from outer()
    at script.js:13:1                ← Called from global scope

Read bottom to top to trace the call path:
global → outer() → middle() → problematic() → ERROR!
```

### Using DevTools

In browser DevTools:

1. **Sources tab** → Set breakpoints
2. **Call Stack panel** → Shows current stack
3. **Step through** → Watch stack grow and shrink

```
┌─────────────────────────────────────────────────────────────┐
│  DevTools - Sources                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Call Stack                     │  Scope                    │
│  ──────────────                 │  ─────                    │
│  ▶ problematic       script:2  │  Local                    │
│  ▶ middle            script:6  │    (no variables)         │
│  ▶ outer             script:10 │                           │
│  ▶ (anonymous)       script:13 │  Global                   │
│                                │    window: Window         │
└─────────────────────────────────────────────────────────────┘
```

---

## Async Operations and the Stack

The call stack only handles **synchronous** code. Asynchronous operations work differently:

```javascript
console.log("Start");

setTimeout(() => {
  console.log("Timeout callback");
}, 0);

console.log("End");
```

**Output:**
```
Start
End
Timeout callback
```

**Why? The Event Loop!**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   CALL STACK              WEB APIs              CALLBACK QUEUE          │
│   ──────────              ────────              ──────────────          │
│                                                                         │
│  1. console.log("Start")                                                │
│     ┌────────────────┐                                                  │
│     │ console.log()  │                                                  │
│     └────────────────┘                                                  │
│     Output: "Start"                                                     │
│                                                                         │
│  2. setTimeout() called - callback sent to Web APIs                     │
│     ┌────────────────┐    ┌─────────────────┐                          │
│     │ setTimeout()   │───▶│ Timer (0ms)     │                          │
│     └────────────────┘    └─────────────────┘                          │
│                                                                         │
│  3. console.log("End")                                                  │
│     ┌────────────────┐                        ┌──────────────────┐     │
│     │ console.log()  │                        │ callback waiting │     │
│     └────────────────┘                        └──────────────────┘     │
│     Output: "End"                                                       │
│                                                                         │
│  4. Stack is EMPTY - Event loop moves callback to stack                 │
│     ┌────────────────┐                                                  │
│     │ callback()     │◀───────────────────────────────────────         │
│     └────────────────┘                                                  │
│     Output: "Timeout callback"                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

> **Key insight:** The callback only runs when the call stack is **empty**. This is why even `setTimeout(fn, 0)` doesn't run immediately.

---

## Self-Assessment Questions

1. **Where do Execution Contexts live?**
   <details>
   <summary>Answer</summary>
   In the Call Stack. Each function call creates an execution context that's pushed onto the stack.
   </details>

2. **What happens to the Call Stack when a function returns?**
   <details>
   <summary>Answer</summary>
   The function's execution context is popped off the stack, and execution continues where it left off in the calling function.
   </details>

3. **Why does infinite recursion cause a stack overflow?**
   <details>
   <summary>Answer</summary>
   Each recursive call adds a new frame to the stack. Without a base case to stop, frames keep adding until the maximum stack size is exceeded.
   </details>

---

## Common Interview Questions

1. **What is the call stack?**
2. **Explain LIFO in the context of the call stack**
3. **What causes a stack overflow? How do you prevent it?**
4. **How do you read a stack trace?**
5. **Why doesn't setTimeout(fn, 0) execute immediately?**
6. **What's the difference between the call stack and the callback queue?**

---

## Practical Exercises

### Exercise 1: Trace the Stack

What's the order of console.log outputs?

```javascript
function a() {
  console.log('a start');
  b();
  console.log('a end');
}

function b() {
  console.log('b start');
  c();
  console.log('b end');
}

function c() {
  console.log('c');
}

a();
```

<details>
<summary>Answer</summary>

```
a start
b start
c
b end
a end
```

Stack trace:
1. `a()` pushed → "a start"
2. `b()` pushed → "b start"
3. `c()` pushed → "c"
4. `c()` popped
5. "b end"
6. `b()` popped
7. "a end"
8. `a()` popped
</details>

### Exercise 2: Fix the Stack Overflow

```javascript
function sum(n) {
  return n + sum(n - 1);
}

sum(5);  // Should return 15
```

<details>
<summary>Answer</summary>

```javascript
function sum(n) {
  if (n <= 0) return 0;  // Base case!
  return n + sum(n - 1);
}

sum(5);  // Returns 15
```
</details>

---

## Related Topics

- [Execution Context](./01-execution-context.md) - What each stack frame contains
- [Event Loop](./06-event-loop.md) - How async operations work with the stack
- [Recursion](#) - Common patterns that use the stack heavily

---

## External Resources

- [MDN: Call Stack](https://developer.mozilla.org/en-US/docs/Glossary/Call_stack)
- [JavaScript.info: Recursion and Stack](https://javascript.info/recursion)
- [Loupe - Visualize the Event Loop](http://latentflip.com/loupe/) - Interactive visualization
- [Philip Roberts: What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ) - Must-watch video
