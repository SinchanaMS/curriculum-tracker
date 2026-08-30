import { Module, Project, CurriculumState, TopicStatus, MilestoneStatus, AppSettings, StreakData, Topic, SubTopic, ImplementationPhase } from '../types';

export const CURRICULUM_START_DATE = '2026-07-19';
export const TOTAL_DAYS = 105; // July 19 → October 31
export const TOTAL_WEEKS = 15; // Extended timeline

let topicIdCounter = 0;
let subtopicIdCounter = 0;
let milestoneIdCounter = 0;

// Revised timeline due dates (Plan B - sustainable 1 topic/day)
// Based on restart from Aug 29, 2026 - ends Oct 31
const REVISED_DUE_DATES: Record<number, string> = {
  2: '2026-09-06',   // JS Foundations (Week 1-2)
  3: '2026-09-15',   // Browser Internals (Week 3)
  5: '2026-09-27',   // React (Week 4-5)
  6: '2026-10-05',   // Next.js (Week 6)
  8: '2026-10-12',   // Frontend Architecture (Week 7-8)
  10: '2026-10-22',  // Frontend System Design (Week 9-10)
  12: '2026-10-31',  // Engineering Breadth (Week 11-12)
  14: '2026-10-31',  // DSA Practice (ongoing)
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

const createMilestone = (name: string, description: string, prerequisites?: string[]) => ({
  id: `milestone-${++milestoneIdCounter}`,
  name,
  description,
  status: MilestoneStatus.NOT_STARTED,
  completedAt: null,
  learnings: '',
  prerequisites
});

let phaseIdCounter = 0;
let stepIdCounter = 0;

const createPhase = (name: string, steps: string[]): ImplementationPhase => ({
  id: `phase-${++phaseIdCounter}`,
  name,
  steps: steps.map(text => ({
    id: `step-${++stepIdCounter}`,
    text,
    completed: false
  }))
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
      createMilestone('Basic Table Rendering', 'Render large datasets efficiently', [
        'Closures', 'Memory Management', 'Rendering', 'Virtual DOM'
      ]),
      createMilestone('Virtualization', 'Implement windowing for 10k+ rows', [
        'DOM', 'Layout (Reflow)', 'Performance Optimization'
      ]),
      createMilestone('Memoization', 'Optimize re-renders with React.memo and useMemo', [
        'Closures', 'useMemo', 'useCallback', 'Reconciliation'
      ]),
      createMilestone('Sorting & Filtering', 'Add performant sorting and filtering', [
        'Event Loop', 'useMemo', 'Custom Hooks'
      ]),
      createMilestone('Column Resizing', 'Implement drag-to-resize columns', [
        'DOM', 'Layout (Reflow)', 'Paint'
      ])
    ],
    implementationGuide: [
      createPhase('Phase 1: Project Setup & Basic Table', [
        'Create new React + TypeScript project (or folder in existing project)',
        'Set up folder structure: components/DataTable/, hooks/, types/, utils/',
        'Define TypeScript interfaces: Column<T>, RowData, TableProps',
        'Create mock data generator function (10,000+ rows)',
        'Build basic <table> with <thead> and <tbody>',
        'Render all rows naively first (to see the performance problem)',
        'Open React DevTools Profiler and measure render time'
      ]),
      createPhase('Phase 2: Virtualization (Core Challenge)', [
        'Understand the concept: only render visible rows + small buffer',
        'Calculate container height (fixed viewport)',
        'Decide on row height strategy (fixed height is easier to start)',
        'Calculate total scrollable height: rowCount × rowHeight',
        'Create scrollable container with overflow-y: auto',
        'Add inner div with total height for scroll area',
        'Implement useVirtualization custom hook',
        'Calculate startIndex: Math.floor(scrollTop / rowHeight)',
        'Calculate endIndex: startIndex + visibleCount + buffer',
        'Calculate offsetY for positioning: startIndex × rowHeight',
        'Render only visible rows with transform: translateY(offsetY)',
        'Add onScroll listener to recalculate on scroll',
        'Test with 10,000+ rows - should be smooth 60fps'
      ]),
      createPhase('Phase 3: Memoization & Performance', [
        'Wrap TableRow component with React.memo()',
        'Define proper comparison function for memo if needed',
        'Use useMemo for sorted/filtered data arrays',
        'Use useMemo for column definitions',
        'Use useCallback for event handlers passed to rows',
        'Profile with React DevTools before and after',
        'Verify reduced re-renders in Profiler'
      ]),
      createPhase('Phase 4: Sorting', [
        'Add sortColumn and sortDirection to state',
        'Create clickable column headers',
        'Implement sort function with useMemo (don\'t mutate original)',
        'Handle ascending/descending toggle',
        'Add sort indicator icons to headers',
        'Test sorting doesn\'t break virtualization'
      ]),
      createPhase('Phase 5: Filtering', [
        'Add filter input above table',
        'Implement useDebounce hook (300ms delay)',
        'Filter data in useMemo before sorting',
        'Update row count display after filtering',
        'Handle empty results state',
        'Ensure virtualization recalculates on filter'
      ]),
      createPhase('Phase 6: Column Resizing', [
        'Store column widths in state',
        'Add resize handle div on column header borders',
        'Style handle with cursor: col-resize',
        'Track mousedown → mousemove → mouseup events',
        'Calculate new width: initialWidth + (currentX - startX)',
        'Set minimum column width constraint',
        'Apply widths to both header and body columns',
        'Test resizing doesn\'t cause layout thrashing'
      ]),
      createPhase('Phase 7: Polish & Edge Cases', [
        'Handle empty data state',
        'Handle loading state',
        'Add keyboard navigation (optional)',
        'Test with different data sizes (100, 1000, 10000, 100000)',
        'Add horizontal scrolling for many columns',
        'Write README documenting your approach',
        'Record a demo video/gif showing performance'
      ])
    ],
    startedAt: null,
    completedAt: null,
    dueDate: getWeekEndDate(2),
    weekStart: 1,
    weekEnd: 2,
    githubUrl: '',
    demoUrl: '',
    techStack: ['React', 'TypeScript'],
    notes: ''
  },
  {
    id: 'proj-command-palette',
    name: 'Command Palette',
    description: 'VS Code-style command palette with fuzzy search and keyboard navigation',
    milestones: [
      createMilestone('Keyboard Shortcuts', 'Cmd+K to open, arrow keys to navigate', [
        'DOM', 'Event Loop', 'useEffect'
      ]),
      createMilestone('Fuzzy Search', 'Implement fuzzy matching algorithm', [
        'Closures', 'useMemo', 'Custom Hooks'
      ]),
      createMilestone('Command Registry', 'Design extensible command system', [
        'Closures', 'Prototypes', 'Context API', 'State Management Patterns'
      ]),
      createMilestone('Recent Commands', 'Track and prioritize recent actions', [
        'Browser Cache', 'Custom Hooks', 'State Management Patterns'
      ]),
      createMilestone('Nested Commands', 'Support command hierarchies', [
        'Closures', 'Reconciliation', 'Component Architecture'
      ])
    ],
    implementationGuide: [
      createPhase('Phase 1: Modal & Keyboard Setup', [
        'Create CommandPalette component with modal overlay',
        'Style modal: centered, dark backdrop, rounded corners',
        'Add useEffect to listen for Cmd+K (Mac) / Ctrl+K (Windows)',
        'Implement open/close state management',
        'Add Escape key to close modal',
        'Prevent body scroll when modal is open',
        'Auto-focus search input when modal opens'
      ]),
      createPhase('Phase 2: Command Registry System', [
        'Define Command interface: { id, name, shortcut?, icon?, action, category? }',
        'Create CommandRegistry class or context',
        'Implement registerCommand(command) method',
        'Implement unregisterCommand(id) method',
        'Implement getCommands() method',
        'Create useCommands() hook to access registry',
        'Register sample commands (theme toggle, navigation, etc.)'
      ]),
      createPhase('Phase 3: Basic Search & Display', [
        'Display all commands in a scrollable list',
        'Add search input at top of modal',
        'Implement basic string matching filter',
        'Highlight matching text in results',
        'Group commands by category (optional)',
        'Show command shortcuts on the right side'
      ]),
      createPhase('Phase 4: Fuzzy Search', [
        'Understand fuzzy matching: characters in order, not consecutive',
        'Implement simple fuzzy match function from scratch',
        'Score results by match quality (consecutive chars = higher)',
        'Sort results by score descending',
        'Alternatively: integrate fuse.js for production quality',
        'Test with typos and partial matches'
      ]),
      createPhase('Phase 5: Keyboard Navigation', [
        'Track selectedIndex in state',
        'Add ArrowDown: increment selectedIndex',
        'Add ArrowUp: decrement selectedIndex',
        'Wrap around at list boundaries (optional)',
        'Add Enter: execute selected command',
        'Scroll selected item into view',
        'Add visual highlight for selected item'
      ]),
      createPhase('Phase 6: Recent Commands', [
        'Create useRecentCommands() hook',
        'Store recent command IDs in localStorage',
        'Limit to last 5-10 commands',
        'Show recent commands when search is empty',
        'Add "Recent" section header',
        'Update recents when command is executed'
      ]),
      createPhase('Phase 7: Nested Commands (Advanced)', [
        'Add children?: Command[] to Command interface',
        'Track navigation path/breadcrumb state',
        'Render child commands when parent is selected',
        'Add Backspace to go back to parent',
        'Show breadcrumb trail in modal header',
        'Add ">" indicator for commands with children'
      ]),
      createPhase('Phase 8: Polish', [
        'Add smooth open/close animations',
        'Add icons for common command types',
        'Handle empty search results state',
        'Add loading state for async commands',
        'Test accessibility (screen reader, focus trap)',
        'Document how to register new commands'
      ])
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
      createMilestone('Infinite Scroll', 'Intersection Observer-based loading', [
        'DOM', 'Browser Architecture', 'useEffect', 'Custom Hooks'
      ]),
      createMilestone('API Pagination', 'Cursor-based pagination', [
        'Promises', 'Async/Await', 'Network Stack'
      ]),
      createMilestone('Caching Layer', 'Implement request caching', [
        'Closures', 'Browser Cache', 'State Management Patterns'
      ]),
      createMilestone('Optimistic Updates', 'Like/comment with rollback', [
        'Promises', 'Error Handling & Boundaries', 'State Management Patterns'
      ]),
      createMilestone('Pull to Refresh', 'Mobile-style refresh gesture', [
        'DOM', 'Layout (Reflow)', 'useEffect'
      ])
    ],
    implementationGuide: [
      createPhase('Phase 1: Project Setup & Mock API', [
        'Set up project with React + TypeScript',
        'Define Post interface: { id, author, content, likes, comments, createdAt }',
        'Create mock API with artificial delay (simulate network)',
        'Implement getPosts(cursor, limit) returning { posts, nextCursor }',
        'Use cursor-based pagination (not offset-based)',
        'Generate 100+ mock posts for testing'
      ]),
      createPhase('Phase 2: Basic Feed Display', [
        'Create FeedPost component for individual posts',
        'Create Feed component to render list of posts',
        'Fetch initial posts on mount',
        'Display loading skeleton while fetching',
        'Style posts like social media cards',
        'Add author avatar, name, timestamp, content'
      ]),
      createPhase('Phase 3: Infinite Scroll with Intersection Observer', [
        'Create useInfiniteScroll custom hook',
        'Add sentinel element at bottom of feed',
        'Set up IntersectionObserver to watch sentinel',
        'Trigger loadMore when sentinel is visible',
        'Track hasNextPage and isFetching states',
        'Append new posts to existing list',
        'Show loading spinner during fetch',
        'Stop observing when no more pages'
      ]),
      createPhase('Phase 4: Caching Layer', [
        'Design cache structure: Map<string, { data, timestamp }>',
        'Implement cache.get(key) with TTL check',
        'Implement cache.set(key, data)',
        'Cache API responses by cursor',
        'Return cached data immediately, refetch in background (SWR pattern)',
        'Alternatively: integrate TanStack Query for production'
      ]),
      createPhase('Phase 5: Like Feature with Optimistic Updates', [
        'Add like button to FeedPost component',
        'Track liked state and like count',
        'On click: immediately update UI (optimistic)',
        'Send API request in background',
        'On success: confirm update',
        'On failure: rollback to previous state',
        'Show error toast on failure',
        'Debounce rapid clicks'
      ]),
      createPhase('Phase 6: Comments with Optimistic Updates', [
        'Add expandable comments section',
        'Create AddComment input component',
        'On submit: add comment to UI immediately',
        'Generate temporary ID for optimistic comment',
        'Send API request in background',
        'Replace temp ID with real ID on success',
        'Remove comment and show error on failure'
      ]),
      createPhase('Phase 7: Pull to Refresh', [
        'Track touch start Y position on mobile',
        'Calculate pull distance during touchmove',
        'Show pull indicator when threshold reached',
        'Trigger refresh on touchend if pulled enough',
        'Add pulling animation/indicator',
        'Prepend new posts to feed',
        'Reset scroll position after refresh'
      ]),
      createPhase('Phase 8: Edge Cases & Polish', [
        'Handle empty feed state',
        'Handle network error state with retry button',
        'Add post timestamp formatting (2h ago, Yesterday)',
        'Virtualize feed for better performance (optional)',
        'Test on mobile devices',
        'Add scroll position restoration on back navigation'
      ])
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
      createMilestone('Design Tokens', 'Define spacing, colors, typography', [
        'CSSOM', 'Design Systems'
      ]),
      createMilestone('Core Components', 'Button, Input, Select, Modal', [
        'Component Architecture', 'Custom Hooks', 'Context API'
      ]),
      createMilestone('Accessibility', 'ARIA attributes, keyboard navigation', [
        'DOM', 'Accessibility (a11y)'
      ]),
      createMilestone('Documentation', 'Storybook integration', [
        'Component Architecture', 'Design Systems'
      ]),
      createMilestone('Testing', 'Unit tests with Testing Library', [
        'DOM', 'Hooks Deep Dive', 'Component Architecture'
      ])
    ],
    implementationGuide: [
      createPhase('Phase 1: Project Setup & Design Tokens', [
        'Initialize project with Vite + React + TypeScript',
        'Install and configure Tailwind CSS',
        'Create tokens/ folder for design tokens',
        'Define color palette: primary, secondary, gray, semantic (error, success)',
        'Define spacing scale: 0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 48, 64',
        'Define typography scale: xs, sm, base, lg, xl, 2xl, 3xl',
        'Define border radius values: none, sm, md, lg, full',
        'Export tokens as CSS variables and/or Tailwind config'
      ]),
      createPhase('Phase 2: Button Component', [
        'Create Button component with TypeScript props interface',
        'Add variant prop: primary, secondary, outline, ghost, danger',
        'Add size prop: sm, md, lg',
        'Add disabled state styling',
        'Add loading state with spinner',
        'Support as prop for polymorphic rendering (button, a, Link)',
        'Add focus ring for accessibility',
        'Support left/right icon slots'
      ]),
      createPhase('Phase 3: Input Component', [
        'Create Input component with forwardRef for ref support',
        'Add label prop with proper htmlFor association',
        'Add error state with error message display',
        'Add helper text support',
        'Add disabled state',
        'Add left/right addon support (icons, text)',
        'Style focus state with ring',
        'Support all native input types'
      ]),
      createPhase('Phase 4: Select Component', [
        'Create Select component with options prop',
        'Support both controlled and uncontrolled modes',
        'Add placeholder option',
        'Add disabled state',
        'Add error state matching Input style',
        'Style the dropdown arrow consistently',
        'Consider building custom dropdown for better styling (advanced)'
      ]),
      createPhase('Phase 5: Modal Component', [
        'Create Modal with Portal (render outside DOM hierarchy)',
        'Add backdrop with click-to-close option',
        'Implement focus trap inside modal',
        'Add Escape key to close',
        'Prevent body scroll when open',
        'Add enter/exit animations',
        'Create Modal.Header, Modal.Body, Modal.Footer subcomponents',
        'Support different sizes: sm, md, lg, full'
      ]),
      createPhase('Phase 6: Accessibility Audit', [
        'Add proper ARIA roles to all components',
        'Ensure all interactive elements are focusable',
        'Test keyboard navigation for each component',
        'Verify color contrast meets WCAG AA (4.5:1)',
        'Add aria-label/aria-describedby where needed',
        'Test with screen reader (VoiceOver/NVDA)',
        'Add skip links if applicable'
      ]),
      createPhase('Phase 7: Storybook Documentation', [
        'Install and configure Storybook',
        'Create stories for each component',
        'Document all props with argTypes',
        'Add usage examples for each variant',
        'Show do\'s and don\'ts',
        'Add accessibility notes',
        'Configure Storybook addons: a11y, viewport, docs'
      ]),
      createPhase('Phase 8: Testing', [
        'Install Testing Library and Jest/Vitest',
        'Write unit tests for Button (click, disabled, loading)',
        'Write unit tests for Input (change, error, focus)',
        'Write unit tests for Select (selection, disabled)',
        'Write unit tests for Modal (open, close, focus trap)',
        'Test accessibility with jest-axe',
        'Aim for 80%+ coverage on core components'
      ])
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
      createMilestone('Drag & Drop', 'Implement drag-drop zone', [
        'DOM', 'useEffect', 'Custom Hooks'
      ]),
      createMilestone('Progress Tracking', 'Real-time upload progress', [
        'Event Loop', 'Promises', 'Async/Await', 'useEffect'
      ]),
      createMilestone('Chunked Upload', 'Large file chunking strategy', [
        'Memory Management', 'Promises', 'Network Stack', 'File Upload System'
      ]),
      createMilestone('Error Recovery', 'Retry failed uploads', [
        'Promises', 'Error Handling & Boundaries', 'State Management Patterns'
      ]),
      createMilestone('File Preview', 'Image/PDF preview before upload', [
        'Memory Management', 'DOM', 'useEffect'
      ])
    ],
    implementationGuide: [
      createPhase('Phase 1: Basic File Input & Drop Zone', [
        'Create DropZone component with styled div',
        'Add hidden file input with useRef',
        'Handle click on zone to trigger file input',
        'Listen to ondragenter, ondragover, ondragleave, ondrop events',
        'Prevent default browser behavior on drag events',
        'Add visual feedback: border color change on drag over',
        'Accept multiple files if needed',
        'Define accepted file types: accept prop on input'
      ]),
      createPhase('Phase 2: File Validation', [
        'Create validateFile(file) function',
        'Check file type against allowed types',
        'Check file size against maximum limit (e.g., 10MB)',
        'Display validation errors to user',
        'Create FileRejection interface for error details',
        'Show rejected files with reasons',
        'Allow removing rejected files from queue'
      ]),
      createPhase('Phase 3: Upload Queue Management', [
        'Define UploadFile interface: { id, file, status, progress, error }',
        'Create upload queue state as array',
        'Add files to queue on drop/select',
        'Display queue as list with file name, size, status',
        'Add remove button for each queued file',
        'Show pending, uploading, complete, error states',
        'Support clearing entire queue'
      ]),
      createPhase('Phase 4: Progress Tracking', [
        'Create uploadFile function with XMLHttpRequest or axios',
        'Use onUploadProgress callback for progress events',
        'Calculate percentage: (loaded / total) * 100',
        'Update queue item progress in real-time',
        'Display progress bar for each file',
        'Show upload speed (optional)',
        'Show estimated time remaining (optional)'
      ]),
      createPhase('Phase 5: Chunked Upload for Large Files', [
        'Define chunk size (e.g., 5MB)',
        'Split file into chunks using file.slice(start, end)',
        'Upload chunks sequentially or in parallel',
        'Track chunk progress for overall file progress',
        'Send chunk index and total chunks to server',
        'Handle chunk assembly on server side',
        'Resume from last successful chunk on retry'
      ]),
      createPhase('Phase 6: Error Handling & Retry', [
        'Catch upload errors (network, server)',
        'Set file status to error with message',
        'Display error state with retry button',
        'Implement retry function',
        'Add automatic retry with exponential backoff (optional)',
        'Limit retry attempts (e.g., 3 max)',
        'Allow canceling in-progress uploads'
      ]),
      createPhase('Phase 7: File Preview', [
        'Create preview for images using URL.createObjectURL',
        'Display thumbnail in queue list',
        'Revoke object URL on component unmount (memory!)',
        'Show file icon for non-image types',
        'Add PDF preview using pdf.js (optional)',
        'Show image dimensions for images',
        'Add full-size preview on click'
      ]),
      createPhase('Phase 8: Polish & UX', [
        'Add drag-and-drop from other apps',
        'Support paste from clipboard',
        'Show overall upload progress',
        'Add upload complete notification',
        'Handle offline state gracefully',
        'Test with various file types and sizes',
        'Document API contract for server'
      ])
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
      createMilestone('WebSocket Connection', 'Establish live data stream', [
        'Event Loop', 'Promises', 'Network Stack', 'Realtime Dashboard'
      ]),
      createMilestone('Chart Integration', 'Real-time updating charts', [
        'useMemo', 'useCallback', 'Performance Optimization', 'Dashboard Design'
      ]),
      createMilestone('Data Aggregation', 'Client-side data processing', [
        'Memory Management', 'useMemo', 'Custom Hooks'
      ]),
      createMilestone('Performance', 'Optimize for 60fps updates', [
        'Event Loop', 'Layout (Reflow)', 'Paint', 'Composite', 'Performance Optimization'
      ]),
      createMilestone('Offline Support', 'Handle connection drops gracefully', [
        'Browser Cache', 'Error Handling & Boundaries', 'State Management Patterns'
      ])
    ],
    implementationGuide: [
      createPhase('Phase 1: Project Setup & Mock Server', [
        'Set up React + TypeScript project',
        'Create simple WebSocket server (Node.js + ws library)',
        'Or use mock: setInterval to simulate incoming data',
        'Define data schema: { timestamp, metric, value }',
        'Generate realistic random data with trends',
        'Test connection with simple console.log'
      ]),
      createPhase('Phase 2: WebSocket Hook', [
        'Create useWebSocket(url) custom hook',
        'Handle connection states: connecting, connected, disconnected',
        'Implement connect, disconnect, send functions',
        'Parse incoming JSON messages',
        'Expose lastMessage and messageHistory',
        'Handle connection errors',
        'Return connection status for UI'
      ]),
      createPhase('Phase 3: Dashboard Layout', [
        'Create responsive grid layout for widgets',
        'Use CSS Grid or Tailwind grid',
        'Define Widget component wrapper',
        'Support different widget sizes: sm, md, lg',
        'Add widget header with title',
        'Create placeholder widgets for each metric',
        'Make layout responsive for mobile'
      ]),
      createPhase('Phase 4: Chart Integration', [
        'Install Recharts (or Chart.js / Victory)',
        'Create LineChart widget for time-series data',
        'Create BarChart widget for categories',
        'Create StatCard widget for single values',
        'Pass data from WebSocket to charts',
        'Format axis labels and tooltips',
        'Add loading state for initial data'
      ]),
      createPhase('Phase 5: Data Aggregation', [
        'Create useDataAggregator hook',
        'Store incoming data in circular buffer (limit memory)',
        'Calculate rolling averages',
        'Calculate min, max, current values',
        'Aggregate by time period (1m, 5m, 1h)',
        'Use useMemo for expensive calculations',
        'Only recalculate when data changes'
      ]),
      createPhase('Phase 6: Performance Optimization', [
        'Throttle incoming messages (max 60 updates/sec)',
        'Use requestAnimationFrame for batch updates',
        'Memoize chart components with React.memo',
        'Profile with React DevTools Profiler',
        'Check for layout thrashing in Performance tab',
        'Virtualize data points if charts have 1000+ points',
        'Consider web worker for heavy calculations'
      ]),
      createPhase('Phase 7: Reconnection Strategy', [
        'Detect WebSocket disconnect events',
        'Show connection status indicator',
        'Implement automatic reconnection',
        'Use exponential backoff (1s, 2s, 4s, 8s...)',
        'Set maximum retry limit',
        'Show reconnecting state in UI',
        'Resume data stream after reconnect'
      ]),
      createPhase('Phase 8: Offline Support', [
        'Cache last known data in localStorage',
        'Show stale data indicator when offline',
        'Display "last updated" timestamp',
        'Queue user actions while offline (if any)',
        'Sync when connection restored',
        'Handle browser online/offline events',
        'Show graceful degradation message'
      ]),
      createPhase('Phase 9: Polish', [
        'Add dark mode support',
        'Add time range selector (live, 1h, 24h)',
        'Add export data feature',
        'Add fullscreen mode for charts',
        'Add alerts for threshold breaches',
        'Test with various data rates',
        'Document WebSocket message format'
      ])
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
      createMilestone('Block System', 'Design block data structure', [
        'Prototypes', 'State Management Patterns', 'Component Architecture'
      ]),
      createMilestone('Rich Text', 'Bold, italic, links, code', [
        'DOM', 'useEffect', 'Custom Hooks'
      ]),
      createMilestone('Block Types', 'Headings, lists, code blocks', [
        'Component Architecture', 'Reconciliation'
      ]),
      createMilestone('Drag & Drop', 'Reorder blocks', [
        'DOM', 'Layout (Reflow)', 'State Management Patterns'
      ]),
      createMilestone('Slash Commands', '/ to insert block types', [
        'DOM', 'useEffect', 'Context API', 'Component Architecture'
      ]),
      createMilestone('Undo/Redo', 'Command history pattern', [
        'Closures', 'State Management Patterns', 'OOP Principles'
      ])
    ],
    implementationGuide: [
      createPhase('Phase 1: Block Data Structure', [
        'Define Block interface: { id, type, content, children? }',
        'Define block types: paragraph, heading1-3, bulletList, numberedList, code, quote',
        'Create initial document state as array of blocks',
        'Generate unique IDs for each block (uuid or nanoid)',
        'Design content structure for rich text (marks array)',
        'Consider nested blocks for lists (children array)'
      ]),
      createPhase('Phase 2: Basic Editor Rendering', [
        'Create Editor component with blocks state',
        'Create Block component with switch for block types',
        'Render contentEditable div for each text block',
        'Handle block focus and blur events',
        'Add placeholder text for empty blocks',
        'Style different block types (headings, quotes, etc.)'
      ]),
      createPhase('Phase 3: Text Editing', [
        'Handle onInput events to update block content',
        'Preserve cursor position after state updates',
        'Handle Enter key to create new block',
        'Handle Backspace on empty block to delete it',
        'Merge blocks when Backspace at start',
        'Handle selection across multiple blocks'
      ]),
      createPhase('Phase 4: Rich Text Formatting', [
        'Track text selection using window.getSelection()',
        'Create formatting toolbar (or use keyboard shortcuts)',
        'Implement bold: Cmd+B / Ctrl+B',
        'Implement italic: Cmd+I / Ctrl+I',
        'Implement code: Cmd+E / Ctrl+E',
        'Store formatting as marks: [{ type: "bold", start, end }]',
        'Render formatted text with spans',
        'Handle link insertion with URL prompt'
      ]),
      createPhase('Phase 5: Block Type Switching', [
        'Convert paragraph to heading on # + space',
        'Convert paragraph to bullet on - + space',
        'Convert paragraph to numbered on 1. + space',
        'Convert paragraph to code on ``` + enter',
        'Convert paragraph to quote on > + space',
        'Add keyboard shortcut Cmd+Shift+1/2/3 for headings'
      ]),
      createPhase('Phase 6: Slash Commands', [
        'Detect / typed at start of empty block',
        'Show command menu popup near cursor',
        'List available block types in menu',
        'Filter menu items as user types',
        'Keyboard navigation in menu (arrows, Enter)',
        'Insert selected block type on Enter',
        'Close menu on Escape or click outside'
      ]),
      createPhase('Phase 7: Drag and Drop', [
        'Add drag handle to each block',
        'Make blocks draggable (draggable attribute)',
        'Track dragstart, dragover, drop events',
        'Calculate drop position (above/below target)',
        'Show drop indicator line',
        'Reorder blocks array on drop',
        'Consider using dnd-kit for smoother UX'
      ]),
      createPhase('Phase 8: Undo/Redo', [
        'Create history stack: past, present, future arrays',
        'Push state to past on every change',
        'Implement undo: move present to future, pop from past',
        'Implement redo: move present to past, pop from future',
        'Add Cmd+Z for undo, Cmd+Shift+Z for redo',
        'Debounce history pushes (group rapid typing)',
        'Limit history size to prevent memory issues'
      ]),
      createPhase('Phase 9: Polish & Advanced', [
        'Add copy/paste handling for blocks',
        'Handle paste from external sources (HTML to blocks)',
        'Add block duplication (Cmd+D)',
        'Add block deletion shortcut',
        'Support nested blocks (indentation)',
        'Add image block type with upload',
        'Persist document to localStorage',
        'Consider integrating Slate.js for production robustness'
      ])
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
