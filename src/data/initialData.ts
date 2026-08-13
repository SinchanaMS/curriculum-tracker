import { Module, Project, CurriculumState, TopicStatus, MilestoneStatus, AppSettings, StreakData, Topic, SubTopic } from '../types';

export const CURRICULUM_START_DATE = '2026-07-19';
export const TOTAL_DAYS = 88;
export const TOTAL_WEEKS = 12;

let topicIdCounter = 0;
let subtopicIdCounter = 0;
let milestoneIdCounter = 0;

// Revised timeline due dates (Option A - aggressive catch-up schedule)
// Based on current progress as of Aug 13, 2026
const REVISED_DUE_DATES: Record<number, string> = {
  2: '2026-08-20',   // JS Foundations (Week 1-2) - was Aug 1
  3: '2026-08-27',   // Browser Internals (Week 3) - was Aug 8
  5: '2026-09-07',   // React (Week 4-5) - was Aug 22
  6: '2026-09-14',   // Next.js (Week 6) - was Aug 29
  8: '2026-09-23',   // Frontend Architecture (Week 7-8) - was Sep 12
  10: '2026-10-03',  // Frontend System Design (Week 9-10) - was Sep 26
  12: '2026-10-15',  // Engineering Breadth (Week 11-12) - was Oct 10
  14: '2026-10-15',  // DSA Practice (ongoing) - same end date
};

// Helper to calculate due date based on week number (end of that week)
const getWeekEndDate = (weekNumber: number): string => {
  // Use revised dates if available
  if (REVISED_DUE_DATES[weekNumber]) {
    return REVISED_DUE_DATES[weekNumber];
  }
  // Fallback to original calculation
  const startDate = new Date(CURRICULUM_START_DATE);
  const daysToAdd = weekNumber * 7 - 1; // End of week (Sunday)
  const dueDate = new Date(startDate);
  dueDate.setDate(startDate.getDate() + daysToAdd);
  return dueDate.toISOString().split('T')[0];
};

interface SubtopicInput {
  name: string;
  importance?: 1 | 2 | 3;
  keyQuestions?: string[];
}

const createSubtopic = (input: string | SubtopicInput): SubTopic => {
  if (typeof input === 'string') {
    return {
      id: `subtopic-${++subtopicIdCounter}`,
      name: input,
      completed: false
    };
  }
  return {
    id: `subtopic-${++subtopicIdCounter}`,
    name: input.name,
    completed: false,
    importance: input.importance,
    keyQuestions: input.keyQuestions
  };
};

// Store current module's weekEnd for topics
let currentModuleWeekEnd = 1;
let questionIdCounter = 0;

interface TopicInput {
  name: string;
  subtopics: (string | SubtopicInput)[];
  whyItMatters?: string;
  keyQuestion?: string;
  selfAssessment?: string[];
  relatedTopics?: string[];
  recommendedDSA?: string[];
}

const createTopic = (input: string | TopicInput, subtopics?: (string | SubtopicInput)[]): Topic => {
  // Simple form: createTopic('Name', ['subtopic1', 'subtopic2'])
  if (typeof input === 'string') {
    return {
      id: `topic-${++topicIdCounter}`,
      name: input,
      status: TopicStatus.PENDING,
      startedAt: null,
      completedAt: null,
      dueDate: getWeekEndDate(currentModuleWeekEnd),
      notes: '',
      resources: [],
      subtopics: (subtopics || []).map(createSubtopic)
    };
  }

  // Enhanced form with learning fields
  return {
    id: `topic-${++topicIdCounter}`,
    name: input.name,
    status: TopicStatus.PENDING,
    startedAt: null,
    completedAt: null,
    dueDate: getWeekEndDate(currentModuleWeekEnd),
    notes: '',
    resources: [],
    subtopics: input.subtopics.map(createSubtopic),
    whyItMatters: input.whyItMatters,
    keyQuestion: input.keyQuestion,
    selfAssessment: input.selfAssessment?.map(q => ({
      id: `question-${++questionIdCounter}`,
      question: q,
      answer: '',
      answeredAt: null
    })),
    relatedTopics: input.relatedTopics,
    recommendedDSA: input.recommendedDSA
  };
};

const createMilestone = (name: string, description: string) => ({
  id: `milestone-${++milestoneIdCounter}`,
  name,
  description,
  status: MilestoneStatus.NOT_STARTED,
  completedAt: null,
  learnings: ''
});

// ============================================
// MODULE 1: JAVASCRIPT FOUNDATIONS (Weeks 1-2)
// ============================================
currentModuleWeekEnd = 2;
const jsFoundationsTopics: Topic[] = [
  createTopic({
    name: 'Execution Context',
    whyItMatters: 'JavaScript needs to know what code to execute, where variables live, and which function call it\'s currently inside. The Execution Context is how JS organizes and tracks all of this.',
    keyQuestion: 'How does JavaScript know what code to execute, where variables live, and which function call it\'s currently inside?',
    subtopics: [
      {
        name: 'Global Execution Context',
        importance: 2,
        keyQuestions: ['When is it created?', 'Is there only one?', 'What does it contain?', 'What is `this` inside it?']
      },
      {
        name: 'Function Execution Context',
        importance: 2,
        keyQuestions: ['When is it created?', 'When is it destroyed?', 'Why do we need a new one for every function call?']
      },
      {
        name: 'Creation Phase vs Execution Phase',
        importance: 3,
        keyQuestions: [
          'What happens during Creation Phase? (memory allocation, function declarations, variable declarations, this, scope chain)',
          'What happens during Execution Phase? (line-by-line execution, variable assignment, function invocation)',
          'Why does understanding this make hoisting easier?'
        ]
      },
      {
        name: 'Variable Environment',
        importance: 1,
        keyQuestions: ['What does it store?', 'Why does it exist?']
      },
      {
        name: 'Lexical Environment',
        importance: 3,
        keyQuestions: [
          'What is the outer environment reference?',
          'How does the scope chain work?',
          'What is lexical scoping?'
        ]
      },
      {
        name: 'Hoisting mechanics',
        importance: 2,
        keyQuestions: [
          'Why does hoisting happen? (Don\'t memorize, understand!)',
          'How do function declarations behave?',
          'How do function expressions behave?',
          'How does var vs let vs const affect hoisting?'
        ]
      },
      {
        name: 'Temporal Dead Zone (TDZ)',
        importance: 2,
        keyQuestions: ['Why was it introduced?', 'What problem does it solve?', 'Why doesn\'t var have it?']
      }
    ],
    selfAssessment: [
      'Why does JavaScript create an execution context?',
      'What\'s the difference between the Creation Phase and the Execution Phase?',
      'Why does hoisting happen?',
      'Why was the Temporal Dead Zone introduced?',
      'If I call the same function 100 times, how many Function Execution Contexts are created?'
    ],
    relatedTopics: ['Call Stack', 'Closures', 'this keyword', 'Scope']
  }),
  createTopic({
    name: 'Call Stack',
    whyItMatters: 'The Call Stack is where Execution Contexts live. Understanding it is essential for debugging, understanding recursion, and later for the Event Loop.',
    keyQuestion: 'How does JavaScript keep track of where it is in the code and which function called which?',
    subtopics: [
      {
        name: 'Stack frames and structure',
        importance: 2,
        keyQuestions: ['What is a stack frame?', 'What information does it contain?']
      },
      {
        name: 'LIFO principle',
        importance: 1,
        keyQuestions: ['Why Last-In-First-Out?', 'How does this relate to function calls?']
      },
      {
        name: 'Stack overflow scenarios',
        importance: 2,
        keyQuestions: ['What causes stack overflow?', 'How can you prevent it?']
      },
      'Debugging with call stack',
      'Async operations and stack',
      'Maximum call stack size'
    ],
    selfAssessment: [
      'Where do Execution Contexts live?',
      'What happens to the Call Stack when a function returns?',
      'Why does infinite recursion cause a stack overflow?'
    ],
    relatedTopics: ['Execution Context', 'Event Loop', 'Recursion']
  }),
  createTopic('Scope', [
    'Global scope',
    'Function scope',
    'Block scope (let/const)',
    'Scope chain lookup',
    'Variable shadowing',
    'Scope vs Context difference'
  ]),
  createTopic('Lexical Scope', [
    'Static vs dynamic scope',
    'Scope determined at write-time',
    'Nested function scoping',
    'Module scope',
    'Eval and scope manipulation'
  ]),
  createTopic({
    name: 'Closures',
    whyItMatters: 'Closures are one of the most powerful features in JavaScript. They enable data privacy, function factories, and are the foundation for many patterns in React (hooks, callbacks).',
    keyQuestion: 'How can a function remember variables from the place where it was defined, even after that place is gone?',
    subtopics: [
      {
        name: 'Closure definition and formation',
        importance: 3,
        keyQuestions: ['What is a closure?', 'When is it created?', 'What does it "close over"?']
      },
      {
        name: 'Practical use cases',
        importance: 2,
        keyQuestions: ['Where do you use closures in real code?', 'Why are they useful?']
      },
      {
        name: 'Data privacy pattern',
        importance: 2,
        keyQuestions: ['How do closures enable private variables?', 'Why is this better than global state?']
      },
      {
        name: 'Function factories',
        importance: 2,
        keyQuestions: ['What is a function factory?', 'How do closures make this possible?']
      },
      {
        name: 'Partial application & currying',
        importance: 2,
        keyQuestions: ['What is partial application?', 'What is currying?', 'How are closures involved?']
      },
      {
        name: 'Memory implications',
        importance: 2,
        keyQuestions: ['When do closures cause memory leaks?', 'How can you avoid them?']
      },
      {
        name: 'Common closure pitfalls (loops)',
        importance: 3,
        keyQuestions: ['Why does the classic loop problem happen?', 'How do you fix it?']
      },
      'Module pattern using closures'
    ],
    selfAssessment: [
      'Explain closures to a 5-year-old (or a non-programmer)',
      'Write a counter function that uses closures',
      'Why does var in a for loop with setTimeout print the wrong value?',
      'How do closures relate to the Lexical Environment?'
    ],
    relatedTopics: ['Lexical Environment', 'Scope', 'this keyword', 'React Hooks']
  }),
  createTopic({
    name: 'Event Loop',
    whyItMatters: 'JavaScript is single-threaded but can handle async operations. The Event Loop is how this magic happens. Understanding it is crucial for debugging async code and performance.',
    keyQuestion: 'How does JavaScript handle async operations if it only has one thread?',
    subtopics: [
      {
        name: 'Call stack and event loop',
        importance: 3,
        keyQuestions: ['How do the Call Stack and Event Loop work together?', 'What happens when the stack is empty?']
      },
      {
        name: 'Microtasks vs Macrotasks',
        importance: 3,
        keyQuestions: ['What are microtasks?', 'What are macrotasks?', 'Which runs first and why?']
      },
      {
        name: 'Task queue (callback queue)',
        importance: 2,
        keyQuestions: ['What goes in the task queue?', 'When are callbacks moved to the stack?']
      },
      {
        name: 'Microtask queue (job queue)',
        importance: 2,
        keyQuestions: ['What goes in the microtask queue?', 'Why does it have priority?']
      },
      {
        name: 'Promise execution order',
        importance: 3,
        keyQuestions: ['In what order do Promises resolve?', 'Can you predict the console.log order?']
      },
      {
        name: 'setTimeout/setInterval behavior',
        importance: 2,
        keyQuestions: ['Is setTimeout(fn, 0) really 0ms?', 'What is the minimum delay?']
      },
      'requestAnimationFrame timing',
      'queueMicrotask API',
      'Node.js event loop phases'
    ],
    selfAssessment: [
      'Draw the Event Loop diagram from memory',
      'Predict the output order of: setTimeout, Promise.resolve, console.log',
      'Why do Promises run before setTimeout even if setTimeout is 0?',
      'What is the difference between the task queue and microtask queue?'
    ],
    relatedTopics: ['Call Stack', 'Promises', 'Async/Await']
  }),
  createTopic('Promises', [
    'Promise states (pending/fulfilled/rejected)',
    'Creating promises (new Promise)',
    'Promise chaining (.then)',
    'Error handling (.catch)',
    'Promise.all() - parallel execution',
    'Promise.race() - first to settle',
    'Promise.allSettled() - all results',
    'Promise.any() - first fulfilled',
    'Promise.resolve/reject',
    'Promisification patterns'
  ]),
  createTopic('Async/Await', [
    'Async function declaration',
    'Await expression behavior',
    'Error handling with try/catch',
    'Parallel execution patterns',
    'Sequential vs concurrent await',
    'Top-level await',
    'Async iterators (for-await-of)',
    'Common async pitfalls',
    'Async in loops (forEach issues)'
  ]),
  createTopic('this Keyword', [
    'Default binding (global)',
    'Implicit binding (object method)',
    'Explicit binding (call/apply/bind)',
    'new binding (constructor)',
    'Arrow functions and this',
    'this in event handlers',
    'this in callbacks',
    'Binding precedence rules',
    'Lost this context issues'
  ]),
  createTopic('Prototypes', [
    'Prototype chain',
    '__proto__ vs prototype property',
    'Object.getPrototypeOf()',
    'Object.create() for inheritance',
    'Constructor functions',
    'ES6 class under the hood',
    'Prototype pollution risks',
    'Performance of prototype lookup',
    'hasOwnProperty vs in operator'
  ]),
  createTopic('Memory Management', [
    'Stack vs Heap allocation',
    'Primitive vs Reference types',
    'Shallow copy vs Deep copy',
    'Structured clone API',
    'Object spread limitations',
    'JSON.parse/stringify caveats',
    'ArrayBuffer and TypedArrays',
    'SharedArrayBuffer basics'
  ]),
  createTopic('Garbage Collection', [
    'Mark and sweep algorithm',
    'Reference counting (historical)',
    'Reachability concept',
    'Common memory leak patterns',
    'Detached DOM nodes',
    'Event listener leaks',
    'Closures holding references',
    'WeakMap/WeakSet for weak refs',
    'WeakRef and FinalizationRegistry',
    'Memory profiling in DevTools'
  ])
];

// ============================================
// MODULE 2: BROWSER INTERNALS (Week 3)
// ============================================
currentModuleWeekEnd = 3;
const browserInternalsTopics: Topic[] = [
  createTopic('Browser Architecture', [
    'Multi-process architecture',
    'Browser process (UI, network)',
    'Renderer process (per tab)',
    'GPU process',
    'Plugin/Extension processes',
    'Site isolation',
    'Process communication (IPC)',
    'Chrome Task Manager'
  ]),
  createTopic('DOM', [
    'DOM tree construction',
    'Node types (Element, Text, Comment)',
    'DOM manipulation methods',
    'querySelector vs getElementById perf',
    'DocumentFragment for batching',
    'MutationObserver API',
    'Shadow DOM basics',
    'DOM traversal performance',
    'Live vs Static NodeLists'
  ]),
  createTopic('CSSOM', [
    'CSS parsing process',
    'CSSOM tree construction',
    'Specificity calculation',
    'Cascade algorithm',
    'Computed styles',
    'CSS containment',
    'getComputedStyle()',
    'CSS Custom Properties inheritance'
  ]),
  createTopic('Render Tree', [
    'Render tree construction',
    'Combining DOM + CSSOM',
    'display:none exclusion',
    'visibility:hidden inclusion',
    'Pseudo-elements in render tree',
    'Render tree vs DOM tree',
    'Layer tree creation'
  ]),
  createTopic('Layout (Reflow)', [
    'Layout calculation process',
    'Box model application',
    'Layout triggers (geometry changes)',
    'Layout thrashing',
    'Forced synchronous layout',
    'Reading layout properties',
    'Batching DOM reads/writes',
    'CSS containment for isolation',
    'will-change hints'
  ]),
  createTopic('Paint', [
    'Paint operation process',
    'Paint triggers (color, shadow)',
    'Paint layers creation',
    'Paint order (stacking context)',
    'Debugging with Paint Flashing',
    'Reducing paint area',
    'opacity and transform benefits'
  ]),
  createTopic('Composite', [
    'Compositor thread',
    'GPU-accelerated properties',
    'transform and opacity compositing',
    'Layer promotion criteria',
    'Layer explosion problem',
    'will-change property',
    'Compositor-only animations',
    'Debugging layers in DevTools'
  ]),
  createTopic('Network Stack', [
    'DNS resolution',
    'TCP/TLS handshake',
    'HTTP/1.1 limitations',
    'HTTP/2 multiplexing',
    'HTTP/3 and QUIC',
    'Connection pooling',
    'Resource hints (preload, prefetch)',
    'preconnect for early connection',
    'Priority hints',
    'Service Worker interception'
  ]),
  createTopic('Browser Cache', [
    'HTTP cache headers',
    'Cache-Control directives',
    'ETag and If-None-Match',
    'Last-Modified and If-Modified-Since',
    'Disk cache vs Memory cache',
    'Service Worker cache API',
    'Cache storage strategies',
    'Cache invalidation patterns',
    'Immutable resources',
    'IndexedDB for app data'
  ])
];

// ============================================
// MODULE 3: REACT (Weeks 4-5)
// ============================================
currentModuleWeekEnd = 5;
const reactTopics: Topic[] = [
  createTopic('Rendering', [
    'Initial render process',
    'Re-render triggers',
    'Render phase vs Commit phase',
    'State change rendering',
    'Props change rendering',
    'Parent re-render propagation',
    'Render batching (React 18)',
    'Automatic batching',
    'flushSync for immediate updates'
  ]),
  createTopic('Reconciliation', [
    'Diffing algorithm basics',
    'O(n) heuristic approach',
    'Element type comparison',
    'Keys importance in lists',
    'Index as key problems',
    'Stable key strategies',
    'Component vs Element recreation',
    'Reconciliation optimizations'
  ]),
  createTopic('Virtual DOM', [
    'VDOM structure (React elements)',
    'VDOM vs Real DOM',
    'VDOM diffing process',
    'Minimal DOM updates',
    'Performance trade-offs',
    'When VDOM helps/hurts',
    'Comparison with other approaches'
  ]),
  createTopic('Fiber Architecture', [
    'Fiber node structure',
    'Linked list traversal',
    'Time slicing concept',
    'Interruptible rendering',
    'Priority levels (lanes)',
    'Work loop mechanism',
    'Current vs Work-in-progress tree',
    'Double buffering technique'
  ]),
  createTopic('Hooks Deep Dive', [
    'Rules of hooks',
    'Hook call order importance',
    'Hooks linked list',
    'Closure trap problem',
    'Stale closure debugging',
    'Custom hook patterns',
    'Hook dependencies array',
    'useDebugValue for DevTools'
  ]),
  createTopic('useEffect', [
    'Effect timing (after paint)',
    'Dependency array mechanics',
    'Empty deps vs no deps',
    'Cleanup function purpose',
    'Cleanup timing',
    'Race conditions in effects',
    'Abort controller pattern',
    'useLayoutEffect differences',
    'Effects in Strict Mode',
    'Common useEffect mistakes'
  ]),
  createTopic('useMemo', [
    'Memoization concept',
    'When to use useMemo',
    'Referential equality',
    'Expensive computation caching',
    'Dependency array matching',
    'Over-memoization pitfalls',
    'useMemo vs useCallback',
    'Measuring memoization benefit'
  ]),
  createTopic('useCallback', [
    'Function identity stability',
    'Event handler optimization',
    'Child component optimization',
    'Dependency array for callbacks',
    'useCallback with useEffect',
    'When useCallback helps',
    'When to skip useCallback',
    'useCallback vs inline functions'
  ]),
  createTopic('Custom Hooks', [
    'Extracting reusable logic',
    'Custom hook naming (use prefix)',
    'Composing multiple hooks',
    'Returning multiple values',
    'Custom hook with options',
    'Testing custom hooks',
    'Common custom hook patterns',
    'useLocalStorage example',
    'useFetch pattern',
    'useDebounce/useThrottle'
  ]),
  createTopic('Context API', [
    'createContext usage',
    'Provider and Consumer',
    'useContext hook',
    'Context re-render behavior',
    'Context performance issues',
    'Context splitting strategies',
    'Memoizing context values',
    'Context vs Props drilling',
    'Context vs State management',
    'Multiple contexts pattern'
  ]),
  createTopic('Suspense', [
    'Suspense for code splitting',
    'React.lazy() for lazy loading',
    'Fallback UI',
    'Suspense boundaries placement',
    'Nested Suspense boundaries',
    'Error boundaries with Suspense',
    'Suspense for data fetching',
    'SuspenseList (experimental)',
    'Streaming SSR with Suspense'
  ]),
  createTopic('Concurrent Rendering', [
    'Concurrent Mode concepts',
    'useTransition hook',
    'startTransition API',
    'useDeferredValue hook',
    'Urgent vs Non-urgent updates',
    'Transition pending state',
    'Avoiding UI jank',
    'Concurrent features adoption',
    'Tearing prevention'
  ])
];

// ============================================
// MODULE 4: NEXT.JS (Week 6)
// ============================================
currentModuleWeekEnd = 6;
const nextjsTopics: Topic[] = [
  createTopic('SSR (Server-Side Rendering)', [
    'SSR request flow',
    'getServerSideProps function',
    'Request/Response objects',
    'Dynamic data per request',
    'Authentication in SSR',
    'SEO benefits of SSR',
    'SSR performance considerations',
    'Caching SSR responses',
    'SSR vs API routes'
  ]),
  createTopic('CSR (Client-Side Rendering)', [
    'When to use CSR',
    'Client-only components',
    'useEffect for client data',
    'Dynamic imports (no SSR)',
    'Loading states',
    'CSR performance trade-offs',
    'SWR/React Query with CSR'
  ]),
  createTopic('SSG (Static Site Generation)', [
    'getStaticProps function',
    'Build-time data fetching',
    'getStaticPaths for dynamic routes',
    'Fallback strategies (true/false/blocking)',
    'Incremental adoption',
    'SSG for blogs/docs',
    'SSG limitations',
    'Revalidation needs'
  ]),
  createTopic('ISR (Incremental Static Regeneration)', [
    'revalidate option',
    'Stale-while-revalidate pattern',
    'On-demand revalidation API',
    'revalidatePath()',
    'revalidateTag()',
    'ISR use cases',
    'ISR vs SSR decision',
    'ISR deployment requirements'
  ]),
  createTopic('Hydration', [
    'Hydration process explained',
    'Hydration mismatch errors',
    'Common mismatch causes',
    'suppressHydrationWarning',
    'useEffect for client-only code',
    'Progressive hydration',
    'Selective hydration',
    'Debugging hydration issues'
  ]),
  createTopic('App Router', [
    'File-based routing',
    'page.tsx convention',
    'layout.tsx for shared UI',
    'loading.tsx for loading states',
    'error.tsx for error handling',
    'Route groups (parentheses)',
    'Parallel routes (@folder)',
    'Intercepting routes',
    'Dynamic segments [slug]',
    'Catch-all routes [...slug]',
    'Route handlers (API routes)'
  ]),
  createTopic('Server Components', [
    'Server vs Client components',
    'Default server components',
    '"use client" directive',
    'RSC payload format',
    'Streaming Server Components',
    'Data fetching in Server Components',
    'Passing props to Client',
    'Server Actions basics',
    'When to use each type',
    'Composition patterns'
  ]),
  createTopic('Caching Strategies', [
    'Request Memoization',
    'Data Cache',
    'Full Route Cache',
    'Router Cache (client)',
    'Cache revalidation methods',
    'fetch cache options',
    'unstable_cache API',
    'Cache invalidation patterns',
    'Opting out of caching',
    'Cache debugging'
  ])
];

// ============================================
// MODULE 5: FRONTEND ARCHITECTURE (Weeks 7-8)
// ============================================
currentModuleWeekEnd = 8;
const frontendArchitectureTopics: Topic[] = [
  createTopic('State Management Patterns', [
    'Local component state',
    'Lifted state',
    'Global state solutions',
    'Server state (React Query/SWR)',
    'URL state',
    'Form state',
    'Context for state',
    'Redux patterns (when needed)',
    'Zustand/Jotai/Recoil comparison',
    'State machine patterns (XState)',
    'Optimistic state updates'
  ]),
  createTopic('Component Architecture', [
    'Presentational vs Container',
    'Compound components pattern',
    'Render props pattern',
    'Higher-Order Components (HOC)',
    'Custom hooks vs HOC',
    'Controlled vs Uncontrolled',
    'Composition over inheritance',
    'Component API design',
    'Props interface design',
    'Default props patterns'
  ]),
  createTopic('Feature-based Architecture', [
    'Feature folder structure',
    'Colocation principle',
    'Barrel exports (index.ts)',
    'Feature boundaries',
    'Shared vs Feature code',
    'Dependency direction rules',
    'Cross-feature communication',
    'Feature flags architecture',
    'Monorepo considerations'
  ]),
  createTopic('Design Systems', [
    'Design tokens (spacing, colors)',
    'Typography scale',
    'Component variants',
    'Component API consistency',
    'Theming architecture',
    'Dark mode implementation',
    'CSS-in-JS vs CSS Modules',
    'Tailwind for design systems',
    'Storybook for documentation',
    'Component testing strategies'
  ]),
  createTopic('Accessibility (a11y)', [
    'WCAG 2.1 guidelines',
    'Semantic HTML importance',
    'ARIA roles and attributes',
    'Focus management',
    'Keyboard navigation',
    'Skip links',
    'Screen reader testing',
    'Color contrast requirements',
    'Form accessibility',
    'Modal/Dialog accessibility',
    'Accessible routing',
    'a11y testing tools'
  ]),
  createTopic('Performance Optimization', [
    'Core Web Vitals (LCP, FID, CLS)',
    'Code splitting strategies',
    'Dynamic imports',
    'Tree shaking',
    'Bundle analysis',
    'Image optimization',
    'Font loading strategies',
    'Third-party script loading',
    'Virtualization for long lists',
    'Debouncing and throttling',
    'Web Workers for heavy tasks',
    'Performance monitoring'
  ]),
  createTopic('Error Handling & Boundaries', [
    'Error boundaries basics',
    'Error boundary placement',
    'Fallback UI design',
    'Error recovery patterns',
    'Logging and reporting',
    'Sentry/LogRocket integration',
    'Network error handling',
    'Retry strategies',
    'Graceful degradation',
    'Feature detection',
    'Error states in UI'
  ])
];

// ============================================
// MODULE 6: FRONTEND SYSTEM DESIGN (Weeks 9-10)
// ============================================
currentModuleWeekEnd = 10;
const systemDesignTopics: Topic[] = [
  createTopic('Dashboard Design', [
    'Widget architecture',
    'Grid layout systems',
    'Data aggregation layer',
    'Real-time data updates',
    'Dashboard state management',
    'Widget communication',
    'Responsive dashboard layout',
    'Dashboard customization',
    'Export/Download features',
    'Dashboard performance'
  ]),
  createTopic('Chat Application', [
    'Message data structure',
    'Real-time with WebSocket',
    'Message threading',
    'Presence indicators',
    'Typing indicators',
    'Read receipts',
    'Message delivery status',
    'Offline message queue',
    'Media attachments',
    'Chat performance at scale'
  ]),
  createTopic('Infinite Scroll', [
    'Intersection Observer API',
    'Scroll position detection',
    'Loading triggers',
    'Virtualization (react-window)',
    'Scroll position restoration',
    'Loading states',
    'Empty states',
    'End of list detection',
    'Pull-to-refresh',
    'Jump to top/bottom'
  ]),
  createTopic('Search Autocomplete', [
    'Debouncing input',
    'API design for search',
    'Caching search results',
    'Highlighting matches',
    'Keyboard navigation',
    'Recent searches',
    'Popular suggestions',
    'Fuzzy matching',
    'Search analytics',
    'No results handling'
  ]),
  createTopic('File Upload System', [
    'Drag and drop zone',
    'File type validation',
    'File size limits',
    'Progress tracking',
    'Chunked uploads',
    'Resumable uploads',
    'Parallel uploads',
    'Error recovery/retry',
    'File preview',
    'Upload queue management',
    'Presigned URLs pattern'
  ]),
  createTopic('Restaurant Listing App', [
    'Geolocation integration',
    'Map integration',
    'Filter architecture',
    'Sort functionality',
    'Pagination strategies',
    'Card layout design',
    'Quick view modals',
    'Favoriting system',
    'Search within results',
    'Mobile responsive design'
  ]),
  createTopic('Form Builder', [
    'Dynamic form schema',
    'Field type registry',
    'Validation architecture',
    'Conditional field logic',
    'Form state management',
    'Multi-step forms',
    'Form persistence',
    'Form preview',
    'Drag-drop field ordering',
    'Export form schema'
  ]),
  createTopic('Realtime Dashboard', [
    'WebSocket vs SSE choice',
    'Connection management',
    'Reconnection strategies',
    'Data normalization',
    'Throttling UI updates',
    'Chart library integration',
    'Memory management',
    'Offline handling',
    'Historical data loading',
    'Dashboard alerts'
  ])
];

// ============================================
// MODULE 7: ENGINEERING BREADTH (Weeks 11-12)
// ============================================
currentModuleWeekEnd = 12;
const engineeringBreadthTopics: Topic[] = [
  createTopic('Git Advanced', [
    'Rebase vs Merge',
    'Interactive rebase',
    'Cherry-pick commits',
    'Git bisect for debugging',
    'Stash and stash pop',
    'Git hooks (pre-commit)',
    'Conventional commits',
    'Branching strategies',
    'Git flow vs trunk-based',
    'Resolving merge conflicts',
    'Git reflog for recovery',
    'Squashing commits'
  ]),
  createTopic('DBMS Fundamentals', [
    'Indexes (B-tree, Hash)',
    'Index optimization',
    'Query execution plans',
    'JOIN types (INNER, LEFT, etc.)',
    'Transactions and ACID',
    'Isolation levels',
    'Deadlocks',
    'Normalization (1NF, 2NF, 3NF)',
    'Denormalization trade-offs',
    'NoSQL basics (when to use)',
    'Query optimization'
  ]),
  createTopic('OOP Principles', [
    'SOLID principles',
    'Single Responsibility',
    'Open/Closed principle',
    'Liskov Substitution',
    'Interface Segregation',
    'Dependency Inversion',
    'Composition vs Inheritance',
    'Design patterns overview',
    'Factory pattern',
    'Observer pattern',
    'Strategy pattern',
    'Dependency Injection'
  ]),
  createTopic('Docker', [
    'Images vs Containers',
    'Dockerfile basics',
    'Docker build process',
    'Layer caching',
    'Multi-stage builds',
    'Volumes for persistence',
    'Docker networking',
    'Docker Compose',
    'Environment variables',
    'Container debugging',
    'Docker for development',
    'Production best practices'
  ]),
  createTopic('AWS Basics', [
    'S3 (storage)',
    'S3 presigned URLs',
    'CloudFront (CDN)',
    'CloudFront caching',
    'EC2 (compute)',
    'Lambda (serverless)',
    'Lambda cold starts',
    'API Gateway',
    'IAM basics (roles, policies)',
    'RDS basics',
    'DynamoDB basics',
    'SQS for queues'
  ]),
  createTopic('Kubernetes Basics', [
    'Kubernetes problem it solves',
    'Pods (smallest unit)',
    'Deployments',
    'ReplicaSets',
    'Services (ClusterIP, LoadBalancer)',
    'Ingress controllers',
    'ConfigMaps',
    'Secrets',
    'Namespaces',
    'kubectl basics',
    'Helm charts overview',
    'K8s vs Docker comparison'
  ])
];

// ============================================
// MODULE 8: DSA PRACTICE (Ongoing - Weeks 1-12)
// ============================================
currentModuleWeekEnd = 14; // Use 14 for end of curriculum
const dsaPracticeTopics: Topic[] = [
  createTopic({
    name: 'Arrays & Hashing',
    whyItMatters: 'Foundation of most coding interviews. Master these patterns first.',
    subtopics: [
      { name: 'Two Sum (Easy)', importance: 3 },
      { name: 'Contains Duplicate (Easy)', importance: 2 },
      { name: 'Valid Anagram (Easy)', importance: 2 },
      { name: 'Group Anagrams (Medium)', importance: 2 },
      { name: 'Top K Frequent Elements (Medium)', importance: 3 },
      { name: 'Product of Array Except Self (Medium)', importance: 3 },
      { name: 'Longest Consecutive Sequence (Medium)', importance: 2 },
      { name: 'Encode and Decode Strings (Medium)', importance: 1 }
    ],
    selfAssessment: [
      'Can you solve Two Sum in O(n) time?',
      'When do you use a HashMap vs HashSet?'
    ]
  }),
  createTopic({
    name: 'Two Pointers',
    whyItMatters: 'Essential for string/array manipulation without extra space.',
    subtopics: [
      { name: 'Valid Palindrome (Easy)', importance: 2 },
      { name: 'Two Sum II - Sorted Array (Medium)', importance: 2 },
      { name: '3Sum (Medium)', importance: 3 },
      { name: 'Container With Most Water (Medium)', importance: 3 },
      { name: 'Trapping Rain Water (Hard)', importance: 2 }
    ],
    selfAssessment: [
      'When should you use two pointers vs sliding window?',
      'How do you handle duplicates in 3Sum?'
    ]
  }),
  createTopic({
    name: 'Sliding Window',
    whyItMatters: 'Optimizes brute force O(n²) to O(n) for subarray/substring problems.',
    subtopics: [
      { name: 'Best Time to Buy and Sell Stock (Easy)', importance: 3 },
      { name: 'Longest Substring Without Repeating Chars (Medium)', importance: 3 },
      { name: 'Longest Repeating Character Replacement (Medium)', importance: 2 },
      { name: 'Permutation in String (Medium)', importance: 2 },
      { name: 'Minimum Window Substring (Hard)', importance: 2 },
      { name: 'Sliding Window Maximum (Hard)', importance: 1 }
    ],
    selfAssessment: [
      'What defines a valid sliding window problem?',
      'Fixed vs variable size windows - when to use each?'
    ]
  }),
  createTopic({
    name: 'Stack',
    whyItMatters: 'Key for parsing, matching brackets, and monotonic patterns.',
    subtopics: [
      { name: 'Valid Parentheses (Easy)', importance: 3 },
      { name: 'Min Stack (Medium)', importance: 2 },
      { name: 'Evaluate Reverse Polish Notation (Medium)', importance: 2 },
      { name: 'Daily Temperatures (Medium)', importance: 3 },
      { name: 'Car Fleet (Medium)', importance: 2 },
      { name: 'Largest Rectangle in Histogram (Hard)', importance: 2 }
    ],
    selfAssessment: [
      'When do you use a monotonic stack?',
      'How do you implement Min Stack in O(1)?'
    ]
  }),
  createTopic({
    name: 'Binary Search',
    whyItMatters: 'Reduces O(n) to O(log n). Critical for sorted data and search space problems.',
    subtopics: [
      { name: 'Binary Search (Easy)', importance: 3 },
      { name: 'Search a 2D Matrix (Medium)', importance: 2 },
      { name: 'Koko Eating Bananas (Medium)', importance: 3 },
      { name: 'Find Minimum in Rotated Sorted Array (Medium)', importance: 3 },
      { name: 'Search in Rotated Sorted Array (Medium)', importance: 3 },
      { name: 'Time Based Key-Value Store (Medium)', importance: 2 },
      { name: 'Median of Two Sorted Arrays (Hard)', importance: 1 }
    ],
    selfAssessment: [
      'Can you write binary search without bugs on first try?',
      'When do you use left < right vs left <= right?'
    ]
  }),
  createTopic({
    name: 'Linked List',
    whyItMatters: 'Tests pointer manipulation and edge case handling.',
    subtopics: [
      { name: 'Reverse Linked List (Easy)', importance: 3 },
      { name: 'Merge Two Sorted Lists (Easy)', importance: 3 },
      { name: 'Linked List Cycle (Easy)', importance: 3 },
      { name: 'Reorder List (Medium)', importance: 2 },
      { name: 'Remove Nth Node From End (Medium)', importance: 2 },
      { name: 'Copy List with Random Pointer (Medium)', importance: 2 },
      { name: 'LRU Cache (Medium)', importance: 3 },
      { name: 'Merge K Sorted Lists (Hard)', importance: 2 }
    ],
    selfAssessment: [
      'Can you reverse a linked list iteratively and recursively?',
      'How does the fast/slow pointer technique detect cycles?'
    ]
  }),
  createTopic({
    name: 'Trees',
    whyItMatters: 'Fundamental data structure. Recursion and DFS/BFS mastery required.',
    subtopics: [
      { name: 'Invert Binary Tree (Easy)', importance: 2 },
      { name: 'Maximum Depth of Binary Tree (Easy)', importance: 2 },
      { name: 'Same Tree (Easy)', importance: 2 },
      { name: 'Subtree of Another Tree (Easy)', importance: 2 },
      { name: 'Lowest Common Ancestor (Medium)', importance: 3 },
      { name: 'Binary Tree Level Order Traversal (Medium)', importance: 3 },
      { name: 'Validate Binary Search Tree (Medium)', importance: 3 },
      { name: 'Kth Smallest Element in BST (Medium)', importance: 2 },
      { name: 'Construct Binary Tree from Preorder/Inorder (Medium)', importance: 2 },
      { name: 'Binary Tree Max Path Sum (Hard)', importance: 2 },
      { name: 'Serialize and Deserialize Binary Tree (Hard)', importance: 2 }
    ],
    selfAssessment: [
      'DFS vs BFS - when to use each for trees?',
      'Can you do all 3 traversals (pre/in/post) iteratively?'
    ]
  }),
  createTopic({
    name: 'Heap / Priority Queue',
    whyItMatters: 'Efficient for top-k problems and streaming data.',
    subtopics: [
      { name: 'Kth Largest Element in Array (Medium)', importance: 3 },
      { name: 'Last Stone Weight (Easy)', importance: 2 },
      { name: 'K Closest Points to Origin (Medium)', importance: 2 },
      { name: 'Task Scheduler (Medium)', importance: 2 },
      { name: 'Design Twitter (Medium)', importance: 2 },
      { name: 'Find Median from Data Stream (Hard)', importance: 3 }
    ],
    selfAssessment: [
      'Min heap vs Max heap - when to use each?',
      'How do you find the kth largest with a min heap?'
    ]
  }),
  createTopic({
    name: 'Backtracking',
    whyItMatters: 'Essential for combination, permutation, and constraint problems.',
    subtopics: [
      { name: 'Subsets (Medium)', importance: 3 },
      { name: 'Combination Sum (Medium)', importance: 3 },
      { name: 'Permutations (Medium)', importance: 3 },
      { name: 'Subsets II (Medium)', importance: 2 },
      { name: 'Combination Sum II (Medium)', importance: 2 },
      { name: 'Word Search (Medium)', importance: 3 },
      { name: 'Palindrome Partitioning (Medium)', importance: 2 },
      { name: 'Letter Combinations of Phone Number (Medium)', importance: 2 },
      { name: 'N-Queens (Hard)', importance: 2 }
    ],
    selfAssessment: [
      'What is the backtracking template?',
      'How do you avoid duplicates in combination problems?'
    ]
  }),
  createTopic({
    name: 'Graphs',
    whyItMatters: 'Complex problems often reduce to graph traversal.',
    subtopics: [
      { name: 'Number of Islands (Medium)', importance: 3 },
      { name: 'Clone Graph (Medium)', importance: 2 },
      { name: 'Pacific Atlantic Water Flow (Medium)', importance: 2 },
      { name: 'Course Schedule (Medium)', importance: 3 },
      { name: 'Course Schedule II (Medium)', importance: 2 },
      { name: 'Number of Connected Components (Medium)', importance: 2 },
      { name: 'Graph Valid Tree (Medium)', importance: 2 },
      { name: 'Word Ladder (Hard)', importance: 2 }
    ],
    selfAssessment: [
      'BFS vs DFS for shortest path?',
      'How do you detect a cycle in a directed vs undirected graph?'
    ]
  }),
  createTopic({
    name: 'Dynamic Programming',
    whyItMatters: 'Most challenging pattern. Build up from 1D to 2D problems.',
    subtopics: [
      { name: 'Climbing Stairs (Easy)', importance: 3 },
      { name: 'House Robber (Medium)', importance: 3 },
      { name: 'House Robber II (Medium)', importance: 2 },
      { name: 'Longest Palindromic Substring (Medium)', importance: 2 },
      { name: 'Palindromic Substrings (Medium)', importance: 2 },
      { name: 'Decode Ways (Medium)', importance: 2 },
      { name: 'Coin Change (Medium)', importance: 3 },
      { name: 'Maximum Product Subarray (Medium)', importance: 2 },
      { name: 'Word Break (Medium)', importance: 3 },
      { name: 'Longest Increasing Subsequence (Medium)', importance: 3 },
      { name: 'Unique Paths (Medium)', importance: 2 },
      { name: 'Longest Common Subsequence (Medium)', importance: 2 },
      { name: 'Edit Distance (Medium)', importance: 2 }
    ],
    selfAssessment: [
      'Can you identify overlapping subproblems?',
      'Top-down vs bottom-up - pros and cons?'
    ]
  }),
  createTopic({
    name: 'Intervals',
    whyItMatters: 'Common in scheduling and calendar problems.',
    subtopics: [
      { name: 'Merge Intervals (Medium)', importance: 3 },
      { name: 'Insert Interval (Medium)', importance: 2 },
      { name: 'Non-overlapping Intervals (Medium)', importance: 2 },
      { name: 'Meeting Rooms (Easy)', importance: 2 },
      { name: 'Meeting Rooms II (Medium)', importance: 3 }
    ],
    selfAssessment: [
      'What is the standard approach for interval problems?',
      'When do you sort by start vs end time?'
    ]
  }),
  createTopic({
    name: 'Greedy',
    whyItMatters: 'Optimal local choices leading to global optimum.',
    subtopics: [
      { name: 'Maximum Subarray (Medium)', importance: 3 },
      { name: 'Jump Game (Medium)', importance: 3 },
      { name: 'Jump Game II (Medium)', importance: 2 },
      { name: 'Gas Station (Medium)', importance: 2 },
      { name: 'Hand of Straights (Medium)', importance: 1 },
      { name: 'Partition Labels (Medium)', importance: 2 }
    ],
    selfAssessment: [
      'How do you prove a greedy solution is correct?',
      'Greedy vs DP - how to decide which to use?'
    ]
  }),
  createTopic({
    name: 'Bit Manipulation',
    whyItMatters: 'Space-efficient solutions and XOR tricks.',
    subtopics: [
      { name: 'Single Number (Easy)', importance: 3 },
      { name: 'Number of 1 Bits (Easy)', importance: 2 },
      { name: 'Counting Bits (Easy)', importance: 2 },
      { name: 'Reverse Bits (Easy)', importance: 1 },
      { name: 'Missing Number (Easy)', importance: 2 },
      { name: 'Sum of Two Integers (Medium)', importance: 1 }
    ],
    selfAssessment: [
      'Why does XOR find the single number?',
      'Common bit manipulation tricks (AND, OR, XOR, shifts)?'
    ]
  })
];

export const INITIAL_MODULES: Module[] = [
  {
    id: 'mod-js-foundations',
    name: 'JavaScript Foundations',
    weekStart: 1,
    weekEnd: 2,
    color: '#F7DF1E',
    topics: jsFoundationsTopics
  },
  {
    id: 'mod-browser-internals',
    name: 'Browser Internals',
    weekStart: 3,
    weekEnd: 3,
    color: '#4285F4',
    topics: browserInternalsTopics
  },
  {
    id: 'mod-react',
    name: 'React',
    weekStart: 4,
    weekEnd: 5,
    color: '#61DAFB',
    topics: reactTopics
  },
  {
    id: 'mod-nextjs',
    name: 'Next.js',
    weekStart: 6,
    weekEnd: 6,
    color: '#000000',
    topics: nextjsTopics
  },
  {
    id: 'mod-frontend-architecture',
    name: 'Frontend Architecture',
    weekStart: 7,
    weekEnd: 8,
    color: '#8B5CF6',
    topics: frontendArchitectureTopics
  },
  {
    id: 'mod-system-design',
    name: 'Frontend System Design',
    weekStart: 9,
    weekEnd: 10,
    color: '#10B981',
    topics: systemDesignTopics
  },
  {
    id: 'mod-engineering-breadth',
    name: 'Engineering Breadth',
    weekStart: 11,
    weekEnd: 12,
    color: '#F97316',
    topics: engineeringBreadthTopics
  },
  {
    id: 'mod-dsa-practice',
    name: 'DSA Practice',
    weekStart: 1,
    weekEnd: 12,
    color: '#EC4899',
    topics: dsaPracticeTopics
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-data-table',
    name: 'Advanced Data Table',
    description: 'High-performance data table with virtualization and memoization',
    milestones: [
      createMilestone('Basic Table Rendering', 'Render large datasets efficiently'),
      createMilestone('Virtualization', 'Implement windowing for 10k+ rows'),
      createMilestone('Memoization', 'Optimize re-renders with React.memo and useMemo'),
      createMilestone('Sorting & Filtering', 'Add performant sorting and filtering'),
      createMilestone('Column Resizing', 'Implement drag-to-resize columns')
    ],
    startedAt: null,
    completedAt: null,
    dueDate: getWeekEndDate(2),
    weekStart: 1,
    weekEnd: 2,
    githubUrl: '',
    demoUrl: '',
    techStack: ['React', 'TypeScript', 'react-window'],
    notes: ''
  },
  {
    id: 'proj-command-palette',
    name: 'Command Palette',
    description: 'VS Code-style command palette with fuzzy search and keyboard navigation',
    milestones: [
      createMilestone('Keyboard Shortcuts', 'Cmd+K to open, arrow keys to navigate'),
      createMilestone('Fuzzy Search', 'Implement fuzzy matching algorithm'),
      createMilestone('Command Registry', 'Design extensible command system'),
      createMilestone('Recent Commands', 'Track and prioritize recent actions'),
      createMilestone('Nested Commands', 'Support command hierarchies')
    ],
    startedAt: null,
    completedAt: null,
    dueDate: getWeekEndDate(3),
    weekStart: 3,
    weekEnd: 3,
    githubUrl: '',
    demoUrl: '',
    techStack: ['React', 'TypeScript', 'fuse.js'],
    notes: ''
  },
  {
    id: 'proj-infinite-feed',
    name: 'Infinite Feed',
    description: 'Social media-style infinite scroll with caching and optimistic updates',
    milestones: [
      createMilestone('Infinite Scroll', 'Intersection Observer-based loading'),
      createMilestone('API Pagination', 'Cursor-based pagination'),
      createMilestone('Caching Layer', 'Implement request caching'),
      createMilestone('Optimistic Updates', 'Like/comment with rollback'),
      createMilestone('Pull to Refresh', 'Mobile-style refresh gesture')
    ],
    startedAt: null,
    completedAt: null,
    dueDate: getWeekEndDate(5),
    weekStart: 4,
    weekEnd: 5,
    githubUrl: '',
    demoUrl: '',
    techStack: ['React', 'TypeScript', 'TanStack Query'],
    notes: ''
  },
  {
    id: 'proj-component-library',
    name: 'Component Library',
    description: 'Production-ready reusable component library with accessibility',
    milestones: [
      createMilestone('Design Tokens', 'Define spacing, colors, typography'),
      createMilestone('Core Components', 'Button, Input, Select, Modal'),
      createMilestone('Accessibility', 'ARIA attributes, keyboard navigation'),
      createMilestone('Documentation', 'Storybook integration'),
      createMilestone('Testing', 'Unit tests with Testing Library')
    ],
    startedAt: null,
    completedAt: null,
    dueDate: getWeekEndDate(6),
    weekStart: 6,
    weekEnd: 6,
    githubUrl: '',
    demoUrl: '',
    techStack: ['React', 'TypeScript', 'Storybook', 'Tailwind CSS'],
    notes: ''
  },
  {
    id: 'proj-file-upload',
    name: 'File Upload System',
    description: 'Robust file upload with progress tracking and error recovery',
    milestones: [
      createMilestone('Drag & Drop', 'Implement drag-drop zone'),
      createMilestone('Progress Tracking', 'Real-time upload progress'),
      createMilestone('Chunked Upload', 'Large file chunking strategy'),
      createMilestone('Error Recovery', 'Retry failed uploads'),
      createMilestone('File Preview', 'Image/PDF preview before upload')
    ],
    startedAt: null,
    completedAt: null,
    dueDate: getWeekEndDate(8),
    weekStart: 7,
    weekEnd: 8,
    githubUrl: '',
    demoUrl: '',
    techStack: ['React', 'TypeScript', 'axios'],
    notes: ''
  },
  {
    id: 'proj-realtime-dashboard',
    name: 'Realtime Dashboard',
    description: 'Live-updating analytics dashboard with charts and performance optimization',
    milestones: [
      createMilestone('WebSocket Connection', 'Establish live data stream'),
      createMilestone('Chart Integration', 'Real-time updating charts'),
      createMilestone('Data Aggregation', 'Client-side data processing'),
      createMilestone('Performance', 'Optimize for 60fps updates'),
      createMilestone('Offline Support', 'Handle connection drops gracefully')
    ],
    startedAt: null,
    completedAt: null,
    dueDate: getWeekEndDate(10),
    weekStart: 9,
    weekEnd: 10,
    githubUrl: '',
    demoUrl: '',
    techStack: ['React', 'TypeScript', 'Recharts', 'WebSocket'],
    notes: ''
  },
  {
    id: 'proj-notion-editor',
    name: 'Notion-style Editor',
    description: 'Block-based rich text editor with drag-and-drop and slash commands',
    milestones: [
      createMilestone('Block System', 'Design block data structure'),
      createMilestone('Rich Text', 'Bold, italic, links, code'),
      createMilestone('Block Types', 'Headings, lists, code blocks'),
      createMilestone('Drag & Drop', 'Reorder blocks'),
      createMilestone('Slash Commands', '/ to insert block types'),
      createMilestone('Undo/Redo', 'Command history pattern')
    ],
    startedAt: null,
    completedAt: null,
    dueDate: getWeekEndDate(12),
    weekStart: 11,
    weekEnd: 12,
    githubUrl: '',
    demoUrl: '',
    techStack: ['React', 'TypeScript', 'Slate.js'],
    notes: ''
  }
];

export const DSA_PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Fast & Slow Pointers',
  'Merge Intervals',
  'Cyclic Sort',
  'In-place Reversal',
  'BFS',
  'DFS',
  'Two Heaps',
  'Subsets',
  'Modified Binary Search',
  'Top K Elements',
  'K-way Merge',
  'Topological Sort',
  'Dynamic Programming',
  'Backtracking',
  'Greedy',
  'Trie',
  'Union Find',
  'Monotonic Stack',
  'Other'
];

const createInitialSettings = (): AppSettings => ({
  theme: 'system',
  dailyGoal: {
    topics: 2,
    problems: 1,
    studyMinutes: 120
  },
  notifications: true,
  exportFormat: 'json'
});

const createInitialStreakData = (): StreakData => ({
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  totalActiveDays: 0,
  activityLog: []
});

export const createInitialState = (): CurriculumState => ({
  startDate: CURRICULUM_START_DATE,
  currentDay: 1,
  modules: INITIAL_MODULES,
  projects: INITIAL_PROJECTS,
  dsaProblems: [],
  weeklyReflections: [],
  dailyTodos: [],
  streakData: createInitialStreakData(),
  settings: createInitialSettings()
});
