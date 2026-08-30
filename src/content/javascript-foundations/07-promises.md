# Promises

## Why It Matters

Promises are JavaScript's modern solution for handling **asynchronous operations**. They replaced callback-based patterns and are the foundation for `async/await`. Understanding Promises is essential for:

- Handling API calls
- Reading files
- Database operations
- Any async operation in modern JavaScript
- Understanding how React data fetching works

> **Key Question:** How do you handle operations that take time to complete without blocking the rest of your code?

---

## What is a Promise?

A **Promise** is an object representing the **eventual completion (or failure)** of an asynchronous operation and its resulting value.

Think of it like ordering food at a restaurant:
1. You place your order → Promise is created (pending)
2. The kitchen prepares your food → Async operation running
3. Food arrives → Promise fulfilled (resolved)
4. Kitchen is out of ingredients → Promise rejected (error)

```javascript
const orderFood = new Promise((resolve, reject) => {
  const foodReady = true;

  if (foodReady) {
    resolve("Here's your burger!");   // Success
  } else {
    reject("Sorry, we're out of food"); // Failure
  }
});

orderFood
  .then(food => console.log(food))    // Handle success
  .catch(error => console.log(error)); // Handle error
```

---

## Promise States

A Promise is always in one of three states:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PROMISE STATES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                        ┌──────────────┐                                 │
│                        │   PENDING    │                                 │
│                        │  (initial)   │                                 │
│                        └──────┬───────┘                                 │
│                               │                                         │
│              ┌────────────────┼────────────────┐                       │
│              │                │                │                        │
│              ▼                                 ▼                        │
│     ┌──────────────┐                  ┌──────────────┐                 │
│     │  FULFILLED   │                  │   REJECTED   │                 │
│     │  (resolved)  │                  │   (failed)   │                 │
│     │              │                  │              │                 │
│     │ Has a VALUE  │                  │ Has a REASON │                 │
│     └──────────────┘                  └──────────────┘                 │
│                                                                         │
│     Once settled (fulfilled or rejected), a Promise                     │
│     CANNOT change state again.                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

| State | Description | Result |
|-------|-------------|--------|
| **Pending** | Initial state, operation in progress | Neither value nor reason |
| **Fulfilled** | Operation completed successfully | Has a value |
| **Rejected** | Operation failed | Has a reason (error) |

---

## Creating Promises

### Using the Promise Constructor

```javascript
const myPromise = new Promise((resolve, reject) => {
  // Async operation here

  // Success case:
  resolve(value);

  // Failure case:
  reject(error);
});
```

**Example: Simulating an API call**

```javascript
function fetchUser(userId) {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      if (userId > 0) {
        resolve({ id: userId, name: "Alice" });
      } else {
        reject(new Error("Invalid user ID"));
      }
    }, 1000);
  });
}

fetchUser(1)
  .then(user => console.log(user))     // { id: 1, name: "Alice" }
  .catch(err => console.error(err));
```

### Quick Promise Creation

```javascript
// Create already-resolved Promise
const resolved = Promise.resolve("Success!");
resolved.then(val => console.log(val)); // "Success!"

// Create already-rejected Promise
const rejected = Promise.reject(new Error("Failed!"));
rejected.catch(err => console.error(err.message)); // "Failed!"
```

---

## Promise Chaining (.then)

The real power of Promises is **chaining** - each `.then()` returns a new Promise:

```javascript
fetchUser(1)
  .then(user => {
    console.log(user.name);     // "Alice"
    return fetchOrders(user.id); // Return another Promise
  })
  .then(orders => {
    console.log(orders);        // Process orders
    return processOrders(orders);
  })
  .then(result => {
    console.log("Done:", result);
  })
  .catch(error => {
    console.error("Error:", error);
  });
```

**Visual of Promise chain:**

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROMISE CHAIN                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  fetchUser(1)                                                          │
│       │                                                                │
│       ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ .then(user => fetchOrders(user.id))                             │  │
│  │      │                                                          │  │
│  │      └──▶ Returns new Promise (fetchOrders result)              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│       │                                                                │
│       ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ .then(orders => processOrders(orders))                          │  │
│  │      │                                                          │  │
│  │      └──▶ Returns new Promise (processOrders result)            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│       │                                                                │
│       ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ .then(result => console.log(result))                            │  │
│  │      │                                                          │  │
│  │      └──▶ Returns new Promise (undefined, but chain continues)  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│       │                                                                │
│       ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ .catch(error => console.error(error))                           │  │
│  │      │                                                          │  │
│  │      └──▶ Catches errors from ANY step above                    │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### What .then() Returns

```javascript
// Returning a value → Next .then receives that value
Promise.resolve(1)
  .then(x => x + 1)     // Returns 2
  .then(x => x * 2)     // Returns 4
  .then(x => console.log(x)); // Logs 4

// Returning a Promise → Next .then waits for it
Promise.resolve(1)
  .then(x => {
    return new Promise(resolve => {
      setTimeout(() => resolve(x + 1), 1000);
    });
  })
  .then(x => console.log(x)); // Logs 2 after 1 second

// Returning nothing → undefined
Promise.resolve(1)
  .then(x => { console.log(x); }) // Logs 1, returns undefined
  .then(x => console.log(x));     // Logs undefined
```

---

## Error Handling (.catch)

`.catch()` handles rejected Promises and errors thrown in the chain:

```javascript
fetchUser(-1)  // Will reject
  .then(user => {
    return fetchOrders(user.id);
  })
  .then(orders => {
    console.log(orders);
  })
  .catch(error => {
    // Catches error from fetchUser(-1)
    console.error("Caught:", error.message);
  });
```

### Error Propagation

Errors bubble down the chain until caught:

```javascript
Promise.resolve()
  .then(() => {
    throw new Error("Step 1 failed");
  })
  .then(() => {
    console.log("This won't run");
  })
  .then(() => {
    console.log("This won't run either");
  })
  .catch(error => {
    console.log("Caught:", error.message); // "Step 1 failed"
  })
  .then(() => {
    console.log("Chain continues after catch"); // This WILL run
  });
```

### .finally()

Runs regardless of success or failure:

```javascript
showLoadingSpinner();

fetchData()
  .then(data => displayData(data))
  .catch(error => showError(error))
  .finally(() => {
    hideLoadingSpinner(); // Always runs
  });
```

---

## Promise Static Methods

### Promise.all() - Parallel Execution (All must succeed)

Waits for ALL Promises to resolve. Fails fast if ANY rejects.

```javascript
const promise1 = fetch('/api/users');
const promise2 = fetch('/api/posts');
const promise3 = fetch('/api/comments');

Promise.all([promise1, promise2, promise3])
  .then(([users, posts, comments]) => {
    // All three resolved
    console.log(users, posts, comments);
  })
  .catch(error => {
    // ANY one failed
    console.error(error);
  });
```

**Visualization:**

```
Promise.all([p1, p2, p3])
       │
       ├── p1 ───────────────────▶ ✓ (500ms)
       │
       ├── p2 ───────────────▶ ✓ (300ms)
       │
       └── p3 ─────────────────────▶ ✓ (600ms)
                                     │
                                     ▼
                            All done at 600ms
                            Returns [result1, result2, result3]


If ANY fails:

Promise.all([p1, p2, p3])
       │
       ├── p1 ───────────────────▶ ✓
       │
       ├── p2 ─────▶ ✗ FAILED
       │            │
       │            └──▶ Immediately rejects!
       │
       └── p3 ─────────────────────▶ (cancelled/ignored)
```

### Promise.allSettled() - All Results (Success or Failure)

Waits for ALL Promises to settle (resolve or reject). Never fails.

```javascript
const promises = [
  Promise.resolve('Success'),
  Promise.reject('Error'),
  Promise.resolve('Another success')
];

Promise.allSettled(promises)
  .then(results => {
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log('Value:', result.value);
      } else {
        console.log('Reason:', result.reason);
      }
    });
  });

// Output:
// Value: Success
// Reason: Error
// Value: Another success
```

### Promise.race() - First to Settle

Returns when the FIRST Promise settles (win or lose).

```javascript
const fast = new Promise(resolve =>
  setTimeout(() => resolve('Fast!'), 100)
);
const slow = new Promise(resolve =>
  setTimeout(() => resolve('Slow!'), 500)
);

Promise.race([fast, slow])
  .then(result => console.log(result)); // "Fast!"

// Useful for timeouts:
function fetchWithTimeout(url, timeout) {
  const fetchPromise = fetch(url);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeout)
  );

  return Promise.race([fetchPromise, timeoutPromise]);
}
```

### Promise.any() - First to Succeed

Returns when the FIRST Promise resolves. Only fails if ALL fail.

```javascript
const promises = [
  Promise.reject('Error 1'),
  Promise.resolve('Success!'),
  Promise.reject('Error 2')
];

Promise.any(promises)
  .then(result => console.log(result)) // "Success!"
  .catch(error => {
    // Only if ALL reject
    console.log(error.errors); // Array of all errors
  });
```

### Comparison Table

| Method | Resolves When | Rejects When |
|--------|--------------|--------------|
| `Promise.all` | All resolve | Any rejects |
| `Promise.allSettled` | All settle | Never |
| `Promise.race` | First settles | First settles (if reject) |
| `Promise.any` | First resolves | All reject |

---

## Promisification

Converting callback-based functions to Promises:

```javascript
// Callback-based function
function readFileCallback(path, callback) {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) callback(err);
    else callback(null, data);
  });
}

// Promisified version
function readFilePromise(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Usage
readFilePromise('file.txt')
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Node.js has built-in promisify
const util = require('util');
const readFilePromise = util.promisify(fs.readFile);
```

---

## Common Patterns

### Sequential Execution

```javascript
// Execute in order, each waiting for the previous
async function sequential(urls) {
  const results = [];
  for (const url of urls) {
    const result = await fetch(url);
    results.push(result);
  }
  return results;
}

// Or with reduce
function sequentialReduce(urls) {
  return urls.reduce((promise, url) => {
    return promise.then(results =>
      fetch(url).then(result => [...results, result])
    );
  }, Promise.resolve([]));
}
```

### Parallel with Limit

```javascript
async function parallelWithLimit(items, limit, asyncFn) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const promise = asyncFn(item).then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// Usage: Process 100 items, max 5 concurrent
await parallelWithLimit(items, 5, processItem);
```

### Retry Pattern

```javascript
function retry(fn, retries = 3, delay = 1000) {
  return fn().catch(error => {
    if (retries <= 0) {
      throw error;
    }
    return new Promise(resolve =>
      setTimeout(resolve, delay)
    ).then(() => retry(fn, retries - 1, delay * 2));
  });
}

// Usage
retry(() => fetch('/api/data'))
  .then(data => console.log(data))
  .catch(err => console.error('All retries failed:', err));
```

---

## Common Mistakes

### 1. Forgetting to Return in .then()

```javascript
// ❌ BAD - Promise not returned, chain breaks
fetchUser(1)
  .then(user => {
    fetchOrders(user.id); // Forgot return!
  })
  .then(orders => {
    console.log(orders); // undefined!
  });

// ✅ GOOD
fetchUser(1)
  .then(user => {
    return fetchOrders(user.id);
  })
  .then(orders => {
    console.log(orders); // Actual orders
  });
```

### 2. Nested Promises (Callback Hell Redux)

```javascript
// ❌ BAD - Nesting defeats the purpose
fetchUser(1)
  .then(user => {
    fetchOrders(user.id)
      .then(orders => {
        fetchItems(orders[0].id)
          .then(items => {
            console.log(items);
          });
      });
  });

// ✅ GOOD - Flat chain
fetchUser(1)
  .then(user => fetchOrders(user.id))
  .then(orders => fetchItems(orders[0].id))
  .then(items => console.log(items));
```

### 3. Not Handling Errors

```javascript
// ❌ BAD - Unhandled rejection
fetchUser(1)
  .then(user => console.log(user));
// If this fails, you'll get UnhandledPromiseRejection

// ✅ GOOD
fetchUser(1)
  .then(user => console.log(user))
  .catch(error => console.error('Failed:', error));
```

---

## Self-Assessment Questions

1. **What are the three states of a Promise?**
   <details>
   <summary>Answer</summary>
   Pending (initial), Fulfilled (resolved with value), Rejected (failed with reason)
   </details>

2. **What's the difference between Promise.all and Promise.allSettled?**
   <details>
   <summary>Answer</summary>
   Promise.all fails fast if any promise rejects. Promise.allSettled waits for all to settle and never rejects.
   </details>

3. **Why should you always return in .then()?**
   <details>
   <summary>Answer</summary>
   If you don't return, the next .then() receives undefined instead of the value/promise you intended.
   </details>

---

## Common Interview Questions

1. **What is a Promise?**
2. **Explain Promise states**
3. **How does Promise chaining work?**
4. **What's the difference between Promise.all, allSettled, race, and any?**
5. **How do you handle errors in Promises?**
6. **What's promisification?**
7. **Implement a Promise.all polyfill**

---

## Related Topics

- [Event Loop](./06-event-loop.md) - How Promise callbacks are scheduled
- [Async/Await](./08-async-await.md) - Syntactic sugar for Promises

---

## External Resources

- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [JavaScript.info: Promises](https://javascript.info/promise-basics)
- [Promise A+ Specification](https://promisesaplus.com/)
- [States and Fates](https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md)
