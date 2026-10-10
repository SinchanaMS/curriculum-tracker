import { InterviewCategory, InterviewDifficulty } from '../types/curriculum';

export const interviewCategories: InterviewCategory[] = [
  // ============================================
  // 1. JAVASCRIPT CORE
  // ============================================
  {
    id: 'js-core',
    name: 'JavaScript Core',
    description: 'Event loop, closures, hoisting, promises, this keyword, prototypes',
    icon: 'FileCode',
    color: '#F7DF1E',
    questions: [
      {
        id: 'js-1',
        question: 'How does the JavaScript Event Loop work?',
        answer: 'The Event Loop is a mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It continuously checks the call stack and task queues, executing callbacks when the stack is empty.',
        keyPoints: [
          'Call Stack: Executes synchronous code (LIFO)',
          'Microtask Queue: Promises, queueMicrotask, MutationObserver (higher priority)',
          'Macrotask Queue: setTimeout, setInterval, I/O, UI rendering',
          'Event Loop checks microtasks first, then one macrotask, then microtasks again'
        ],
        followUps: [
          {
            question: 'What is the difference between microtasks and macrotasks?',
            answer: 'Microtasks (Promises, queueMicrotask) have higher priority and are fully drained before any macrotask. Macrotasks (setTimeout, setInterval) execute one at a time with microtask queue checks in between.'
          },
          {
            question: 'What will this output and why? console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);',
            answer: 'Output: 1, 4, 3, 2. Sync code runs first (1, 4), then microtasks (Promise: 3), then macrotasks (setTimeout: 2).'
          },
          {
            question: 'How does the event loop interact with rendering?',
            answer: 'Rendering happens between macrotasks. The browser may skip rendering if the tab is not visible. requestAnimationFrame runs before the next repaint.'
          }
        ],
        example: '// Order: 1, 4, 3, 2\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
        commonMistakes: [
          'Thinking setTimeout(fn, 0) runs immediately',
          'Not knowing Promise callbacks are microtasks',
          'Forgetting that all microtasks drain before next macrotask'
        ],
        interviewerExpects: 'Clear explanation of call stack, task queues, and execution order. Bonus: mention requestAnimationFrame and rendering.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'js-2',
        question: 'What are closures in JavaScript and how do you use them?',
        answer: 'A closure is a function that retains access to its outer (enclosing) scope even after the outer function has returned. It "closes over" the variables it references.',
        keyPoints: [
          'Functions remember their lexical environment',
          'Inner function has access to outer function variables',
          'Variables are kept alive as long as closure exists',
          'Used for data privacy, function factories, partial application'
        ],
        followUps: [
          {
            question: 'Can you give a real-world use case for closures?',
            answer: 'Data privacy (module pattern), event handlers that need access to loop variables, debounce/throttle implementations, React hooks internally use closures.'
          },
          {
            question: 'What is the classic loop closure problem?',
            answer: 'Using var in a loop with setTimeout causes all callbacks to reference the same variable. Fix with let (block scope) or IIFE to create new scope per iteration.'
          },
          {
            question: 'How do closures affect memory?',
            answer: 'Closures can cause memory leaks if they hold references to large objects no longer needed. The referenced variables cannot be garbage collected until the closure is released.'
          }
        ],
        example: 'function createCounter() {\n  let count = 0; // private variable\n  return {\n    increment: () => ++count,\n    getCount: () => count\n  };\n}\nconst counter = createCounter();\ncounter.increment(); // 1\ncounter.getCount(); // 1',
        commonMistakes: [
          'Confusing closure with scope',
          'Not understanding the loop closure issue with var',
          'Creating unnecessary closures in loops (performance)'
        ],
        interviewerExpects: 'Practical example, understanding of lexical scope, awareness of memory implications.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'js-3',
        question: 'What is hoisting and how does it differ for var, let, const, and functions?',
        answer: 'Hoisting is JavaScript\'s behavior of moving declarations to the top of their scope during compilation. However, only declarations are hoisted, not initializations.',
        keyPoints: [
          'var: hoisted and initialized to undefined',
          'let/const: hoisted but NOT initialized (Temporal Dead Zone)',
          'Function declarations: fully hoisted (can call before declaration)',
          'Function expressions: only variable is hoisted, not the function'
        ],
        followUps: [
          {
            question: 'What is the Temporal Dead Zone (TDZ)?',
            answer: 'TDZ is the time between entering scope and variable declaration where let/const variables cannot be accessed. Accessing them throws ReferenceError.'
          },
          {
            question: 'Why was let/const designed with TDZ?',
            answer: 'To catch programming errors early. Accessing variables before declaration is usually a bug. TDZ makes this explicit rather than silently returning undefined.'
          },
          {
            question: 'What happens here? console.log(x); let x = 5;',
            answer: 'ReferenceError: Cannot access \'x\' before initialization. The variable is hoisted but in TDZ until the declaration line.'
          }
        ],
        example: '// var hoisting\nconsole.log(a); // undefined\nvar a = 5;\n\n// let/const TDZ\nconsole.log(b); // ReferenceError\nlet b = 5;\n\n// Function hoisting\nsayHi(); // "Hi!" - works\nfunction sayHi() { console.log("Hi!"); }',
        commonMistakes: [
          'Thinking let/const are not hoisted (they are, just in TDZ)',
          'Confusing function declarations with function expressions',
          'Not knowing var is function-scoped, let/const are block-scoped'
        ],
        interviewerExpects: 'Clear distinction between var/let/const behavior, understanding of TDZ, practical implications.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'js-4',
        question: 'How does the "this" keyword work in different contexts?',
        answer: 'The value of "this" depends on how a function is called, not where it\'s defined. It can be the global object, the calling object, a bound object, or undefined in strict mode.',
        keyPoints: [
          'Global context: window (browser) or global (Node), undefined in strict mode',
          'Object method: the object calling the method',
          'Constructor (new): the newly created instance',
          'Arrow functions: inherit "this" from enclosing scope (lexical)',
          'call/apply/bind: explicitly set "this"'
        ],
        followUps: [
          {
            question: 'Why do arrow functions not have their own "this"?',
            answer: 'Arrow functions lexically bind "this" from the enclosing scope. This was designed to solve the common problem of losing "this" context in callbacks.'
          },
          {
            question: 'What is the difference between call, apply, and bind?',
            answer: 'call(thisArg, arg1, arg2) - invokes immediately with args. apply(thisArg, [args]) - invokes with array of args. bind(thisArg) - returns new function with bound "this", does not invoke.'
          },
          {
            question: 'How would you fix "this" in a callback?',
            answer: 'Use arrow function, bind the method, save "this" to a variable (const self = this), or use call/apply when invoking.'
          }
        ],
        example: 'const obj = {\n  name: "Alice",\n  greet() { console.log(this.name); },\n  greetArrow: () => console.log(this.name)\n};\nobj.greet(); // "Alice"\nobj.greetArrow(); // undefined (this is global)\n\nconst greet = obj.greet;\ngreet(); // undefined (lost context)\ngreet.call(obj); // "Alice"',
        commonMistakes: [
          'Expecting arrow functions to have their own "this"',
          'Losing "this" when passing methods as callbacks',
          'Not understanding "this" in event handlers'
        ],
        interviewerExpects: 'Demonstrate all contexts with examples, explain arrow function behavior, show how to fix common issues.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'js-5',
        question: 'What does console.log(0.1 + 0.2 === 0.3) return and why?',
        answer: 'It returns false. JavaScript uses IEEE 754 floating-point arithmetic, which cannot precisely represent some decimal fractions in binary, leading to tiny rounding errors.',
        keyPoints: [
          '0.1 + 0.2 = 0.30000000000000004 in JavaScript',
          'Binary floating-point cannot exactly represent 0.1 or 0.2',
          'Use Number.EPSILON for comparison tolerance',
          'For money: use integers (cents) or libraries like decimal.js'
        ],
        followUps: [
          {
            question: 'How would you correctly compare floating-point numbers?',
            answer: 'Use Math.abs(a - b) < Number.EPSILON or a small threshold like 0.0001 depending on your precision needs.'
          },
          {
            question: 'How should you handle currency in JavaScript?',
            answer: 'Store values as integers (cents/paise), use dedicated libraries like decimal.js or big.js, or use Intl.NumberFormat for display.'
          }
        ],
        example: 'console.log(0.1 + 0.2); // 0.30000000000000004\nconsole.log(0.1 + 0.2 === 0.3); // false\n\n// Safe comparison\nfunction areEqual(a, b) {\n  return Math.abs(a - b) < Number.EPSILON;\n}\nconsole.log(areEqual(0.1 + 0.2, 0.3)); // true',
        interviewerExpects: 'Understand IEEE 754 limitation, provide practical workarounds.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'js-6',
        question: 'What is the difference between == and ===?',
        answer: '=== (strict equality) compares value and type without coercion. == (loose equality) performs type coercion before comparison, leading to unexpected results.',
        keyPoints: [
          '=== checks type first, returns false if different',
          '== coerces types using complex rules (ToNumber, ToPrimitive)',
          'Always prefer === for predictable behavior',
          'null == undefined is true, but null === undefined is false'
        ],
        followUps: [
          {
            question: 'When might you intentionally use ==?',
            answer: 'Only for null/undefined check: value == null catches both null and undefined. Otherwise, always use ===.'
          },
          {
            question: 'What does [] == false return?',
            answer: 'true. [] coerces to "" (empty string) → 0, false coerces to 0, so 0 == 0 is true.'
          }
        ],
        example: '// Surprising == results\n[] == false    // true\n[] == ![]      // true (both coerce to 0)\n"1" == 1       // true\nnull == undefined // true\n\n// === is predictable\n[] === false   // false\n"1" === 1      // false',
        commonMistakes: [
          'Using == by habit from other languages',
          'Not knowing the coercion rules',
          'Using === for null check when == is cleaner'
        ],
        interviewerExpects: 'Clear explanation of coercion, examples of == pitfalls, when == is acceptable.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'js-7',
        question: 'What is the difference between null and undefined?',
        answer: 'undefined means a variable has been declared but not assigned a value. null is an intentional assignment indicating "no value." Both are falsy but have different semantics.',
        keyPoints: [
          'undefined: default value for uninitialized variables, missing function params, missing object properties',
          'null: explicitly assigned to indicate absence of value',
          'typeof undefined === "undefined"',
          'typeof null === "object" (historical bug)',
          'null == undefined (true), null === undefined (false)'
        ],
        followUps: [
          {
            question: 'Why does typeof null return "object"?',
            answer: 'It\'s a bug from the first JavaScript implementation that was never fixed for backward compatibility. Internally, null was represented with a null pointer, and objects were identified by their type tag.'
          },
          {
            question: 'How do you check for null specifically?',
            answer: 'Use strict equality: value === null. Do not use typeof since it returns "object".'
          }
        ],
        example: 'let a;           // undefined\nlet b = null;    // null\nlet obj = {};\n\nconsole.log(a);        // undefined\nconsole.log(obj.prop); // undefined\nconsole.log(typeof a); // "undefined"\nconsole.log(typeof b); // "object" (bug)\n\n// Checking\nif (value == null) { } // catches both\nif (value === null) { } // only null',
        interviewerExpects: 'Semantic difference, typeof quirk, practical checking patterns.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'js-8',
        question: 'Explain Promises and async/await. How do they handle asynchronous code?',
        answer: 'Promises represent eventual completion/failure of async operations. async/await is syntactic sugar over Promises, making async code look synchronous and easier to read.',
        keyPoints: [
          'Promise states: pending → fulfilled/rejected',
          'then() for success, catch() for errors, finally() for cleanup',
          'async function always returns a Promise',
          'await pauses execution until Promise settles',
          'Error handling: try/catch with await, .catch() with Promises'
        ],
        followUps: [
          {
            question: 'What is the difference between Promise.all, Promise.race, Promise.allSettled, and Promise.any?',
            answer: 'all: resolves when ALL resolve, rejects on first rejection. race: settles with first settled promise. allSettled: waits for all, never rejects, returns status array. any: resolves with first fulfilled, rejects only if all reject.'
          },
          {
            question: 'How do you handle errors with async/await?',
            answer: 'Use try/catch blocks around await calls. For parallel operations, combine Promise.all with try/catch, or use .catch() on individual promises.'
          },
          {
            question: 'Can you use await at the top level?',
            answer: 'Yes, in ES modules (type="module") or modern Node.js. Otherwise, wrap in an async IIFE: (async () => { await ... })();'
          }
        ],
        example: '// Promise\nfetch(url)\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\n// async/await\nasync function getData() {\n  try {\n    const res = await fetch(url);\n    const data = await res.json();\n    console.log(data);\n  } catch (err) {\n    console.error(err);\n  }\n}',
        commonMistakes: [
          'Forgetting to await (getting Promise object instead of value)',
          'Not handling rejections (unhandled promise rejection)',
          'Using await in a regular function (must be async)',
          'Sequential awaits when parallel is possible'
        ],
        interviewerExpects: 'Clear understanding of Promise lifecycle, proper error handling, awareness of Promise combinators.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'js-9',
        question: 'What is the difference between shallow copy and deep copy?',
        answer: 'Shallow copy creates a new object but nested objects still reference the original. Deep copy creates completely independent copies of all nested objects.',
        keyPoints: [
          'Shallow: Object.assign(), spread operator {...obj}, Array.slice()',
          'Deep: JSON.parse(JSON.stringify()), structuredClone(), libraries like lodash.cloneDeep',
          'JSON method fails with functions, undefined, circular refs, Date, Map, Set',
          'structuredClone() handles most types but not functions'
        ],
        followUps: [
          {
            question: 'How would you implement a deep clone without using libraries?',
            answer: 'Use recursion: check if value is object/array, create new container, iterate and recursively clone each property. Handle circular references with a WeakMap.'
          },
          {
            question: 'What are the limitations of JSON.parse(JSON.stringify())?',
            answer: 'Loses functions, undefined values, Symbol keys. Converts Date to string. Fails on circular references. Cannot handle Map, Set, RegExp, or Infinity.'
          }
        ],
        example: '// Shallow copy - nested objects shared\nconst obj = { a: 1, nested: { b: 2 } };\nconst shallow = { ...obj };\nshallow.nested.b = 99;\nconsole.log(obj.nested.b); // 99 (mutated!)\n\n// Deep copy - fully independent\nconst deep = structuredClone(obj);\ndeep.nested.b = 100;\nconsole.log(obj.nested.b); // 99 (unchanged)',
        commonMistakes: [
          'Assuming spread operator deep copies',
          'Using JSON method on objects with functions',
          'Not handling circular references'
        ],
        interviewerExpects: 'Know multiple methods, understand limitations of each, implement custom solution if asked.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'js-10',
        question: 'What are higher-order functions in JavaScript?',
        answer: 'Higher-order functions either take functions as arguments, return functions, or both. They enable functional programming patterns like map, filter, reduce, and function composition.',
        keyPoints: [
          'Examples: map, filter, reduce, forEach, sort',
          'Enable abstraction and code reuse',
          'Foundation for functional programming',
          'Closures often used with HOFs'
        ],
        followUps: [
          {
            question: 'Can you implement Array.prototype.map from scratch?',
            answer: 'Loop through array, call callback with (element, index, array), push result to new array, return new array.'
          },
          {
            question: 'What is function composition?',
            answer: 'Combining multiple functions where output of one becomes input of next: compose(f, g)(x) = f(g(x)). Used for building complex transformations from simple functions.'
          }
        ],
        example: '// HOF that takes function\nconst nums = [1, 2, 3];\nconst doubled = nums.map(n => n * 2); // [2, 4, 6]\n\n// HOF that returns function\nfunction multiply(a) {\n  return function(b) {\n    return a * b;\n  };\n}\nconst double = multiply(2);\ndouble(5); // 10\n\n// Custom map implementation\nArray.prototype.myMap = function(cb) {\n  const result = [];\n  for (let i = 0; i < this.length; i++) {\n    result.push(cb(this[i], i, this));\n  }\n  return result;\n};',
        interviewerExpects: 'Examples of built-in HOFs, ability to implement them, understand practical applications.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      }
    ]
  },

  // ============================================
  // 2. JAVASCRIPT CODING
  // ============================================
  {
    id: 'js-coding',
    name: 'JavaScript Coding',
    description: 'Polyfills, debounce/throttle, deep clone, currying, array methods',
    icon: 'Code',
    color: '#F0DB4F',
    questions: [
      {
        id: 'jsc-1',
        question: 'Implement a debounce function from scratch.',
        answer: 'Debounce delays function execution until after a specified time has passed since the last call. It returns a new function that resets the timer on each call.',
        keyPoints: [
          'Returns a wrapper function',
          'Uses setTimeout and clearTimeout',
          'Preserves `this` context and arguments',
          'Optional: leading edge execution'
        ],
        followUps: [
          {
            question: 'What is the difference between debounce and throttle?',
            answer: 'Debounce waits for silence (executes after delay with no calls). Throttle limits frequency (executes at most once per interval). Use debounce for search input, throttle for scroll/resize.'
          },
          {
            question: 'How would you add a cancel method?',
            answer: 'Store the timeout ID, return an object with both the debounced function and a cancel method that calls clearTimeout.'
          },
          {
            question: 'What are real-world use cases?',
            answer: 'Search autocomplete, window resize handlers, form validation, auto-save, button click protection.'
          }
        ],
        codeExample: 'function debounce(fn, delay) {\n  let timeoutId;\n  return function(...args) {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => {\n      fn.apply(this, args);\n    }, delay);\n  };\n}\n\n// Usage\nconst search = debounce((query) => {\n  console.log("Searching:", query);\n}, 300);\n\ninput.addEventListener("input", (e) => search(e.target.value));',
        commonMistakes: [
          'Forgetting to preserve `this` context',
          'Not clearing previous timeout',
          'Using arrow function when `this` binding matters'
        ],
        interviewerExpects: 'Working implementation, understanding of use cases, bonus for leading edge option.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'jsc-2',
        question: 'Implement a throttle function from scratch.',
        answer: 'Throttle ensures a function is called at most once per specified time interval, regardless of how many times it is invoked.',
        keyPoints: [
          'Track last execution time',
          'Only execute if enough time has passed',
          'Optional: trailing edge execution',
          'Common for scroll, resize, mousemove'
        ],
        followUps: [
          {
            question: 'When would you use throttle vs debounce?',
            answer: 'Throttle for continuous events where you want regular updates (scroll position, drag). Debounce when you want to wait for user to stop (search input, form validation).'
          }
        ],
        codeExample: 'function throttle(fn, limit) {\n  let lastCall = 0;\n  return function(...args) {\n    const now = Date.now();\n    if (now - lastCall >= limit) {\n      lastCall = now;\n      fn.apply(this, args);\n    }\n  };\n}\n\n// Alternative with setTimeout for trailing\nfunction throttleWithTrailing(fn, limit) {\n  let waiting = false;\n  let lastArgs = null;\n  \n  return function(...args) {\n    if (!waiting) {\n      fn.apply(this, args);\n      waiting = true;\n      setTimeout(() => {\n        waiting = false;\n        if (lastArgs) {\n          fn.apply(this, lastArgs);\n          lastArgs = null;\n        }\n      }, limit);\n    } else {\n      lastArgs = args;\n    }\n  };\n}',
        interviewerExpects: 'Working implementation, clear difference from debounce, real use cases.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'jsc-3',
        question: 'Write a polyfill for Function.prototype.bind.',
        answer: 'bind() creates a new function with a fixed `this` value and optional preset arguments. The polyfill must handle both regular calls and constructor calls (new).',
        keyPoints: [
          'Returns a new function',
          'Binds `this` to specified context',
          'Prepends partial arguments',
          'Must work with `new` keyword'
        ],
        followUps: [
          {
            question: 'Why do we need to check for `new` invocation?',
            answer: 'When bound function is used with `new`, `this` should be the new instance, not the bound context. We check using instanceof.'
          },
          {
            question: 'What is the difference between bind, call, and apply?',
            answer: 'bind returns a new function without calling. call invokes with comma-separated args. apply invokes with array of args.'
          }
        ],
        codeExample: 'Function.prototype.myBind = function(context, ...boundArgs) {\n  const fn = this;\n  \n  return function bound(...args) {\n    // If called with new, ignore bound context\n    if (new.target) {\n      return new fn(...boundArgs, ...args);\n    }\n    return fn.apply(context, [...boundArgs, ...args]);\n  };\n};\n\n// Usage\nconst obj = { x: 10 };\nfunction add(a, b) { return this.x + a + b; }\nconst boundAdd = add.myBind(obj, 5);\nboundAdd(3); // 18',
        commonMistakes: [
          'Forgetting to handle partial application',
          'Not handling new keyword',
          'Losing prototype chain'
        ],
        interviewerExpects: 'Working implementation with partial application, awareness of new keyword edge case.',
        difficulty: InterviewDifficulty.ADVANCED
      },
      {
        id: 'jsc-4',
        question: 'Implement Array.prototype.reduce from scratch.',
        answer: 'reduce() executes a reducer function on each element, accumulating a single result. It takes a callback and optional initial value.',
        keyPoints: [
          'Callback receives: accumulator, currentValue, index, array',
          'If no initial value, first element is accumulator',
          'Throws on empty array with no initial value',
          'Returns single accumulated value'
        ],
        followUps: [
          {
            question: 'What happens if you call reduce on an empty array?',
            answer: 'With no initial value: TypeError. With initial value: returns the initial value without calling callback.'
          },
          {
            question: 'How would you implement map using reduce?',
            answer: 'arr.reduce((acc, val) => [...acc, fn(val)], [])'
          }
        ],
        codeExample: 'Array.prototype.myReduce = function(callback, initialValue) {\n  if (this.length === 0 && initialValue === undefined) {\n    throw new TypeError("Reduce of empty array with no initial value");\n  }\n  \n  let accumulator = initialValue !== undefined ? initialValue : this[0];\n  let startIndex = initialValue !== undefined ? 0 : 1;\n  \n  for (let i = startIndex; i < this.length; i++) {\n    accumulator = callback(accumulator, this[i], i, this);\n  }\n  \n  return accumulator;\n};\n\n// Usage\n[1, 2, 3].myReduce((acc, val) => acc + val, 0); // 6',
        interviewerExpects: 'Handle initial value correctly, proper error handling, understand callback signature.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'jsc-5',
        question: 'Implement infinite currying: sum(1)(2)(3)...(n)() = total',
        answer: 'Create a function that accumulates values and returns itself for chaining. When called with no arguments, return the accumulated sum.',
        keyPoints: [
          'Return function for chaining',
          'Track accumulated value via closure',
          'Check for empty call to return result',
          'Can also use valueOf/toString for implicit conversion'
        ],
        followUps: [
          {
            question: 'What if we want sum(1)(2)(3) to return 6 without final ()?',
            answer: 'Override valueOf or toString method on the returned function to return the accumulated value when type coercion occurs.'
          },
          {
            question: 'What is currying and why is it useful?',
            answer: 'Currying transforms f(a,b,c) into f(a)(b)(c). Enables partial application, function composition, and creating specialized functions from general ones.'
          }
        ],
        codeExample: '// With explicit termination\nfunction sum(a) {\n  return function(b) {\n    if (b === undefined) return a;\n    return sum(a + b);\n  };\n}\nsum(1)(2)(3)(); // 6\n\n// With implicit conversion\nfunction sum(a) {\n  const fn = (b) => sum(a + b);\n  fn.valueOf = () => a;\n  return fn;\n}\n+sum(1)(2)(3); // 6\nsum(1)(2)(3) + 0; // 6',
        interviewerExpects: 'Working implementation, understand closure usage, bonus for valueOf approach.',
        difficulty: InterviewDifficulty.ADVANCED
      },
      {
        id: 'jsc-6',
        question: 'Flatten a deeply nested array.',
        answer: 'Convert a nested array structure into a single-level array. Can be done recursively, iteratively, or using Array.flat().',
        keyPoints: [
          'Array.flat(Infinity) - native solution',
          'Recursive: check if element is array, flatten recursively',
          'Iterative: use stack or queue',
          'Handle specified depth levels'
        ],
        followUps: [
          {
            question: 'How would you handle a specific depth?',
            answer: 'Pass depth parameter, decrement on recursion, stop flattening when depth reaches 0.'
          }
        ],
        codeExample: '// Native\n[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4]\n\n// Recursive\nfunction flatten(arr, depth = Infinity) {\n  return arr.reduce((acc, val) => {\n    if (Array.isArray(val) && depth > 0) {\n      acc.push(...flatten(val, depth - 1));\n    } else {\n      acc.push(val);\n    }\n    return acc;\n  }, []);\n}\n\n// Iterative with stack\nfunction flattenIterative(arr) {\n  const stack = [...arr];\n  const result = [];\n  while (stack.length) {\n    const item = stack.pop();\n    if (Array.isArray(item)) {\n      stack.push(...item);\n    } else {\n      result.unshift(item);\n    }\n  }\n  return result;\n}',
        interviewerExpects: 'Multiple approaches, handle depth parameter, discuss time complexity.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'jsc-7',
        question: 'Deep clone an object without using JSON methods.',
        answer: 'Recursively copy all properties, handling nested objects, arrays, and edge cases like circular references, Date, RegExp, Map, Set.',
        keyPoints: [
          'Check for null and primitives (return as-is)',
          'Handle Date, RegExp, Map, Set specially',
          'Use WeakMap to track circular references',
          'Recursively clone nested objects/arrays'
        ],
        followUps: [
          {
            question: 'How do you handle circular references?',
            answer: 'Use a WeakMap to store cloned objects. Before cloning, check if original exists in map. If yes, return cached clone.'
          },
          {
            question: 'What about structuredClone?',
            answer: 'Modern built-in that handles most types including circular refs, but not functions. Available in modern browsers and Node 17+.'
          }
        ],
        codeExample: 'function deepClone(obj, visited = new WeakMap()) {\n  // Primitives and null\n  if (obj === null || typeof obj !== "object") return obj;\n  \n  // Circular reference check\n  if (visited.has(obj)) return visited.get(obj);\n  \n  // Handle special types\n  if (obj instanceof Date) return new Date(obj);\n  if (obj instanceof RegExp) return new RegExp(obj);\n  if (obj instanceof Map) {\n    const clone = new Map();\n    visited.set(obj, clone);\n    obj.forEach((v, k) => clone.set(deepClone(k, visited), deepClone(v, visited)));\n    return clone;\n  }\n  if (obj instanceof Set) {\n    const clone = new Set();\n    visited.set(obj, clone);\n    obj.forEach(v => clone.add(deepClone(v, visited)));\n    return clone;\n  }\n  \n  // Arrays and Objects\n  const clone = Array.isArray(obj) ? [] : {};\n  visited.set(obj, clone);\n  \n  for (const key in obj) {\n    if (obj.hasOwnProperty(key)) {\n      clone[key] = deepClone(obj[key], visited);\n    }\n  }\n  return clone;\n}',
        interviewerExpects: 'Handle circular refs, multiple types, understand limitations vs JSON/structuredClone.',
        difficulty: InterviewDifficulty.ADVANCED
      }
    ]
  },

  // ============================================
  // 3. REACT FUNDAMENTALS
  // ============================================
  {
    id: 'react-fundamentals',
    name: 'React Fundamentals',
    description: 'Hooks, Virtual DOM, reconciliation, state vs props, keys, controlled components',
    icon: 'Atom',
    color: '#61DAFB',
    questions: [
      {
        id: 'rf-1',
        question: 'What is the Virtual DOM and how does React use it?',
        answer: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to batch and optimize updates by comparing virtual trees (diffing) and only updating changed elements in the real DOM.',
        keyPoints: [
          'In-memory representation of UI',
          'Diffing algorithm compares old vs new virtual trees',
          'Reconciliation determines minimal DOM operations',
          'Batches multiple updates for performance'
        ],
        followUps: [
          {
            question: 'How does reconciliation work?',
            answer: 'React compares element types first. Same type: update props/attributes. Different type: unmount old, mount new. For lists, uses keys to track identity and minimize re-renders.'
          },
          {
            question: 'Is Virtual DOM faster than direct DOM manipulation?',
            answer: 'Not always. Direct DOM manipulation can be faster for simple updates. Virtual DOM shines when: 1) Many updates happen together (batching), 2) Complex UIs need efficient diffing, 3) Developer productivity via declarative model.'
          },
          {
            question: 'What is React Fiber?',
            answer: 'Fiber is React\'s reconciliation engine (React 16+). It enables incremental rendering, splitting work into chunks, pausing/resuming work, and prioritizing updates (e.g., user input over data fetching).'
          }
        ],
        example: '// React maintains virtual DOM\nconst vdom = {\n  type: "div",\n  props: { className: "container" },\n  children: [\n    { type: "h1", props: { children: "Hello" } }\n  ]\n};\n\n// On state change:\n// 1. Create new virtual DOM tree\n// 2. Diff with previous tree\n// 3. Calculate minimal updates\n// 4. Batch apply to real DOM',
        interviewerExpects: 'Understand why VDOM exists, how diffing works, awareness of Fiber architecture.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'rf-2',
        question: 'What is the difference between state and props?',
        answer: 'Props are read-only inputs passed from parent to child. State is mutable data managed within a component. Props flow down, state is local.',
        keyPoints: [
          'Props: immutable, passed from parent, like function arguments',
          'State: mutable, managed internally, triggers re-render on change',
          'Props can include callbacks to communicate upward',
          'State should be lifted to lowest common ancestor when shared'
        ],
        followUps: [
          {
            question: 'When should you lift state up?',
            answer: 'When multiple components need the same state, lift it to their closest common ancestor and pass down as props. Avoids duplication and keeps state in sync.'
          },
          {
            question: 'Can you modify props?',
            answer: 'Never. Props are read-only. To "change" them, the parent must update and pass new props. This maintains unidirectional data flow.'
          },
          {
            question: 'What is prop drilling and how do you solve it?',
            answer: 'Passing props through many layers of components. Solutions: Context API, state management libraries (Redux, Zustand), component composition.'
          }
        ],
        example: '// Props - passed from parent\nfunction Child({ name, onUpdate }) {\n  return <button onClick={() => onUpdate(name)}>Hi {name}</button>;\n}\n\n// State - managed internally\nfunction Parent() {\n  const [name, setName] = useState("Alice");\n  return <Child name={name} onUpdate={setName} />;\n}',
        interviewerExpects: 'Clear distinction, understanding of data flow, awareness of lifting state.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'rf-3',
        question: 'Why are keys important in React lists?',
        answer: 'Keys help React identify which items changed, were added, or removed. They enable efficient reconciliation by matching elements between renders instead of re-creating all elements.',
        keyPoints: [
          'Must be unique among siblings (not globally)',
          'Should be stable (same item = same key across renders)',
          'Do NOT use index as key if list order can change',
          'Keys are not passed as props to child components'
        ],
        followUps: [
          {
            question: 'Why is using index as key bad?',
            answer: 'If items are reordered, inserted, or deleted, indices shift. React thinks elements changed identity, causing: incorrect state preservation, unnecessary re-renders, input field value bugs.'
          },
          {
            question: 'When is index as key acceptable?',
            answer: 'Only when: list is static (never reordered), items have no stable ID, list is never filtered/sorted, items have no internal state.'
          },
          {
            question: 'Can you give a practical example of the index bug?',
            answer: 'A todo list with checkboxes. Delete item at index 0. Without proper keys, the checkbox state of item 1 now appears on item 0 because React matched by index.'
          }
        ],
        example: '// Bad - index as key\n{items.map((item, index) => (\n  <Item key={index} {...item} />  // Bug when list changes!\n))}\n\n// Good - stable unique ID\n{items.map(item => (\n  <Item key={item.id} {...item} />  // Correct identity tracking\n))}',
        commonMistakes: [
          'Using index for dynamic lists',
          'Using random values (Math.random()) - regenerates every render',
          'Forgetting keys entirely (React warning)'
        ],
        interviewerExpects: 'Explain why index is problematic with concrete example, know when index is acceptable.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'rf-4',
        question: 'What is the difference between controlled and uncontrolled components?',
        answer: 'Controlled components have form data controlled by React state (single source of truth). Uncontrolled components store data in the DOM, accessed via refs.',
        keyPoints: [
          'Controlled: value + onChange, React owns the data',
          'Uncontrolled: defaultValue, DOM owns the data, use ref to read',
          'Controlled enables validation, conditional disabling, format enforcement',
          'Uncontrolled simpler for simple forms, integrating non-React code'
        ],
        followUps: [
          {
            question: 'When would you use uncontrolled components?',
            answer: 'File inputs (must be uncontrolled), integrating with non-React libraries, simple forms where you only need value on submit, performance-critical scenarios with many inputs.'
          },
          {
            question: 'Can you mix controlled and uncontrolled?',
            answer: 'Not on the same input - pick one. But different inputs in a form can use different approaches. Avoid switching an input between controlled/uncontrolled.'
          }
        ],
        example: '// Controlled - React owns the value\nfunction Controlled() {\n  const [value, setValue] = useState("");\n  return (\n    <input \n      value={value} \n      onChange={e => setValue(e.target.value)} \n    />\n  );\n}\n\n// Uncontrolled - DOM owns the value\nfunction Uncontrolled() {\n  const inputRef = useRef();\n  const handleSubmit = () => {\n    console.log(inputRef.current.value);\n  };\n  return <input ref={inputRef} defaultValue="" />;\n}',
        interviewerExpects: 'Clear distinction, know trade-offs, understand when each is appropriate.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'rf-5',
        question: 'How do React hooks work? What are the rules of hooks?',
        answer: 'Hooks let you use state and lifecycle features in functional components. They rely on call order, so must follow specific rules to work correctly.',
        keyPoints: [
          'Only call at top level (not in conditions, loops, nested functions)',
          'Only call from React functions (components or custom hooks)',
          'React tracks hooks by call order per component instance',
          'Custom hooks must start with "use"'
        ],
        followUps: [
          {
            question: 'Why can\'t hooks be called conditionally?',
            answer: 'React identifies hooks by their call order. If a hook is skipped conditionally, all subsequent hooks get misaligned with their previous state, causing bugs.'
          },
          {
            question: 'How would you create a custom hook?',
            answer: 'Extract stateful logic into a function starting with "use". It can use other hooks. Returns values/functions for component to use. Each component gets its own state copy.'
          },
          {
            question: 'What hooks are available?',
            answer: 'Core: useState, useEffect, useContext, useReducer, useRef, useMemo, useCallback. Additional: useLayoutEffect, useImperativeHandle, useDebugValue, useId, useTransition, useDeferredValue.'
          }
        ],
        example: '// Wrong - conditional hook\nif (condition) {\n  const [val, setVal] = useState(0);  // Error!\n}\n\n// Custom hook\nfunction useCounter(initial = 0) {\n  const [count, setCount] = useState(initial);\n  const increment = () => setCount(c => c + 1);\n  const decrement = () => setCount(c => c - 1);\n  return { count, increment, decrement };\n}\n\n// Usage\nfunction Counter() {\n  const { count, increment } = useCounter(10);\n  return <button onClick={increment}>{count}</button>;\n}',
        interviewerExpects: 'Know the rules and WHY, create custom hooks, understand internal mechanism.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'rf-6',
        question: 'Explain useEffect and its dependency array.',
        answer: 'useEffect runs side effects after render. The dependency array controls when the effect re-runs: empty array = once on mount, with deps = when deps change, no array = every render.',
        keyPoints: [
          '[] - runs once after initial render (mount)',
          '[a, b] - runs when a or b changes',
          'No array - runs after every render',
          'Return cleanup function for unmount/before next effect'
        ],
        followUps: [
          {
            question: 'What problems can incorrect dependencies cause?',
            answer: 'Missing deps: stale closures, effect uses old values. Extra deps: unnecessary effect runs. Wrong deps: infinite loops (if effect changes its own dep).'
          },
          {
            question: 'Why does useEffect run twice in React Strict Mode?',
            answer: 'To help detect missing cleanup. React mounts, unmounts, then remounts in development. If your effect breaks on remount, cleanup is likely missing.'
          },
          {
            question: 'When should you use useLayoutEffect instead?',
            answer: 'When you need to measure/mutate DOM before browser paints. useEffect is async (after paint), useLayoutEffect is sync (before paint). Use for tooltips, animations, DOM measurements.'
          }
        ],
        example: '// Fetch on mount\nuseEffect(() => {\n  fetchData();\n}, []);\n\n// Re-fetch when id changes\nuseEffect(() => {\n  fetchData(id);\n}, [id]);\n\n// With cleanup\nuseEffect(() => {\n  const subscription = subscribe(id);\n  return () => subscription.unsubscribe();  // Cleanup\n}, [id]);\n\n// Infinite loop - BAD\nuseEffect(() => {\n  setCount(count + 1);  // Changes count, triggers effect again\n}, [count]);',
        commonMistakes: [
          'Missing dependencies (stale closure)',
          'Object/array in deps (new reference each render)',
          'Forgetting cleanup for subscriptions/timers',
          'Causing infinite loops'
        ],
        interviewerExpects: 'Explain all dependency scenarios, cleanup importance, common pitfalls.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'rf-7',
        question: 'What is the difference between useMemo and useCallback?',
        answer: 'useMemo memoizes a computed value. useCallback memoizes a function reference. Both prevent unnecessary recalculations/re-creations when dependencies haven\'t changed.',
        keyPoints: [
          'useMemo: returns memoized value, for expensive calculations',
          'useCallback: returns memoized function, for stable callbacks',
          'useCallback(fn, deps) === useMemo(() => fn, deps)',
          'Both help with referential equality for React.memo children'
        ],
        followUps: [
          {
            question: 'When should you NOT use these hooks?',
            answer: 'For simple calculations (overhead not worth it), when the component doesn\'t re-render often, when memoized children don\'t exist. Premature optimization adds complexity.'
          },
          {
            question: 'How do they help with React.memo?',
            answer: 'React.memo does shallow comparison. Without stable references, callbacks/objects appear "new" each render, breaking memoization. useCallback/useMemo provide stable references.'
          },
          {
            question: 'What is the cost of memoization?',
            answer: 'Memory for cached values, comparison overhead on each render. For cheap operations, memoization can be slower than recalculating.'
          }
        ],
        example: '// useMemo - expensive calculation\nconst sortedList = useMemo(() => {\n  return items.sort((a, b) => a.value - b.value);\n}, [items]);\n\n// useCallback - stable function reference\nconst handleClick = useCallback((id) => {\n  setSelected(id);\n}, []);  // No deps = same function forever\n\n// Why it matters for memo\nconst Child = React.memo(({ onClick }) => {\n  console.log("render");\n  return <button onClick={onClick}>Click</button>;\n});\n\n// Without useCallback, Child re-renders every time\n// because onClick is a new function reference',
        interviewerExpects: 'Know difference, when to use each, understand trade-offs of memoization.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'rf-8',
        question: 'What is Context API and when should you use it?',
        answer: 'Context provides a way to pass data through the component tree without prop drilling. It\'s best for low-frequency updates like themes, user auth, or locale.',
        keyPoints: [
          'createContext, Provider, useContext',
          'Avoids prop drilling for global data',
          'All consumers re-render when context value changes',
          'Not optimized for frequent updates (use state libraries instead)'
        ],
        followUps: [
          {
            question: 'Why shouldn\'t you use Context for all state?',
            answer: 'Every context consumer re-renders when value changes, even if they only use part of it. For frequent updates, this causes performance issues. Use state libraries with selectors instead.'
          },
          {
            question: 'How can you optimize Context performance?',
            answer: 'Split into multiple contexts, memoize context value, use selectors (with libraries), or combine with useReducer for complex state.'
          },
          {
            question: 'Context vs Redux - when to use which?',
            answer: 'Context: simple global state, infrequent updates, small apps. Redux: complex state logic, frequent updates, need for middleware, time-travel debugging, large apps.'
          }
        ],
        example: '// Create context\nconst ThemeContext = createContext("light");\n\n// Provider wraps tree\nfunction App() {\n  const [theme, setTheme] = useState("light");\n  return (\n    <ThemeContext.Provider value={{ theme, setTheme }}>\n      <Page />\n    </ThemeContext.Provider>\n  );\n}\n\n// Consumer uses context\nfunction Button() {\n  const { theme, setTheme } = useContext(ThemeContext);\n  return (\n    <button \n      style={{ background: theme === "dark" ? "#333" : "#fff" }}\n      onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}\n    >\n      Toggle\n    </button>\n  );\n}',
        interviewerExpects: 'Know when Context is appropriate, understand re-render implications, alternatives.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      }
    ]
  },

  // ============================================
  // 4. REACT ADVANCED
  // ============================================
  {
    id: 'react-advanced',
    name: 'React Advanced',
    description: 'Fiber, memoization pitfalls, stale closures, batching, concurrent mode, error boundaries',
    icon: 'Sparkles',
    color: '#00D8FF',
    questions: [
      {
        id: 'ra-1',
        question: 'Why does useEffect run twice in React Strict Mode?',
        answer: 'Strict Mode intentionally double-invokes effects to help detect missing cleanup functions. It mounts, unmounts, then remounts components to surface issues before production.',
        keyPoints: [
          'Only happens in development, not production',
          'Helps find missing cleanup (subscriptions, timers, listeners)',
          'If effect breaks on remount, cleanup is likely missing',
          'Tests that effects are idempotent and properly clean up'
        ],
        followUps: [
          {
            question: 'How do you fix issues revealed by double-invocation?',
            answer: 'Add proper cleanup function that undoes the effect: unsubscribe, clear timers, remove listeners, abort fetches, etc.'
          },
          {
            question: 'Should I disable Strict Mode to fix this?',
            answer: 'No. The double-invocation reveals real bugs. Fix the underlying issue instead. Your app should handle mount/unmount correctly.'
          }
        ],
        example: '// Problem: timer not cleaned up\nuseEffect(() => {\n  const id = setInterval(() => console.log("tick"), 1000);\n  // Missing cleanup - two intervals running!\n}, []);\n\n// Fixed: proper cleanup\nuseEffect(() => {\n  const id = setInterval(() => console.log("tick"), 1000);\n  return () => clearInterval(id);  // Cleanup!\n}, []);',
        interviewerExpects: 'Understand the purpose, know it\'s development-only, fix issues rather than disable.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'ra-2',
        question: 'Why might a component using React.memo still re-render?',
        answer: 'React.memo does shallow comparison. Re-renders happen if: new object/array/function references are passed, context changes, or internal state/hooks change.',
        keyPoints: [
          'New object/array literals: {} !== {}',
          'Inline functions: () => {} !== () => {}',
          'Context value changes affect all consumers',
          'Internal state changes always re-render',
          'Parent re-render passes new prop references'
        ],
        followUps: [
          {
            question: 'How do you fix unwanted re-renders?',
            answer: 'useMemo for objects/arrays, useCallback for functions, custom comparison function as second arg to memo, split context to reduce consumers.'
          },
          {
            question: 'When should you NOT use React.memo?',
            answer: 'Components that almost always receive new props, simple/cheap components where memo overhead exceeds render cost, components that need to re-render with parent.'
          }
        ],
        example: '// Problem: new object every render\nfunction Parent() {\n  return <MemoChild style={{ color: "red" }} />;  // New object!\n}\n\n// Fix: memoize the object\nfunction Parent() {\n  const style = useMemo(() => ({ color: "red" }), []);\n  return <MemoChild style={style} />;\n}\n\n// Custom comparison\nconst MemoChild = React.memo(Child, (prevProps, nextProps) => {\n  return prevProps.id === nextProps.id;  // Only compare id\n});',
        interviewerExpects: 'Understand shallow comparison, identify referential equality issues, know fixes.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'ra-3',
        question: 'What are stale closures and how do they affect React hooks?',
        answer: 'Stale closures occur when a function captures an old value from a previous render. Common in useEffect, setTimeout, or event handlers that reference state.',
        keyPoints: [
          'Closures capture values at creation time',
          'Missing dependencies cause stale values',
          'Fix: add to dependency array, or use refs',
          'Functional setState: setCount(c => c + 1) always uses latest'
        ],
        followUps: [
          {
            question: 'How does using a ref help?',
            answer: 'Refs are mutable and persist across renders. Store current value in ref, read ref.current in closure to always get latest value.'
          },
          {
            question: 'Can you give a real example?',
            answer: 'setInterval that increments counter: without functional update or ref, it always reads initial count value, never incrementing past 1.'
          }
        ],
        example: '// Stale closure problem\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  useEffect(() => {\n    const id = setInterval(() => {\n      setCount(count + 1);  // Always 0 + 1 = 1!\n    }, 1000);\n    return () => clearInterval(id);\n  }, []);  // Missing count dependency\n  \n  // Fix 1: functional update\n  setCount(c => c + 1);  // Uses latest value\n  \n  // Fix 2: use ref\n  const countRef = useRef(count);\n  useEffect(() => { countRef.current = count; });\n  // Now read countRef.current in interval\n}',
        interviewerExpects: 'Identify stale closure pattern, multiple solutions, understand why functional updates help.',
        difficulty: InterviewDifficulty.ADVANCED
      },
      {
        id: 'ra-4',
        question: 'How does React batch state updates?',
        answer: 'React batches multiple setState calls into a single re-render for performance. React 18+ batches automatically everywhere; earlier versions only batched in event handlers.',
        keyPoints: [
          'React 18: automatic batching in all contexts',
          'Pre-18: batching only in React event handlers',
          'Multiple setStates = one re-render (batched)',
          'flushSync() forces immediate render if needed'
        ],
        followUps: [
          {
            question: 'What changed in React 18 regarding batching?',
            answer: 'Before 18, setTimeout, promises, native events did not batch. React 18 batches everywhere including async code. Use flushSync to opt out if needed.'
          },
          {
            question: 'How does batching affect performance?',
            answer: 'Reduces re-renders. Three setStates in one handler = one render, not three. This prevents unnecessary DOM updates and intermediate states.'
          }
        ],
        example: '// All batched into one render\nfunction handleClick() {\n  setCount(c => c + 1);\n  setFlag(f => !f);\n  setName("updated");\n  // Only ONE re-render happens\n}\n\n// React 18: async also batched\nsetTimeout(() => {\n  setCount(c => c + 1);\n  setFlag(f => !f);\n  // Still one render in React 18!\n}, 100);\n\n// Opt out of batching\nimport { flushSync } from "react-dom";\nflushSync(() => setCount(c => c + 1));\n// Render happens immediately here',
        interviewerExpects: 'Know React 18 changes, understand performance benefit, know flushSync.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'ra-5',
        question: 'What is React Concurrent Mode / Concurrent Features?',
        answer: 'Concurrent features allow React to work on multiple tasks simultaneously, pause/resume rendering, and prioritize urgent updates (like user input) over less urgent ones.',
        keyPoints: [
          'Non-blocking rendering',
          'Interruptible: can pause to handle urgent updates',
          'useTransition: mark updates as non-urgent',
          'useDeferredValue: defer updating a value',
          'Suspense for data fetching'
        ],
        followUps: [
          {
            question: 'What is useTransition used for?',
            answer: 'Marks state updates as non-urgent. React can interrupt them for urgent updates (typing). Shows loading state while transition is pending. Keeps UI responsive during heavy updates.'
          },
          {
            question: 'What is useDeferredValue?',
            answer: 'Returns a deferred version of a value that "lags behind". Useful for expensive renders: keep input responsive while list filters in background.'
          },
          {
            question: 'How is this different from debouncing?',
            answer: 'Debouncing delays execution entirely. Concurrent features start work immediately but can interrupt/deprioritize it. No fixed delay, responds to actual system load.'
          }
        ],
        example: '// useTransition - non-urgent state update\nfunction Search() {\n  const [query, setQuery] = useState("");\n  const [results, setResults] = useState([]);\n  const [isPending, startTransition] = useTransition();\n  \n  const handleChange = (e) => {\n    setQuery(e.target.value);  // Urgent: update input immediately\n    startTransition(() => {\n      setResults(filterItems(e.target.value));  // Non-urgent\n    });\n  };\n  \n  return (\n    <>\n      <input value={query} onChange={handleChange} />\n      {isPending ? <Spinner /> : <List items={results} />}\n    </>\n  );\n}',
        interviewerExpects: 'Understand prioritization concept, practical use cases, difference from debouncing.',
        difficulty: InterviewDifficulty.ADVANCED
      },
      {
        id: 'ra-6',
        question: 'What are Error Boundaries and how do they work?',
        answer: 'Error Boundaries are React components that catch JavaScript errors in their child tree, log them, and display a fallback UI instead of crashing the whole app.',
        keyPoints: [
          'Class component with getDerivedStateFromError or componentDidCatch',
          'Catches errors in render, lifecycle, and constructors of children',
          'Does NOT catch: event handlers, async code, SSR, errors in itself',
          'Use react-error-boundary for hooks-based approach'
        ],
        followUps: [
          {
            question: 'Why can\'t Error Boundaries be functional components?',
            answer: 'No hooks equivalent for componentDidCatch yet. Must use class component or a library like react-error-boundary that wraps one.'
          },
          {
            question: 'What errors don\'t Error Boundaries catch?',
            answer: 'Event handlers (use try/catch), async code (promises), SSR, errors in the boundary itself. They only catch during rendering.'
          },
          {
            question: 'How would you handle errors in event handlers?',
            answer: 'Use regular try/catch, or create custom hook that catches and sets error state, then conditionally render error UI.'
          }
        ],
        example: 'class ErrorBoundary extends React.Component {\n  state = { hasError: false, error: null };\n  \n  static getDerivedStateFromError(error) {\n    return { hasError: true, error };\n  }\n  \n  componentDidCatch(error, info) {\n    logErrorToService(error, info.componentStack);\n  }\n  \n  render() {\n    if (this.state.hasError) {\n      return <ErrorFallback error={this.state.error} />;\n    }\n    return this.props.children;\n  }\n}\n\n// Usage\n<ErrorBoundary>\n  <App />\n</ErrorBoundary>',
        interviewerExpects: 'Know limitations, implement basic boundary, understand what it catches vs doesn\'t.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'ra-7',
        question: 'How would you render 300,000 records without freezing the browser?',
        answer: 'Use virtualization: only render visible items. Libraries like react-window or react-virtualized render a "window" of items, recycling DOM nodes as user scrolls.',
        keyPoints: [
          'Virtualization: render only visible rows',
          'Fixed vs variable height items',
          'react-window, react-virtualized, @tanstack/virtual',
          'Alternative: pagination, infinite scroll with limits'
        ],
        followUps: [
          {
            question: 'How does virtualization work internally?',
            answer: 'Container has height of all items (for scrollbar). Inner container positions only visible items absolutely. On scroll, recalculate which items visible, update positions.'
          },
          {
            question: 'What about variable height items?',
            answer: 'More complex: need to measure items or estimate heights. react-window VariableSizeList requires a function returning each item\'s height.'
          },
          {
            question: 'When would you use pagination instead?',
            answer: 'When users need to jump to specific pages, for better SEO, when data is server-paginated anyway, when total count is important to show.'
          }
        ],
        example: 'import { FixedSizeList } from "react-window";\n\nfunction VirtualList({ items }) {\n  const Row = ({ index, style }) => (\n    <div style={style}>\n      {items[index].name}\n    </div>\n  );\n  \n  return (\n    <FixedSizeList\n      height={600}       // Container height\n      width="100%"\n      itemCount={items.length}  // 300,000\n      itemSize={50}       // Row height\n    >\n      {Row}\n    </FixedSizeList>\n  );\n}\n// Only ~12-15 rows rendered at any time!',
        interviewerExpects: 'Know virtualization concept, library options, understand when to use alternatives.',
        difficulty: InterviewDifficulty.ADVANCED
      },
      {
        id: 'ra-8',
        question: 'What is hydration in React SSR?',
        answer: 'Hydration is the process where React attaches event listeners and makes server-rendered HTML interactive. React "hydrates" the static HTML with client-side JavaScript.',
        keyPoints: [
          'Server sends pre-rendered HTML (fast initial paint)',
          'Client loads JS and "hydrates" - attaches events, state',
          'React expects client render to match server HTML',
          'Mismatch causes hydration errors, can cause re-render'
        ],
        followUps: [
          {
            question: 'What causes hydration mismatches?',
            answer: 'Using browser-only APIs (window, localStorage) during render, Date.now() or Math.random(), different data on server vs client, invalid HTML nesting.'
          },
          {
            question: 'How do you fix hydration errors?',
            answer: 'Use useEffect for browser-only code (runs after hydration), suppressHydrationWarning for intentional differences, ensure same data on server/client.'
          },
          {
            question: 'What is selective hydration in React 18?',
            answer: 'With Suspense, React can hydrate components independently and prioritize hydrating the component user is interacting with, making page interactive faster.'
          }
        ],
        example: '// Hydration mismatch - BAD\nfunction Clock() {\n  return <span>{Date.now()}</span>;  // Different on server vs client!\n}\n\n// Fixed - render after hydration\nfunction Clock() {\n  const [time, setTime] = useState(null);\n  \n  useEffect(() => {\n    setTime(Date.now());  // Only runs on client\n  }, []);\n  \n  if (!time) return <span>Loading...</span>;\n  return <span>{time}</span>;\n}',
        interviewerExpects: 'Understand SSR flow, identify mismatch causes, know how to fix them.',
        difficulty: InterviewDifficulty.ADVANCED
      }
    ]
  },

  // ============================================
  // 5. REACT MACHINE CODING (LLD)
  // ============================================
  {
    id: 'react-machine-coding',
    name: 'React Machine Coding',
    description: 'Build components: modal, infinite scroll, autocomplete, data table, forms',
    icon: 'Wrench',
    color: '#764ABC',
    questions: [
      {
        id: 'rmc-1',
        question: 'Build a debounced search input with API cancellation.',
        answer: 'Create a search input that debounces API calls and cancels previous pending requests using AbortController to prevent race conditions.',
        keyPoints: [
          'Debounce the search query state change',
          'Use AbortController to cancel in-flight requests',
          'Handle loading, error, and empty states',
          'Cancel on unmount via cleanup function'
        ],
        followUps: [
          {
            question: 'Why is request cancellation important?',
            answer: 'Without it, slow requests for old queries can resolve after newer requests, showing stale results. Also prevents memory leaks and wasted bandwidth.'
          },
          {
            question: 'How would you add caching?',
            answer: 'Store results by query in state/ref/external cache. Check cache before fetching. Consider TTL for stale data. Libraries like react-query handle this.'
          }
        ],
        codeExample: 'function DebouncedSearch() {\n  const [query, setQuery] = useState("");\n  const [results, setResults] = useState([]);\n  const [loading, setLoading] = useState(false);\n  const abortRef = useRef(null);\n  \n  useEffect(() => {\n    if (!query) {\n      setResults([]);\n      return;\n    }\n    \n    const timeoutId = setTimeout(async () => {\n      // Cancel previous request\n      abortRef.current?.abort();\n      abortRef.current = new AbortController();\n      \n      setLoading(true);\n      try {\n        const res = await fetch(\n          `/api/search?q=${query}`,\n          { signal: abortRef.current.signal }\n        );\n        const data = await res.json();\n        setResults(data);\n      } catch (err) {\n        if (err.name !== "AbortError") {\n          console.error(err);\n        }\n      } finally {\n        setLoading(false);\n      }\n    }, 300);\n    \n    return () => {\n      clearTimeout(timeoutId);\n      abortRef.current?.abort();\n    };\n  }, [query]);\n  \n  return (\n    <div>\n      <input \n        value={query} \n        onChange={e => setQuery(e.target.value)}\n        placeholder="Search..."\n      />\n      {loading && <Spinner />}\n      <ul>\n        {results.map(r => <li key={r.id}>{r.name}</li>)}\n      </ul>\n    </div>\n  );\n}',
        interviewerExpects: 'Working debounce, proper cancellation, cleanup on unmount, handling all states.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'rmc-2',
        question: 'Implement infinite scroll with intersection observer.',
        answer: 'Use IntersectionObserver to detect when a sentinel element is visible, then load more data. Handle loading states and prevent duplicate fetches.',
        keyPoints: [
          'IntersectionObserver watches sentinel element',
          'Load more when sentinel enters viewport',
          'Track hasMore, loading to prevent extra fetches',
          'Cleanup observer on unmount'
        ],
        followUps: [
          {
            question: 'How does IntersectionObserver work?',
            answer: 'Async API that observes elements and fires callback when they intersect with viewport or ancestor. More performant than scroll event listeners.'
          },
          {
            question: 'How would you handle errors and retries?',
            answer: 'Show error state with retry button, exponential backoff for automatic retries, preserve existing data on error.'
          }
        ],
        codeExample: 'function InfiniteList() {\n  const [items, setItems] = useState([]);\n  const [page, setPage] = useState(1);\n  const [loading, setLoading] = useState(false);\n  const [hasMore, setHasMore] = useState(true);\n  const sentinelRef = useRef(null);\n  \n  useEffect(() => {\n    const loadMore = async () => {\n      if (loading || !hasMore) return;\n      setLoading(true);\n      const data = await fetchPage(page);\n      setItems(prev => [...prev, ...data.items]);\n      setHasMore(data.hasMore);\n      setPage(p => p + 1);\n      setLoading(false);\n    };\n    \n    const observer = new IntersectionObserver(\n      (entries) => {\n        if (entries[0].isIntersecting) {\n          loadMore();\n        }\n      },\n      { threshold: 0.1 }\n    );\n    \n    if (sentinelRef.current) {\n      observer.observe(sentinelRef.current);\n    }\n    \n    return () => observer.disconnect();\n  }, [page, loading, hasMore]);\n  \n  return (\n    <div>\n      {items.map(item => <Item key={item.id} {...item} />)}\n      {hasMore && <div ref={sentinelRef}>{loading ? "Loading..." : ""}</div>}\n      {!hasMore && <div>No more items</div>}\n    </div>\n  );\n}',
        interviewerExpects: 'Working observer, prevent duplicate loads, handle all states, proper cleanup.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'rmc-3',
        question: 'Build a reusable Modal component using React Portal.',
        answer: 'Create a modal that renders outside the component tree using createPortal, handles keyboard events (Escape), click outside to close, focus trap, and accessibility.',
        keyPoints: [
          'createPortal renders outside parent DOM',
          'Escape key and backdrop click to close',
          'Focus trap: tab cycles within modal',
          'ARIA attributes for accessibility',
          'Prevent body scroll when open'
        ],
        followUps: [
          {
            question: 'Why use a Portal?',
            answer: 'Avoids z-index and overflow issues from parent styles. Modal renders at document body level, ensuring it\'s always on top.'
          },
          {
            question: 'What is focus trap and why is it important?',
            answer: 'Keeps focus within modal while open. Tab key should cycle through modal elements only. Required for keyboard accessibility (WCAG).'
          }
        ],
        codeExample: 'function Modal({ isOpen, onClose, children, title }) {\n  const modalRef = useRef(null);\n  \n  useEffect(() => {\n    if (!isOpen) return;\n    \n    const handleEscape = (e) => {\n      if (e.key === "Escape") onClose();\n    };\n    \n    document.addEventListener("keydown", handleEscape);\n    document.body.style.overflow = "hidden";\n    modalRef.current?.focus();\n    \n    return () => {\n      document.removeEventListener("keydown", handleEscape);\n      document.body.style.overflow = "";\n    };\n  }, [isOpen, onClose]);\n  \n  if (!isOpen) return null;\n  \n  return createPortal(\n    <div \n      className="modal-backdrop" \n      onClick={onClose}\n      role="presentation"\n    >\n      <div\n        ref={modalRef}\n        className="modal-content"\n        onClick={e => e.stopPropagation()}\n        role="dialog"\n        aria-modal="true"\n        aria-labelledby="modal-title"\n        tabIndex={-1}\n      >\n        <h2 id="modal-title">{title}</h2>\n        {children}\n        <button onClick={onClose}>Close</button>\n      </div>\n    </div>,\n    document.body\n  );\n}',
        interviewerExpects: 'Portal usage, keyboard handling, accessibility attributes, click outside, scroll lock.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'rmc-4',
        question: 'Create a data table with sorting and pagination.',
        answer: 'Build a reusable table component that handles column sorting (asc/desc), pagination controls, and displays data efficiently.',
        keyPoints: [
          'Sort state: column + direction',
          'Pagination: page, pageSize, total',
          'Memoize sorted/paginated data',
          'Accessible headers with sort indicators'
        ],
        followUps: [
          {
            question: 'How would you handle server-side pagination?',
            answer: 'Pass sort/page params to API, update on change, show loading state. Parent controls data fetching, table just displays.'
          },
          {
            question: 'How would you add column filtering?',
            answer: 'Filter state per column, combine filters before sort/paginate. Consider debouncing text filters.'
          }
        ],
        codeExample: 'function DataTable({ data, columns }) {\n  const [sort, setSort] = useState({ col: null, dir: "asc" });\n  const [page, setPage] = useState(1);\n  const pageSize = 10;\n  \n  const sortedData = useMemo(() => {\n    if (!sort.col) return data;\n    return [...data].sort((a, b) => {\n      const val = a[sort.col] > b[sort.col] ? 1 : -1;\n      return sort.dir === "asc" ? val : -val;\n    });\n  }, [data, sort]);\n  \n  const paginatedData = useMemo(() => {\n    const start = (page - 1) * pageSize;\n    return sortedData.slice(start, start + pageSize);\n  }, [sortedData, page]);\n  \n  const totalPages = Math.ceil(data.length / pageSize);\n  \n  const handleSort = (col) => {\n    setSort(s => ({\n      col,\n      dir: s.col === col && s.dir === "asc" ? "desc" : "asc"\n    }));\n    setPage(1);\n  };\n  \n  return (\n    <>\n      <table>\n        <thead>\n          <tr>\n            {columns.map(col => (\n              <th key={col.key} onClick={() => handleSort(col.key)}>\n                {col.label}\n                {sort.col === col.key && (sort.dir === "asc" ? " ▲" : " ▼")}\n              </th>\n            ))}\n          </tr>\n        </thead>\n        <tbody>\n          {paginatedData.map(row => (\n            <tr key={row.id}>\n              {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}\n            </tr>\n          ))}\n        </tbody>\n      </table>\n      <div>\n        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>\n        <span>Page {page} of {totalPages}</span>\n        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>\n      </div>\n    </>\n  );\n}',
        interviewerExpects: 'Working sort toggle, pagination logic, memoization, reusable design.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'rmc-5',
        question: 'Build an autocomplete/typeahead component with keyboard navigation.',
        answer: 'Create a search input with dropdown suggestions, keyboard navigation (up/down/enter), debounced API calls, and accessibility.',
        keyPoints: [
          'Debounced search as user types',
          'Arrow keys to navigate, Enter to select',
          'Highlight active item visually',
          'ARIA attributes for screen readers',
          'Close on blur, escape, or outside click'
        ],
        followUps: [
          {
            question: 'How do you handle the highlighted item state?',
            answer: 'Track activeIndex in state. Arrow up/down changes index with wraparound. Enter selects item at activeIndex. Reset on new results.'
          },
          {
            question: 'What ARIA attributes are needed?',
            answer: 'role="combobox" on input, aria-expanded, aria-autocomplete, role="listbox" on dropdown, role="option" on items, aria-activedescendant for active item.'
          }
        ],
        codeExample: 'function Autocomplete({ onSelect, fetchSuggestions }) {\n  const [query, setQuery] = useState("");\n  const [suggestions, setSuggestions] = useState([]);\n  const [activeIndex, setActiveIndex] = useState(-1);\n  const [isOpen, setIsOpen] = useState(false);\n  \n  useEffect(() => {\n    if (!query) { setSuggestions([]); return; }\n    const timeout = setTimeout(async () => {\n      const results = await fetchSuggestions(query);\n      setSuggestions(results);\n      setActiveIndex(-1);\n      setIsOpen(true);\n    }, 300);\n    return () => clearTimeout(timeout);\n  }, [query]);\n  \n  const handleKeyDown = (e) => {\n    if (!isOpen) return;\n    switch (e.key) {\n      case "ArrowDown":\n        e.preventDefault();\n        setActiveIndex(i => (i + 1) % suggestions.length);\n        break;\n      case "ArrowUp":\n        e.preventDefault();\n        setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);\n        break;\n      case "Enter":\n        if (activeIndex >= 0) {\n          onSelect(suggestions[activeIndex]);\n          setIsOpen(false);\n        }\n        break;\n      case "Escape":\n        setIsOpen(false);\n        break;\n    }\n  };\n  \n  return (\n    <div>\n      <input\n        value={query}\n        onChange={e => setQuery(e.target.value)}\n        onKeyDown={handleKeyDown}\n        onFocus={() => suggestions.length && setIsOpen(true)}\n        role="combobox"\n        aria-expanded={isOpen}\n      />\n      {isOpen && suggestions.length > 0 && (\n        <ul role="listbox">\n          {suggestions.map((s, i) => (\n            <li\n              key={s.id}\n              role="option"\n              aria-selected={i === activeIndex}\n              className={i === activeIndex ? "active" : ""}\n              onClick={() => { onSelect(s); setIsOpen(false); }}\n            >\n              {s.name}\n            </li>\n          ))}\n        </ul>\n      )}\n    </div>\n  );\n}',
        interviewerExpects: 'Working keyboard nav, debounce, proper ARIA, handle edge cases.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'rmc-6',
        question: 'Implement a custom useFetch hook with loading, error, and cancellation.',
        answer: 'Create a reusable hook that handles fetching data, tracks loading/error states, and properly cancels requests on unmount or dependency change.',
        keyPoints: [
          'Returns { data, loading, error, refetch }',
          'AbortController for cancellation',
          'Cleanup on unmount and refetch',
          'Handle race conditions'
        ],
        followUps: [
          {
            question: 'How would you add caching?',
            answer: 'Store results by URL in a cache (module-level Map or context). Check cache before fetching, return cached data with stale indicator, fetch in background.'
          },
          {
            question: 'How is this different from react-query/SWR?',
            answer: 'Libraries add: global cache, deduplication, background refetch, stale-while-revalidate, retry logic, devtools. Custom hook is simpler but less features.'
          }
        ],
        codeExample: 'function useFetch(url, options = {}) {\n  const [state, setState] = useState({\n    data: null,\n    loading: true,\n    error: null\n  });\n  const abortRef = useRef(null);\n  \n  const fetchData = useCallback(async () => {\n    abortRef.current?.abort();\n    abortRef.current = new AbortController();\n    \n    setState(s => ({ ...s, loading: true, error: null }));\n    \n    try {\n      const res = await fetch(url, {\n        ...options,\n        signal: abortRef.current.signal\n      });\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      const data = await res.json();\n      setState({ data, loading: false, error: null });\n    } catch (err) {\n      if (err.name !== "AbortError") {\n        setState(s => ({ ...s, loading: false, error: err }));\n      }\n    }\n  }, [url, JSON.stringify(options)]);\n  \n  useEffect(() => {\n    fetchData();\n    return () => abortRef.current?.abort();\n  }, [fetchData]);\n  \n  return { ...state, refetch: fetchData };\n}\n\n// Usage\nfunction UserProfile({ userId }) {\n  const { data, loading, error, refetch } = useFetch(`/api/users/${userId}`);\n  \n  if (loading) return <Spinner />;\n  if (error) return <button onClick={refetch}>Retry</button>;\n  return <div>{data.name}</div>;\n}',
        interviewerExpects: 'Proper state management, cancellation, cleanup, refetch capability.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      }
    ]
  },

  // ============================================
  // 6. CSS & STYLING
  // ============================================
  {
    id: 'css-styling',
    name: 'CSS & Styling',
    description: 'Flexbox, Grid, positioning, stacking context, z-index, animations, responsive design',
    icon: 'Paintbrush',
    color: '#264DE4',
    questions: [
      {
        id: 'css-1',
        question: 'Explain CSS Flexbox vs Grid. When would you use each?',
        answer: 'Flexbox is one-dimensional (row OR column), ideal for component layouts. Grid is two-dimensional (rows AND columns), ideal for page layouts. Use Flexbox for distributing items along one axis, Grid for complex layouts.',
        keyPoints: [
          'Flexbox: 1D, content-out, good for nav, cards, centering',
          'Grid: 2D, layout-first, good for page structure, dashboards',
          'Can nest: Grid for page, Flexbox inside grid items',
          'Both handle responsive design well'
        ],
        followUps: [
          {
            question: 'How do you center an element with Flexbox?',
            answer: 'Parent: display: flex; justify-content: center; align-items: center; This centers on both axes.'
          },
          {
            question: 'What is fr unit in Grid?',
            answer: 'Fractional unit representing a fraction of available space. grid-template-columns: 1fr 2fr means second column is twice as wide as first.'
          },
          {
            question: 'How do you make a responsive grid without media queries?',
            answer: 'Use auto-fit or auto-fill with minmax(): grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); Items wrap and resize automatically.'
          }
        ],
        example: '/* Flexbox - navbar */\n.nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n/* Grid - page layout */\n.page {\n  display: grid;\n  grid-template-columns: 250px 1fr;\n  grid-template-rows: auto 1fr auto;\n  grid-template-areas:\n    "header header"\n    "sidebar main"\n    "footer footer";\n}\n\n/* Responsive grid */\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1rem;\n}',
        interviewerExpects: 'Know when to use each, practical examples, responsive patterns.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'css-2',
        question: 'What is a CSS stacking context and why might z-index not work?',
        answer: 'A stacking context is a 3D conceptualization of HTML elements. z-index only works within the same stacking context. An element with lower z-index in a higher parent context can still appear above elements with higher z-index.',
        keyPoints: [
          'Stacking contexts are created by: position + z-index, opacity < 1, transform, filter, etc.',
          'z-index only competes within same context',
          'Parent stacking order trumps child z-index',
          'isolation: isolate creates new context without side effects'
        ],
        followUps: [
          {
            question: 'What CSS properties create a new stacking context?',
            answer: 'position with z-index (not static), opacity < 1, transform, filter, perspective, clip-path, mask, mix-blend-mode, isolation: isolate, will-change, contain: paint.'
          },
          {
            question: 'How do you debug z-index issues?',
            answer: 'Check parent stacking contexts in DevTools. Use "3D view" in Edge/Chrome. Ensure competing elements are in same context. Consider isolation: isolate.'
          }
        ],
        example: '/* Parent creates stacking context */\n.modal-container {\n  position: relative;\n  z-index: 10;  /* Creates stacking context */\n}\n\n.dropdown {\n  position: absolute;\n  z-index: 9999;  /* Won\'t escape parent\'s context! */\n}\n\n/* tooltip in a z-index: 5 parent can\'t beat\n   dropdown in z-index: 10 parent, regardless of\n   their individual z-index values */\n\n/* Fix: move dropdown to body or use portal */\n/* Or: use isolation: isolate strategically */',
        interviewerExpects: 'Explain stacking context creation, debug z-index issues, practical solutions.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'css-3',
        question: 'What is the difference between position: relative, absolute, fixed, and sticky?',
        answer: 'relative: positioned relative to its normal position. absolute: relative to nearest positioned ancestor. fixed: relative to viewport. sticky: hybrid that toggles between relative and fixed based on scroll.',
        keyPoints: [
          'relative: stays in flow, offset from normal position',
          'absolute: removed from flow, positioned to ancestor (or body)',
          'fixed: removed from flow, positioned to viewport, stays on scroll',
          'sticky: in flow until threshold, then fixed within container'
        ],
        followUps: [
          {
            question: 'What is the "containing block" for absolute positioning?',
            answer: 'The nearest ancestor with position other than static. If none, the initial containing block (usually viewport).'
          },
          {
            question: 'Why might position: sticky not work?',
            answer: 'Parent has overflow: hidden/auto/scroll, no top/bottom/left/right specified, ancestor has overflow set, parent height doesn\'t allow scrolling.'
          }
        ],
        example: '/* Relative - nudge from normal position */\n.relative {\n  position: relative;\n  top: 10px;  /* Moves down 10px from where it would be */\n}\n\n/* Absolute - position to ancestor */\n.container { position: relative; }  /* Containing block */\n.absolute {\n  position: absolute;\n  top: 0; right: 0;  /* Top-right of container */\n}\n\n/* Fixed - stays in viewport */\n.fixed-header {\n  position: fixed;\n  top: 0; left: 0; right: 0;\n}\n\n/* Sticky - fixed when scrolled to */\n.sticky-nav {\n  position: sticky;\n  top: 0;  /* Sticks when scrolled to top of viewport */\n}',
        interviewerExpects: 'Clear distinction, practical use cases, troubleshoot sticky issues.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'css-4',
        question: 'What is the difference between display: none and visibility: hidden?',
        answer: 'display: none removes element from layout entirely (no space). visibility: hidden makes element invisible but preserves its space in the layout.',
        keyPoints: [
          'display: none - no layout space, triggers reflow',
          'visibility: hidden - keeps space, children can override',
          'opacity: 0 - invisible but interactive (clicks work)',
          'Screen readers: display: none and visibility: hidden hide from AT'
        ],
        followUps: [
          {
            question: 'Which is better for animations?',
            answer: 'Neither animates well. Use opacity (0→1) for fade, or transform with visibility (set visible before animate, hidden after).'
          },
          {
            question: 'How do you hide content but keep it accessible to screen readers?',
            answer: 'Use .sr-only class: position: absolute; width: 1px; height: 1px; clip: rect(0,0,0,0); overflow: hidden.'
          }
        ],
        example: '/* display: none - completely removed */\n.hidden { display: none; }\n\n/* visibility: hidden - invisible but takes space */\n.invisible { visibility: hidden; }\n\n/* Child can override visibility */\n.parent { visibility: hidden; }\n.parent .child { visibility: visible; }  /* Works! */\n\n/* opacity: 0 - invisible but interactive */\n.transparent { opacity: 0; }  /* Still clickable! */\n\n/* Screen reader only */\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0;\n}',
        interviewerExpects: 'Know differences, accessibility implications, animation considerations.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'css-5',
        question: 'How would you animate an accordion expansion smoothly?',
        answer: 'Use CSS Grid with grid-template-rows transitioning from 0fr to 1fr, or max-height animation. Avoid height: auto (not animatable).',
        keyPoints: [
          'height: auto cannot be animated directly',
          'max-height works but needs estimated max value',
          'Grid: grid-template-rows: 0fr → 1fr (modern)',
          'Alternative: JavaScript to set explicit height'
        ],
        followUps: [
          {
            question: 'Why can\'t you animate to height: auto?',
            answer: 'CSS transitions need explicit values. auto is computed at render time. Browser can\'t interpolate between fixed value and auto.'
          },
          {
            question: 'What\'s the problem with max-height approach?',
            answer: 'Must set max-height larger than content. If too large, animation timing is off (fast close, slow open). If too small, content clips.'
          }
        ],
        example: '/* Modern: CSS Grid approach */\n.accordion-content {\n  display: grid;\n  grid-template-rows: 0fr;\n  transition: grid-template-rows 0.3s ease;\n}\n.accordion-content.open {\n  grid-template-rows: 1fr;\n}\n.accordion-content > div {\n  overflow: hidden;\n}\n\n/* Classic: max-height approach */\n.accordion-content {\n  max-height: 0;\n  overflow: hidden;\n  transition: max-height 0.3s ease;\n}\n.accordion-content.open {\n  max-height: 500px;  /* Must be >= actual height */\n}',
        interviewerExpects: 'Know height: auto limitation, multiple solutions, trade-offs.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'css-6',
        question: 'What is the difference between pseudo-classes and pseudo-elements?',
        answer: 'Pseudo-classes (:) select elements in specific states (hover, focus, nth-child). Pseudo-elements (::) create/style parts of elements (before, after, first-line).',
        keyPoints: [
          'Pseudo-class: :hover, :focus, :nth-child(), :not(), :disabled',
          'Pseudo-element: ::before, ::after, ::first-line, ::placeholder',
          'Single colon also works for elements (legacy), prefer double',
          '::before/::after need content property'
        ],
        followUps: [
          {
            question: 'When would you use ::before vs a real element?',
            answer: 'Decorative content (icons, shapes), no semantic meaning, CSS-controlled styling. Real elements for actual content, accessibility, interaction.'
          },
          {
            question: 'Can you use multiple pseudo-classes?',
            answer: 'Yes: input:focus:invalid, a:hover:not(.disabled). They combine to narrow selection.'
          }
        ],
        example: '/* Pseudo-classes - state selection */\nbutton:hover { background: blue; }\nbutton:focus { outline: 2px solid; }\ninput:invalid { border-color: red; }\nli:nth-child(odd) { background: #f5f5f5; }\n\n/* Pseudo-elements - create content */\n.tooltip::after {\n  content: attr(data-tip);\n  position: absolute;\n}\n.required::after {\n  content: "*";\n  color: red;\n}\nblockquote::before {\n  content: open-quote;\n}\np::first-line {\n  font-weight: bold;\n}',
        interviewerExpects: 'Clear distinction, common use cases, proper syntax.',
        difficulty: InterviewDifficulty.BASIC
      }
    ]
  },

  // ============================================
  // 7. BROWSER & WEB FUNDAMENTALS
  // ============================================
  {
    id: 'browser-web',
    name: 'Browser & Web',
    description: 'Critical rendering path, CORS, event delegation, storage, HTTP/HTTPS, WebSockets',
    icon: 'Globe',
    color: '#4285F4',
    questions: [
      {
        id: 'bw-1',
        question: 'What happens when you type a URL in the browser?',
        answer: 'DNS lookup → TCP connection → TLS handshake (HTTPS) → HTTP request → Server response → Parse HTML → Build DOM/CSSOM → Render tree → Layout → Paint → Composite.',
        keyPoints: [
          'DNS resolves domain to IP',
          'TCP 3-way handshake, TLS for HTTPS',
          'HTTP request/response',
          'Parse HTML, build DOM (blocking on scripts)',
          'Parse CSS, build CSSOM',
          'Render tree = DOM + CSSOM',
          'Layout, Paint, Composite'
        ],
        followUps: [
          {
            question: 'How do scripts affect rendering?',
            answer: 'Regular scripts block HTML parsing. async loads parallel, executes when ready (blocks during execution). defer loads parallel, executes after parsing. Script location matters.'
          },
          {
            question: 'What is the critical rendering path?',
            answer: 'Minimum steps to first render: HTML → DOM, CSS → CSSOM, combine to render tree, layout, paint. Optimize by minimizing blocking resources.'
          },
          {
            question: 'How does the browser optimize rendering?',
            answer: 'Preload scanner finds resources during blocking, connection prewarming, caching, compositing layers, avoiding layout thrashing.'
          }
        ],
        example: '1. User enters URL\n2. DNS Lookup: example.com → 93.184.216.34\n3. TCP Connection: SYN → SYN-ACK → ACK\n4. TLS Handshake: key exchange, certificate verify\n5. HTTP Request: GET / HTTP/1.1\n6. Server Response: HTML document\n7. Parse HTML → DOM\n8. Find CSS links → fetch → CSSOM\n9. Render Tree = DOM + CSSOM\n10. Layout: calculate positions/sizes\n11. Paint: draw pixels\n12. Composite: layer management, display',
        interviewerExpects: 'Full flow understanding, explain critical rendering path, optimization awareness.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'bw-2',
        question: 'What is CORS and how would you handle CORS issues?',
        answer: 'Cross-Origin Resource Sharing is a security mechanism that restricts cross-origin HTTP requests. Browsers block requests to different origins unless the server explicitly allows it via headers.',
        keyPoints: [
          'Same-origin: same protocol, domain, port',
          'Preflight (OPTIONS) for non-simple requests',
          'Server must send Access-Control-Allow-Origin',
          'Credentials require Access-Control-Allow-Credentials'
        ],
        followUps: [
          {
            question: 'What triggers a preflight request?',
            answer: 'Non-simple requests: custom headers, methods other than GET/HEAD/POST, Content-Type other than form-urlencoded/multipart/text-plain, credentials.'
          },
          {
            question: 'How do you fix CORS on the frontend?',
            answer: 'You can\'t bypass CORS on frontend. Solutions: configure server headers, use a proxy (dev server or backend), JSONP (legacy, GET only).'
          },
          {
            question: 'What is the danger of Access-Control-Allow-Origin: *?',
            answer: 'Allows any site to make requests. Fine for public APIs, dangerous for authenticated endpoints. Cannot combine with credentials: true.'
          }
        ],
        example: '// Simple request - no preflight\nfetch("https://api.example.com/data");\n\n// Triggers preflight (custom header)\nfetch("https://api.example.com/data", {\n  headers: { "X-Custom-Header": "value" }\n});\n\n// Server response headers:\nAccess-Control-Allow-Origin: https://mysite.com\nAccess-Control-Allow-Methods: GET, POST, PUT\nAccess-Control-Allow-Headers: Content-Type, X-Custom-Header\nAccess-Control-Allow-Credentials: true\n\n// Dev proxy (Vite example)\nexport default {\n  server: {\n    proxy: {\n      "/api": "http://localhost:3001"\n    }\n  }\n};',
        interviewerExpects: 'Explain mechanism, preflight triggers, practical solutions.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'bw-3',
        question: 'What is event delegation and when is it useful?',
        answer: 'Event delegation attaches a single event listener to a parent element to handle events from its children. Uses event bubbling. Useful for dynamic content and performance.',
        keyPoints: [
          'Single listener handles many elements',
          'Works with dynamically added elements',
          'Better performance than many listeners',
          'Use event.target to identify actual element'
        ],
        followUps: [
          {
            question: 'What events don\'t bubble?',
            answer: 'focus, blur, mouseenter, mouseleave, load, unload, scroll (on specific elements). Use focusin/focusout instead of focus/blur for delegation.'
          },
          {
            question: 'How do you handle nested elements with delegation?',
            answer: 'Use closest() to find the relevant ancestor: event.target.closest(".item"). This handles clicks on child elements within the item.'
          }
        ],
        example: '// Instead of this (bad for dynamic items):\nlist.querySelectorAll("li").forEach(item => {\n  item.addEventListener("click", handleClick);\n});\n\n// Use delegation (handles dynamic items too):\nlist.addEventListener("click", (e) => {\n  const item = e.target.closest("li");\n  if (!item) return;\n  \n  // Handle click on item or its children\n  const id = item.dataset.id;\n  handleItemClick(id);\n});\n\n// Works even for items added later!\nlist.appendChild(newItem);  // No new listener needed',
        interviewerExpects: 'Know bubbling, practical benefits, handle nested elements.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'bw-4',
        question: 'Compare localStorage, sessionStorage, and cookies.',
        answer: 'localStorage persists until cleared (5-10MB). sessionStorage clears on tab close (~5MB). Cookies sent with requests, can expire, limited size (4KB), server-accessible.',
        keyPoints: [
          'localStorage: persistent, same-origin, ~5-10MB',
          'sessionStorage: per-tab, clears on close, ~5MB',
          'Cookies: sent with requests, expiration, ~4KB, HttpOnly option',
          'All are synchronous (can block) except via async patterns'
        ],
        followUps: [
          {
            question: 'When should you use cookies vs localStorage?',
            answer: 'Cookies: auth tokens (HttpOnly), server needs data, cross-subdomain. localStorage: client-only data, larger storage, no server overhead.'
          },
          {
            question: 'What is HttpOnly and why is it important?',
            answer: 'HttpOnly prevents JavaScript from accessing the cookie, protecting against XSS attacks stealing session tokens. Server-only access.'
          },
          {
            question: 'How do you handle storage quota exceeded?',
            answer: 'Try/catch around setItem, implement LRU eviction, compress data, use IndexedDB for large data.'
          }
        ],
        example: '// localStorage\nlocalStorage.setItem("user", JSON.stringify(user));\nconst user = JSON.parse(localStorage.getItem("user"));\n\n// sessionStorage\nsessionStorage.setItem("tempData", value);\n\n// Cookies\ndocument.cookie = "name=value; path=/; max-age=3600";\n\n// Secure cookie (set by server)\nSet-Cookie: token=abc; HttpOnly; Secure; SameSite=Strict\n\n// Storage event (cross-tab sync)\nwindow.addEventListener("storage", (e) => {\n  console.log("Changed:", e.key, e.oldValue, e.newValue);\n});',
        interviewerExpects: 'Know differences, security considerations, appropriate use cases.',
        difficulty: InterviewDifficulty.BASIC
      },
      {
        id: 'bw-5',
        question: 'How do HTTP and HTTPS differ? Explain TLS briefly.',
        answer: 'HTTP is unencrypted; data can be intercepted. HTTPS uses TLS to encrypt communication, authenticate servers via certificates, and ensure data integrity.',
        keyPoints: [
          'TLS: encryption (privacy), authentication (certificates), integrity (tampering detection)',
          'TLS handshake establishes secure channel',
          'Certificates verify server identity (CA-signed)',
          'HTTPS required for modern APIs, service workers'
        ],
        followUps: [
          {
            question: 'What happens in a TLS handshake?',
            answer: 'Client hello (supported protocols) → Server hello + certificate → Client verifies cert → Key exchange → Both derive session keys → Encrypted communication begins.'
          },
          {
            question: 'What are the performance implications?',
            answer: 'Initial handshake adds latency. TLS 1.3 reduced round trips. Session resumption avoids full handshake. Modern hardware accelerates encryption.'
          }
        ],
        example: '// HTTP: plaintext\nGET /login HTTP/1.1\nHost: example.com\nusername=alice&password=secret  // Visible!\n\n// HTTPS: encrypted\n// Same request, but encrypted in TLS tunnel\n// Only endpoints can read content\n\n// TLS Handshake (simplified):\n1. Client → Server: "Hello, I support TLS 1.3"\n2. Server → Client: "Using TLS 1.3, here\'s my certificate"\n3. Client verifies certificate chain to trusted CA\n4. Key exchange (Diffie-Hellman)\n5. Both derive same session key\n6. All further communication encrypted',
        interviewerExpects: 'Understand security guarantees, handshake basics, why HTTPS matters.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'bw-6',
        question: 'What are WebSockets and when would you use them?',
        answer: 'WebSockets provide full-duplex, persistent connections for real-time bidirectional communication. Unlike HTTP, both client and server can send messages anytime without requests.',
        keyPoints: [
          'Persistent connection after HTTP upgrade handshake',
          'Low latency, bidirectional',
          'Good for: chat, gaming, live updates, collaboration',
          'Alternative: Server-Sent Events for server→client only'
        ],
        followUps: [
          {
            question: 'WebSockets vs polling vs SSE?',
            answer: 'Polling: repeated requests, high latency, server load. Long-polling: better but connection overhead. SSE: server→client only, auto-reconnect, simpler. WebSocket: full bidirectional, lowest latency.'
          },
          {
            question: 'How do you handle WebSocket reconnection?',
            answer: 'Detect close/error events, exponential backoff retry, preserve pending messages, re-authenticate on connect, consider libraries like socket.io.'
          }
        ],
        example: '// Client\nconst ws = new WebSocket("wss://api.example.com/ws");\n\nws.onopen = () => {\n  console.log("Connected");\n  ws.send(JSON.stringify({ type: "subscribe", channel: "updates" }));\n};\n\nws.onmessage = (event) => {\n  const data = JSON.parse(event.data);\n  console.log("Received:", data);\n};\n\nws.onclose = () => {\n  console.log("Disconnected, reconnecting...");\n  setTimeout(() => reconnect(), 1000);\n};\n\n// Server can push anytime\nws.send(JSON.stringify({ type: "notification", text: "New message!" }));',
        interviewerExpects: 'Know when to use vs alternatives, basic implementation, reconnection handling.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      }
    ]
  },

  // ============================================
  // 8. PERFORMANCE & OPTIMIZATION
  // ============================================
  {
    id: 'performance',
    name: 'Performance',
    description: 'Core Web Vitals, lazy loading, code splitting, virtualization, bundle optimization',
    icon: 'Zap',
    color: '#10B981',
    questions: [
      {
        id: 'perf-1',
        question: 'What are Core Web Vitals and how do you optimize them?',
        answer: 'Core Web Vitals are Google\'s key metrics for user experience: LCP (loading), INP (interactivity), CLS (visual stability). They impact SEO and user experience.',
        keyPoints: [
          'LCP (Largest Contentful Paint): <2.5s - main content loaded',
          'INP (Interaction to Next Paint): <200ms - responsiveness',
          'CLS (Cumulative Layout Shift): <0.1 - visual stability',
          'Measured in the field (real users) and lab (Lighthouse)'
        ],
        followUps: [
          {
            question: 'How do you improve LCP?',
            answer: 'Optimize largest element (image/text): preload critical resources, use CDN, optimize images (WebP, sizing), remove render-blocking resources, use SSR/SSG.'
          },
          {
            question: 'What causes poor CLS?',
            answer: 'Images without dimensions, ads/embeds without reserved space, dynamically injected content, web fonts causing layout shift (FOUT).'
          },
          {
            question: 'How did INP replace FID?',
            answer: 'FID measured only first interaction. INP measures all interactions throughout page lifecycle, giving better picture of responsiveness.'
          }
        ],
        example: '<!-- LCP optimization: preload hero image -->\n<link rel="preload" as="image" href="hero.webp">\n\n<!-- CLS optimization: reserve space for images -->\n<img src="photo.jpg" width="800" height="600" alt="..." />\n\n<!-- Or use aspect-ratio -->\n<style>\n.img-container {\n  aspect-ratio: 16 / 9;\n}\n</style>\n\n<!-- INP optimization: defer non-critical JS -->\n<script src="analytics.js" defer></script>\n\n<!-- Break up long tasks -->\nfunction processChunk() {\n  // Process small batch\n  if (moreWork) {\n    setTimeout(processChunk, 0);  // Yield to main thread\n  }\n}',
        interviewerExpects: 'Know all three metrics, causes of poor scores, practical optimizations.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'perf-2',
        question: 'Explain lazy loading and code splitting in React.',
        answer: 'Code splitting breaks bundle into smaller chunks loaded on demand. Lazy loading defers loading components/routes until needed. Use React.lazy + Suspense.',
        keyPoints: [
          'React.lazy(() => import("./Component")) for lazy loading',
          'Suspense shows fallback while loading',
          'Route-based splitting most common',
          'Reduces initial bundle size, improves TTFB'
        ],
        followUps: [
          {
            question: 'When should you code split?',
            answer: 'Routes (page-level), heavy libraries, features behind user action, modals/dialogs, below-the-fold content. Don\'t over-split (too many small chunks).'
          },
          {
            question: 'What is the trade-off?',
            answer: 'Smaller initial load vs waterfall on navigation. Prefetch to mitigate. Balance chunk size (~30-50KB compressed is reasonable).'
          },
          {
            question: 'How do you preload lazy components?',
            answer: 'Call the import() on hover/focus, or use resource hints. Store in module scope to trigger load before render.'
          }
        ],
        example: '// Lazy load route components\nconst Dashboard = React.lazy(() => import("./Dashboard"));\nconst Settings = React.lazy(() => import("./Settings"));\n\nfunction App() {\n  return (\n    <Suspense fallback={<Loading />}>\n      <Routes>\n        <Route path="/" element={<Dashboard />} />\n        <Route path="/settings" element={<Settings />} />\n      </Routes>\n    </Suspense>\n  );\n}\n\n// Preload on hover\nconst preloadSettings = () => import("./Settings");\n<Link to="/settings" onMouseEnter={preloadSettings}>Settings</Link>\n\n// Named exports need wrapper\nconst MyComponent = React.lazy(() =>\n  import("./module").then(m => ({ default: m.MyComponent }))\n);',
        interviewerExpects: 'Implementation with Suspense, when to split, preloading strategies.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'perf-3',
        question: 'How would you diagnose and fix a slow React page?',
        answer: 'Profile with React DevTools and browser DevTools. Check for: unnecessary re-renders, expensive renders, large bundle, blocking resources, layout thrashing.',
        keyPoints: [
          'React DevTools Profiler: identify slow components',
          'Performance tab: JS execution, layout, paint',
          'Network tab: large bundles, slow requests',
          'Lighthouse: overall recommendations'
        ],
        followUps: [
          {
            question: 'What are signs of unnecessary re-renders?',
            answer: 'Components highlighting frequently in DevTools, same output rendering multiple times. Causes: new object/function props, missing memoization, context changes.'
          },
          {
            question: 'How do you fix layout thrashing?',
            answer: 'Batch DOM reads before writes, use transform/opacity for animations (compositor-only), avoid forced synchronous layouts, use ResizeObserver instead of polling.'
          },
          {
            question: 'What is the difference between scripting, rendering, and painting?',
            answer: 'Scripting: JavaScript execution. Rendering: style calculation and layout. Painting: filling pixels. All run on main thread and can cause jank.'
          }
        ],
        example: '// 1. Profile: React DevTools → Profiler → Record\n\n// 2. Common fixes:\n\n// Memoize expensive component\nconst ExpensiveList = React.memo(({ items }) => {\n  // ...\n});\n\n// Memoize computed values\nconst sorted = useMemo(() => \n  items.sort((a, b) => a.name.localeCompare(b.name)),\n  [items]\n);\n\n// Virtualize long lists\nimport { FixedSizeList } from "react-window";\n\n// Code split heavy features\nconst ChartLibrary = React.lazy(() => import("./charts"));\n\n// 3. Browser DevTools:\n// Performance tab → Record → Analyze flame chart\n// Look for long tasks (>50ms), forced layouts',
        interviewerExpects: 'Systematic approach with tools, identify common issues, practical fixes.',
        difficulty: InterviewDifficulty.ADVANCED
      },
      {
        id: 'perf-4',
        question: 'How do you optimize bundle size?',
        answer: 'Analyze with webpack-bundle-analyzer, remove unused code (tree shaking), code split, use lighter alternatives, lazy load, optimize dependencies.',
        keyPoints: [
          'Analyze: webpack-bundle-analyzer, source-map-explorer',
          'Tree shaking: ES modules, sideEffects: false',
          'Externalize large libs (moment → date-fns)',
          'Dynamic imports for conditional features',
          'Compression: gzip/brotli'
        ],
        followUps: [
          {
            question: 'What enables tree shaking?',
            answer: 'ES module syntax (import/export), sideEffects: false in package.json, production mode. CommonJS (require) cannot be tree-shaken.'
          },
          {
            question: 'How do you find what\'s making the bundle large?',
            answer: 'Use bundle analyzer visualization. Look for: duplicate dependencies, large libraries, unneeded polyfills, dev-only code in production.'
          }
        ],
        example: '// Analyze bundle\n// package.json\n"scripts": {\n  "analyze": "vite build --mode production && npx vite-bundle-visualizer"\n}\n\n// Tree-shakeable import\nimport { debounce } from "lodash-es";  // Only imports debounce\n// vs\nimport _ from "lodash";  // Imports everything!\n\n// Dynamic import for conditional feature\nconst loadPdfExport = async () => {\n  const { generatePdf } = await import("./pdf-export");\n  await generatePdf(data);\n};\n\n// Replace heavy libraries\n// moment.js (300KB) → date-fns (tree-shakeable)\n// lodash → lodash-es or native methods\n// axios → fetch (built-in)',
        interviewerExpects: 'Know analysis tools, tree shaking requirements, practical reduction strategies.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'perf-5',
        question: 'How would you handle caching for a web application?',
        answer: 'Use HTTP caching headers (Cache-Control), service workers for offline/stale-while-revalidate, CDN edge caching, and application-level data caching.',
        keyPoints: [
          'Cache-Control: max-age, immutable, stale-while-revalidate',
          'ETag/Last-Modified for validation',
          'Versioned assets: app.[hash].js (cache forever)',
          'Service Worker: precache, runtime cache strategies',
          'CDN: edge caching for static assets'
        ],
        followUps: [
          {
            question: 'What caching strategy for different asset types?',
            answer: 'Hashed JS/CSS: Cache-Control: max-age=31536000, immutable. HTML: no-cache or short max-age (needs fresh content). Images: long cache with versioning.'
          },
          {
            question: 'How does stale-while-revalidate work?',
            answer: 'Serves stale cache immediately (fast), fetches fresh in background, updates cache for next request. Balance of speed and freshness.'
          }
        ],
        example: '// HTTP Headers (server config)\n// Versioned assets (app.a1b2c3.js)\nCache-Control: max-age=31536000, immutable\n\n// HTML (needs fresh)\nCache-Control: no-cache\n// or\nCache-Control: max-age=0, must-revalidate\n\n// API responses\nCache-Control: max-age=60, stale-while-revalidate=300\n\n// Service Worker example\nworkbox.routing.registerRoute(\n  ({request}) => request.destination === "image",\n  new workbox.strategies.CacheFirst({\n    cacheName: "images",\n    plugins: [\n      new workbox.expiration.ExpirationPlugin({\n        maxEntries: 50,\n        maxAgeSeconds: 30 * 24 * 60 * 60  // 30 days\n      })\n    ]\n  })\n);',
        interviewerExpects: 'Know cache headers, strategies for different content, invalidation.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      }
    ]
  },

  // ============================================
  // 9. NEXT.JS & SSR
  // ============================================
  {
    id: 'nextjs-ssr',
    name: 'Next.js & SSR',
    description: 'CSR vs SSR vs SSG, hydration, App Router, data fetching, routing',
    icon: 'Server',
    color: '#000000',
    questions: [
      {
        id: 'next-1',
        question: 'What is the difference between CSR, SSR, and SSG?',
        answer: 'CSR renders in browser (blank initial HTML). SSR renders on server per request (fresh data, slower TTFB). SSG renders at build time (fastest, stale data).',
        keyPoints: [
          'CSR: bundle loads, JS renders - slower FCP, good for SPAs',
          'SSR: server renders HTML per request - fast FCP, fresh data, server load',
          'SSG: HTML generated at build - fastest, CDN-cacheable, stale until rebuild',
          'ISR: SSG + revalidation - best of both, Next.js specific'
        ],
        followUps: [
          {
            question: 'When would you choose each?',
            answer: 'CSR: dashboards, authenticated apps, heavy interactivity. SSR: personalized/real-time content, SEO-critical. SSG: blogs, docs, marketing - content changes infrequently.'
          },
          {
            question: 'What is ISR (Incremental Static Regeneration)?',
            answer: 'Serves static page, revalidates in background after specified time. Combines SSG speed with fresher data. revalidate: 60 means refresh every 60 seconds.'
          },
          {
            question: 'What are the SEO implications?',
            answer: 'CSR: poor SEO (crawlers may not execute JS). SSR/SSG: good SEO (HTML ready). Search engines improved at JS, but SSR/SSG still recommended.'
          }
        ],
        example: '// Next.js App Router\n\n// SSG (default) - static at build\nexport default async function Page() {\n  const data = await fetch("https://api.example.com/data");\n  return <div>{data}</div>;\n}\n\n// SSR - fresh every request\nexport const dynamic = "force-dynamic";\n// or\nexport const revalidate = 0;\n\n// ISR - revalidate every 60 seconds\nexport const revalidate = 60;\n\n// CSR - client component\n"use client";\nimport { useEffect, useState } from "react";\nexport default function ClientPage() {\n  const [data, setData] = useState(null);\n  useEffect(() => { fetch(...).then(...) }, []);\n}',
        interviewerExpects: 'Clear trade-offs, appropriate use cases, Next.js implementation.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'next-2',
        question: 'What is the difference between Pages Router and App Router in Next.js?',
        answer: 'Pages Router: file-based routing in /pages, getServerSideProps/getStaticProps for data. App Router: /app directory, React Server Components by default, layouts, streaming.',
        keyPoints: [
          'App Router: React Server Components, nested layouts, streaming',
          'Pages Router: client components, per-page data fetching',
          'App Router: fetch() with caching, no getServerSideProps',
          'App Router: loading.js, error.js, layout.js conventions'
        ],
        followUps: [
          {
            question: 'What are React Server Components?',
            answer: 'Components that run only on server, never shipped to client. Can directly access DB, filesystem. Reduce bundle size. Use "use client" directive for client components.'
          },
          {
            question: 'How is data fetching different in App Router?',
            answer: 'Fetch directly in Server Components (no special functions). Fetch requests are deduplicated and cached by default. Use cache/revalidate options.'
          },
          {
            question: 'Should you migrate from Pages to App Router?',
            answer: 'Both can coexist. App Router is the future with better DX and performance. Migrate incrementally, starting with new features.'
          }
        ],
        example: '// Pages Router (/pages/posts/[id].js)\nexport async function getServerSideProps({ params }) {\n  const post = await fetchPost(params.id);\n  return { props: { post } };\n}\nexport default function Post({ post }) {\n  return <article>{post.title}</article>;\n}\n\n// App Router (/app/posts/[id]/page.tsx)\nexport default async function Post({ params }) {\n  const post = await fetchPost(params.id);  // Direct fetch!\n  return <article>{post.title}</article>;\n}\n\n// App Router with layout\n// /app/posts/layout.tsx\nexport default function PostsLayout({ children }) {\n  return (\n    <div>\n      <Sidebar />\n      {children}\n    </div>\n  );\n}',
        interviewerExpects: 'Key differences, RSC understanding, data fetching changes.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'next-3',
        question: 'How do you handle authentication in Next.js?',
        answer: 'Use middleware for route protection, store session in httpOnly cookies, verify on server. Libraries: NextAuth.js, Clerk, Auth0. Server Components can check auth directly.',
        keyPoints: [
          'Middleware: check auth before rendering, redirect if needed',
          'HttpOnly cookies: secure session storage',
          'Server Components: verify session, fetch user-specific data',
          'Client Components: useSession or similar for UI state'
        ],
        followUps: [
          {
            question: 'Where should you verify authentication?',
            answer: 'Multiple layers: middleware for initial redirect, Server Components for data access, API routes for mutations. Never trust client-side alone.'
          },
          {
            question: 'How do you protect API routes?',
            answer: 'Check session/token at start of handler, return 401/403 if invalid. Use middleware patterns or wrapper functions for consistency.'
          }
        ],
        example: '// middleware.ts - runs before page render\nimport { NextResponse } from "next/server";\n\nexport function middleware(request) {\n  const session = request.cookies.get("session");\n  \n  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {\n    return NextResponse.redirect(new URL("/login", request.url));\n  }\n  \n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: ["/dashboard/:path*", "/api/:path*"]\n};\n\n// Server Component - direct auth check\nimport { getSession } from "@/lib/auth";\n\nexport default async function Dashboard() {\n  const session = await getSession();\n  if (!session) redirect("/login");\n  \n  const userData = await fetchUserData(session.userId);\n  return <DashboardContent user={userData} />;\n}',
        interviewerExpects: 'Multi-layer protection, middleware usage, secure session handling.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      }
    ]
  },

  // ============================================
  // 10. STATE MANAGEMENT
  // ============================================
  {
    id: 'state-management',
    name: 'State Management',
    description: 'Redux vs Context, Zustand, state architecture, when to use what',
    icon: 'Database',
    color: '#764ABC',
    questions: [
      {
        id: 'sm-1',
        question: 'Redux vs Context API - when to use which?',
        answer: 'Context: simple global state, infrequent updates (theme, auth). Redux: complex state logic, frequent updates, need middleware, devtools, or large app with many state slices.',
        keyPoints: [
          'Context: all consumers re-render on any change',
          'Redux: selectors enable granular subscriptions',
          'Redux: middleware for async, logging, persistence',
          'Context: simpler setup, no external dependencies'
        ],
        followUps: [
          {
            question: 'How do you optimize Context to avoid re-renders?',
            answer: 'Split into multiple contexts, memoize context value, useMemo for derived state, colocate state near consumers, or use state library instead.'
          },
          {
            question: 'What about alternatives like Zustand, Jotai, Recoil?',
            answer: 'Zustand: simple API like Redux, no boilerplate. Jotai: atomic, bottom-up approach. Recoil: atomic with selectors. All offer granular subscriptions.'
          }
        ],
        example: '// Context - good for infrequent updates\nconst ThemeContext = createContext();\nfunction App() {\n  const [theme, setTheme] = useState("light");\n  const value = useMemo(() => ({ theme, setTheme }), [theme]);\n  return (\n    <ThemeContext.Provider value={value}>\n      <Page />\n    </ThemeContext.Provider>\n  );\n}\n\n// Redux - granular subscriptions\nfunction UserName() {\n  // Only re-renders when name changes, not all state\n  const name = useSelector(state => state.user.name);\n  return <span>{name}</span>;\n}\n\n// Zustand - simple alternative\nconst useStore = create((set) => ({\n  count: 0,\n  increment: () => set(s => ({ count: s.count + 1 }))\n}));\nfunction Counter() {\n  const count = useStore(s => s.count);  // Granular subscription\n}',
        interviewerExpects: 'Know trade-offs, performance implications, recommend based on use case.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'sm-2',
        question: 'How would you structure state in a large React application?',
        answer: 'Separate server state (react-query/SWR) from client state. Colocate local state, lift shared state minimally. Use state slices/modules, clear ownership.',
        keyPoints: [
          'Server state: react-query/SWR handles caching, sync',
          'Client UI state: local (useState) or global (Zustand/Redux)',
          'Colocate state near where it\'s used',
          'Avoid unnecessary global state'
        ],
        followUps: [
          {
            question: 'What is server state vs client state?',
            answer: 'Server state: data from backend, can be stale, owned by server. Client state: UI state like modals, form inputs, selections - owned by frontend.'
          },
          {
            question: 'How does react-query change state management?',
            answer: 'Handles server state entirely: caching, refetching, loading/error states. Often eliminates need for Redux since most "global state" was actually server state.'
          }
        ],
        example: '// Modern structure:\n\n// 1. Server state - react-query\nfunction Posts() {\n  const { data, isLoading } = useQuery(["posts"], fetchPosts);\n  // Caching, refetch, sync handled automatically\n}\n\n// 2. UI state - Zustand slice\nconst useUIStore = create((set) => ({\n  sidebarOpen: true,\n  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen }))\n}));\n\n// 3. Auth state - Context (infrequent changes)\nconst AuthContext = createContext();\n\n// 4. Form state - local (colocated)\nfunction EditPost() {\n  const [title, setTitle] = useState("");  // Local!\n}\n\n// Avoid: putting everything in global store\n// Avoid: duplicating server data in Redux',
        interviewerExpects: 'Server vs client state distinction, colocating state, modern patterns.',
        difficulty: InterviewDifficulty.ADVANCED
      }
    ]
  },

  // ============================================
  // 11. FRONTEND SYSTEM DESIGN
  // ============================================
  {
    id: 'frontend-system-design',
    name: 'Frontend System Design',
    description: 'Architecture for scale, component libraries, real-time apps, caching strategies',
    icon: 'Layout',
    color: '#8B5CF6',
    questions: [
      {
        id: 'fsd-1',
        question: 'How would you design a frontend architecture for 10,000+ concurrent real-time users?',
        answer: 'WebSocket for real-time updates with connection pooling. Optimistic UI updates. Efficient state management with granular subscriptions. Virtual rendering for large datasets. CDN for static assets.',
        keyPoints: [
          'WebSocket with reconnection and message queuing',
          'Optimistic updates for perceived performance',
          'Virtualization for large lists/grids',
          'State management with selectors (avoid full re-renders)',
          'Service workers for offline support'
        ],
        followUps: [
          {
            question: 'How do you handle WebSocket reconnection?',
            answer: 'Exponential backoff, message queue during disconnect, replay missed messages on reconnect, connection status indicator.'
          },
          {
            question: 'What about stale data and sync conflicts?',
            answer: 'Timestamp/version on updates, last-write-wins or CRDT for conflicts, show sync status, allow manual refresh.'
          },
          {
            question: 'How do you ensure consistency across tabs?',
            answer: 'BroadcastChannel API, SharedWorker, or storage events for cross-tab sync. Single WebSocket connection shared via SharedWorker.'
          }
        ],
        example: '// Architecture overview:\n\n// 1. Real-time layer\nclass RealtimeService {\n  connect() { /* WebSocket with reconnect */ }\n  subscribe(channel, callback) { /* Granular subscriptions */ }\n  send(message) { /* Queue if disconnected */ }\n}\n\n// 2. State with selectors\nconst useStore = create((set) => ({\n  messages: {},\n  addMessage: (msg) => set(s => ({\n    messages: { ...s.messages, [msg.id]: msg }\n  }))\n}));\n// Subscribe to specific message only\nconst message = useStore(s => s.messages[id]);\n\n// 3. Optimistic updates\nasync function sendMessage(text) {\n  const tempId = uuid();\n  addMessage({ id: tempId, text, pending: true });  // Optimistic\n  try {\n    const msg = await api.send(text);\n    updateMessage(tempId, { ...msg, pending: false });\n  } catch {\n    updateMessage(tempId, { failed: true });\n  }\n}\n\n// 4. Virtualized list for messages\n<VirtualList items={messages} itemHeight={60} />',
        interviewerExpects: 'End-to-end thinking, real-time patterns, performance at scale, failure handling.',
        difficulty: InterviewDifficulty.ADVANCED
      },
      {
        id: 'fsd-2',
        question: 'How would you design a reusable component library for multiple teams?',
        answer: 'Design tokens for consistency, compound components for flexibility, TypeScript for type safety, Storybook for docs/testing, semantic versioning, clear contribution guidelines.',
        keyPoints: [
          'Design tokens: colors, spacing, typography',
          'Compound components: flexible composition',
          'Headless/unstyled options for customization',
          'Accessibility built-in (ARIA, keyboard)',
          'Tree-shakeable exports'
        ],
        followUps: [
          {
            question: 'How do you handle breaking changes?',
            answer: 'Semver strictly, deprecation warnings before removal, migration guides, codemods for automated updates, support N-1 version.'
          },
          {
            question: 'How do you ensure consistency across teams?',
            answer: 'Design tokens as source of truth, linting rules, Figma→code sync, regular design reviews, shared Storybook as documentation.'
          },
          {
            question: 'How do you handle theming?',
            answer: 'CSS variables for runtime theming, design tokens generate CSS vars, theme provider component, support dark/light and custom themes.'
          }
        ],
        example: '// tokens/colors.ts\nexport const colors = {\n  primary: { 50: "#...", 500: "#3B82F6", 900: "#..." },\n  // ...\n};\n\n// Compound component pattern\nfunction Tabs({ children }) { /* context provider */ }\nTabs.List = TabList;\nTabs.Tab = Tab;\nTabs.Panels = TabPanels;\nTabs.Panel = TabPanel;\n\n// Usage - flexible composition\n<Tabs defaultValue="1">\n  <Tabs.List>\n    <Tabs.Tab value="1">First</Tabs.Tab>\n    <Tabs.Tab value="2">Second</Tabs.Tab>\n  </Tabs.List>\n  <Tabs.Panels>\n    <Tabs.Panel value="1">Content 1</Tabs.Panel>\n    <Tabs.Panel value="2">Content 2</Tabs.Panel>\n  </Tabs.Panels>\n</Tabs>\n\n// Tree-shakeable exports\nexport { Button } from "./Button";\nexport { Input } from "./Input";\n// Not: export default { Button, Input }',
        interviewerExpects: 'Scalable architecture, API design, versioning strategy, theming.',
        difficulty: InterviewDifficulty.ADVANCED
      },
      {
        id: 'fsd-3',
        question: 'Design a file upload system with progress tracking.',
        answer: 'Chunked uploads for large files, progress via XHR/fetch streams, resume capability, presigned URLs for direct-to-storage upload, preview generation.',
        keyPoints: [
          'Chunked upload: split file, upload sequentially/parallel',
          'Progress: XHR onprogress or ReadableStream',
          'Resume: track uploaded chunks, skip on retry',
          'Direct upload: presigned URL to S3/GCS',
          'Validation: file type, size on client and server'
        ],
        followUps: [
          {
            question: 'How do you handle upload failures?',
            answer: 'Retry individual chunks, exponential backoff, persist progress to localStorage, allow manual retry, show clear error state.'
          },
          {
            question: 'How do you validate files?',
            answer: 'Client: File type (MIME), size limit, magic bytes for security. Server: re-validate everything, virus scan for uploaded content.'
          }
        ],
        example: 'async function uploadWithProgress(file, onProgress) {\n  const chunkSize = 5 * 1024 * 1024;  // 5MB chunks\n  const chunks = Math.ceil(file.size / chunkSize);\n  let uploaded = 0;\n  \n  // Get upload session\n  const { uploadId, urls } = await api.createUpload({\n    filename: file.name,\n    size: file.size,\n    chunks\n  });\n  \n  for (let i = 0; i < chunks; i++) {\n    const start = i * chunkSize;\n    const end = Math.min(start + chunkSize, file.size);\n    const chunk = file.slice(start, end);\n    \n    await uploadChunk(urls[i], chunk, (chunkProgress) => {\n      const total = ((uploaded + chunkProgress) / file.size) * 100;\n      onProgress(total);\n    });\n    \n    uploaded += chunk.size;\n  }\n  \n  return api.completeUpload(uploadId);\n}\n\n// XHR for progress\nfunction uploadChunk(url, chunk, onProgress) {\n  return new Promise((resolve, reject) => {\n    const xhr = new XMLHttpRequest();\n    xhr.upload.onprogress = (e) => onProgress(e.loaded);\n    xhr.onload = () => resolve();\n    xhr.onerror = () => reject();\n    xhr.open("PUT", url);\n    xhr.send(chunk);\n  });\n}',
        interviewerExpects: 'Chunking strategy, progress tracking, error handling, resume capability.',
        difficulty: InterviewDifficulty.ADVANCED
      }
    ]
  },

  // ============================================
  // 12. SECURITY
  // ============================================
  {
    id: 'security',
    name: 'Security',
    description: 'XSS, CSRF, CSP, secure data handling, authentication security',
    icon: 'Shield',
    color: '#EF4444',
    questions: [
      {
        id: 'sec-1',
        question: 'What is XSS and how do you prevent it?',
        answer: 'Cross-Site Scripting injects malicious scripts into pages viewed by other users. Prevent with output encoding, CSP headers, avoiding innerHTML, and sanitizing user input.',
        keyPoints: [
          'Types: Stored, Reflected, DOM-based XSS',
          'Escape output: HTML entities, JS strings',
          'CSP: restrict script sources',
          'React escapes by default, but dangerouslySetInnerHTML is risky',
          'Sanitize if HTML is needed (DOMPurify)'
        ],
        followUps: [
          {
            question: 'What is Content Security Policy (CSP)?',
            answer: 'HTTP header that restricts what resources can load/execute. script-src \'self\' only allows scripts from same origin. Blocks inline scripts and eval unless explicitly allowed.'
          },
          {
            question: 'How does React protect against XSS?',
            answer: 'JSX expressions are escaped by default. {userInput} is safe. dangerouslySetInnerHTML bypasses this - sanitize content first with DOMPurify.'
          }
        ],
        example: '// XSS vulnerability\nelement.innerHTML = userInput;  // Dangerous!\n\n// Safe - escape or use textContent\nelement.textContent = userInput;\n\n// React - safe by default\n<div>{userInput}</div>  // Escaped\n\n// Dangerous - sanitize first!\n<div dangerouslySetInnerHTML={{ __html: userInput }} />\n\n// Safe with sanitization\nimport DOMPurify from "dompurify";\n<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />\n\n// CSP header\nContent-Security-Policy: default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'',
        interviewerExpects: 'Know XSS types, prevention methods, CSP, framework-specific protections.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'sec-2',
        question: 'What is CSRF and how do you prevent it?',
        answer: 'Cross-Site Request Forgery tricks authenticated users into executing unwanted actions. Prevent with CSRF tokens, SameSite cookies, and checking Origin/Referer headers.',
        keyPoints: [
          'Attacker crafts request, victim\'s browser sends cookies',
          'CSRF tokens: unique per session, verified server-side',
          'SameSite cookies: Strict or Lax prevents cross-site sending',
          'Check Origin header matches expected domain'
        ],
        followUps: [
          {
            question: 'How does SameSite cookie attribute help?',
            answer: 'Strict: never sent cross-site. Lax: sent for top-level navigations (links) but not forms/XHR. Prevents cookies from being sent with cross-site requests.'
          },
          {
            question: 'Do SPAs need CSRF protection?',
            answer: 'Yes, if using cookies for auth. If using Bearer tokens in headers (not cookies), CSRF not applicable since attacker can\'t set headers.'
          }
        ],
        example: '// Server sets CSRF token in cookie or meta tag\n// Client includes token in requests\n\n// React example\nfunction useCSRFToken() {\n  return document.querySelector(\'meta[name="csrf-token"]\')?.content;\n}\n\nasync function submitForm(data) {\n  const csrfToken = useCSRFToken();\n  await fetch("/api/submit", {\n    method: "POST",\n    headers: {\n      "Content-Type": "application/json",\n      "X-CSRF-Token": csrfToken\n    },\n    body: JSON.stringify(data)\n  });\n}\n\n// Server cookie settings\nSet-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict',
        interviewerExpects: 'Understand attack vector, multiple prevention methods, modern browser protections.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'sec-3',
        question: 'How do you securely handle sensitive data on the frontend?',
        answer: 'Minimize exposure: don\'t store secrets in frontend code, use HttpOnly cookies for tokens, encrypt sensitive localStorage data, clear on logout, avoid logging sensitive data.',
        keyPoints: [
          'Never store secrets in JS bundles (env vars compile in!)',
          'HttpOnly cookies for session tokens',
          'Clear sensitive data on logout',
          'Avoid console.log of sensitive data',
          'Use secure contexts (HTTPS) for crypto operations'
        ],
        followUps: [
          {
            question: 'Is localStorage secure for tokens?',
            answer: 'Accessible to any script on page, vulnerable to XSS. HttpOnly cookies are safer for session tokens. If localStorage needed, combine with short expiry and refresh tokens.'
          },
          {
            question: 'How do you handle API keys?',
            answer: 'Never expose in frontend. Use backend proxy to add keys, or use serverless functions. Public APIs may have restricted keys (domain-locked).'
          }
        ],
        example: '// Bad - secret in code\nconst API_KEY = "sk_live_abc123";  // Visible in bundle!\n\n// Good - proxy through backend\nasync function fetchData() {\n  // Backend adds API key, not exposed to frontend\n  return fetch("/api/proxy/external-service");\n}\n\n// Clear sensitive data on logout\nfunction logout() {\n  localStorage.clear();\n  sessionStorage.clear();\n  // Redirect or reload to clear memory\n  window.location.href = "/login";\n}\n\n// Secure cookie for token\n// Set by server:\nSet-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict; Path=/\n\n// Frontend cannot read HttpOnly cookies (that\'s the point)',
        interviewerExpects: 'Know what to avoid, proper token storage, cleanup practices.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      }
    ]
  },

  // ============================================
  // 13. BEHAVIORAL / MANAGERIAL
  // ============================================
  {
    id: 'behavioral',
    name: 'Behavioral',
    description: 'Conflict resolution, production debugging, cross-team collaboration, technical decisions',
    icon: 'Users',
    color: '#F59E0B',
    questions: [
      {
        id: 'beh-1',
        question: 'Describe a difficult technical decision you made.',
        answer: 'Use STAR format: Situation, Task, Action, Result. Focus on trade-offs considered, stakeholders consulted, outcome measured.',
        keyPoints: [
          'Explain the context and constraints',
          'Describe options you evaluated',
          'Explain why you chose your approach',
          'Share the outcome and lessons learned'
        ],
        followUps: [
          {
            question: 'What would you do differently?',
            answer: 'Show reflection. Even successful decisions have learnings. Maybe: involve more stakeholders, prototype earlier, document decision better.'
          },
          {
            question: 'How did you get buy-in?',
            answer: 'Describe communication: presented options with pros/cons, addressed concerns, maybe built prototype to demonstrate, documented for future reference.'
          }
        ],
        example: 'Example structure:\n\nSituation: "We needed to add real-time features to our dashboard, serving 10K concurrent users."\n\nTask: "I was responsible for choosing the real-time architecture."\n\nAction: "I evaluated WebSockets vs SSE vs polling. Created POCs for each. Consulted with backend team on infrastructure. Chose WebSocket with Socket.IO for bidirectional needs, despite added complexity."\n\nResult: "Launched with 99.5% connection reliability. Latency dropped from 30s polling to <100ms. Documented decision in ADR for future reference."\n\nReflection: "Would involve DevOps earlier - we underestimated load balancer configuration complexity."',
        interviewerExpects: 'Clear structure, trade-off analysis, collaboration, measurable outcome.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'beh-2',
        question: 'Tell me about a critical production bug you debugged.',
        answer: 'Describe the incident, your debugging process, root cause, fix, and what you did to prevent recurrence.',
        keyPoints: [
          'How you identified/were alerted to the issue',
          'Systematic debugging approach',
          'Root cause analysis',
          'Fix and validation',
          'Prevention measures (monitoring, tests)'
        ],
        followUps: [
          {
            question: 'How did you communicate during the incident?',
            answer: 'Updated stakeholders on status, set expectations, documented timeline. Post-mortem shared learnings with team.'
          },
          {
            question: 'What monitoring did you add after?',
            answer: 'Describe specific alerts, dashboards, or logging added to catch similar issues earlier.'
          }
        ],
        example: 'Example:\n\n"Users reported checkout failing intermittently. \n\nI checked error monitoring - saw increased 500s from payment API. Logs showed timeout errors. Payment provider status showed no issues.\n\nDug deeper - timeouts only for large carts. Found we were sending full product objects instead of IDs, causing payload size issues at high item counts.\n\nFix: refactored to send only product IDs and quantities. Validated with load test.\n\nPrevention: Added payload size monitoring, unit test for cart serialization, documented API contract."',
        interviewerExpects: 'Systematic approach, clear communication, prevention mindset.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'beh-3',
        question: 'How do you handle disagreements with team members or designers?',
        answer: 'Listen to understand their perspective, focus on shared goals, present data/evidence, seek compromise or escalate constructively if needed.',
        keyPoints: [
          'Assume positive intent',
          'Understand their constraints and goals',
          'Present technical trade-offs objectively',
          'Find common ground or compromise',
          'Document decision for alignment'
        ],
        followUps: [
          {
            question: 'Give me a specific example.',
            answer: 'Use STAR format. Show empathy, collaboration, and a positive outcome even if your original idea wasn\'t chosen.'
          },
          {
            question: 'What if you still disagree after discussion?',
            answer: 'Disagree and commit: voice concerns, but support the team decision once made. Escalate only for significant risks.'
          }
        ],
        example: 'Example:\n\n"Designer wanted complex animations on a data-heavy dashboard. I was concerned about performance.\n\nInstead of refusing, I:\n1. Built a prototype showing performance impact\n2. Proposed alternatives: simplified animations, lazy loading\n3. Compromised on key animations with reduced complexity\n\nResult: Designer\'s vision was largely preserved, performance stayed acceptable. They appreciated the collaborative approach and now consult me early on interaction-heavy features."',
        interviewerExpects: 'Collaboration skills, empathy, constructive conflict resolution.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      },
      {
        id: 'beh-4',
        question: 'How do you prioritize technical debt vs new features?',
        answer: 'Quantify impact of debt (velocity, bugs, onboarding time), tie to business outcomes, allocate consistent percentage, tackle alongside related feature work.',
        keyPoints: [
          'Track debt impact: bug rate, dev velocity, incidents',
          'Prioritize debt that blocks features or causes incidents',
          'Allocate % of sprint capacity (e.g., 20%)',
          'Combine debt work with related features when possible'
        ],
        followUps: [
          {
            question: 'How do you convince stakeholders to invest in tech debt?',
            answer: 'Translate to business terms: slower feature velocity, higher bug rate, onboarding time. Show trend data. Propose specific, scoped improvements with expected outcomes.'
          },
          {
            question: 'When would you NOT pay down tech debt?',
            answer: 'When the code is being replaced soon, when the debt is in rarely-touched code, when there are higher-impact priorities.'
          }
        ],
        example: 'Example approach:\n\n"I maintain a tech debt backlog with estimated impact scores:\n- High: blocks features or causes incidents\n- Medium: slows development noticeably\n- Low: annoyances, nice-to-haves\n\nWe allocate ~20% of sprint capacity to debt. High-impact items get scheduled like features. I bundle debt work with related features when possible - refactoring auth while adding new auth feature.\n\nI track metrics: deployment frequency, time to onboard, bug rate. This data helps justify continued investment to stakeholders."',
        interviewerExpects: 'Systematic approach, business communication, pragmatic prioritization.',
        difficulty: InterviewDifficulty.INTERMEDIATE
      }
    ]
  }
];

// Helper to get all questions flat
export const getAllQuestions = () =>
  interviewCategories.flatMap(cat =>
    cat.questions.map(q => ({ ...q, category: cat.name, categoryId: cat.id }))
  );

// Helper to get question count
export const getTotalQuestionCount = () =>
  interviewCategories.reduce((acc, cat) => acc + cat.questions.length, 0);
