// JavaScript Foundations content
import executionContext from './javascript-foundations/01-execution-context.md?raw';
import callStack from './javascript-foundations/02-call-stack.md?raw';
import scope from './javascript-foundations/03-scope.md?raw';
import lexicalScope from './javascript-foundations/04-lexical-scope.md?raw';
import closures from './javascript-foundations/05-closures.md?raw';
import eventLoop from './javascript-foundations/06-event-loop.md?raw';
import promises from './javascript-foundations/07-promises.md?raw';
import asyncAwait from './javascript-foundations/08-async-await.md?raw';
import thisKeyword from './javascript-foundations/09-this-keyword.md?raw';
import prototypes from './javascript-foundations/10-prototypes.md?raw';
import memoryManagement from './javascript-foundations/11-memory-management-expanded.md?raw';
import garbageCollection from './javascript-foundations/12-garbage-collection-expanded.md?raw';

// Browser Internals content
import browserArchitecture from './browser-internals/01-browser-architecture.md?raw';
import dom from './browser-internals/02-dom-learning-guide.md?raw';
import cssOM from './browser-internals/03-cssom-learning-guide.md?raw';

// Frontend Architecture content
import stateManagement from './frontend-architecture/01-state-management.md?raw';
import componentArchitecture from './frontend-architecture/02-component-architecture.md?raw';
import featureBasedArchitecture from './frontend-architecture/03-feature-based-architecture.md?raw';
import designSystems from './frontend-architecture/04-design-systems.md?raw';
import accessibility from './frontend-architecture/05-accessibility-a11y.md?raw';
import performanceOptimization from './frontend-architecture/06-performance-optimization.md?raw';
import errorHandlingAndBoundaries from './frontend-architecture/07-error-handling-and-boundaries.md?raw';

// Content organized by module
export const moduleContent: Record<string, TopicContent[]> = {
  'mod-js-foundations': [
    { topicName: 'Execution Context', content: executionContext, order: 1 },
    { topicName: 'Call Stack', content: callStack, order: 2 },
    { topicName: 'Scope', content: scope, order: 3 },
    { topicName: 'Lexical Scope', content: lexicalScope, order: 4 },
    { topicName: 'Closures', content: closures, order: 5 },
    { topicName: 'Event Loop', content: eventLoop, order: 6 },
    { topicName: 'Promises', content: promises, order: 7 },
    { topicName: 'Async/Await', content: asyncAwait, order: 8 },
    { topicName: 'this Keyword', content: thisKeyword, order: 9 },
    { topicName: 'Prototypes', content: prototypes, order: 10 },
    { topicName: 'Memory Management', content: memoryManagement, order: 11 },
    { topicName: 'Garbage Collection', content: garbageCollection, order: 12 },
  ],
  // Add other modules as content is created
  'mod-browser-internals': [{ topicName: 'Browser Architecture', content: browserArchitecture, order: 1 },
  { topicName: 'DOM', content: dom, order: 2 },
  { topicName: 'CSSOM', content: cssOM, order: 3 },
  ],
  'mod-react': [],
  'mod-nextjs': [],
  'mod-frontend-architecture': [
    { topicName: 'State Management', content: stateManagement, order: 1 },
    { topicName: 'Component Architecture', content: componentArchitecture, order: 2 },
    { topicName: 'Feature Based Architecture', content: featureBasedArchitecture, order: 3 },
    { topicName: 'Design Systems', content: designSystems, order: 4 },
    { topicName: 'Accessibility a11y', content: accessibility, order: 5 },
    { topicName: 'Performance Optimization', content: performanceOptimization, order: 6 },
    { topicName: 'Error Handling and Boundaries', content: errorHandlingAndBoundaries, order: 7 }
  ],
  'mod-system-design': [],
  'mod-engineering-breadth': [],
  'mod-dsa-practice': [],
};

export interface TopicContent {
  topicName: string;
  content: string;
  order: number;
}

// Get content for a specific module
export function getModuleContent(moduleId: string): TopicContent[] {
  return moduleContent[moduleId] || [];
}

// Get content for a specific topic by name
export function getTopicContent(moduleId: string, topicName: string): string | null {
  const topics = moduleContent[moduleId];
  if (!topics) return null;

  const topic = topics.find(t =>
    t.topicName.toLowerCase() === topicName.toLowerCase()
  );
  return topic?.content || null;
}

// Check if a module has learning content available
export function hasModuleContent(moduleId: string): boolean {
  const content = moduleContent[moduleId];
  return content && content.length > 0;
}

// Get all available modules with content
export function getModulesWithContent(): string[] {
  return Object.entries(moduleContent)
    .filter(([, topics]) => topics.length > 0)
    .map(([moduleId]) => moduleId);
}
