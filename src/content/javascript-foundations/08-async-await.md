# Async/Await

## Why It Matters

`async/await` is **syntactic sugar** over Promises that makes asynchronous code look and behave like synchronous code. It's the modern way to handle async operations in JavaScript and is extensively used in:

- React data fetching
- Node.js backend code
- Any modern JavaScript application

> **Key Question:** How can we write asynchronous code that's as readable as synchronous code?

---

## What is Async/Await?

`async/await` is built on top of Promises. It doesn't replace Promises - it makes them easier to work with.

```javascript
// With Promises
function fetchUser(id) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(user => {
      console.log(user);
      return user;
    });
}

// With async/await - Same thing, easier to read!
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  console.log(user);
  return user;
}
```

---

## Async Functions

The `async` keyword before a function makes it an **async function**.

### What async does:
1. The function **always returns a Promise**
2. Allows using `await` inside
3. Non-Promise return values are wrapped in `Promise.resolve()`

```javascript
// These are equivalent:
async function greet() {
  return "Hello";
}

function greet() {
  return Promise.resolve("Hello");
}

// Usage
greet().then(msg => console.log(msg)); // "Hello"
```

### Async Function Declarations

```javascript
// Function declaration
async function fetchData() {
  return await getData();
}

// Function expression
const fetchData = async function() {
  return await getData();
};

// Arrow function
const fetchData = async () => {
  return await getData();
};

// Method in object
const api = {
  async fetchData() {
    return await getData();
  }
};

// Method in class
class API {
  async fetchData() {
    return await getData();
  }
}
```

---

## Await Expression

The `await` keyword **pauses** the async function until the Promise settles.

```javascript
async function example() {
  console.log('Before await');

  const result = await somePromise(); // Pauses here until resolved

  console.log('After await:', result); // Continues with resolved value
}
```

### What await does:
1. **Pauses** the async function execution
2. **Waits** for the Promise to settle
3. **Returns** the resolved value (or throws if rejected)
4. **Does NOT block** the entire JavaScript thread

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     HOW AWAIT WORKS                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  async function getData() {                                             │
│    console.log("1");           ──▶ Runs immediately                    │
│                                                                         │
│    const data = await fetch(); ──▶ Pauses function here               │
│                                    │                                    │
│                                    │ Meanwhile, other code can run!    │
│                                    │                                    │
│                                    ▼ When fetch resolves...            │
│                                                                         │
│    console.log("2", data);     ──▶ Resumes with data                  │
│    return data;                                                         │
│  }                                                                      │
│                                                                         │
│  getData();                                                             │
│  console.log("3");             ──▶ Runs while getData is waiting!     │
│                                                                         │
│  Output: 1, 3, 2                                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Error Handling with try/catch

Unlike Promise chains with `.catch()`, async/await uses standard `try/catch`:

```javascript
// Promise style
fetchUser(1)
  .then(user => processUser(user))
  .catch(error => console.error(error));

// Async/await style
async function handleUser() {
  try {
    const user = await fetchUser(1);
    const result = await processUser(user);
    return result;
  } catch (error) {
    console.error('Error:', error);
    // Can handle, rethrow, or return default
    return null;
  }
}
```

### Catching Specific Errors

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error);
    } else if (error.message.includes('HTTP error')) {
      console.error('Server error:', error);
    } else {
      console.error('Unknown error:', error);
    }
    throw error; // Re-throw if needed
  }
}
```

### Error Handling Patterns

```javascript
// Pattern 1: Try/catch each await
async function pattern1() {
  let user;
  try {
    user = await fetchUser();
  } catch (e) {
    user = defaultUser;
  }

  let posts;
  try {
    posts = await fetchPosts(user.id);
  } catch (e) {
    posts = [];
  }

  return { user, posts };
}

// Pattern 2: Catch at the call site
async function fetchData() {
  const user = await fetchUser();    // Can throw
  const posts = await fetchPosts();  // Can throw
  return { user, posts };
}

// Handle errors when calling
fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Pattern 3: Go-style error handling
async function fetchUserSafe() {
  try {
    const user = await fetchUser();
    return [user, null];
  } catch (error) {
    return [null, error];
  }
}

const [user, error] = await fetchUserSafe();
if (error) {
  console.error('Failed:', error);
} else {
  console.log('User:', user);
}
```

---

## Parallel vs Sequential Execution

### Sequential (One After Another)

```javascript
// Each await waits for the previous to complete
async function sequential() {
  const a = await fetchA(); // Wait 1 second
  const b = await fetchB(); // Wait 1 second
  const c = await fetchC(); // Wait 1 second
  return [a, b, c];
}
// Total time: ~3 seconds
```

**Visualization:**

```
Sequential:
┌──────────────────────────────────────────────────────┐
│                                                      │
│  fetchA ──────▶ fetchB ──────▶ fetchC ──────▶ Done  │
│  [1 sec]        [1 sec]        [1 sec]              │
│                                                      │
│  Total: 3 seconds                                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Parallel (All at Once)

```javascript
// Start all at once, wait for all to complete
async function parallel() {
  const [a, b, c] = await Promise.all([
    fetchA(),
    fetchB(),
    fetchC()
  ]);
  return [a, b, c];
}
// Total time: ~1 second (longest one)
```

**Visualization:**

```
Parallel:
┌──────────────────────────────────────────────────────┐
│                                                      │
│  fetchA ──────▶                                      │
│  fetchB ──────▶  ──▶ All done!                      │
│  fetchC ──────▶                                      │
│  [1 sec max]                                         │
│                                                      │
│  Total: 1 second (all run concurrently)              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Common Mistake: Accidental Sequential

```javascript
// ❌ BAD - These run sequentially!
async function bad() {
  const a = await fetchA();
  const b = await fetchB(); // Waits for fetchA first!
  return [a, b];
}

// ✅ GOOD - Run in parallel
async function good() {
  const promiseA = fetchA(); // Start immediately
  const promiseB = fetchB(); // Start immediately

  const a = await promiseA;  // Now wait
  const b = await promiseB;  // Now wait

  return [a, b];
}

// ✅ BETTER - Use Promise.all
async function better() {
  const [a, b] = await Promise.all([fetchA(), fetchB()]);
  return [a, b];
}
```

---

## Top-Level Await

In ES2022+ modules, you can use `await` at the top level (not inside a function):

```javascript
// module.js (ES modules only)
const response = await fetch('/api/config');
const config = await response.json();

export { config };

// main.js
import { config } from './module.js';
// config is already loaded!
```

**Important:** Only works in ES modules (`.mjs` or `type: "module"` in package.json).

---

## Async Iterators (for-await-of)

For iterating over async data streams:

```javascript
// Async generator
async function* asyncGenerator() {
  yield await fetchPage(1);
  yield await fetchPage(2);
  yield await fetchPage(3);
}

// Consuming async iterator
async function processPages() {
  for await (const page of asyncGenerator()) {
    console.log('Processing:', page);
  }
}

// Real-world: Streaming data
async function readStream(stream) {
  for await (const chunk of stream) {
    console.log('Received chunk:', chunk);
  }
}
```

---

## Common Pitfalls

### 1. Await in forEach (Doesn't Work!)

```javascript
// ❌ BAD - forEach doesn't wait for async callbacks
async function bad() {
  const urls = ['/api/1', '/api/2', '/api/3'];

  urls.forEach(async (url) => {
    const data = await fetch(url);
    console.log(data);
  });

  console.log('Done'); // Prints BEFORE fetches complete!
}

// ✅ GOOD - Use for...of
async function good() {
  const urls = ['/api/1', '/api/2', '/api/3'];

  for (const url of urls) {
    const data = await fetch(url);
    console.log(data);
  }

  console.log('Done'); // Prints after all fetches
}

// ✅ ALSO GOOD - Use Promise.all for parallel
async function parallel() {
  const urls = ['/api/1', '/api/2', '/api/3'];

  const results = await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url);
      return response.json();
    })
  );

  console.log('Done', results);
}
```

### 2. Mixing Await and .then() Unnecessarily

```javascript
// ❌ Mixing styles - confusing
async function mixed() {
  const user = await fetchUser();
  return fetchPosts(user.id).then(posts => {
    return { user, posts };
  });
}

// ✅ Consistent style
async function consistent() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id);
  return { user, posts };
}
```

### 3. Forgetting to Await

```javascript
// ❌ BAD - Returns Promise, not data
async function bad() {
  const response = fetch('/api/data'); // Forgot await!
  return response.json(); // Error: response.json is not a function
}

// ✅ GOOD
async function good() {
  const response = await fetch('/api/data');
  return await response.json();
}
```

### 4. Unhandled Promise Rejections

```javascript
// ❌ BAD - No error handling
async function bad() {
  const data = await riskyOperation(); // If this fails, unhandled!
  return data;
}

// ✅ GOOD - Handle errors
async function good() {
  try {
    const data = await riskyOperation();
    return data;
  } catch (error) {
    console.error('Failed:', error);
    throw error; // Or handle appropriately
  }
}
```

---

## Async/Await Under the Hood

`async/await` is transformed into Promise-based code:

```javascript
// What you write:
async function fetchData() {
  const response = await fetch('/api');
  const data = await response.json();
  return data;
}

// What it becomes (conceptually):
function fetchData() {
  return fetch('/api')
    .then(response => response.json())
    .then(data => data);
}
```

The code after `await` becomes a **microtask** (like Promise `.then()`):

```javascript
async function example() {
  console.log('1');
  await Promise.resolve();
  console.log('2'); // This is a microtask!
}

example();
console.log('3');

// Output: 1, 3, 2
// '2' runs as a microtask after '3'
```

---

## Interview Practice: Predict the Output

### Challenge 1

```javascript
async function test() {
  console.log('1');
  await Promise.resolve();
  console.log('2');
}

console.log('3');
test();
console.log('4');
```

<details>
<summary>Answer</summary>

```
3
1
4
2
```

**Explanation:**
1. `3` - sync
2. `test()` called, prints `1` - sync
3. `await` pauses test(), schedules rest as microtask
4. `4` - sync
5. Microtask runs, prints `2`
</details>

### Challenge 2

```javascript
async function a() {
  console.log('a1');
  await b();
  console.log('a2');
}

async function b() {
  console.log('b1');
  await c();
  console.log('b2');
}

async function c() {
  console.log('c');
}

a();
console.log('sync');
```

<details>
<summary>Answer</summary>

```
a1
b1
c
sync
b2
a2
```

**Explanation:**
1. `a1` - sync in a()
2. `b1` - sync in b()
3. `c` - sync in c()
4. c() returns (resolved), but b() is paused at await
5. `sync` - main thread continues
6. `b2` - microtask: rest of b()
7. `a2` - microtask: rest of a()
</details>

---

## Self-Assessment Questions

1. **What does the `async` keyword do?**
   <details>
   <summary>Answer</summary>
   Makes the function return a Promise, allows using await inside, and wraps non-Promise returns in Promise.resolve().
   </details>

2. **What does `await` do?**
   <details>
   <summary>Answer</summary>
   Pauses the async function until the Promise settles, then returns the resolved value (or throws if rejected).
   </details>

3. **Why doesn't await work in forEach?**
   <details>
   <summary>Answer</summary>
   forEach doesn't return a Promise and doesn't wait for its callback to complete. Use for...of or Promise.all with map instead.
   </details>

4. **How do you run async operations in parallel?**
   <details>
   <summary>Answer</summary>
   Use Promise.all() with an array of promises, or start all promises first (save to variables) then await them.
   </details>

---

## Common Interview Questions

1. **What is async/await?**
2. **How do you handle errors in async/await?**
3. **What's the difference between sequential and parallel async execution?**
4. **Why doesn't await work inside forEach?**
5. **How does async/await relate to Promises?**
6. **What is top-level await?**

---

## Related Topics

- [Promises](./07-promises.md) - Foundation for async/await
- [Event Loop](./06-event-loop.md) - How async code is scheduled

---

## External Resources

- [MDN: async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [JavaScript.info: Async/await](https://javascript.info/async-await)
- [Dr. Axel: Async/await](https://exploringjs.com/es2016-es2017/ch_async-functions.html)
- [Kent C. Dodds: Async/Await](https://kentcdodds.com/blog/asynchronous-javascript)
