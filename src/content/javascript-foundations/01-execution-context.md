# Execution Context

## Why It Matters

JavaScript needs to know **what code to execute**, **where variables live**, and **which function call it's currently inside**. The Execution Context is how JavaScript organizes and tracks all of this. Understanding execution contexts is the foundation for understanding:

- Why hoisting happens
- How closures work
- What `this` refers to
- How the scope chain works

> **Key Question:** How does JavaScript know what code to execute, where variables live, and which function call it's currently inside?

---

## What is an Execution Context?

An **Execution Context** is an abstract concept that holds information about the environment within which the current code is being executed. Think of it as a "box" or "wrapper" that JavaScript creates to manage and run your code.

```
┌─────────────────────────────────────────────────────────────┐
│                    EXECUTION CONTEXT                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │  Variable           │  │  Lexical Environment        │  │
│  │  Environment        │  │  (Scope Chain)              │  │
│  │  ─────────────      │  │  ─────────────────────      │  │
│  │  - variables        │  │  - outer environment ref    │  │
│  │  - function decls   │  │  - environment record       │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  this binding                                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

Every execution context has three main components:
1. **Variable Environment** - Stores variables and function declarations
2. **Lexical Environment** - Manages scope chain and outer references
3. **This Binding** - Determines what `this` refers to

---

## Types of Execution Contexts

### 1. Global Execution Context (GEC)

The **Global Execution Context** is created when your JavaScript file first starts running. There is **only one** global execution context per program.

```javascript
// When this file runs, a Global Execution Context is created

var name = "Alice";        // Stored in global variable environment
let age = 25;              // Stored in global lexical environment
const city = "Seattle";    // Stored in global lexical environment

function greet() {         // Function declaration stored in GEC
  console.log("Hello!");
}

console.log(this);         // In browser: Window object
                           // In Node.js: {} (empty object in modules)
```

**Key points about GEC:**
| Question | Answer |
|----------|--------|
| When is it created? | Before any code runs |
| Is there only one? | Yes, one per program |
| What does it contain? | Global variables, functions, `window`/`global` object |
| What is `this` inside it? | `window` (browser) or `global` (Node.js) |

### 2. Function Execution Context (FEC)

A **new execution context** is created **every time a function is called**. Each function call gets its own execution context.

```javascript
function multiply(a, b) {
  // New FEC created here with:
  // - Variable Environment: { a: 5, b: 3, result: undefined }
  // - Lexical Environment: reference to outer (global) scope
  // - this: depends on how function was called

  var result = a * b;
  return result;
}

multiply(5, 3);  // Creates FEC #1
multiply(2, 4);  // Creates FEC #2 (different from #1!)
multiply(7, 8);  // Creates FEC #3 (different from #1 and #2!)
```

**Key points about FEC:**
| Question | Answer |
|----------|--------|
| When is it created? | Every time the function is **called** (not defined) |
| When is it destroyed? | When the function finishes executing |
| Why a new one for every call? | Each call might have different arguments and local variables |

```
If you call a function 100 times → 100 Function Execution Contexts are created
(though only one exists at a time after each returns)
```

### 3. Eval Execution Context (Rare)

Created when code runs inside `eval()`. Avoid using `eval()` in production code due to security risks.

---

## The Two Phases of Execution Context

When an execution context is created, it goes through **two phases**:

### Phase 1: Creation Phase

During the creation phase, JavaScript:

1. **Creates the Variable Environment**
   - Scans for `var` declarations and initializes them to `undefined`
   - Scans for function declarations and stores them completely

2. **Creates the Lexical Environment**
   - Scans for `let` and `const` declarations (but doesn't initialize them!)
   - Sets up the scope chain (outer environment reference)

3. **Determines `this` binding**

```javascript
console.log(name);     // undefined (var is hoisted, initialized to undefined)
console.log(greet);    // [Function: greet] (function is fully hoisted)
console.log(age);      // ReferenceError! (let is in TDZ)

var name = "Alice";
let age = 25;

function greet() {
  return "Hello!";
}
```

**Visual of Creation Phase:**

```
┌────────────────────────────────────────────────────────────┐
│                   CREATION PHASE                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   1. Memory allocation for variables & functions           │
│      ┌──────────────────────────────────────────────┐     │
│      │  var name = undefined  ← initialized!        │     │
│      │  let age = <uninitialized>  ← TDZ!          │     │
│      │  const city = <uninitialized>  ← TDZ!       │     │
│      │  function greet = [entire function]          │     │
│      └──────────────────────────────────────────────┘     │
│                                                            │
│   2. Scope chain setup (outer environment reference)       │
│                                                            │
│   3. this binding determined                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Phase 2: Execution Phase

JavaScript executes the code **line by line**:

1. Assigns values to variables
2. Executes function calls
3. Evaluates expressions

```javascript
// === CREATION PHASE ===
// name = undefined, greet = function, age = <TDZ>

// === EXECUTION PHASE ===
var name = "Alice";   // name is now "Alice"
let age = 25;         // age is now 25 (exits TDZ)

function greet() {
  return "Hello, " + name;
}

greet();              // New FEC created, "Hello, Alice" returned
```

**Visual of Execution Phase:**

```
┌────────────────────────────────────────────────────────────┐
│                   EXECUTION PHASE                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   Line 1: var name = "Alice"                               │
│           ├── name was undefined                           │
│           └── name is now "Alice"                          │
│                                                            │
│   Line 2: let age = 25                                     │
│           ├── age was in TDZ                               │
│           └── age is now 25 (exits TDZ)                    │
│                                                            │
│   Line 3-5: function greet() { ... }                       │
│             └── Already stored during creation phase       │
│                                                            │
│   Line 7: greet()                                          │
│           └── Creates NEW Function Execution Context       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Variable Environment vs Lexical Environment

These are often confusing because they're similar. Here's the key difference:

| Aspect | Variable Environment | Lexical Environment |
|--------|---------------------|---------------------|
| Stores | `var` declarations, function declarations | `let`, `const` declarations |
| Initial value | `undefined` for `var` | Uninitialized (TDZ) for `let`/`const` |
| Scope chain | No | Yes (has outer reference) |

```javascript
function example() {
  // Variable Environment: { x: undefined }
  // Lexical Environment: { y: <TDZ>, z: <TDZ> }

  var x = 10;
  let y = 20;
  const z = 30;
}
```

### The Outer Environment Reference

The Lexical Environment contains a reference to its **outer (parent) environment**. This is how the scope chain works:

```javascript
var global = "I'm global";

function outer() {
  var outerVar = "I'm in outer";

  function inner() {
    var innerVar = "I'm in inner";
    console.log(innerVar);   // Found in inner's environment
    console.log(outerVar);   // Found in outer's environment (via scope chain)
    console.log(global);     // Found in global environment (via scope chain)
  }

  inner();
}

outer();
```

**Scope Chain Visualization:**

```
┌─────────────────────────────────────────────────────────────────┐
│ GLOBAL EXECUTION CONTEXT                                        │
│ Variable Environment: { global: "I'm global", outer: fn }       │
│ outer: null (no outer reference)                                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼ outer() called
┌─────────────────────────────────────────────────────────────────┐
│ OUTER's EXECUTION CONTEXT                                       │
│ Variable Environment: { outerVar: "I'm in outer", inner: fn }   │
│ outer: → points to GLOBAL                                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼ inner() called
┌─────────────────────────────────────────────────────────────────┐
│ INNER's EXECUTION CONTEXT                                       │
│ Variable Environment: { innerVar: "I'm in inner" }              │
│ outer: → points to OUTER's context                              │
└─────────────────────────────────────────────────────────────────┘

When looking up 'global' in inner():
  1. Check inner's env → not found
  2. Check outer's env (via outer reference) → not found
  3. Check global's env (via outer reference) → FOUND!
```

---

## Hoisting Explained Through Execution Context

**Hoisting isn't magic** - it's a natural consequence of the Creation Phase. Let's trace through:

```javascript
console.log(a);    // undefined
console.log(b);    // ReferenceError: Cannot access 'b' before initialization
console.log(c);    // ReferenceError: c is not defined

var a = 1;
let b = 2;
// c is never declared
```

**Why does this happen?**

```
CREATION PHASE:
┌────────────────────────────────────────────────────────────┐
│  Variable Environment:                                      │
│    a: undefined  ← var is hoisted and initialized           │
│                                                             │
│  Lexical Environment:                                       │
│    b: <uninitialized>  ← let is hoisted but NOT initialized │
│                        ← This is the Temporal Dead Zone     │
└────────────────────────────────────────────────────────────┘

EXECUTION PHASE:
  Line 1: console.log(a)  → a exists (undefined)  ✓
  Line 2: console.log(b)  → b exists but uninitialized → TDZ Error!
  Line 3: console.log(c)  → c doesn't exist at all → ReferenceError!
```

### Function Hoisting

Function declarations are **fully hoisted** (the entire function body):

```javascript
greet();  // "Hello!" - works because function is fully hoisted

function greet() {
  console.log("Hello!");
}

sayBye(); // TypeError: sayBye is not a function

var sayBye = function() {
  console.log("Bye!");
};
// sayBye is hoisted as undefined (it's a var)
// The function assignment happens during execution phase
```

---

## Temporal Dead Zone (TDZ)

The **Temporal Dead Zone** is the period between entering a scope and the variable being declared.

```javascript
{
  // TDZ for 'x' starts here
  console.log(x);  // ReferenceError: Cannot access 'x' before initialization

  let x = 10;      // TDZ for 'x' ends here

  console.log(x);  // 10
}
```

**Why was TDZ introduced?**

1. **Catch bugs early** - Using variables before declaration is usually a mistake
2. **Consistency** - `const` must have a value when declared, so `let` follows the same pattern
3. **Better code** - Encourages declaring variables before using them

**Why doesn't `var` have TDZ?**

`var` was designed in 1995 when JavaScript was meant to be beginner-friendly and forgiving. The TDZ behavior was introduced with ES6 (2015) to help developers write more predictable code.

---

## Interview Deep-Dive: Complete Example

Let's trace through a complex example:

```javascript
var x = 1;

function foo() {
  console.log(x);  // What prints here?
  var x = 2;
  console.log(x);  // What prints here?
}

foo();
console.log(x);    // What prints here?
```

**Step-by-step execution:**

```
=== GLOBAL EXECUTION CONTEXT (Creation Phase) ===
Variable Environment: { x: undefined, foo: function }

=== GLOBAL EXECUTION CONTEXT (Execution Phase) ===
Line 1: x = 1
Line 9: foo() ← Creates new FEC

  === FOO EXECUTION CONTEXT (Creation Phase) ===
  Variable Environment: { x: undefined }  ← local x shadows global x!

  === FOO EXECUTION CONTEXT (Execution Phase) ===
  Line 4: console.log(x) → undefined (local x exists but is undefined)
  Line 5: x = 2
  Line 6: console.log(x) → 2

  === FOO EXECUTION CONTEXT destroyed ===

Line 10: console.log(x) → 1 (global x was never modified)

OUTPUT:
undefined
2
1
```

---

## Self-Assessment Questions

Test your understanding:

1. **Why does JavaScript create an execution context?**
   <details>
   <summary>Answer</summary>
   To manage the environment in which code runs - tracking variables, function declarations, scope chain, and the `this` binding.
   </details>

2. **What's the difference between Creation Phase and Execution Phase?**
   <details>
   <summary>Answer</summary>
   Creation Phase: Memory allocation, hoisting, scope chain setup, `this` determination.
   Execution Phase: Line-by-line code execution, variable assignments, function calls.
   </details>

3. **Why does hoisting happen?**
   <details>
   <summary>Answer</summary>
   Hoisting is a result of the Creation Phase. JavaScript scans for declarations before executing code, storing `var` as `undefined` and functions completely, while `let`/`const` remain uninitialized (TDZ).
   </details>

4. **Why was the Temporal Dead Zone introduced?**
   <details>
   <summary>Answer</summary>
   To catch bugs early by preventing use of `let`/`const` variables before declaration, and to enforce `const` always having a value.
   </details>

5. **If I call the same function 100 times, how many Function Execution Contexts are created?**
   <details>
   <summary>Answer</summary>
   100 execution contexts are created (one per call). Each is created when the function is called and destroyed when it returns.
   </details>

---

## Common Interview Questions

1. **What is an execution context?**
2. **Explain the difference between Global and Function Execution Contexts**
3. **What happens during the Creation Phase?**
4. **Why is `typeof undeclaredVar` not an error but `let` before declaration is?**
5. **Explain hoisting for `var`, `let`, `const`, function declarations, and function expressions**

---

## Related Topics

- [Call Stack](./02-call-stack.md) - Where execution contexts live
- [Closures](./05-closures.md) - How functions remember their lexical environment
- [this Keyword](./09-this-keyword.md) - How `this` is determined in each context
- [Scope](./03-scope.md) - How variable access is determined

---

## External Resources

- [MDN: Execution Context](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this#global_context)
- [JavaScript.info: Variable Scope, Closure](https://javascript.info/closure)
- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures)
- [Lydia Hallie: JavaScript Visualized - Execution Context](https://dev.to/lydiahallie/javascript-visualized-execution-context-2dh5)
