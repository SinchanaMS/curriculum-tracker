# Performance Optimization — Frontend Interview Guide

## Why It Matters

Frontend performance is about helping users see meaningful content quickly, interact without delay, and avoid unexpected layout movement. It is not simply about making a bundle smaller or getting a high Lighthouse score.

At an SDE2 / senior frontend level, interviewers want to hear a repeatable process:

1. **Measure** the experience and identify the bottleneck.
2. **Diagnose** whether the issue is network, JavaScript, rendering, images/fonts, third-party code, or data volume.
3. **Choose** an optimization that addresses the measured cause.
4. **Verify** the improvement under realistic conditions.
5. **Monitor** the experience after release.

> **Core principle: optimize the bottleneck you can demonstrate, not the one you assume exists.**

## Learning Map

```text
Performance Optimization
├── Measure
│   ├── Core Web Vitals
│   ├── Bundle analysis
│   └── Performance monitoring
├── Reduce work and bytes
│   ├── Code splitting and dynamic imports
│   ├── Tree shaking
│   ├── Image optimization
│   ├── Font loading
│   └── Third-party scripts
└── Keep interactions responsive
    ├── Virtualization
    ├── Debouncing and throttling
    └── Web Workers
```

---

# 1. Core Web Vitals: LCP, FID, and CLS

## What are Core Web Vitals?

Core Web Vitals are user-focused metrics that describe important parts of the real user experience. The three concepts in this study list are:

- **LCP — Largest Contentful Paint:** how quickly the largest visible image or text block in the viewport is rendered.
- **FID — First Input Delay:** how long the browser waits before it can begin processing a user's first interaction.
- **CLS — Cumulative Layout Shift:** how much visible content unexpectedly shifts during the page's lifetime.

**Important current terminology:** FID has been replaced by **INP (Interaction to Next Paint)** as a Core Web Vital. FID measured only the delay before the first interaction began processing. INP evaluates interaction responsiveness across the page, considering input delay, processing time, and presentation delay. Learn FID because it remains common in older interview material, but use INP when discussing current Core Web Vitals.

## Good metric ranges

| Metric | Good | Needs improvement | Poor |
|---|---:|---:|---:|
| LCP | ≤ 2.5 seconds | 2.5–4 seconds | > 4 seconds |
| INP | ≤ 200 ms | 200–500 ms | > 500 ms |
| CLS | ≤ 0.1 | 0.1–0.25 | > 0.25 |

These thresholds are evaluated at the 75th percentile of page visits, segmented by mobile and desktop where data is available. They are not guarantees for every individual visit.

FID's former thresholds were: good ≤ 100 ms, needs improvement 100–300 ms, poor > 300 ms. If an interviewer specifically asks about FID, explain that it measured the delay between the first user interaction and the browser beginning to process its event handler.

## 1.1 LCP — Largest Contentful Paint

LCP focuses on when the largest relevant content element in the viewport becomes visible. Common candidates include a hero image, a large poster image, or a large block of text.

### What can make LCP slow?

- A slow server response or slow initial document request.
- Render-blocking CSS or synchronous JavaScript.
- The browser discovering the important image late.
- An oversized or unoptimized image.
- A hero image loaded lazily even though it is visible immediately.
- Client-side rendering that delays meaningful content.
- Slow fonts when the LCP text depends on them.

### How to improve LCP

1. **Improve initial server response:** inspect TTFB, backend response time, caching, and CDN behavior.
2. **Make the LCP resource discoverable early:** avoid hiding a critical hero image behind delayed JavaScript or CSS background loading when an HTML image is more appropriate.
3. **Optimize the image:** use appropriate dimensions, modern formats, responsive sources, and compression.
4. **Prioritize critical content:** consider `fetchpriority="high"` for the actual LCP image when justified.
5. **Avoid lazy-loading the LCP image:** lazy loading is generally for off-screen images, not the primary image needed for the initial viewport.
6. **Reduce render-blocking work:** remove unused CSS, defer non-critical JavaScript, and inline only genuinely critical CSS when appropriate.
7. **Use caching and a CDN** where they improve delivery for the audience.

Example:

```html
<img
  src="/images/product-hero.webp"
  width="1440"
  height="900"
  fetchpriority="high"
  alt="Product dashboard"
/>
```

This is an illustrative example. The actual dimensions and priority should reflect the real image and measured loading behavior. Do not mark every image as high priority.

### LCP debugging checklist

- What element is the LCP candidate?
- Is the delay in server response, resource discovery, resource download, or rendering?
- Is the image unnecessarily large?
- Is the critical resource discovered early?
- Is JavaScript blocking rendering or delaying the content?
- Is the page relying on client-side fetching before showing its main content?

## 1.2 FID and INP — Responsiveness

A page can look loaded while still feeling slow if the main thread is busy.

JavaScript executes on the main thread along with much of the work involved in style calculation, layout, and painting. A long-running task can delay event handlers and rendering.

### FID versus INP

- **FID:** measured the input delay of the first qualifying interaction. It did not capture the full time until the resulting visual update appeared.
- **INP:** considers interaction responsiveness throughout a visit. It measures from an interaction through the next paint, capturing input delay, event processing, and presentation delay.

### Common causes of poor responsiveness

- Large JavaScript bundles that need parsing and execution.
- Long tasks during hydration or initialization.
- Expensive event handlers.
- Large React renders or repeated state updates.
- Heavy synchronous calculations on the main thread.
- Too many DOM nodes or expensive layout/paint work.
- Third-party scripts competing for main-thread time.

### How to improve responsiveness

- Split code so the browser does not have to load and execute every feature immediately.
- Break up long tasks into smaller chunks when possible.
- Move CPU-heavy, independent calculations to a Web Worker.
- Debounce or throttle high-frequency events where appropriate.
- Reduce unnecessary React rendering and expensive calculations.
- Virtualize very large lists.
- Delay non-essential third-party scripts.
- Measure the actual interaction using browser performance tooling.

Do not assume every slow interaction is a React problem. Use a performance trace to identify whether the time is spent waiting, executing JavaScript, rendering, or doing something else.

## 1.3 CLS — Cumulative Layout Shift

CLS measures unexpected movement of visible content. A page may have fast loading but still feel poor if buttons move just as users try to click them.

### Common causes

- Images or videos without reserved dimensions.
- Ads or embeds inserted without allocated space.
- Web fonts causing text to reflow.
- Content injected above existing content.
- UI banners appearing after initial render.
- Components changing size when asynchronous data arrives.

### How to improve CLS

Reserve space for media:

```html
<img
  src="/images/report-preview.webp"
  width="1200"
  height="800"
  alt="Report preview"
/>
```

Or reserve a responsive area using CSS:

```css
.report-preview {
  aspect-ratio: 3 / 2;
  width: 100%;
  object-fit: cover;
}
```

Other techniques:
- Reserve space for ads, embeds, skeletons, and asynchronous widgets.
- Avoid inserting new content above content the user is already reading unless the user initiated the change.
- Load fonts carefully and choose fallback metrics that reduce layout differences.
- Prefer animations using `transform` and `opacity` when appropriate instead of properties that trigger layout.
- Do not confuse all movement with a CLS issue: user-initiated changes and some animations are treated differently by the metric.

## How the metrics relate

```text
User opens a page
      ↓
LCP: Is meaningful main content visible quickly?
      ↓
User interacts
      ↓
INP: Does the interface respond promptly?
      ↓
Throughout the visit
      ↓
CLS: Does content stay visually stable?
```

### Interview answer: “How would you improve Core Web Vitals?”

> “I would first measure field data and identify which metric is failing for which pages and devices. For LCP, I’d inspect the critical resource, server response, image delivery, and render-blocking work. For INP, I’d profile slow interactions and look for long main-thread tasks, expensive handlers, or large renders. For CLS, I’d look for media without reserved dimensions, font swaps, and asynchronously inserted content. I’d verify the fix with both field and lab measurements rather than relying on one Lighthouse score.”

---

# 2. Code Splitting Strategies

## What is code splitting?

Code splitting divides an application's JavaScript into smaller chunks instead of delivering one large bundle to every user up front.

Without effective splitting:

```text
Initial page request
       ↓
Large JavaScript bundle
       ↓
Download + parse + compile + execute
       ↓
Page becomes interactive
```

With appropriate splitting:

```text
Initial page
   ↓
Critical application code
   ↓
User navigates to Reports
   ↓
Reports chunk loads when needed
```

The goal is to reduce the amount of JavaScript needed for the initial experience while keeping later navigation reliable.

## Common splitting strategies

### 1. Route-based splitting

Load the code for a route when that route is needed.

Examples:
- `/dashboard`
- `/reports`
- `/settings`
- `/admin`

An ordinary user may never visit the admin area, so its code should not necessarily be included in the initial route bundle.

### 2. Component-based splitting

Split large or expensive features that are not required immediately, such as:
- A rich text editor.
- A complex charting library.
- A map.
- A rarely opened settings panel.
- A large modal workflow.

### 3. Dependency/vendor splitting

Build tools may separate shared dependencies into chunks. This can improve caching, but the ideal chunk structure depends on the bundler, dependency graph, and application. Too many tiny chunks can increase request overhead or complicate loading.

## React route example

With a router that supports lazy route modules, load route code on demand. For a component-level example:

```tsx
import { lazy, Suspense } from "react";

const ReportsPage = lazy(() => import("./pages/ReportsPage"));

function App() {
  return (
    <Suspense fallback={<p>Loading reports…</p>}>
      <ReportsPage />
    </Suspense>
  );
}
```

`React.lazy` expects a dynamically imported module whose default export is the component. `Suspense` supplies a fallback while the lazy component's code is loading.

This code demonstrates the mechanism, not a complete route setup. In a real app, place boundaries intentionally and handle route-level loading and errors.

## How to choose a split point

Ask:
- Is this code required for the first visible screen?
- Is the feature rarely used or only opened after an action?
- Is it large enough to justify a separate chunk?
- Will splitting it delay a common interaction?
- Is there a suitable loading fallback?
- Can the chunk be prefetched when user intent is likely?

## Trade-offs

Benefits:
- Less initial JavaScript to download and execute.
- Better initial loading and potentially better responsiveness.
- More effective caching when chunks change independently.

Costs:
- Extra network requests and loading states.
- A feature can feel slower when first opened.
- More complex error handling and prefetching behavior.
- Poor split boundaries can duplicate dependencies or create excessive chunks.

> **Code splitting does not make code disappear; it changes when and how much of it must be loaded.**

---

# 3. Dynamic Imports

## What is a dynamic import?

A dynamic import loads a module asynchronously at runtime:

```js
const module = await import("./analytics.js");
module.initializeAnalytics();
```

Unlike a static import at the top of a module, `import()` returns a Promise. Modern bundlers commonly use it as a code-splitting boundary.

## React example: load a heavy feature on demand

```tsx
import { lazy, Suspense, useState } from "react";

const AnalyticsChart = lazy(() => import("./AnalyticsChart"));

export function AnalyticsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <button type="button" onClick={() => setOpen(true)}>
        View analytics
      </button>

      {open && (
        <Suspense fallback={<p>Loading chart…</p>}>
          <AnalyticsChart />
        </Suspense>
      )}
    </section>
  );
}
```

The chart module is requested when the lazy component is rendered. The exact timing depends on the bundler and component tree.

## Handling errors

A dynamic import can fail because of a network error, deployment mismatch, or unavailable chunk. `Suspense` handles the loading state, not the error state. Use an Error Boundary or another suitable error-handling strategy to display a recoverable message and provide a retry path when possible.

## When dynamic import is useful

- A heavy component is only shown after a user action.
- A route is rarely visited.
- A feature is conditionally needed.
- A library is used only for a specific workflow.

Avoid dynamically importing every small component. Excessive splitting can add overhead and create a worse experience for features users almost always need.

## Preloading and prefetching

Depending on the bundler/framework, code can sometimes be preloaded or prefetched before it is strictly needed. For example, an app might warm a likely next route on hover or when an intent signal occurs. This is a trade-off: it may improve perceived latency but can waste bandwidth and CPU if the user never visits the feature.

---

# 4. Tree Shaking

## What is tree shaking?

Tree shaking is a build-time optimization that removes unused exports and code from the production bundle when the bundler can safely prove they are unused.

For example:

```js
// math.js
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}
```

If an application imports only `add`, a compatible production build may remove `multiply`:

```js
import { add } from "./math.js";
```

## What makes tree shaking work well?

- Static ES module imports and exports (`import` / `export`).
- A bundler that supports tree shaking.
- Code with analyzable dependencies.
- Correct package metadata about side effects.
- Production build optimizations enabled.

## Side effects

A side effect is behavior that occurs merely because a module is evaluated, beyond providing exported values. Examples include modifying global state, registering a global handler, or importing a CSS file.

If a package incorrectly declares that it has no side effects, a bundler might remove code that the application actually needs. Conversely, unknown side effects can prevent safe elimination.

A package can use a `sideEffects` field in `package.json` to describe which files have side effects. This metadata must be accurate; do not mark a package as side-effect-free without checking its behavior.

## Tree shaking versus code splitting

| Tree shaking | Code splitting |
|---|---|
| Removes unused code from the output where safe. | Separates code into chunks that can load at different times. |
| Primarily reduces shipped code. | Primarily controls when code is loaded. |
| Usually a production build optimization. | Often created by dynamic imports or route boundaries. |

They can be used together.

## Common reasons a dependency remains large

- Importing a whole library when only a small part is needed.
- Using CommonJS packages that are harder for the bundler to analyze.
- Side effects that prevent removal.
- Importing from a package entry point that re-exports many modules in a way the build cannot eliminate.
- Misconfigured production builds.

Do not assume a named import guarantees that every unused byte is removed. Inspect the actual production output.

---

# 5. Bundle Analysis

## Why analyze a bundle?

A bundle is the JavaScript and related assets the build produces. Bundle analysis helps answer:
- Which dependencies contribute the most bytes?
- Are we shipping code a route does not need?
- Did a new package cause a size regression?
- Are shared chunks duplicated?
- Is the bundle large because of our code or third-party libraries?

A smaller bundle often helps, but **download size alone does not explain runtime performance**. JavaScript also has to be parsed, compiled, and executed, and a small bundle can still do expensive work.

## A practical workflow

1. Build a production bundle.
2. Generate a visualization or stats report using the tool appropriate to the bundler.
3. Identify large modules and dependencies.
4. Check whether the code is required on the initial route.
5. Look for duplicate versions or repeated dependencies.
6. Consider replacing, reducing, or lazily loading the expensive dependency.
7. Rebuild and compare the result.
8. Test actual loading and interaction behavior.

Common tooling includes:
- `webpack-bundle-analyzer` for Webpack.
- `rollup-plugin-visualizer` for Rollup-based builds and compatible tooling.
- Vite ecosystem bundle visualization plugins.
- Browser DevTools Network and Performance panels for the downloaded resources and runtime behavior.
- Lighthouse for a broader lab audit.

Exact commands and integration depend on the project setup.

## Example diagnosis

Suppose the initial bundle includes:
- Application shell: 120 KB
- Charting library: 450 KB
- Rich text editor: 380 KB
- Date utilities: 60 KB

These are illustrative numbers, not universal thresholds.

If the initial dashboard does not show a chart or editor, ask whether those dependencies can be split into feature chunks. If a chart is always visible above the fold, splitting it may only move the wait later rather than improve the experience.

## Track budgets

Teams can set budgets for:
- Initial JavaScript bytes.
- Route-level JavaScript.
- CSS size.
- Image payloads.
- Total transferred resources.
- Performance metrics in CI or field monitoring.

A budget should reflect the application and audience. The point is to detect regressions early, not to hit an arbitrary number without considering functionality.

### Interview answer: “How do you reduce bundle size?”

> “I would first inspect the production bundle rather than guessing. I’d identify large dependencies, duplicate modules, and code that is unnecessary for the initial route. Then I’d consider tree shaking, more targeted imports, dependency replacement, and route- or feature-level code splitting. I’d compare the built output and verify that the change improves real loading or responsiveness without making common workflows slower.”

---

# 6. Image Optimization

Images often make up a large fraction of the bytes downloaded by a page. Optimizing them can improve loading time, especially on mobile networks.

## Main techniques

### 1. Choose an appropriate format

- **AVIF / WebP:** often provide smaller files than older formats for photographic and many complex images.
- **JPEG:** still common for photographs and broadly supported.
- **PNG:** useful when lossless quality or alpha transparency is needed, though it can be large for photographs.
- **SVG:** useful for vector illustrations and icons when the content is suitable.
- **GIF:** often inefficient for modern animation; video or modern image formats may be better alternatives where appropriate.

Do not choose formats blindly. Check visual quality, transparency needs, animation requirements, and browser support for the product.

### 2. Serve the correct dimensions

Do not send a 3000-pixel-wide image to a 300-pixel-wide thumbnail if a smaller rendition will do.

Use responsive images:

```html
<img
  src="/images/team-800.webp"
  srcset="
    /images/team-400.webp 400w,
    /images/team-800.webp 800w,
    /images/team-1200.webp 1200w
  "
  sizes="(max-width: 600px) 100vw, 800px"
  width="800"
  height="533"
  alt="The product team working together"
/>
```

The browser uses `srcset` and `sizes` to select an appropriate candidate based on layout and device conditions.

### 3. Lazy-load off-screen images

```html
<img
  src="/images/customer-story.webp"
  loading="lazy"
  width="800"
  height="600"
  alt="Customer using the product"
/>
```

Lazy loading defers fetching until the image is near the viewport. Avoid lazy-loading images that are immediately visible and likely to be the LCP element.

### 4. Reserve layout space

Set intrinsic `width` and `height`, or use CSS `aspect-ratio`, to reduce layout shifts while the image loads.

### 5. Compress and cache

Use an image pipeline or CDN to:
- Compress images to a suitable quality level.
- Generate multiple sizes.
- Convert to modern formats where useful.
- Set sensible cache headers for versioned assets.

## Decorative versus informative images

- Informative images need useful alternative text.
- Decorative images should generally use `alt=""` so assistive technology can ignore them.
- Do not put essential text only inside an image if it can be real text.
- Avoid using a generic filename or “image of” in every alt value; describe the meaningful information in context.

## Common mistakes

- Sending full-resolution assets to every device.
- Lazy-loading the hero image.
- Forgetting dimensions and causing CLS.
- Compressing so aggressively that visual quality becomes poor.
- Using CSS background images for content that needs meaningful alternative text.
- Optimizing file size while ignoring the number of images or when they load.

---

# 7. Font Loading Strategies

Fonts affect both visual quality and performance. They can delay text rendering, increase downloaded bytes, and cause layout shifts when the fallback font is replaced.

## Common strategies

### 1. Use modern font formats and subset fonts

WOFF2 is widely used for web fonts and often compresses well. If the font family supports subsets, load only the characters and weights the application needs. Avoid shipping many weights when the design uses only two.

### 2. Use `font-display`

```css
@font-face {
  font-family: "Product Sans";
  src: url("/fonts/product-sans.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}
```

`font-display: swap` allows fallback text to render quickly and swaps in the web font when available. It improves text availability but can cause a visual change or layout shift if the fallback metrics differ.

Other values such as `optional` and `fallback` have different behavior. Choose based on the desired trade-off rather than treating one value as universally best.

### 3. Preload only critical fonts

```html
<link
  rel="preload"
  href="/fonts/product-sans-regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

Preloading can help when the font is needed early, but it competes with other critical resources. Do not preload every font weight or a font used only on a later route.

### 4. Reduce layout shift

- Use a fallback font with similar metrics.
- Consider CSS font metric overrides such as `size-adjust`, `ascent-override`, and `descent-override` when appropriate and supported.
- Reserve layout space when a font change could significantly alter a component.
- Avoid loading many font families and weights.

### 5. Consider system fonts

A system font stack can reduce network requests and avoid web-font loading delays. It may be a good choice when branding does not require a specific font.

## How to diagnose font problems

- Inspect the Network panel for font requests and file sizes.
- Check whether the browser delays text or swaps fonts.
- Measure whether the font is on the critical rendering path.
- Observe CLS around font loading.
- Check if fonts are downloaded unnecessarily on routes that do not use them.

### Interview takeaway

> “I’d keep the font payload small, use WOFF2 and only the weights/subsets needed, choose a font-display strategy deliberately, and preload only truly critical fonts. I’d also compare fallback and web-font metrics because making text appear sooner can still create layout shifts when the font swaps.”

---

# 8. Third-Party Script Loading

Third-party scripts include analytics, chat widgets, advertising, experimentation tools, maps, video embeds, and support tools.

They can add:
- Network requests and connection setup.
- JavaScript download, parsing, and execution.
- Main-thread contention.
- Layout shifts from inserted UI.
- Privacy and reliability dependencies.
- Failures that affect the page even when the core application is healthy.

## Script loading options

### `async`

```html
<script async src="https://example.com/analytics.js"></script>
```

The browser fetches the script without blocking HTML parsing, then executes it as soon as it is ready. Execution order among async scripts is not guaranteed. An async script can still interrupt the main thread when it executes.

### `defer`

```html
<script defer src="/scripts/app.js"></script>
```

For classic external scripts, `defer` fetches in parallel with HTML parsing and executes after parsing, preserving order among deferred classic scripts. Deferred scripts execute before `DOMContentLoaded`. Module scripts have their own deferred-like default behavior; understand the actual script type.

### `async` versus `defer`

| `async` | `defer` |
|---|---|
| Executes as soon as the script is downloaded. | Executes after HTML parsing completes. |
| Execution order is not guaranteed between async scripts. | Deferred classic scripts preserve document order. |
| Good for independent scripts where order does not matter. | Useful for scripts that depend on the parsed document or need ordered execution. |

Neither attribute makes script execution free. They mainly change fetching and execution timing.

## Strategies for third-party code

1. Audit which scripts are actually used and remove abandoned integrations.
2. Load non-essential tools after the critical content is available.
3. Load chat, maps, editors, or video embeds on user interaction when appropriate.
4. Reserve space for widgets to avoid CLS.
5. Use the framework's script-loading mechanism when it provides better scheduling and deduplication.
6. Measure their contribution in browser traces and field data.
7. Handle failure gracefully; the core product should not unnecessarily depend on an analytics script.
8. Consider privacy, consent, security, and content-security policy alongside performance.

## Example: load a widget on demand

Instead of initializing a heavy map on every page load, render a lightweight preview and load the map library after the user chooses to open the map. This can improve initial loading, but the first map interaction will have a delay. A preview or intentional loading state can make that trade-off clear.

### Interview takeaway

> “I inventory third-party scripts, measure their network and main-thread cost, remove unused integrations, and defer or load non-essential widgets on demand. I also reserve layout space and make sure the core application remains usable if a third-party service fails.”

---

# 9. Virtualization for Long Lists

## The problem

Rendering thousands of rows can be expensive even if the data is already loaded. Each DOM node can add memory usage, style calculation, layout, paint, and reconciliation work.

For example, rendering 10,000 table rows with several cells and controls per row can produce a very large DOM tree.

## What is virtualization?

Virtualization (also called windowing) renders only the visible items plus a small buffer, rather than rendering every item at once.

```text
10,000 records in data
          ↓
Viewport shows 20 rows
          ↓
Render visible rows + small overscan
          ↓
Reuse/update rendered rows while scrolling
```

The user can scroll through the full dataset, but only a subset of items is mounted at any moment.

## Pagination versus virtualization

- **Pagination** divides data into pages and shows a subset per page.
- **Virtualization** limits the rendered DOM to the visible window while allowing scrolling through a larger sequence.
- **Server-side pagination** also limits how much data is fetched from the server.
- They can be combined: fetch a page or chunk of records, then virtualize the rendered rows.

Virtualization does not automatically reduce API payload size or data-processing costs. It primarily reduces rendering and DOM work.

## When is virtualization useful?

- Large tables.
- Long chat histories.
- Activity feeds.
- Search result lists.
- Large menus or pickers.
- Any repeated UI where DOM size is a measured bottleneck.

It is often unnecessary for a short list. Virtualization adds complexity around variable row heights, accessibility, keyboard navigation, sticky headers, measuring, and scroll position.

## Conceptual example

Libraries such as `react-window` and TanStack Virtual can calculate which items should be rendered based on scroll position. Exact APIs vary by library version.

```tsx
// Conceptual pseudocode, not a drop-in library API:
const visibleItems = getItemsInViewport({
  scrollTop,
  viewportHeight,
  itemHeight,
  overscan: 5,
});

return (
  <div style={{ height: totalHeight, position: "relative" }}>
    {visibleItems.map(({ item, index, offset }) => (
      <div
        key={item.id}
        style={{
          position: "absolute",
          top: offset,
          height: itemHeight,
        }}
      >
        <Row item={item} />
      </div>
    ))}
  </div>
);
```

The full scrollable height is preserved, while only visible rows are rendered at their calculated offsets. Production libraries handle many tricky details that this conceptual example omits.

## Important trade-offs

- Stable keys are essential.
- Variable-height rows require measurement or estimates.
- Focused elements may be unmounted when scrolled away; plan keyboard and focus behavior carefully.
- Screen readers may only encounter the currently rendered window, so semantics and announcements need testing.
- Browser find-in-page may not find content that is not mounted.
- Scroll restoration and sticky headers need care.

### Interview answer: “How would you optimize a table with 10,000 rows?”

> “I’d first determine whether the bottleneck is data fetching, filtering, row rendering, or DOM size. I’d consider server-side pagination or filtering if the data payload is large, and virtualization if rendering thousands of DOM rows is the problem. I’d profile before adding memoization, keep row keys stable, and test keyboard navigation and screen-reader behavior because virtualization changes which rows exist in the DOM.”

---

# 10. Debouncing and Throttling

Both techniques limit how often a function runs in response to frequent events, but they behave differently.

## Debouncing

Debouncing waits until events have stopped for a specified period, then invokes the function.

Useful for:
- Search input that triggers API requests.
- Autosave after typing pauses.
- Validation that should happen after input settles.
- Resizing work where only the final dimensions matter.

```js
function debounce(callback, delay) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

const searchAfterPause = debounce((query) => {
  fetchResults(query);
}, 300);
```

If the user types continuously, the callback keeps getting postponed until there is a pause. This basic implementation omits cancellation and lifecycle cleanup, which production code should consider.

## Throttling

Throttling limits execution to at most once per interval (depending on the chosen implementation), even if events continue to fire.

Useful for:
- Scroll-related calculations.
- Pointer movement tracking.
- Repeated event handling where periodic updates are enough.

```js
function throttle(callback, interval) {
  let lastRun = 0;

  return (...args) => {
    const now = Date.now();

    if (now - lastRun >= interval) {
      lastRun = now;
      callback(...args);
    }
  };
}
```

This is a simple leading-edge throttle. It does not guarantee a final invocation after events stop. Other implementations can use timers to provide trailing-edge behavior.

## Debounce versus throttle

| Debounce | Throttle |
|---|---|
| Waits for a pause in events. | Limits frequency while events continue. |
| Good for search after typing settles. | Good for periodic work during continuous scrolling. |
| May not run while events keep arriving. | Can run periodically during the event stream. |

## React considerations

Avoid recreating a debounced function on every render if doing so resets its timer or loses its internal state. In React, keep the debounced function stable where appropriate and clean up pending timers on unmount. Ensure it uses the latest relevant callback or values, and consider request cancellation for network search.

Also distinguish **debouncing the API call** from **debouncing the visible input value**. The input should normally update immediately so typing feels responsive; the side effect can wait.

### Interview takeaway

> “I debounce work when I want to act after a burst of events settles, such as sending a search request after typing. I throttle work when I need periodic updates during continuous events, such as scroll tracking. I also handle cleanup and stale values in React, and use cancellation or request ordering to prevent outdated search responses from overwriting newer ones.”

---

# 11. Web Workers for Heavy Tasks

## What is the main thread?

The main thread runs JavaScript for the page and participates in event handling and much of the work involved in rendering. If a CPU-heavy calculation occupies it for a long time, input and visual updates may be delayed.

Examples of potentially expensive tasks:
- Parsing or transforming a large dataset.
- Complex calculations.
- Processing large files.
- Certain image or data transformations.
- CPU-heavy filtering or indexing.

The actual suitability depends on data size, algorithm cost, browser capabilities, and how frequently the work runs.

## What is a Web Worker?

A Web Worker runs JavaScript in a background worker thread, separate from the page's main thread. It cannot directly manipulate the DOM. The main thread and worker communicate using messages.

```text
Main thread
   │ postMessage(input)
   ▼
Web Worker
   │ compute result
   ▼
Main thread
   │ update UI
   ▼
Browser renders
```

This can keep the UI responsive while a CPU-heavy task runs.

## Worker example

Main thread:

```js
const worker = new Worker(
  new URL("./calculate.worker.js", import.meta.url),
  { type: "module" }
);

worker.postMessage({ numbers: [1, 2, 3, 4] });

worker.onmessage = (event) => {
  console.log("Result:", event.data);
};

worker.onerror = (error) => {
  console.error("Worker failed:", error);
};
```

Worker file (`calculate.worker.js`):

```js
self.onmessage = (event) => {
  const { numbers } = event.data;

  const total = numbers.reduce((sum, value) => sum + value, 0);

  self.postMessage(total);
};
```

This example uses a small calculation for clarity. A Worker is not worth the setup for every tiny task; it becomes useful when the work is heavy enough that moving it off the main thread outweighs messaging and data-transfer overhead.

## Communication and performance

- `postMessage` commonly uses structured cloning, which can copy data.
- Large data copies can be expensive.
- Transferable objects such as `ArrayBuffer` can transfer ownership instead of copying in supported scenarios.
- Shared memory options exist but require careful synchronization and are not necessary for most applications.
- Workers have their own lifecycle and memory costs.

Workers are not a solution for DOM rendering or React component updates because they cannot directly manipulate the document. They are best for calculations and processing that can be separated from UI work.

## How to decide

1. Use a Performance trace to confirm long main-thread tasks.
2. Check whether the work is CPU-bound and independent of the DOM.
3. Optimize the algorithm first if possible.
4. Move suitable heavy work to a Worker.
5. Minimize transferred data and reuse a worker if repeated tasks justify it.
6. Handle errors and terminate workers when they are no longer needed.
7. Measure interaction responsiveness after the change.

### Interview takeaway

> “I’d use a Web Worker for CPU-heavy work that can run independently of the DOM, such as processing a large dataset. It keeps that computation off the main thread, but introduces messaging, serialization, and lifecycle overhead. I’d first profile and optimize the algorithm, then verify that the worker actually improves responsiveness.”

---

# 12. Performance Monitoring

Optimization is incomplete if it is measured only on a developer's laptop. Production users have different devices, networks, geographic locations, browser extensions, and data volumes.

## Lab data versus field data

### Lab data

Collected in a controlled or repeatable test environment, for example:
- Lighthouse runs.
- Chrome DevTools performance recordings.
- Local production builds with CPU/network throttling.
- Automated browser tests.

Useful for:
- Reproducing problems.
- Comparing changes under similar conditions.
- Inspecting detailed traces.
- Finding likely causes.

Limitations:
- May not represent actual users, devices, traffic, or behavior.

### Field data / Real User Monitoring (RUM)

Collected from real page visits, using browser APIs or a monitoring service.

Useful for:
- Seeing real-world performance distributions.
- Segmenting by device, browser, route, or connection where appropriate.
- Understanding the 75th percentile of Core Web Vitals.
- Detecting regressions after release.

Limitations:
- Results vary with traffic, sampling, privacy constraints, and user conditions.
- Field data may tell you that a metric is poor without immediately explaining why.

A mature performance practice uses both: field data identifies real problems; lab tools help reproduce and diagnose them.

## Useful monitoring tools

- **Chrome DevTools Performance panel:** main-thread tasks, rendering, layout, scripting, and traces.
- **Network panel:** resource sizes, priorities, request timing, caching, and waterfalls.
- **Lighthouse:** lab audits and opportunities for improvement.
- **PageSpeed Insights:** lab results plus available field data for a URL or origin.
- **Chrome UX Report (CrUX):** aggregated real-user experience data for eligible sites.
- **web-vitals library:** measures Web Vitals in the browser and can send results to a monitoring endpoint.
- **Application monitoring / RUM platforms:** can combine performance metrics with route, release, and error information.

Tool capabilities and available data vary; do not assume every URL has field data.

## Example: collect Web Vitals

A simplified pattern using the `web-vitals` package:

```js
import { onCLS, onINP, onLCP } from "web-vitals";

function sendToAnalytics(metric) {
  // Send only the fields your monitoring system needs.
  // Include a route/release identifier where appropriate.
  navigator.sendBeacon(
    "/analytics/web-vitals",
    JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
    })
  );
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
```

This is illustrative. A production implementation should validate the endpoint, handle payload and privacy requirements, avoid sending sensitive data, and follow the library's recommended patterns for attribution and delivery. `sendBeacon` can fail or be unavailable in some circumstances, so monitoring systems may need a fallback.

## What should you monitor?

- Core Web Vitals, especially at the 75th percentile.
- Initial JavaScript and CSS transfer sizes.
- Resource loading and server response time.
- Long tasks and slow interactions.
- Errors in dynamic chunk loading.
- Route-level performance.
- Performance differences across releases, devices, and network conditions.

Avoid collecting unnecessary personal data. Performance telemetry should follow the application's privacy and consent requirements.

## A repeatable optimization workflow

```text
Observe a real performance problem
             ↓
Identify affected route, users, and metric
             ↓
Reproduce with lab tools
             ↓
Inspect the trace / network waterfall
             ↓
Form a specific hypothesis
             ↓
Make one targeted change
             ↓
Compare before and after
             ↓
Release and monitor field data
```

### Interview answer: “How do you monitor performance in production?”

> “I’d combine field monitoring with lab diagnostics. Field data tells me how real users experience the application and whether the 75th-percentile Core Web Vitals are healthy. When a metric regresses, I’d reproduce the route or interaction in DevTools, inspect network and main-thread traces, make a targeted change, and compare the result. I’d also track release-level regressions and avoid collecting unnecessary personal data.”

---

# 13. Putting It Together: Diagnose by Symptom

| Symptom | First places to investigate | Potential strategies |
|---|---|---|
| Main content appears late | LCP element, TTFB, image request, render-blocking CSS/JS | Improve delivery, optimize image, prioritize critical resource, reduce blocking work |
| Page loads but clicks feel delayed | INP attribution, long tasks, event handlers, React renders | Split work, reduce computation, Worker, reduce renders, defer third-party code |
| Content jumps during loading | CLS sources, image dimensions, fonts, injected content | Reserve space, adjust font loading, avoid unexpected insertion |
| Initial JavaScript is large | Production bundle report, import graph | Tree shaking, targeted imports, code splitting, dependency reduction |
| Table scroll is sluggish | DOM size, row rendering, profiling | Virtualization, pagination, simpler rows, targeted memoization |
| Search sends too many requests | Input event flow and network trace | Debounce requests, cancel stale requests, deduplicate or cache |
| Scrolling causes repeated expensive work | Event handlers and performance trace | Throttle, use passive listeners where appropriate, reduce layout reads/writes |
| Page is slow only on real devices | Field data by device/network/route | Reduce JS work and bytes, optimize images/fonts, improve caching and delivery |
| A feature opens slowly after splitting | Chunk timing and feature usage | Better fallback, prefetch on intent, adjust split point |
| Third-party widget causes regressions | Script timing and main-thread activity | Remove, defer, lazy-load, reserve space, isolate failure |

---

# 14. Common Performance Optimization Mistakes

1. **Optimizing without measuring.** A change can add complexity without fixing the bottleneck.
2. **Treating Lighthouse as the whole truth.** Lab scores are useful but do not replace field data.
3. **Confusing FID with current Core Web Vitals.** Know that INP replaced FID.
4. **Lazy-loading the LCP image.** This can delay the most important visible content.
5. **Preloading everything.** Critical resource priority is a limited resource; over-preloading creates competition.
6. **Code-splitting too aggressively.** Common interactions may become slower because they wait for chunks.
7. **Assuming tree shaking removes every unused byte.** Verify the production build and package side effects.
8. **Optimizing only bundle bytes.** Parsing, execution, layout, and network conditions also matter.
9. **Virtualizing without checking accessibility.** Off-screen rows may be unmounted, changing navigation and screen-reader behavior.
10. **Debouncing the visible input itself.** Keep typing responsive; debounce the expensive side effect where appropriate.
11. **Using Workers for tiny tasks.** Messaging and lifecycle overhead can outweigh the benefit.
12. **Loading third-party scripts indiscriminately.** They compete for bandwidth and main-thread time.
13. **Ignoring image dimensions.** Large images affect loading; missing dimensions can cause layout shifts.
14. **Preloading every font weight.** This wastes bandwidth and can delay more important resources.
15. **Making multiple changes without a baseline.** It becomes difficult to know which change helped or regressed performance.

---

# 15. Questions You Should Be Able to Answer

## Fundamentals and metrics
1. What is frontend performance optimization?
2. What are Core Web Vitals?
3. What do LCP, FID, CLS, and INP measure?
4. Why was FID replaced by INP?
5. What are the good thresholds for LCP, INP, and CLS?
6. What is the difference between lab and field data?
7. What does the 75th percentile mean for Core Web Vitals?

## JavaScript delivery
8. What is code splitting?
9. What is route-based versus component-based splitting?
10. What is a dynamic import?
11. How do `React.lazy` and `Suspense` work?
12. What is tree shaking?
13. How can side effects prevent tree shaking?
14. How do you analyze a production bundle?
15. What trade-offs can code splitting introduce?

## Resources and rendering
16. How would you optimize an LCP image?
17. When should images be lazy-loaded?
18. How do `srcset` and `sizes` work?
19. How can font loading affect LCP and CLS?
20. When would you use `font-display: swap`?
21. What is the difference between `async` and `defer`?
22. How do third-party scripts affect performance?

## Runtime performance
23. What is virtualization, and when would you use it?
24. Virtualization versus pagination?
25. Debouncing versus throttling?
26. How would you avoid stale search results in a debounced React search?
27. What is a Web Worker, and what can it not do?
28. How do you investigate a long main-thread task?
29. How would you optimize a slow table with thousands of rows?

## Monitoring and scenarios
30. How would you investigate poor LCP?
31. How would you investigate poor INP?
32. How would you investigate CLS?
33. How do you monitor performance after deployment?
34. How would you set a bundle budget?
35. How do you verify that an optimization actually helped?
36. How would you prioritize performance work when time is limited?

---

# 16. Senior-Level Mental Model

Do not memorize rules such as:

```text
Smaller bundle = always faster
Lazy loading = always better
Memoization = always faster
Web Worker = always better
Lighthouse score = complete performance picture
```

Instead, reason about the bottleneck and trade-offs.

Ask:

```text
What does the user perceive as slow?
              ↓
Which metric or interaction captures that problem?
              ↓
Can I reproduce it and inspect a trace?
              ↓
Is the bottleneck network, CPU, rendering, layout, or data volume?
              ↓
Which change targets that specific bottleneck?
              ↓
What new cost or delay could that change introduce?
              ↓
How will I compare before and after?
              ↓
How will I monitor it in production?
```

This is the reasoning interviewers are looking for: measurement, diagnosis, targeted changes, and evidence.

---

# 17. Final Interview Summary

A strong frontend engineer should be able to explain that:

- LCP measures when the largest visible content renders; improve critical resource discovery, delivery, and render-blocking work.
- FID is a legacy Core Web Vital; INP is the current responsiveness metric and considers interactions throughout a visit.
- CLS measures unexpected visual movement; reserve space and manage fonts and asynchronous content carefully.
- Code splitting separates code into chunks that can load at different times; choose split points based on user journeys.
- Dynamic imports can load a feature on demand, but require loading and error states.
- Tree shaking removes unused code when the build can safely identify it; module format and side effects matter.
- Bundle analysis provides evidence about which dependencies and modules contribute to the production output.
- Responsive images, suitable formats, compression, caching, and careful lazy loading reduce image cost.
- Font strategies balance early text rendering, visual consistency, bandwidth, and layout stability.
- Third-party scripts can compete for network and main-thread resources; audit, defer, and load on demand where suitable.
- Virtualization reduces DOM work for long lists but does not automatically reduce data fetching and can complicate accessibility.
- Debouncing waits for events to settle; throttling limits how often work runs during continuous events.
- Web Workers move suitable CPU-heavy work off the main thread but add messaging and lifecycle overhead.
- Production monitoring and lab diagnostics complement each other.
- Every optimization should be validated with before-and-after measurements and monitored after release.

## The Core Interview Answer

When asked how you optimize a frontend, explain your process:

> “I start with real-user metrics and profiling instead of applying generic optimizations. I identify whether the bottleneck is initial resource delivery, JavaScript execution, rendering, layout stability, or large amounts of data. I make a targeted change—such as optimizing the LCP image, splitting a heavy route, virtualizing a large table, or moving a calculation to a Worker—then compare results under similar conditions. Finally, I monitor field data to confirm that the improvement benefits users without introducing regressions elsewhere.”
