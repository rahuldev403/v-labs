import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { NhostClient, NhostProvider } from "@nhost/react";
import App from "./App";
import "./index.css";

const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </NhostProvider>
  </React.StrictMode>,
);
