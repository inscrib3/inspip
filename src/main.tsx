import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import { ThemeProvider } from "./theme";
import { RouterProvider } from "./router";
import { AppProvider } from "./app";

Sentry.init({
  dsn: "https://86d7fc2b43446d09a7855d5e36151fbf@o4506084561780736.ingest.sentry.io/4506084567482368",
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <AppProvider>
        <ThemeProvider>
          <RouterProvider />
        </ThemeProvider>
      </AppProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
