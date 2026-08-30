# Prototypes

## Why It Matters

JavaScript uses **prototypal inheritance** instead of classical inheritance. Understanding prototypes is essential for:

- Understanding how JavaScript objects work
- Knowing what ES6 classes actually do under the hood
- Debugging "method not found" errors
- Extending built-in objects (carefully)
- Optimizing memory usage

> **Key Question:** How does JavaScript share functionality between objects without classical classes?

---

## What is a Prototype?

Every JavaScript object has an internal link to another object called its **prototype**. When you try to access a property that doesn't exist on an object, JavaScript looks up the **prototype chain** to find it.

```javascript
const person = {
  name: "Alice",
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
};

const student = {
  school: "MIT"
};

// Set student's prototype to person
Object.setPrototypeOf(student, person);

student.name;   // undefined (not on student)
student.school; // "MIT" (on student)
student.greet(); // Works! Found on prototype (person)
```

---

## The Prototype Chain

When accessing a property, JavaScript:
1. Checks the object itself
2. Checks the object's prototype
3. Checks the prototype's prototype
4. ... continues until `null` (end of chain)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PROTOTYPE CHAIN                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  student                                                                │
│  ┌─────────────────────┐                                               │
│  │ school: "MIT"       │                                               │
│  │ [[Prototype]] ──────┼──▶ person                                     │
│  └─────────────────────┘    ┌─────────────────────┐                    │
│                             │ name: "Alice"       │                    │
│                             │ greet: function     │                    │
│                             │ [[Prototype]] ──────┼──▶ Object.prototype│
│                             └─────────────────────┘    ┌──────────────┐│
│                                                        │ toString()   ││
│                                                        │ hasOwnProp() ││
│                                                        │ [[Proto]]: ──┼┼▶ null
│                                                        └──────────────┘│
│                                                                         │
│  Lookup: student.greet()                                               │
│  1. student → no greet                                                 │
│  2. person (student's prototype) → greet found! ✓                      │
│                                                                         │
│  Lookup: student.toString()                                            │
│  1. student → no toString                                              │
│  2. person → no toString                                               │
│  3. Object.prototype → toString found! ✓                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## `__proto__` vs `prototype`

This is one of the most confusing parts. Here's the difference:

| Term | What it is | Where it exists |
|------|-----------|-----------------|
| `__proto__` | Internal link to prototype object | Every object |
| `prototype` | Property that becomes `__proto__` of instances | Only functions |

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const alice = new Person("Alice");

// alice.__proto__ === Person.prototype
console.log(alice.__proto__ === Person.prototype);  // true

// Person.prototype.__proto__ === Object.prototype
console.log(Person.prototype.__proto__ === Object.prototype);  // true
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  __proto__ vs prototype                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Person (function)                                                      │
│  ┌─────────────────────────────┐                                       │
│  │ prototype ──────────────────┼──▶ Person.prototype                   │
│  └─────────────────────────────┘    ┌─────────────────────────┐        │
│                                     │ greet: function         │        │
│                                     │ constructor: Person     │        │
│                                     │ __proto__ ──────────────┼──▶ ... │
│                                     └─────────────────────────┘        │
│                                              ▲                          │
│                                              │                          │
│  alice (instance)                            │                          │
│  ┌─────────────────────────────┐             │                          │
│  │ name: "Alice"               │             │                          │
│  │ __proto__ ──────────────────┼─────────────┘                          │
│  └─────────────────────────────┘                                        │
│                                                                         │
│  alice.__proto__ === Person.prototype  ✓                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Object.getPrototypeOf()

The recommended way to access an object's prototype (instead of `__proto__`):

```javascript
const person = { name: "Alice" };
const student = Object.create(person);

// ✅ GOOD - Use Object.getPrototypeOf
console.log(Object.getPrototypeOf(student) === person);  // true

// ❌ AVOID - __proto__ is deprecated
console.log(student.__proto__ === person);  // true (but deprecated)
```

---

## Object.create() for Inheritance

`Object.create()` creates a new object with the specified prototype:

```javascript
const personMethods = {
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  },
  introduce() {
    console.log(`I'm ${this.name}, ${this.age} years old`);
  }
};

// Create object with personMethods as prototype
const alice = Object.create(personMethods);
alice.name = "Alice";
alice.age = 25;

alice.greet();      // "Hi, I'm Alice"
alice.introduce();  // "I'm Alice, 25 years old"

// Factory function pattern
function createPerson(name, age) {
  const person = Object.create(personMethods);
  person.name = name;
  person.age = age;
  return person;
}

const bob = createPerson("Bob", 30);
bob.greet();  // "Hi, I'm Bob"
```

---

## Constructor Functions

Before ES6 classes, constructor functions were the primary way to create "classes":

```javascript
// Constructor function (capital letter by convention)
function Person(name, age) {
  // 'this' is the new instance
  this.name = name;
  this.age = age;
}

// Methods go on prototype (shared, memory efficient)
Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

Person.prototype.birthday = function() {
  this.age++;
  console.log(`Now I'm ${this.age}!`);
};

// Create instances
const alice = new Person("Alice", 25);
const bob = new Person("Bob", 30);

alice.greet();     // "Hi, I'm Alice"
bob.greet();       // "Hi, I'm Bob"
alice.birthday();  // "Now I'm 26!"

// Both share the same methods
console.log(alice.greet === bob.greet);  // true (same function)
```

**Why put methods on prototype?**

```javascript
// ❌ BAD - Each instance gets its own copy
function BadPerson(name) {
  this.name = name;
  this.greet = function() {  // New function for EVERY instance!
    console.log(`Hi, I'm ${this.name}`);
  };
}

const p1 = new BadPerson("Alice");
const p2 = new BadPerson("Bob");
console.log(p1.greet === p2.greet);  // false - different functions!

// ✅ GOOD - All instances share one function
function GoodPerson(name) {
  this.name = name;
}
GoodPerson.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const g1 = new GoodPerson("Alice");
const g2 = new GoodPerson("Bob");
console.log(g1.greet === g2.greet);  // true - same function!
```

---

## ES6 Classes Under the Hood

ES6 classes are **syntactic sugar** over prototypes:

```javascript
// ES6 Class
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }

  static create(name) {
    return new Person(name);
  }
}

// Is equivalent to:
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

Person.create = function(name) {
  return new Person(name);
};
```

**Inheritance:**

```javascript
// ES6
class Student extends Person {
  constructor(name, school) {
    super(name);
    this.school = school;
  }

  study() {
    console.log(`${this.name} is studying at ${this.school}`);
  }
}

// Is equivalent to:
function Student(name, school) {
  Person.call(this, name);  // Call parent constructor
  this.school = school;
}

// Set up prototype chain
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

Student.prototype.study = function() {
  console.log(`${this.name} is studying at ${this.school}`);
};
```

---

## Prototype Pollution Risks

Modifying built-in prototypes can cause security issues:

```javascript
// ❌ DANGEROUS - Prototype Pollution
Object.prototype.isAdmin = true;

const user = {};
console.log(user.isAdmin);  // true - Everyone is admin now!

// Attacker could inject:
const maliciousInput = JSON.parse('{"__proto__": {"isAdmin": true}}');
// Some libraries copy this to objects, polluting prototypes
```

**Prevention:**

```javascript
// Use Object.create(null) for dictionaries
const safeDict = Object.create(null);
safeDict.isAdmin;  // undefined (no prototype!)

// Use Map for key-value storage
const safeMap = new Map();
safeMap.get('isAdmin');  // undefined

// Validate user input
function safeAssign(target, source) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor') continue;
    target[key] = source[key];
  }
}
```

---

## Performance of Prototype Lookup

Prototype chain lookup has a small performance cost:

```javascript
const obj = { a: 1 };

// Direct property - fastest
obj.a;

// One level up
obj.toString();  // Inherited from Object.prototype

// Deep chains are slower
const level1 = { a: 1 };
const level2 = Object.create(level1);
const level3 = Object.create(level2);
const level4 = Object.create(level3);

level4.a;  // Must traverse 3 levels to find 'a'
```

**Optimization tip:** For frequently accessed inherited properties, cache them:

```javascript
// ❌ Looks up prototype chain every time
for (let i = 0; i < 1000000; i++) {
  obj.inheritedMethod();
}

// ✅ Cache the method reference
const method = obj.inheritedMethod;
for (let i = 0; i < 1000000; i++) {
  method.call(obj);
}
```

---

## hasOwnProperty vs in Operator

```javascript
const person = { name: "Alice" };
const student = Object.create(person);
student.school = "MIT";

// 'in' checks the whole prototype chain
console.log('school' in student);    // true (own property)
console.log('name' in student);      // true (inherited)
console.log('toString' in student);  // true (from Object.prototype)

// hasOwnProperty only checks the object itself
console.log(student.hasOwnProperty('school'));    // true
console.log(student.hasOwnProperty('name'));      // false
console.log(student.hasOwnProperty('toString')); // false

// Safe way (in case hasOwnProperty was overwritten)
Object.prototype.hasOwnProperty.call(student, 'school');  // true

// Or use Object.hasOwn (ES2022)
Object.hasOwn(student, 'school');  // true
```

---

## Common Patterns

### Mixin Pattern

```javascript
// Mixins - compose objects from multiple sources
const canWalk = {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

const canSwim = {
  swim() {
    console.log(`${this.name} is swimming`);
  }
};

const canFly = {
  fly() {
    console.log(`${this.name} is flying`);
  }
};

class Duck {
  constructor(name) {
    this.name = name;
  }
}

// Mix in capabilities
Object.assign(Duck.prototype, canWalk, canSwim, canFly);

const donald = new Duck("Donald");
donald.walk();  // "Donald is walking"
donald.swim();  // "Donald is swimming"
donald.fly();   // "Donald is flying"
```

### Extending Built-ins (Carefully!)

```javascript
// ✅ OK - Adding to your own classes
class MyArray extends Array {
  first() {
    return this[0];
  }

  last() {
    return this[this.length - 1];
  }
}

const arr = new MyArray(1, 2, 3);
arr.first();  // 1
arr.last();   // 3
arr.map(x => x * 2);  // MyArray [2, 4, 6]

// ❌ AVOID - Modifying built-in prototypes
Array.prototype.first = function() {
  return this[0];
};
// Can break other code that doesn't expect this method
```

---

## Self-Assessment Questions

1. **What is the prototype chain?**
   <details>
   <summary>Answer</summary>
   The prototype chain is the series of linked objects JavaScript traverses when looking up a property. Each object has a prototype, and the chain continues until reaching null.
   </details>

2. **What's the difference between `__proto__` and `prototype`?**
   <details>
   <summary>Answer</summary>
   `__proto__` is the internal link to an object's prototype (exists on all objects). `prototype` is a property on functions that becomes the `__proto__` of instances created with `new`.
   </details>

3. **Why should methods go on the prototype?**
   <details>
   <summary>Answer</summary>
   Memory efficiency. Methods on prototype are shared by all instances (one copy), while methods in constructor create a new copy for each instance.
   </details>

4. **What is prototype pollution?**
   <details>
   <summary>Answer</summary>
   A security vulnerability where an attacker modifies Object.prototype (or other built-in prototypes), affecting all objects in the application.
   </details>

---

## Common Interview Questions

1. **What is a prototype?**
2. **Explain the prototype chain**
3. **What's the difference between `__proto__` and `prototype`?**
4. **How do ES6 classes work under the hood?**
5. **What is `hasOwnProperty` used for?**
6. **What is prototype pollution?**

---

## Related Topics

- [this Keyword](./09-this-keyword.md) - How `this` works in constructor functions
- [Execution Context](./01-execution-context.md) - Where prototypes are resolved

---

## External Resources

- [MDN: Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [JavaScript.info: Prototypes](https://javascript.info/prototypes)
- [You Don't Know JS: this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/this%20%26%20object%20prototypes/README.md)
- [A Plain English Guide to Prototypes](https://www.freecodecamp.org/news/a-beginner-friendly-guide-to-understanding-javascript-prototype/)
