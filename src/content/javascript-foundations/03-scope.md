# Scope

## Why It Matters

**Scope** determines where variables are accessible in your code. Understanding scope helps you:

- Avoid naming conflicts
- Write more predictable code
- Understand closures
- Debug "variable not defined" errors
- Write secure code (avoid leaking variables)

> **Key Question:** Where can I access this variable from?

---

## What is Scope?

**Scope** is the current context of execution in which values and expressions are "visible" or can be referenced. Think of scope as the **visibility** or **accessibility** of variables.

```javascript
function outer() {
  const message = "Hello";  // message is scoped to outer()

  function inner() {
    console.log(message);   // Can access message (it's in outer scope)
  }

  inner();
}

outer();
console.log(message);  // ReferenceError! message is not in global scope
```

---

## Types of Scope

### 1. Global Scope

Variables declared outside any function or block are in the **global scope**. They're accessible everywhere.

```javascript
// Global scope
var globalVar = "I'm global";
let globalLet = "I'm also global";
const GLOBAL_CONST = "And me too";

function anyFunction() {
  console.log(globalVar);     // ✅ Accessible
  console.log(globalLet);     // ✅ Accessible
  console.log(GLOBAL_CONST);  // ✅ Accessible
}

anyFunction();
console.log(globalVar);       // ✅ Accessible
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│                     GLOBAL SCOPE                            │
│                                                             │
│   globalVar = "I'm global"                                  │
│   globalLet = "I'm also global"                             │
│   GLOBAL_CONST = "And me too"                               │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              anyFunction SCOPE                       │  │
│   │                                                      │  │
│   │   Can access: globalVar, globalLet, GLOBAL_CONST    │  │
│   │                                                      │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Warning:** Global variables are generally considered bad practice because:
- They can be accidentally overwritten
- They pollute the global namespace
- They make code harder to reason about

```javascript
// ❌ BAD - Implicit global (forgetting var/let/const)
function createGlobal() {
  accident = "I'm accidentally global!";  // No var/let/const!
}
createGlobal();
console.log(accident);  // Works! But this is a bug waiting to happen

// ✅ GOOD - Use strict mode to catch this
"use strict";
function preventAccident() {
  accident = "Error!";  // ReferenceError in strict mode
}
```

---

### 2. Function Scope

Variables declared with `var` inside a function are **function-scoped**. They're only accessible within that function.

```javascript
function myFunction() {
  var functionScoped = "Only inside myFunction";

  if (true) {
    var alsoFunctionScoped = "Still function scoped!";
  }

  console.log(functionScoped);      // ✅ Works
  console.log(alsoFunctionScoped);  // ✅ Works (var ignores blocks!)
}

myFunction();
console.log(functionScoped);        // ❌ ReferenceError
```

**Key insight:** `var` is function-scoped, NOT block-scoped!

```javascript
function varExample() {
  if (true) {
    var x = 10;  // var is function-scoped
  }
  console.log(x);  // 10 - x "escapes" the if block!
}

function letExample() {
  if (true) {
    let y = 10;  // let is block-scoped
  }
  console.log(y);  // ReferenceError - y is confined to if block
}
```

---

### 3. Block Scope (let/const)

Variables declared with `let` and `const` are **block-scoped**. A block is anything between `{ }`.

```javascript
{
  let blockLet = "Inside block";
  const blockConst = "Also inside block";
  var blockVar = "Not actually block scoped!";
}

console.log(blockVar);    // ✅ Works (var is function-scoped)
console.log(blockLet);    // ❌ ReferenceError
console.log(blockConst);  // ❌ ReferenceError
```

**Common block scopes:**

```javascript
// if/else blocks
if (condition) {
  let x = 1;  // Only inside this if
}

// for loops
for (let i = 0; i < 5; i++) {
  // i only exists inside this loop
}
console.log(i);  // ReferenceError

// while loops
while (condition) {
  const temp = getValue();  // Only inside this while
}

// Plain blocks (useful for limiting scope)
{
  const privateData = "secret";
  // do something with privateData
}
// privateData is gone
```

---

## Comparison: var vs let vs const

| Feature | `var` | `let` | `const` |
|---------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisting | Yes (initialized to `undefined`) | Yes (TDZ) | Yes (TDZ) |
| Re-declaration | ✅ Allowed | ❌ Error | ❌ Error |
| Re-assignment | ✅ Allowed | ✅ Allowed | ❌ Error |
| Use case | Legacy code | Variables that change | Constants, objects |

```javascript
// Re-declaration
var a = 1;
var a = 2;  // ✅ OK with var

let b = 1;
let b = 2;  // ❌ SyntaxError: Identifier 'b' has already been declared

// Re-assignment
const c = 1;
c = 2;  // ❌ TypeError: Assignment to constant variable

// But objects/arrays can be mutated!
const obj = { name: "Alice" };
obj.name = "Bob";  // ✅ OK! The reference is constant, not the content
obj = {};          // ❌ Error! Can't reassign the reference
```

---

## Scope Chain Lookup

When JavaScript needs a variable, it looks up the **scope chain**:

1. First, check the current scope
2. If not found, check the outer (parent) scope
3. Continue until reaching global scope
4. If still not found, throw `ReferenceError`

```javascript
const global = "I'm global";

function outer() {
  const outerVar = "I'm in outer";

  function middle() {
    const middleVar = "I'm in middle";

    function inner() {
      const innerVar = "I'm in inner";

      // Scope chain lookup:
      console.log(innerVar);   // Found in inner ✓
      console.log(middleVar);  // Not in inner → Found in middle ✓
      console.log(outerVar);   // Not in inner/middle → Found in outer ✓
      console.log(global);     // Not in inner/middle/outer → Found in global ✓
      console.log(notDefined); // Not found anywhere → ReferenceError!
    }

    inner();
  }

  middle();
}

outer();
```

**Visual scope chain:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ GLOBAL SCOPE                                                            │
│   global = "I'm global"                                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ outer() SCOPE                                                    │  │
│   │   outerVar = "I'm in outer"                                      │  │
│   │                                                                  │  │
│   │   ┌─────────────────────────────────────────────────────────┐   │  │
│   │   │ middle() SCOPE                                           │   │  │
│   │   │   middleVar = "I'm in middle"                            │   │  │
│   │   │                                                          │   │  │
│   │   │   ┌─────────────────────────────────────────────────┐   │   │  │
│   │   │   │ inner() SCOPE                                    │   │   │  │
│   │   │   │   innerVar = "I'm in inner"                      │   │   │  │
│   │   │   │                                                  │   │   │  │
│   │   │   │   Looking for 'global':                          │   │   │  │
│   │   │   │   inner? ❌ → middle? ❌ → outer? ❌ → global? ✅  │   │   │  │
│   │   │   └─────────────────────────────────────────────────┘   │   │  │
│   │   └─────────────────────────────────────────────────────────┘   │  │
│   └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Variable Shadowing

When a variable in an inner scope has the same name as one in an outer scope, the inner variable **shadows** the outer one.

```javascript
const name = "Global Name";

function showName() {
  const name = "Function Name";  // Shadows global 'name'

  if (true) {
    const name = "Block Name";   // Shadows function 'name'
    console.log(name);           // "Block Name"
  }

  console.log(name);             // "Function Name"
}

showName();
console.log(name);               // "Global Name"
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│ GLOBAL: name = "Global Name"                                │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ showName(): name = "Function Name"  ← shadows global │  │
│   │                                                      │  │
│   │   ┌─────────────────────────────────────────────┐   │  │
│   │   │ if block: name = "Block Name" ← shadows fn  │   │  │
│   │   └─────────────────────────────────────────────┘   │  │
│   └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Warning:** Shadowing can cause confusion. Use different names when possible:

```javascript
// ❌ Confusing
const data = fetchGlobalData();

function process() {
  const data = fetchLocalData();  // Which data?
  return transform(data);
}

// ✅ Clearer
const globalData = fetchGlobalData();

function process() {
  const localData = fetchLocalData();
  return transform(localData);
}
```

---

## Scope vs Context (Important Distinction!)

These terms are often confused but mean different things:

| Scope | Context |
|-------|---------|
| Where variables are accessible | What `this` refers to |
| Determined at write-time (lexical) | Determined at run-time |
| About variable visibility | About object reference |

```javascript
const obj = {
  name: "Object",

  // Same scope, different context
  regularMethod: function() {
    console.log(this.name);  // Context: obj
  },

  arrowMethod: () => {
    console.log(this.name);  // Context: inherited (probably global)
  }
};

obj.regularMethod();  // "Object" (this = obj)
obj.arrowMethod();    // undefined (this = global/window)

// Same context, different scope
function outer() {
  const outerVar = "outer";

  return {
    method() {
      // Scope: can access outerVar
      // Context: will depend on how method is called
      console.log(outerVar);
      console.log(this);
    }
  };
}
```

---

## Module Scope

ES6 modules have their own scope. Variables in a module are **not global** by default.

```javascript
// module.js
const privateVar = "Can't access from outside";
export const publicVar = "Can access if imported";

export function publicFn() {
  return privateVar;  // Module can access its own private vars
}

// main.js
import { publicVar, publicFn } from './module.js';

console.log(publicVar);    // ✅ "Can access if imported"
console.log(publicFn());   // ✅ "Can't access from outside"
console.log(privateVar);   // ❌ ReferenceError (not exported)
```

---

## Common Scope Pitfalls

### 1. The Classic Loop Problem

```javascript
// ❌ PROBLEM with var
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);  // Prints 3, 3, 3
  }, 100);
}
// Why? var is function-scoped, so there's only ONE i
// By the time callbacks run, i is 3

// ✅ SOLUTION 1: Use let
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);  // Prints 0, 1, 2
  }, 100);
}
// Why? let is block-scoped, so each iteration has its own i

// ✅ SOLUTION 2: IIFE (older approach)
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j);  // Prints 0, 1, 2
    }, 100);
  })(i);
}
```

### 2. Accidental Globals

```javascript
// ❌ PROBLEM
function addNumbers(a, b) {
  result = a + b;  // Forgot let/const! Creates global
  return result;
}

// ✅ SOLUTION: Use strict mode
"use strict";
function addNumbers(a, b) {
  result = a + b;  // ReferenceError: result is not defined
  return result;
}
```

### 3. Confusion with Hoisting

```javascript
// ❌ CONFUSING
console.log(x);  // undefined, not error!
var x = 5;

// What JS actually does:
var x;           // Hoisted to top
console.log(x);  // undefined
x = 5;

// ✅ CLEARER with let
console.log(y);  // ReferenceError - TDZ
let y = 5;
```

---

## Best Practices

1. **Use `const` by default**, `let` when you need to reassign
2. **Avoid `var`** in modern code
3. **Declare variables at the top** of their scope
4. **Use strict mode** (`"use strict"`) to catch errors
5. **Minimize global variables** - use modules or IIFE
6. **Don't shadow** variables unless intentional

```javascript
"use strict";

// ✅ Good practice
const CONFIG = { api: 'https://api.example.com' };

function processData(items) {
  const results = [];  // const by default

  for (let i = 0; i < items.length; i++) {  // let for loop counter
    const item = items[i];
    // process item
    results.push(item);
  }

  return results;
}
```

---

## Self-Assessment Questions

1. **What's the difference between function scope and block scope?**
   <details>
   <summary>Answer</summary>
   Function scope (var) means the variable is accessible throughout the entire function. Block scope (let/const) means the variable is only accessible within the { } block it's declared in.
   </details>

2. **Why does using `var` in a for loop with setTimeout print the wrong values?**
   <details>
   <summary>Answer</summary>
   `var` is function-scoped, so there's only one variable shared across all iterations. By the time the callbacks run, the loop has finished and the variable has its final value.
   </details>

3. **What is variable shadowing?**
   <details>
   <summary>Answer</summary>
   When a variable in an inner scope has the same name as a variable in an outer scope, the inner variable "shadows" (hides) the outer one within its scope.
   </details>

---

## Common Interview Questions

1. **What is scope in JavaScript?**
2. **Explain the difference between var, let, and const**
3. **What is the scope chain?**
4. **What's the difference between scope and context?**
5. **How does block scope differ from function scope?**
6. **What is variable hoisting?**

---

## Related Topics

- [Lexical Scope](./04-lexical-scope.md) - How scope is determined
- [Closures](./05-closures.md) - Functions that remember their scope
- [Execution Context](./01-execution-context.md) - Where scope lives
- [this Keyword](./09-this-keyword.md) - Context vs Scope

---

## External Resources

- [MDN: Scope](https://developer.mozilla.org/en-US/docs/Glossary/Scope)
- [JavaScript.info: Variable Scope](https://javascript.info/closure#lexical-environment)
- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures)
- [Wes Bos: var, let, const](https://wesbos.com/javascript-scoping)
