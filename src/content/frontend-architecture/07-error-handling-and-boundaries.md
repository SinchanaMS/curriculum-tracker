# Error Handling & Boundaries

> Frontend interview study guide — React, TypeScript, browser APIs, and production applications.

## Checklist

- [ ] Error boundaries basics
- [ ] Error boundary placement
- [ ] Fallback UI design
- [ ] Error recovery patterns
- [ ] Logging and reporting
- [ ] Sentry / LogRocket integration
- [ ] Network error handling
- [ ] Retry strategies
- [ ] Graceful degradation
- [ ] Feature detection
- [ ] Error states in UI

## 1. The mental model

Error handling is not just displaying an error message. A robust frontend should **detect, classify, contain, communicate, recover, observe, and prevent** failures.

| Failure | Example | Typical handling |
|---|---|---|
| Render/programming error | Component reads a property from `undefined` | Error boundary + report |
| Network error | Request times out | Request-level state; retry if safe |
| Validation error | Invalid email | Inline field feedback |
| Authentication | `401` | Session refresh/sign-in flow |
| Authorization | `403` | Explain lack of permission |
| Not found | `404` | Not-found state |
| Rate limit | `429` | Back off; respect `Retry-After` |
| Server failure | `5xx` | Temporary failure state; cautious retry |
| Unsupported capability | Browser lacks an API | Feature detection + fallback |
| Partial failure | Recommendations fail, product page works | Degrade only that feature |

**Interview framing:** “I separate expected operational failures, such as failed requests or invalid input, from unexpected programming errors. Each category needs a different recovery path, but both should result in useful user feedback and appropriate observability.”

## 2. Error boundaries basics

### What is an error boundary?

A React error boundary catches errors thrown while rendering its descendant component tree and during certain React-managed lifecycle work. It renders fallback UI rather than letting that failed subtree take down the rest of the React tree.

React's standard boundary API uses a class component:

- `static getDerivedStateFromError(error)` updates state so the next render displays fallback UI.
- `componentDidCatch(error, info)` is the place to report the error and component stack.

```tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, {
      operation: "react_render",
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <section role="alert">
          <h2>Something went wrong.</h2>
          <p>Try reloading this section.</p>
        </section>
      );
    }

    return this.props.children;
  }
}
```

Usage:

```tsx
<ErrorBoundary fallback={<ChartFallback />}>
  <RevenueChart />
</ErrorBoundary>
```

### What boundaries catch

They are intended for errors in descendant rendering and certain lifecycle work.

### What boundaries do not catch

They are **not** a universal `try/catch`. They generally do not catch:

- Errors in event handlers.
- Errors in asynchronous callbacks such as `setTimeout`.
- Rejected promises by themselves.
- Errors during server-side rendering.
- Errors thrown by the boundary itself.
- Errors outside the boundary's descendant tree.

Handle event handlers and async operations explicitly:

```tsx
async function handleSave() {
  setSaving(true);
  setError(null);

  try {
    await saveChanges();
  } catch (error) {
    setError("We couldn't save your changes. Try again.");
    reportError(error, { operation: "save_changes" });
  } finally {
    setSaving(false);
  }
}
```

A rejected data-fetching promise does not automatically become a render error. Catch it in the data layer or deliberately integrate it with an error-boundary mechanism.

### Function components?

A function component cannot implement React's standard boundary lifecycle methods itself. Use a small class boundary or a maintained library such as `react-error-boundary` if you want a more ergonomic API for function components.

### When should you use one?

Use boundaries for UI subtrees that can fail independently: charts, rich-text editors, third-party widgets, routes, or feature areas. Do not use them as a substitute for normal validation, network error states, or explicit handling in event handlers.

## 3. Error boundary placement

Boundary placement is an architecture decision. Too few boundaries can let a small bug remove too much UI; too many can fragment the experience.

| Level | Example | Benefit |
|---|---|---|
| Root/application | Main app shell | Last-resort fallback |
| Route/page | Customer details page | Contains page-level render failure |
| Feature | Billing panel or editor | Other features remain usable |
| Widget | Chart, map, third-party widget | One widget can fail independently |

```tsx
function Dashboard() {
  return (
    <AppLayout>
      <CustomerSummary />

      <ErrorBoundary fallback={<RevenuePanelFallback />}>
        <RevenuePanel />
      </ErrorBoundary>

      <ErrorBoundary fallback={<ActivityPanelFallback />}>
        <ActivityPanel />
      </ErrorBoundary>
    </AppLayout>
  );
}
```

Placement principles:

1. Keep a root boundary as a safety net.
2. Add boundaries around meaningful, independent failure domains.
3. Match fallback scope to boundary scope: a widget failure usually needs a widget-sized fallback.
4. Avoid hiding systemic failures behind tiny local fallbacks if the whole page is unreliable.
5. Consider how a boundary resets when route identity or inputs change.
6. Do not wrap every tiny component by default; choose based on user impact and recovery needs.

**Interview answer:** “I'd keep a root boundary, then add narrower boundaries around routes or independent feature areas. On a dashboard, one chart crashing shouldn't remove the summary and activity feed. Request failures remain in the relevant data state rather than being treated as render crashes.”

## 4. Fallback UI design

A fallback is a deliberate alternative UI shown when normal content cannot be rendered or completed.

It should answer:
- What happened?
- What is affected?
- What can the user do next?
- Is their work safe?
- Can they continue using unaffected parts of the product?

```tsx
function ChartFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <section role="alert" aria-labelledby="chart-error-title">
      <h2 id="chart-error-title">This chart is unavailable</h2>
      <p>Your other dashboard information is still available.</p>
      <button type="button" onClick={onRetry}>Try again</button>
    </section>
  );
}
```

Good fallback principles:
- Use plain, non-blaming language; do not expose stack traces.
- Make the recovery action relevant and functional.
- Preserve user-entered data when possible.
- Do not repeatedly retry a deterministic programming error.
- Use semantic headings and accessible controls; do not communicate errors by color alone.
- Avoid claiming data was saved unless the app knows it was saved.
- Keep unaffected navigation and actions available where possible.

### Boundary fallback vs request error UI

| Boundary fallback | Request error UI |
|---|---|
| Descendant throws during rendering/lifecycle work | A fetch or mutation fails |
| Component may not be safe to render | Component can render an error state |
| Recovery may reset/remount the subtree | Recovery usually reruns the request |
| Catches unexpected render failures | Handles expected operational failures |

## 5. Error recovery patterns

Recovery should match the cause. “Retry” is not the answer to every failure.

### Common approaches

1. **Retry the operation** for transient network failures or selected server errors.
2. **Reset the boundary** after a meaningful user action or changed input.
3. **Preserve user work** when a save fails; keep the draft and allow retry.
4. **Offer a safe restart** if a feature's internal state is corrupted, explaining consequences for unsaved work.
5. **Fall back to a simpler path**, such as a table when a chart fails.
6. **Re-authenticate** when a session has expired; do not endlessly retry a permission failure.
7. **Stop retrying permanent failures**, such as validation errors or deterministic code errors.

A changed key can reset a boundary by remounting it:

```tsx
function CustomerPage({ customerId }: { customerId: string }) {
  return (
    <ErrorBoundary key={customerId} fallback={<CustomerPageFallback />}>
      <CustomerDetails customerId={customerId} />
    </ErrorBoundary>
  );
}
```

When `customerId` changes, React remounts the boundary and resets its state. This also resets descendant state, so use the technique deliberately.

Before offering retry, ask:
- Is the operation safe to repeat?
- Could a payment/order have succeeded despite a client timeout?
- Is the failure transient or permanent?
- Is user input preserved?
- Does the user need to sign in or change permissions?
- Should the feature reset, or does the whole route need to reload?

## 6. Logging and reporting

User-facing errors and engineering observability have different goals:

- **User-facing message:** concise, safe, actionable.
- **Developer report:** enough context to diagnose the issue.
- **Operational metric:** frequency, impact, and trends.

Useful context, subject to privacy policy:
- Error type, message, stack trace, and React component stack.
- Route/screen and operation name.
- HTTP status and request/correlation ID.
- App version/release, browser, and relevant environment.
- Whether retry/recovery succeeded.

Never send secrets or unnecessary personal data: tokens, cookies, passwords, API keys, full request/response bodies by default, sensitive form values, or private user content. Use redaction, data minimization, retention controls, and access controls.

A vendor-independent reporting abstraction:

```tsx
type ErrorContext = {
  operation?: string;
  route?: string;
  requestId?: string;
};

function reportError(error: unknown, context: ErrorContext = {}) {
  const normalized =
    error instanceof Error ? error : new Error(String(error));

  // Replace with the approved observability provider in production.
  console.error("Application error", {
    message: normalized.message,
    stack: normalized.stack,
    ...context,
  });
}
```

Centralizing reporting makes it easier to change vendors and enforce consistent redaction. Avoid reporting the same event independently at every layer.

### Logging levels

- **Debug:** detailed diagnostics, mostly development.
- **Info:** meaningful lifecycle/business events.
- **Warning:** unusual but handled condition.
- **Error:** failed operation that needs investigation.
- **Critical/fatal:** major functionality unavailable.

Exact names vary. Do not log the same propagated failure at every layer.

## 7. Sentry / LogRocket integration

Broadly:
- **Sentry** focuses on error monitoring, issue grouping, stack traces, release context, and performance monitoring.
- **LogRocket** focuses on session replay and frontend session diagnostics, helping teams understand what happened before a failure.
- They can complement one another, but each additional telemetry vendor increases privacy and governance considerations.

Vendor APIs change, so verify the current documentation for your SDK and framework version.

### Integration principles

1. Initialize the SDK once near application startup.
2. Configure environment and release/version.
3. Capture unhandled errors and relevant handled exceptions.
4. Attach safe context: route, operation, request ID, release.
5. Filter known noise carefully without hiding broad classes of real bugs.
6. Upload source maps for the exact deployed release and protect them if required.
7. Mask sensitive session-replay content and honor consent/retention requirements.
8. Test the integration outside production.
9. Watch alert volume and issue grouping to avoid alert fatigue.

Example Sentry-style initialization (the exact API depends on SDK version and framework):

```tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  // Configure tracing/replay/sampling and privacy settings
  // according to current SDK docs and product requirements.
});
```

A Vite app often uses `import.meta.env`; Next.js has different client/server instrumentation requirements. Never expose a secret server-side key in a client bundle. A public client DSN is intended for client use but still needs project-side controls.

Report a handled exception with useful context:

```tsx
try {
  await saveInvoice();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: "save_invoice" },
  });
  setErrorMessage("We couldn't save the invoice. Your changes are still here.");
}
```

Only say the draft is preserved if the application actually preserves it. Choose a reporting owner so the same exception is not captured by the API helper, hook, component, and global handler.

### Source maps and replay privacy

Source maps map minified production code back to original source. Generate them in CI/CD, upload them to the monitoring provider, associate them with the exact release, and verify stack traces resolve correctly. Protect source maps according to security policy.

Session replay can expose clicks, navigation, and visual state. Mask/block passwords, payment details, personal data, private text, and regulated information. Configure consent and retention appropriately; do not assume defaults satisfy your obligations.

**Interview answer:** “I'd initialize monitoring once, attach release and operation context, configure source maps, and test a known error in a non-production environment. For session replay I'd configure masking carefully. I'd avoid duplicate reporting and noisy alerts.”

## 8. Network error handling

### `fetch` does not reject on HTTP error statuses

`fetch` normally resolves to a `Response` for `404` or `500`. Check `response.ok` or `response.status`.

```tsx
async function fetchCustomer(customerId: string) {
  const response = await fetch(`/api/customers/${customerId}`);

  if (!response.ok) {
    throw new Error(`Failed to load customer (${response.status})`);
  }

  return response.json();
}
```

Production code should usually map HTTP statuses into typed app errors, parse error payloads safely, handle aborts, and avoid showing raw server messages.

### Normalize HTTP errors

```tsx
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public requestId?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `Request failed with status ${response.status}`,
      response.headers.get("x-request-id") ?? undefined,
    );
  }

  return response.json() as Promise<T>;
}
```

This is a minimal example. A complete API layer may also handle `AbortError`, non-JSON responses, runtime response validation, and API-specific error bodies.

### Common statuses

| Status | Typical meaning | Frontend response |
|---|---|---|
| `400` | Bad request | Useful validation/request message |
| `401` | Unauthenticated | Approved session refresh or sign-in |
| `403` | Forbidden | Permission-specific feedback |
| `404` | Not found | Not-found state |
| `409` | Conflict | Reload/reconcile current state |
| `422` | Invalid input (API-dependent) | Map errors to fields |
| `429` | Rate limited | Back off; respect `Retry-After` |
| `5xx` | Server failure | Temporary failure state; cautious retry |

The API contract is authoritative; status semantics can vary.

### Model request states explicitly

```tsx
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

Explicit states help avoid contradictory combinations such as `isLoading === true` and `error !== null` unless that combination is intentionally supported. Some products preserve stale data during a failed background refresh; model that behavior deliberately.

### Avoid stale responses

If the user changes a search term rapidly, an older request may finish last and overwrite current results. Use cancellation or a query library that manages request identity.

```tsx
useEffect(() => {
  const controller = new AbortController();

  async function load() {
    setStatus("loading");

    try {
      const response = await fetch(
        `/api/customers?q=${encodeURIComponent(search)}`,
        { signal: controller.signal },
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setCustomers(await response.json());
      setStatus("success");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setStatus("error");
    }
  }

  void load();
  return () => controller.abort();
}, [search]);
```

This is illustrative; real code should include all relevant state transitions and response validation. TanStack Query/React Query or another data layer can standardize caching, cancellation, retries, and error states.

### Offline and timeout notes

- `navigator.onLine` is a hint, not proof that the API is reachable.
- `Promise.race` with a timeout does not cancel the underlying request by itself.
- Distinguish an intentional abort from an actual failure.
- Communicate pending, failed, and confirmed-success states clearly for writes.
- Consider idempotency keys or server deduplication for sensitive operations.

## 9. Retry strategies

Retries help with transient failures, but can overload a service or duplicate side effects if implemented carelessly.

### When to retry

Often reasonable: transient network errors, timeouts when safe, selected `5xx`, and `429` with server guidance.

Usually not useful without another change: validation errors, `403`, many `404` responses, `401` when refresh fails, and deterministic render errors.

### Exponential backoff

Increase the delay between attempts:

\[
\text{delay}_n = \min(\text{maxDelay}, \text{baseDelay} \times 2^n)
\]

Add **jitter** so many clients do not retry simultaneously. Full jitter chooses a random delay from zero to the exponential cap.

```tsx
function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function retry<T>(
  operation: () => Promise<T>,
  isRetryable: (error: unknown) => boolean,
  maxRetries = 2,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryable(error)) {
        throw error;
      }

      const cap = Math.min(8_000, 500 * 2 ** attempt);
      await sleep(Math.random() * cap); // full jitter
    }
  }

  throw lastError;
}
```

This leaves retry classification to the caller. Production logic should also consider cancellation, total time budget, `Retry-After`, and operation safety.

### Retry UX and idempotency

- Automatic retries can be appropriate for background reads.
- For writes, show pending status and never imply success before confirmation.
- Offer manual retry after bounded attempts.
- Prevent duplicate simultaneous retries from repeated clicks.
- Stop retrying when the operation is cancelled where possible.
- A timed-out payment may have succeeded on the server. Do not blindly repeat it.
- Use server-supported idempotency keys, deduplication, or an operation-status check for sensitive mutations.

**Key phrase:** A client timeout does not prove that the server did not process the request.

## 10. Graceful degradation

Graceful degradation keeps essential product functionality usable when a secondary feature or dependency fails.

Examples:
- Chart fails → show the underlying data in a table.
- Map provider fails → show the address and a directions link.
- Recommendations API fails → keep the core product page usable.
- Analytics script fails → core user actions still work.
- Profile image fails → show initials or a placeholder.

Design principles:
1. Identify critical versus noncritical features.
2. Avoid making unrelated features depend on a fragile shared dependency.
3. Keep core workflows independent of analytics and other nonessential services.
4. Provide a simpler alternative where practical.
5. Label stale or partial data clearly.
6. Keep degraded UI accessible.
7. Measure whether users can still complete the task.

**Graceful degradation** starts with a richer experience and preserves usability when something fails. **Progressive enhancement** starts with a basic functional experience and adds capabilities when available. In practice, both aim to preserve user value across different conditions.

## 11. Feature detection

Feature detection checks whether a runtime supports a capability. Prefer checking the actual API over guessing from browser names or versions.

```tsx
const supportsShare =
  typeof navigator !== "undefined" &&
  typeof navigator.share === "function";

async function sharePage() {
  if (!supportsShare) {
    // Offer a copy-link fallback or another supported action.
    return;
  }

  await navigator.share({
    title: document.title,
    url: location.href,
  });
}
```

An API can exist and still fail because of permissions, security context, user cancellation, or platform constraints. Feature detection does not replace `try/catch`.

```tsx
async function copyText(text: string) {
  try {
    if (!navigator.clipboard?.writeText) return "unsupported" as const;
    await navigator.clipboard.writeText(text);
    return "copied" as const;
  } catch {
    return "failed" as const;
  }
}
```

The caller can then display success, provide manual-copy instructions, or explain the failure.

CSS capability detection:

```css
.card-grid {
  display: block;
}

@supports (display: grid) {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
}
```

Best practices:
- Check the specific capability.
- Provide a fallback for optional features.
- Still handle runtime failures.
- Test the fallback path.
- Avoid needless branching for features guaranteed by your supported-browser policy.

## 12. Error states in UI

Error states should be designed as intentionally as loading, empty, and success states.

### Possible states

1. Idle/not requested.
2. Loading.
3. Success with data.
4. Success with no results (empty).
5. Error with no usable data.
6. Refresh failed while stale data remains visible.
7. Partial success.
8. Unauthenticated/unauthorized.
9. Offline/unavailable.
10. Mutation pending.
11. Mutation failed while local edits remain.
12. Success confirmation.

Not every component needs all of them. Model the states relevant to the feature.

### Separate loading, error, and empty states

```tsx
function CustomerList() {
  const { data, isPending, isError, refetch } = useCustomersQuery();

  if (isPending) return <CustomerListSkeleton />;

  if (isError) {
    return (
      <section role="alert">
        <p>We couldn't load customers.</p>
        <button type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </section>
    );
  }

  if (data.length === 0) return <EmptyCustomersState />;

  return <CustomersTable customers={data} />;
}
```

This assumes a query library with those properties; check the semantics for your installed version. If stale data is available during a background refresh failure, replacing the whole table may be unnecessarily disruptive.

### Choosing the right placement

| UI pattern | Use when | Example |
|---|---|---|
| Inline field | One field is invalid | “Enter a valid email address” |
| Inline section | One section request fails | “Could not load activity” |
| Toast/snackbar | Brief operation feedback | “Changes could not be saved” |
| Page-level | Primary route content unavailable | “We couldn't load this customer” |
| Root/full-screen fallback | Main app tree cannot render | “Something went wrong” |
| Persistent banner | Condition affects the session | “You're offline; changes may not sync” |

A toast should not be the only indication of a serious error requiring action because it disappears. Pair it with persistent state when needed.

### Accessibility

- Associate field errors with their inputs; use `aria-describedby` when appropriate.
- Use `aria-invalid="true"` for invalid fields.
- Use `role="alert"` for important, immediate messages, sparingly.
- Use a polite live region for updates that should be announced without interruption.
- Move focus to an error summary after failed form submission when helpful.
- Do not rely on color alone.
- Keep retry actions keyboard-accessible.

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={Boolean(emailError)}
  aria-describedby={emailError ? "email-error" : undefined}
/>
{emailError && <p id="email-error">{emailError}</p>}
```

### Error copy

| Avoid | Prefer |
|---|---|
| “Error 500” | “We couldn't load your reports. Try again.” |
| “Invalid input” | “Enter a valid email address.” |
| “Failed” | “Your changes weren't saved. Try again.” |
| “Please try again” for every failure | Explain what the user can do to resolve it |

Only promise that a draft is preserved if it actually is.

## 13. Putting it together: architecture

```text
UI component
  ├── renders loading / success / empty / error states
  ├── handles user actions
  └── preserves local input when possible
         ↓
Feature hook / query or mutation layer
  ├── owns request lifecycle and cancellation
  ├── maps errors to app-level types
  ├── applies safe retry policy
  └── exposes state for the UI
         ↓
API client
  ├── checks HTTP status and parses responses
  ├── attaches request metadata
  └── normalizes transport/API failures

Error boundaries surround selected UI subtrees to contain render failures.
Observability captures actionable unexpected failures with privacy-aware context.
```

Responsibilities:
- **Form component:** validation and local submission feedback.
- **Query/mutation layer:** request lifecycle, cache, retry policy.
- **API client:** consistent HTTP handling and error normalization.
- **Error boundary:** contain render-time failures.
- **Reporting abstraction:** consistent, privacy-aware telemetry.
- **Design system:** reusable error, empty, loading, and retry patterns.
- **Team/process:** alert thresholds, ownership, privacy, incident response.

Normalize errors centrally, but make recovery decisions close to the operation that understands them.

## 14. Common mistakes

1. **Treating boundaries as global `try/catch`.** They do not catch every event-handler or asynchronous error. Handle those where they occur.
2. **Only having one root boundary.** A widget failure may unnecessarily replace the whole app. Add boundaries around independent regions.
3. **Retrying everything.** Permanent errors stay permanent, and mutations may duplicate side effects. Classify and bound retries.
4. **Showing raw exceptions.** They confuse users and may expose internals. Keep technical details in private telemetry.
5. **Logging at every layer.** Duplicate events distort issue counts. Define reporting ownership.
6. **Silently swallowing errors.** Users may assume an operation succeeded. Show the right state and recover intentionally.
7. **Assuming `fetch` rejects on `500`.** Check `response.ok`.
8. **Retrying writes without idempotency.** A timeout does not prove the operation failed server-side.
9. **Trusting `navigator.onLine` as proof of connectivity.** Treat it as a hint; handle request outcomes.
10. **Testing only the happy path.** Test empty, stale, partial, offline, unauthorized, and failed states as relevant.

## 15. Testing error handling

### Unit/component tests
- Descendant throws and boundary shows fallback.
- Fallback action works.
- Failed request renders an error state.
- Retry invokes the operation again.
- Form error is associated with its field.
- User input survives a failed save when required.
- Unsupported capability renders fallback.
- One widget failure leaves unrelated content usable.

### Integration/E2E tests
- Simulate `4xx`, `5xx`, network rejection, and timeout.
- Verify expired-session and permission behavior.
- Ensure repeated clicks do not duplicate mutations.
- Test offline/reconnection flows where supported.
- Test retry limits and backoff with controlled timers.
- Confirm errors are reported once with useful context.
- Check keyboard and screen-reader behavior.

### Production verification
- Trigger a known test exception in a non-production environment.
- Confirm it reaches the correct project/environment.
- Verify release and source-map association.
- Check sensitive fields are redacted.
- Ensure alerts are useful rather than noisy.

## 16. Interview questions

1. **What is a React error boundary?** Explain render-error containment, fallback UI, and `getDerivedStateFromError` / `componentDidCatch`.
2. **What does a boundary not catch?** Event handlers, asynchronous callbacks/rejections, server rendering, and errors in the boundary itself.
3. **Where would you place boundaries in a dashboard?** Root safety net plus route/feature boundaries around independent failure domains.
4. **How is a boundary different from `try/catch`?** `try/catch` handles synchronous execution in its lexical scope; a boundary catches specific errors in descendant React rendering/lifecycle work.
5. **How would you design fallback UI?** Match scope, use clear copy, offer safe recovery, preserve user work, and ensure accessibility.
6. **How do you recover from a boundary error?** Reset/remount after a meaningful change; do not blindly retry deterministic bugs.
7. **How do you handle API failures?** Check status, normalize errors, model request states, and retry only when appropriate.
8. **Why doesn't `fetch` throw on `500`?** It resolves with a `Response`; check `ok` or `status`.
9. **How do you implement retries?** Classify, cap attempts, use backoff/jitter, respect `Retry-After`, support cancellation, and consider idempotency.
10. **Would you automatically retry a payment?** Not blindly; use idempotency or check operation status because the server may have processed it.
11. **How would you use Sentry or LogRocket?** Error capture, release/source-map context, replay diagnostics, privacy masking, and alert hygiene.
12. **What context belongs in an error report?** Error/stack, route, operation, release, status/request ID, safe metadata — never secrets.
13. **How do you isolate a widget failure?** Feature-level boundary and independent data state; local fallback or simpler representation.
14. **What is graceful degradation?** Keep core workflows usable when secondary functionality fails.
15. **How do you detect browser capabilities?** Check actual APIs or CSS `@supports`, provide fallback, still handle runtime failures.
16. **How should error states be accessible?** Semantic structure, associated field errors, appropriate live regions, visible focus, and non-color-only cues.
17. **How do you avoid duplicate reporting?** Assign reporting ownership and enrich a single event as it propagates.
18. **How do you test error handling?** Test boundary, request failures, retry, preserved input, partial failure, accessibility, and telemetry.

## 17. Senior-level answer framework

When asked to design error handling for a feature:

1. **Classify failure modes:** render bugs, network/API, validation, auth, unsupported features, partial dependency failures.
2. **Define ownership:** API client normalizes; query/mutation layer owns request lifecycle; UI renders states; boundary contains render failures; reporting layer captures unexpected issues.
3. **Contain failures:** root fallback plus narrower boundaries around independent regions.
4. **Design recovery:** preserve user work, offer safe retry or alternatives, never claim success prematurely.
5. **Set retry policy:** bounded attempts, backoff/jitter, server guidance, cancellation, idempotency.
6. **Instrument carefully:** release and operation context, source maps, deduplication, privacy redaction.
7. **Verify:** test failure modes, partial degradation, accessibility, recovery, and production reporting.

**Example answer:**

“For a dashboard, I'd separate request failures from render failures. The API/query layer would normalize HTTP and network errors and expose loading, success, empty, and error states. I'd retry only transient failures with bounded backoff, and I'd be careful with mutations because a timeout doesn't prove the server didn't process them. At the UI level, I'd add a root error boundary and narrower boundaries around independent widgets so one chart crash doesn't take down the dashboard. I'd provide clear, accessible fallbacks that preserve user work where possible. Finally, I'd report unexpected errors with release, route, and operation context, configure source maps, redact sensitive data, and test the recovery flows.”

## 18. Final revision sheet

- **Error boundary:** contains specified descendant render/lifecycle errors and shows fallback UI.
- **Not a universal catch:** event handlers, async callbacks/rejections, server rendering, and the boundary itself need other handling.
- **Placement:** root safety net + route/feature boundaries based on independent failure domains.
- **Fallback:** scoped, accessible, actionable, and honest about saved work.
- **Recovery:** retry transient failures; reset only when meaningful.
- **Reporting:** capture useful context once, with privacy-aware redaction.
- **Sentry:** error monitoring, release context, stack traces, source maps.
- **LogRocket:** session replay/diagnostics; mask sensitive content and govern retention.
- **Fetch:** check `response.ok`; `4xx`/`5xx` do not automatically reject.
- **Retry:** bounded attempts, backoff/jitter, cancellation, `Retry-After`, idempotency.
- **Graceful degradation:** keep core workflows usable when secondary features fail.
- **Feature detection:** check capabilities, provide fallbacks, still handle runtime failures.
- **UI states:** loading, empty, success, error, partial/stale, auth, offline, mutation outcomes.
- **Accessibility:** associate errors with controls, use alerts/live regions carefully, never rely on color alone.

## Official references

- React — [Error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- MDN — [Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- MDN — [Feature detection](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Feature_detection)
- Sentry — [JavaScript SDK documentation](https://docs.sentry.io/platforms/javascript/)
- LogRocket — [Documentation](https://docs.logrocket.com/)
