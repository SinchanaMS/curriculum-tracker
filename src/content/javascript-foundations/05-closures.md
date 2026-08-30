# Closures

## Why It Matters

Closures are one of the **most powerful** and **most asked about** features in JavaScript. They enable:

- Data privacy (private variables)
- Function factories
- Partial application & currying
- Module patterns
- React hooks (useState, useEffect, etc.)
- Event handlers that remember data

> **Key Question:** How can a function remember variables from the place where it was defined, even after that place is "gone"?

---

## What is a Closure?

A **closure** is a function that has access to variables from its outer (enclosing) scope, even after the outer function has finished executing.

In other words: **A closure is a function bundled together with references to its surrounding state (lexical environment).**

```javascript
function outer() {
  const message = "Hello from outer!";

  function inner() {
    console.log(message);  // inner "closes over" message
  }

  return inner;
}

const myFunc = outer();  // outer() finishes executing
myFunc();                // "Hello from outer!" - Still works!
```

**Wait, how?** The variable `message` was inside `outer()`, and `outer()` has finished running. Shouldn't `message` be gone?

No! Because `inner` forms a **closure** over `message`. It maintains a reference to its lexical environment.

---

## How Closures Work

When a function is created, it doesn't just store its code - it also stores a reference to its **lexical environment** (the scope where it was defined).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HOW CLOSURES WORK                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. outer() is called                                                   │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │ outer's Execution Context                                    │    │
│     │   message = "Hello from outer!"                              │    │
│     │   inner = function (has reference to this environment)       │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  2. outer() returns inner                                               │
│     - outer's execution context would normally be garbage collected     │
│     - BUT inner still has a reference to it (closure!)                  │
│                                                                         │
│  3. myFunc = inner (with its closure)                                   │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │ myFunc                                                       │    │
│     │   - function code                                            │    │
│     │   - [[Environment]]: reference to outer's scope              │    │
│     │                      { message: "Hello from outer!" }        │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  4. myFunc() is called                                                  │
│     - Looks for 'message' in its closure                               │
│     - Finds it! Prints "Hello from outer!"                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Simple Explanation

**Explain closures to a 5-year-old:**

> Imagine you have a backpack. When you leave your house (the outer function), you take your backpack with you. Inside your backpack, you have your favorite toy (the variable). Even though you're not at home anymore, you still have your toy because it's in your backpack!
>
> A closure is like that backpack - it lets a function carry variables with it wherever it goes.

---

## When is a Closure Created?

A closure is created **every time a function is created**. But we typically only notice/use closures when:

1. An inner function references variables from an outer function
2. The inner function is executed outside of the outer function's scope

```javascript
// Closure created but not useful
function noUsefulClosure() {
  const x = 10;
  console.log(x);  // Uses x directly, no closure needed
}

// Useful closure
function usefulClosure() {
  const x = 10;
  return function() {
    console.log(x);  // x accessed via closure after outer returns
  };
}
```

---

## Practical Use Cases

### 1. Data Privacy (Private Variables)

Closures allow you to create private variables that can't be accessed from outside:

```javascript
function createCounter() {
  let count = 0;  // Private variable

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
counter.increment();  // 1
counter.increment();  // 2
counter.getCount();   // 2

// Cannot access count directly!
counter.count;        // undefined
console.log(count);   // ReferenceError
```

**Visualization:**

```
┌─────────────────────────────────────────────────────────────┐
│  createCounter() returns an object                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  CLOSURE (private scope)                              │ │
│  │    count = 0                                          │ │
│  │              ↑                                        │ │
│  │              │ (only accessible via methods)          │ │
│  │              │                                        │ │
│  └──────────────┼────────────────────────────────────────┘ │
│                 │                                           │
│  ┌──────────────┴────────────────────────────────────────┐ │
│  │  PUBLIC API (returned object)                         │ │
│  │    increment()  ──→ can access count                  │ │
│  │    decrement()  ──→ can access count                  │ │
│  │    getCount()   ──→ can access count                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  OUTSIDE: count is NOT accessible                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. Function Factories

Create functions with pre-configured behavior:

```javascript
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
const tenTimes = createMultiplier(10);

double(5);    // 10
triple(5);    // 15
tenTimes(5);  // 50

// Each function has its own closure with its own multiplier
```

### 3. Partial Application & Currying

Pre-fill some arguments of a function:

```javascript
// Partial Application
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

function createGreeter(greeting) {
  return function(name) {
    return greet(greeting, name);  // greeting is "partially applied"
  };
}

const sayHello = createGreeter("Hello");
const sayGoodbye = createGreeter("Goodbye");

sayHello("Alice");    // "Hello, Alice!"
sayGoodbye("Bob");    // "Goodbye, Bob!"

// Currying - transform function to accept one argument at a time
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

const curriedGreet = curry(greet);
curriedGreet("Hi")("Charlie");  // "Hi, Charlie!"
```

### 4. Module Pattern

Create modules with private and public parts:

```javascript
const Calculator = (function() {
  // Private
  let result = 0;

  function validate(n) {
    if (typeof n !== 'number') {
      throw new Error('Must be a number');
    }
  }

  // Public API
  return {
    add(n) {
      validate(n);
      result += n;
      return this;
    },
    subtract(n) {
      validate(n);
      result -= n;
      return this;
    },
    multiply(n) {
      validate(n);
      result *= n;
      return this;
    },
    getResult() {
      return result;
    },
    reset() {
      result = 0;
      return this;
    }
  };
})();  // IIFE - Immediately Invoked Function Expression

Calculator.add(5).multiply(2).subtract(3).getResult();  // 7
Calculator.result;  // undefined (private!)
Calculator.validate;  // undefined (private!)
```

### 5. Event Handlers (React-like patterns)

```javascript
function setupButtons() {
  const buttons = document.querySelectorAll('button');

  buttons.forEach((button, index) => {
    // Each handler closes over its own 'index'
    button.addEventListener('click', () => {
      console.log(`Button ${index} clicked`);
    });
  });
}

// React useState simulation
function useState(initialValue) {
  let state = initialValue;

  function getState() {
    return state;
  }

  function setState(newValue) {
    state = newValue;
    // In real React, this would trigger re-render
  }

  return [getState, setState];
}

const [getCount, setCount] = useState(0);
getCount();     // 0
setCount(5);
getCount();     // 5
```

---

## Memory Implications

Closures keep references to their outer scope, which means those variables **can't be garbage collected** as long as the closure exists.

```javascript
function createHugeArray() {
  const hugeArray = new Array(1000000).fill('data');

  return function() {
    console.log(hugeArray.length);  // Keeps hugeArray in memory!
  };
}

const myFunc = createHugeArray();
// hugeArray (millions of bytes) is still in memory
// because myFunc's closure references it

// To free memory:
// myFunc = null;  // Now hugeArray can be garbage collected
```

### When Closures Cause Memory Leaks

```javascript
// ❌ MEMORY LEAK - closure keeps reference unnecessarily
function setupHandler() {
  const largeData = fetchLargeData();

  element.addEventListener('click', function() {
    // This closure keeps largeData in memory
    // even if we only need element
    console.log('clicked');
  });
}

// ✅ BETTER - don't close over unnecessary variables
function setupHandler() {
  const largeData = fetchLargeData();
  processData(largeData);  // Use it immediately

  element.addEventListener('click', function() {
    console.log('clicked');  // No closure over largeData
  });
}

// ✅ ALSO GOOD - remove listener when done
function setupHandler() {
  const handler = function() {
    console.log('clicked');
  };

  element.addEventListener('click', handler);

  // Return cleanup function
  return function cleanup() {
    element.removeEventListener('click', handler);
  };
}
```

---

## Common Closure Pitfalls

### The Classic Loop Problem

```javascript
// ❌ PROBLEM - All functions share the same 'i'
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // Prints: 3, 3, 3
  }, 100);
}

// WHY?
// - var is function-scoped, so there's ONE 'i' variable
// - All three functions close over the SAME 'i'
// - By the time they run, i = 3
```

**Visual explanation:**

```
Loop with var:
┌─────────────────────────────────────────────────────────────┐
│  SINGLE SCOPE                                               │
│    i = 0 → 1 → 2 → 3                                       │
│                                                             │
│    callback1 ──┐                                            │
│    callback2 ──┼──→ all reference same 'i' (now 3)         │
│    callback3 ──┘                                            │
└─────────────────────────────────────────────────────────────┘

Output: 3, 3, 3
```

**Solutions:**

```javascript
// ✅ SOLUTION 1: Use let (creates new binding each iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // Prints: 0, 1, 2
  }, 100);
}

// ✅ SOLUTION 2: IIFE to create new scope
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j);  // Prints: 0, 1, 2
    }, 100);
  })(i);
}

// ✅ SOLUTION 3: Use forEach (each callback has own scope)
[0, 1, 2].forEach(function(i) {
  setTimeout(function() {
    console.log(i);  // Prints: 0, 1, 2
  }, 100);
});
```

**Visual with let:**

```
Loop with let:
┌─────────────────────────────────────────────────────────────┐
│  Iteration 0:                                               │
│  ┌────────────────┐                                         │
│  │ i = 0          │ ← callback1 closes over THIS i          │
│  └────────────────┘                                         │
│                                                             │
│  Iteration 1:                                               │
│  ┌────────────────┐                                         │
│  │ i = 1          │ ← callback2 closes over THIS i          │
│  └────────────────┘                                         │
│                                                             │
│  Iteration 2:                                               │
│  ┌────────────────┐                                         │
│  │ i = 2          │ ← callback3 closes over THIS i          │
│  └────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘

Output: 0, 1, 2
```

### Stale Closures in React

```javascript
// ❌ PROBLEM - Stale closure
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count);  // Always logs 0!
      setCount(count + 1); // Always sets to 1!
    }, 1000);

    return () => clearInterval(interval);
  }, []);  // Empty deps = closure captures initial count (0)

  return <div>{count}</div>;
}

// ✅ SOLUTION 1: Use functional update
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1);  // Functional update, no closure issue
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>{count}</div>;
}

// ✅ SOLUTION 2: Include in deps (but creates new interval)
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count);
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [count]);  // Re-run effect when count changes

  return <div>{count}</div>;
}
```

---

## Interview Code Challenges

### Challenge 1: What's the output?

```javascript
function createFunctions() {
  var result = [];
  for (var i = 0; i < 3; i++) {
    result.push(function() {
      return i;
    });
  }
  return result;
}

var funcs = createFunctions();
console.log(funcs[0]());
console.log(funcs[1]());
console.log(funcs[2]());
```

<details>
<summary>Answer</summary>

```
3
3
3
```

All functions share the same `i` (var is function-scoped). By the time any function runs, the loop has finished and i = 3.
</details>

### Challenge 2: Write a counter with closures

Create a function that returns an object with `increment`, `decrement`, and `getValue` methods.

<details>
<summary>Answer</summary>

```javascript
function createCounter(initialValue = 0) {
  let count = initialValue;

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getValue() {
      return count;
    }
  };
}

const counter = createCounter(10);
counter.increment();  // 11
counter.increment();  // 12
counter.decrement();  // 11
counter.getValue();   // 11
```
</details>

### Challenge 3: Implement memoization

```javascript
function memoize(fn) {
  // Your code here
}

const expensiveCalc = (n) => {
  console.log('Computing...');
  return n * 2;
};

const memoized = memoize(expensiveCalc);
memoized(5);  // "Computing..." → 10
memoized(5);  // 10 (no "Computing...", cached!)
memoized(10); // "Computing..." → 20
```

<details>
<summary>Answer</summary>

```javascript
function memoize(fn) {
  const cache = {};  // Closure over cache

  return function(...args) {
    const key = JSON.stringify(args);

    if (key in cache) {
      return cache[key];
    }

    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}
```
</details>

---

## Self-Assessment Questions

1. **Explain closures to a 5-year-old**
   <details>
   <summary>Answer</summary>
   It's like having a backpack. When you leave home (outer function), you take your backpack (closure) with your toys (variables) inside. You can use your toys later even though you're not at home anymore.
   </details>

2. **Write a counter function that uses closures**
   <details>
   <summary>Answer</summary>

   ```javascript
   function createCounter() {
     let count = 0;
     return function() {
       return ++count;
     };
   }

   const counter = createCounter();
   counter();  // 1
   counter();  // 2
   ```
   </details>

3. **Why does var in a for loop with setTimeout print the wrong value?**
   <details>
   <summary>Answer</summary>
   `var` is function-scoped, so there's only one variable shared by all iterations. All callbacks close over the same variable, and by the time they execute, the loop has finished with i at its final value.
   </details>

4. **How do closures relate to the Lexical Environment?**
   <details>
   <summary>Answer</summary>
   When a function is created, it stores a reference to its lexical environment (the scope chain at the time of creation). This reference is the closure - it allows the function to access variables from that environment even after the outer function returns.
   </details>

---

## Common Interview Questions

1. **What is a closure?**
2. **How are closures used to create private variables?**
3. **Explain the classic loop closure problem and its solutions**
4. **What are the memory implications of closures?**
5. **How do React hooks use closures?**
6. **Write a memoize function using closures**

---

## Related Topics

- [Lexical Scope](./04-lexical-scope.md) - How scope is determined
- [Execution Context](./01-execution-context.md) - Where closures live
- [Memory Management](./11-memory-management.md) - Closure memory implications
- [Garbage Collection](./12-garbage-collection.md) - When closures prevent GC

---

## External Resources

- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [JavaScript.info: Closures](https://javascript.info/closure)
- [You Don't Know JS: Closures](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch7.md)
- [Dan Abramov: A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/) - Closures in React
- [Visualizing Closures](https://ui.dev/javascript-visualizer/) - Interactive tool
