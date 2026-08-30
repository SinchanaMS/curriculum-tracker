# The `this` Keyword

## Why It Matters

The `this` keyword is one of the most confusing parts of JavaScript. It behaves differently depending on **how and where** a function is called. Understanding `this` is essential for:

- Working with object methods
- Event handlers
- React class components
- Understanding `bind`, `call`, `apply`
- Debugging "undefined is not a function" errors

> **Key Question:** How does JavaScript determine what `this` refers to?

---

## What is `this`?

`this` is a keyword that refers to the **context** in which a function is executed. Unlike most variables, `this` is NOT determined by where a function is written, but by **how it's called**.

```javascript
const person = {
  name: "Alice",
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
};

person.greet();      // "Hi, I'm Alice" - this = person

const greetFn = person.greet;
greetFn();           // "Hi, I'm undefined" - this = global/undefined!
```

---

## The Four Rules of `this`

JavaScript uses these rules to determine `this`, in order of precedence:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THIS BINDING RULES                                   │
│                    (in order of precedence)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. NEW BINDING (highest priority)                                      │
│     new MyClass()  →  this = new instance                               │
│                                                                         │
│  2. EXPLICIT BINDING                                                    │
│     func.call(obj) / func.apply(obj) / func.bind(obj)                  │
│     →  this = obj                                                       │
│                                                                         │
│  3. IMPLICIT BINDING                                                    │
│     obj.method()  →  this = obj                                        │
│                                                                         │
│  4. DEFAULT BINDING (lowest priority)                                   │
│     func()  →  this = global (or undefined in strict mode)             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Rule 1: Default Binding

When a function is called as a **standalone function**, `this` refers to the global object (or `undefined` in strict mode).

```javascript
function showThis() {
  console.log(this);
}

showThis();  // Window (browser) or global (Node.js)

// In strict mode:
"use strict";
function showThisStrict() {
  console.log(this);
}

showThisStrict();  // undefined
```

**Global context:**

```javascript
// In browser
console.log(this);           // Window
console.log(this === window); // true

// At top level, var creates properties on global object
var name = "Global Name";
console.log(this.name);      // "Global Name"
console.log(window.name);    // "Global Name"

// let/const don't
let age = 25;
console.log(this.age);       // undefined
```

---

## Rule 2: Implicit Binding

When a function is called as a **method of an object**, `this` refers to that object.

```javascript
const person = {
  name: "Alice",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

person.greet();  // "Hello, I'm Alice" - this = person
```

### The Object "To the Left of the Dot"

Look at what's immediately to the left of the dot when the function is called:

```javascript
const alice = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

const bob = {
  name: "Bob",
  greet: alice.greet  // Copying the function reference
};

alice.greet();  // "Alice" - this = alice (left of dot)
bob.greet();    // "Bob" - this = bob (left of dot)
```

### Implicit Binding is Lost

```javascript
const person = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

// ❌ Lost binding - no object to the left of dot
const greetFn = person.greet;
greetFn();  // undefined (or error in strict mode)

// ❌ Lost in callbacks
setTimeout(person.greet, 100);  // undefined

// ❌ Lost when passing to another function
function runCallback(cb) {
  cb();  // No object.method() call here
}
runCallback(person.greet);  // undefined
```

---

## Rule 3: Explicit Binding (call, apply, bind)

You can explicitly set `this` using `call()`, `apply()`, or `bind()`.

### call() - Invoke with explicit this

```javascript
function greet(greeting) {
  console.log(`${greeting}, I'm ${this.name}`);
}

const alice = { name: "Alice" };
const bob = { name: "Bob" };

greet.call(alice, "Hello");  // "Hello, I'm Alice"
greet.call(bob, "Hi");       // "Hi, I'm Bob"
```

### apply() - Like call, but with array of arguments

```javascript
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const alice = { name: "Alice" };

// call: arguments passed individually
introduce.call(alice, "Hello", "!");   // "Hello, I'm Alice!"

// apply: arguments passed as array
introduce.apply(alice, ["Hello", "!"]); // "Hello, I'm Alice!"
```

### bind() - Returns new function with bound this

```javascript
const person = {
  name: "Alice",
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
};

const greetFn = person.greet.bind(person);  // Permanently bind

greetFn();               // "Hi, I'm Alice"
setTimeout(greetFn, 100); // "Hi, I'm Alice" - binding preserved!

// Can also bind arguments
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2);  // First arg bound to 2
double(5);  // 10
double(10); // 20
```

**Comparison:**

| Method | Invokes Immediately? | Returns |
|--------|---------------------|---------|
| `call(thisArg, arg1, arg2)` | Yes | Function result |
| `apply(thisArg, [args])` | Yes | Function result |
| `bind(thisArg, arg1)` | No | New bound function |

---

## Rule 4: new Binding

When a function is called with `new`, `this` refers to the newly created instance.

```javascript
function Person(name) {
  // this = {} (new empty object)
  this.name = name;
  // return this (implicit)
}

const alice = new Person("Alice");
console.log(alice.name);  // "Alice"

// What 'new' does behind the scenes:
function newOperator(Constructor, ...args) {
  const obj = {};                          // 1. Create empty object
  Object.setPrototypeOf(obj, Constructor.prototype); // 2. Set prototype
  const result = Constructor.apply(obj, args);       // 3. Call with this = obj
  return result instanceof Object ? result : obj;    // 4. Return obj (usually)
}
```

---

## Arrow Functions and `this`

Arrow functions are **different** - they don't have their own `this`. They inherit `this` from their enclosing scope (lexical `this`).

```javascript
const person = {
  name: "Alice",

  // Regular function - this depends on how it's called
  regularGreet: function() {
    console.log(this.name);
  },

  // Arrow function - this inherited from where it's defined
  arrowGreet: () => {
    console.log(this.name);  // this = outer scope (global!)
  },

  // Arrow in method - useful for callbacks!
  greetDelayed: function() {
    setTimeout(() => {
      console.log(this.name);  // this = person (inherited)
    }, 100);
  }
};

person.regularGreet();   // "Alice"
person.arrowGreet();     // undefined (this = global)
person.greetDelayed();   // "Alice" (arrow inherits this)
```

### When to Use Arrow Functions

```javascript
// ✅ GOOD: Arrow functions for callbacks
class Component {
  constructor() {
    this.value = 42;

    // Arrow function preserves this
    document.addEventListener('click', () => {
      console.log(this.value);  // 42
    });
  }
}

// ❌ BAD: Arrow functions as methods
const obj = {
  value: 42,
  getValue: () => this.value  // this = global, not obj!
};
obj.getValue();  // undefined

// ✅ GOOD: Regular functions as methods
const obj2 = {
  value: 42,
  getValue() {
    return this.value;  // this = obj2
  }
};
obj2.getValue();  // 42
```

---

## `this` in Event Handlers

In event handlers, `this` refers to the element that triggered the event:

```javascript
const button = document.querySelector('button');

// Regular function: this = button element
button.addEventListener('click', function() {
  console.log(this);        // <button>...</button>
  console.log(this.textContent);
});

// Arrow function: this = enclosing scope (probably global)
button.addEventListener('click', () => {
  console.log(this);        // Window (not the button!)
});
```

### Event Handler in Class

```javascript
class Button {
  constructor(text) {
    this.text = text;
    this.element = document.createElement('button');

    // ❌ BAD - this will be the element, not the instance
    this.element.addEventListener('click', this.handleClick);

    // ✅ GOOD - bind preserves instance
    this.element.addEventListener('click', this.handleClick.bind(this));

    // ✅ ALSO GOOD - arrow function
    this.element.addEventListener('click', () => this.handleClick());
  }

  handleClick() {
    console.log(`Clicked: ${this.text}`);
  }
}
```

---

## `this` in Callbacks

Callbacks often lose `this` context:

```javascript
const user = {
  name: "Alice",
  friends: ["Bob", "Charlie"],

  // ❌ PROBLEM - this is lost in forEach callback
  showFriendsBad() {
    this.friends.forEach(function(friend) {
      console.log(`${this.name} knows ${friend}`);  // this.name = undefined
    });
  },

  // ✅ SOLUTION 1 - Arrow function
  showFriendsArrow() {
    this.friends.forEach((friend) => {
      console.log(`${this.name} knows ${friend}`);  // Works!
    });
  },

  // ✅ SOLUTION 2 - Save this to variable
  showFriendsThat() {
    const that = this;  // Or self = this
    this.friends.forEach(function(friend) {
      console.log(`${that.name} knows ${friend}`);  // Works!
    });
  },

  // ✅ SOLUTION 3 - Use thisArg parameter
  showFriendsThisArg() {
    this.friends.forEach(function(friend) {
      console.log(`${this.name} knows ${friend}`);
    }, this);  // Second argument sets this
  },

  // ✅ SOLUTION 4 - Bind
  showFriendsBind() {
    this.friends.forEach(function(friend) {
      console.log(`${this.name} knows ${friend}`);
    }.bind(this));
  }
};
```

---

## Binding Precedence

What happens when multiple rules apply?

```javascript
function greet() {
  console.log(this.name);
}

const alice = { name: "Alice" };
const bob = { name: "Bob" };

// new > explicit > implicit > default

// 1. new beats explicit
const BoundGreet = greet.bind(alice);
const instance = new BoundGreet();  // this = new instance, not alice

// 2. explicit beats implicit
bob.greet = greet;
bob.greet.call(alice);  // "Alice" - call beats bob.greet

// 3. implicit beats default
bob.greet();  // "Bob" - bob.greet() beats standalone greet()
```

**Precedence order (highest to lowest):**

```
1. new binding          →  new Func()
2. Explicit binding     →  func.call(obj) / apply / bind
3. Implicit binding     →  obj.method()
4. Default binding      →  func()
```

---

## Common Patterns and Solutions

### Pattern 1: Class Methods with Correct `this`

```javascript
class Component {
  constructor() {
    this.value = 42;

    // Option 1: Bind in constructor
    this.handleClick = this.handleClick.bind(this);
  }

  // Option 2: Arrow function as class field
  handleClick = () => {
    console.log(this.value);
  }

  // Option 3: Bind when attaching
  attachListeners() {
    element.addEventListener('click', this.handleClick.bind(this));
    // or
    element.addEventListener('click', () => this.handleClick());
  }
}
```

### Pattern 2: Method Chaining

```javascript
class Calculator {
  constructor() {
    this.value = 0;
  }

  add(n) {
    this.value += n;
    return this;  // Return this for chaining
  }

  subtract(n) {
    this.value -= n;
    return this;
  }

  multiply(n) {
    this.value *= n;
    return this;
  }

  getResult() {
    return this.value;
  }
}

const result = new Calculator()
  .add(5)
  .multiply(2)
  .subtract(3)
  .getResult();  // 7
```

---

## Quick Reference Table

| Scenario | `this` refers to |
|----------|-----------------|
| Global scope (non-strict) | `window` / `global` |
| Global scope (strict) | `undefined` |
| `obj.method()` | `obj` |
| `func()` standalone | `window` / `undefined` |
| `func.call(obj)` | `obj` |
| `func.apply(obj)` | `obj` |
| `func.bind(obj)()` | `obj` |
| `new Func()` | New instance |
| Arrow function | Enclosing scope's `this` |
| Event handler (regular) | The element |
| Event handler (arrow) | Enclosing scope's `this` |
| `setTimeout(func)` | `window` / `undefined` |
| `setTimeout(() => ...)` | Enclosing scope's `this` |

---

## Self-Assessment Questions

1. **What are the four rules for determining `this`?**
   <details>
   <summary>Answer</summary>
   1. Default binding (standalone function) → global/undefined
   2. Implicit binding (obj.method()) → obj
   3. Explicit binding (call/apply/bind) → specified object
   4. new binding (new Constructor()) → new instance
   </details>

2. **Why don't arrow functions have their own `this`?**
   <details>
   <summary>Answer</summary>
   Arrow functions lexically bind `this` from their enclosing scope. This was designed to solve the common problem of losing `this` in callbacks.
   </details>

3. **How do you fix lost `this` in callbacks?**
   <details>
   <summary>Answer</summary>
   Use arrow functions, bind(), save `this` to a variable (that/self), or use the thisArg parameter where available.
   </details>

---

## Common Interview Questions

1. **What is `this` in JavaScript?**
2. **Explain the four binding rules**
3. **What's the difference between call, apply, and bind?**
4. **How do arrow functions handle `this` differently?**
5. **How do you preserve `this` in callbacks?**
6. **What is `this` in an event handler?**

---

## Related Topics

- [Execution Context](./01-execution-context.md) - Where `this` binding is determined
- [Closures](./05-closures.md) - How `this` relates to closures
- [Prototypes](./10-prototypes.md) - `this` in constructor functions

---

## External Resources

- [MDN: this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [JavaScript.info: Object methods, "this"](https://javascript.info/object-methods)
- [You Don't Know JS: this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/this%20%26%20object%20prototypes/README.md)
- [Gentle Explanation of this](https://dmitripavlutin.com/gentle-explanation-of-this-in-javascript/)
