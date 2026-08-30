# Lexical Scope

## Why It Matters

**Lexical scope** (also called **static scope**) determines how variable names are resolved in nested functions. Understanding lexical scope is the foundation for understanding **closures** - one of the most powerful features in JavaScript.

> **Key Question:** How does JavaScript decide which variable to use when there are multiple variables with the same name in different scopes?

---

## What is Lexical Scope?

**Lexical** means "relating to words/text" - it refers to where code is **written**, not where it's **executed**.

In JavaScript, scope is determined **at the time you write your code** (compile-time), not when the code runs (run-time). This is called **lexical scoping** or **static scoping**.

```javascript
const name = "Global";

function outer() {
  const name = "Outer";

  function inner() {
    console.log(name);  // Which name? Decided at WRITE time!
  }

  inner();
}

outer();  // Prints "Outer"
```

The function `inner()` looks for `name` in its lexical environment - where it was **written** (inside `outer`), not where it might be **called** from.

---

## Static vs Dynamic Scope

JavaScript uses **static (lexical) scope**. Some other languages use **dynamic scope**. Here's the difference:

```javascript
const x = 10;

function foo() {
  console.log(x);  // What does x refer to?
}

function bar() {
  const x = 20;
  foo();  // Calling foo from inside bar
}

bar();
```

| Scope Type | What `foo()` prints | Why |
|------------|---------------------|-----|
| **Lexical (JavaScript)** | `10` | `foo` was **defined** in global scope, where x = 10 |
| **Dynamic (not JS)** | `20` | `foo` was **called** from `bar`, where x = 20 |

**Visual comparison:**

```
LEXICAL SCOPE (JavaScript uses this)
════════════════════════════════════

┌────────────────────────────────────────────────┐
│ GLOBAL: x = 10                                 │
│                                                │
│   function foo() {                             │
│     console.log(x);  ─────────────────┐       │
│   }                                   │       │
│                                       │       │
│   ┌────────────────────────────────┐  │       │
│   │ bar(): x = 20                  │  │       │
│   │                                │  │       │
│   │   foo();  // calls foo         │  │       │
│   │           // but foo looks UP  │  │       │
│   │           // to where it was   │  │       │
│   │           // WRITTEN (global)  │  │       │
│   └────────────────────────────────┘  │       │
│                                       │       │
│   x = 10 ◄────────────────────────────┘       │
└────────────────────────────────────────────────┘

Output: 10



DYNAMIC SCOPE (JavaScript does NOT use this)
════════════════════════════════════════════

If JS used dynamic scope:

  bar() calls foo()
       ↓
  foo() looks for x in CALLING scope (bar)
       ↓
  x = 20 (from bar)

Output would be: 20
```

---

## Scope Determined at Write-Time

The key insight: **you can determine scope by looking at the code**, without running it.

```javascript
function createGreeting(greeting) {
  // At WRITE time, we know:
  // - greeting is in this function's scope
  // - name will be looked up in outer scope

  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = createGreeting("Hello");
const sayHi = createGreeting("Hi");

// Even though createGreeting has finished running,
// the returned functions "remember" their greeting
sayHello("Alice");  // "Hello, Alice!"
sayHi("Bob");       // "Hi, Bob!"
```

This is possible because of lexical scope - the inner function's scope was determined when it was **written** inside `createGreeting`.

---

## Nested Function Scoping

Functions can be nested, and each level creates its own scope:

```javascript
function level1() {
  const a = "Level 1";

  function level2() {
    const b = "Level 2";

    function level3() {
      const c = "Level 3";

      // Can access: c, b, a (all outer scopes)
      console.log(c, b, a);
    }

    // Can access: b, a
    // Cannot access: c
    level3();
  }

  // Can access: a
  // Cannot access: b, c
  level2();
}

level1();
```

**Scope nesting visualization:**

```
┌─────────────────────────────────────────────────────────────┐
│ level1 SCOPE                                                │
│   a = "Level 1"                                             │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ level2 SCOPE                                         │  │
│   │   b = "Level 2"                                      │  │
│   │   Can see: a                                         │  │
│   │                                                      │  │
│   │   ┌─────────────────────────────────────────────┐   │  │
│   │   │ level3 SCOPE                                 │   │  │
│   │   │   c = "Level 3"                              │   │  │
│   │   │   Can see: a, b                              │   │  │
│   │   │                                              │   │  │
│   │   │   console.log(c, b, a) ✅                    │   │  │
│   │   └─────────────────────────────────────────────┘   │  │
│   │                                                      │  │
│   │   console.log(c) ❌ c not visible here              │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   console.log(b) ❌ b not visible here                     │
└─────────────────────────────────────────────────────────────┘
```

---

## The Scope Chain

When JavaScript looks up a variable, it follows the **scope chain**:

1. Check current scope
2. Check parent scope
3. Check grandparent scope
4. ... continue until global scope
5. If not found, throw `ReferenceError`

```javascript
const global = "GLOBAL";

function outer() {
  const outer = "OUTER";

  function middle() {
    const middle = "MIDDLE";

    function inner() {
      const inner = "INNER";

      // Lookup for 'outer':
      // 1. inner scope? No 'outer' ❌
      // 2. middle scope? No 'outer' ❌
      // 3. outer scope? Found 'outer'! ✅
      console.log(outer);  // "OUTER"
    }

    inner();
  }

  middle();
}

outer();
```

**Scope chain diagram:**

```
Looking up 'outer' from inner():

inner scope ──────────────────┐
  │                           │
  │ outer? ❌ Not here        │
  │                           │
  ▼                           │
middle scope                  │
  │                           │
  │ outer? ❌ Not here        │
  │                           │
  ▼                           │
outer scope ◄─────────────────┘
  │
  │ outer? ✅ FOUND! "OUTER"
  │
  ▼ (would continue to global if not found)
global scope
```

---

## Module Scope

ES6 modules introduce another level of scope between function and global:

```javascript
// module.js
const modulePrivate = "Only in this module";

export const modulePublic = "Accessible when imported";

export function getPrivate() {
  return modulePrivate;  // Module scope can access private
}

// main.js
import { modulePublic, getPrivate } from './module.js';

console.log(modulePublic);      // ✅ "Accessible when imported"
console.log(getPrivate());      // ✅ "Only in this module"
console.log(modulePrivate);     // ❌ ReferenceError
```

**Module scope hierarchy:**

```
┌─────────────────────────────────────────────────────────────┐
│ GLOBAL SCOPE                                                │
│   (window in browser, global in Node)                       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ MODULE SCOPE (module.js)                             │  │
│   │   modulePrivate = "..."                              │  │
│   │   modulePublic = "..." (exported)                    │  │
│   │                                                      │  │
│   │   ┌─────────────────────────────────────────────┐   │  │
│   │   │ FUNCTION SCOPE (getPrivate)                  │   │  │
│   │   │   Can access: modulePrivate, modulePublic    │   │  │
│   │   └─────────────────────────────────────────────┘   │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ MODULE SCOPE (main.js)                               │  │
│   │   Can only access what's imported                    │  │
│   └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Eval and Scope Manipulation (Advanced)

`eval()` can modify scope at runtime, which is why it's dangerous and discouraged:

```javascript
function example() {
  const x = 10;

  // eval can create variables in the current scope
  eval('var y = 20');

  console.log(x);  // 10
  console.log(y);  // 20 (created by eval!)
}

example();
```

**Why `eval` is problematic:**

1. **Security risk** - can execute arbitrary code
2. **Performance** - prevents JS engine optimizations
3. **Debugging** - makes scope unpredictable
4. **Strict mode** - eval gets its own scope in strict mode

```javascript
"use strict";
function strictExample() {
  eval('var x = 10');
  console.log(x);  // ReferenceError! eval's scope is isolated
}
```

> **Best practice:** Never use `eval()`. If you think you need it, you probably don't.

---

## Lexical Scope and Closures

Lexical scope is what makes **closures** possible:

```javascript
function createCounter() {
  let count = 0;  // This is in createCounter's lexical scope

  return function() {
    count++;      // Inner function can access count
    return count; // because of lexical scoping
  };
}

const counter = createCounter();
console.log(counter());  // 1
console.log(counter());  // 2
console.log(counter());  // 3

// count is "closed over" - the inner function
// maintains access to its lexical scope
```

The inner function "remembers" its lexical environment even after `createCounter()` has finished executing. This is a **closure**.

---

## Practical Examples

### Example 1: Private Variables

```javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance;  // Private! Lexically scoped

  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount <= balance) {
        balance -= amount;
        return balance;
      }
      throw new Error("Insufficient funds");
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(100);
account.deposit(50);   // 150
account.withdraw(30);  // 120
account.getBalance();  // 120
account.balance;       // undefined - can't access directly!
```

### Example 2: Function Factory

```javascript
function createMultiplier(multiplier) {
  // multiplier is in this function's lexical scope

  return function(number) {
    return number * multiplier;  // Accesses multiplier lexically
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

double(5);  // 10
triple(5);  // 15

// Each returned function has its own lexical environment
// with its own value of multiplier
```

### Example 3: Event Handlers

```javascript
function setupButton(buttonId, message) {
  const button = document.getElementById(buttonId);

  button.addEventListener('click', function() {
    // This function can access 'message' because of lexical scope
    alert(message);
  });
}

setupButton('btn1', 'Hello!');
setupButton('btn2', 'Goodbye!');

// Each button's handler has its own lexical scope
// with its own 'message' value
```

---

## Self-Assessment Questions

1. **What is lexical scope?**
   <details>
   <summary>Answer</summary>
   Lexical scope means that scope is determined by where code is written (at compile/parse time), not where it's executed (at runtime).
   </details>

2. **What's the difference between lexical and dynamic scope?**
   <details>
   <summary>Answer</summary>
   Lexical scope: Variables are resolved based on where functions are defined.
   Dynamic scope: Variables would be resolved based on where functions are called.
   JavaScript uses lexical scope.
   </details>

3. **How does the scope chain work?**
   <details>
   <summary>Answer</summary>
   When looking up a variable, JavaScript checks the current scope first, then the parent scope, then grandparent, etc., until it reaches global scope or finds the variable.
   </details>

4. **Why is lexical scope important for closures?**
   <details>
   <summary>Answer</summary>
   Lexical scope allows inner functions to "remember" variables from their outer functions, even after the outer function has returned. This is what creates closures.
   </details>

---

## Common Interview Questions

1. **What is lexical scope?**
2. **How is scope determined in JavaScript?**
3. **What's the difference between lexical and dynamic scope?**
4. **How does the scope chain work in nested functions?**
5. **Why should you avoid `eval()`?**

---

## Related Topics

- [Scope](./03-scope.md) - Basic scope concepts
- [Closures](./05-closures.md) - How lexical scope enables closures
- [Execution Context](./01-execution-context.md) - Where lexical environments live

---

## External Resources

- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [JavaScript.info: Lexical Environment](https://javascript.info/closure#lexical-environment)
- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch2.md)
- [Kyle Simpson: Lexical Scope](https://frontendmasters.com/courses/deep-javascript-v3/)
