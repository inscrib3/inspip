import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./theme";
import { RouterProvider } from "./router";
import { AppProvider } from "./app";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <ThemeProvider>
        <RouterProvider />
      </ThemeProvider>
    </AppProvider>
  </React.StrictMode>
);
