import React from "react";
import ReactDOM from "react-dom/client";
import { Api } from "./api";

const root = document.createElement("div");
root.id = "crx-root";
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Api />
  </React.StrictMode>
);
