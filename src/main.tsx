/// <reference types="vite/client" />
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import "./redesign.css";
import App from "./App";
import { startSharedSync } from "./lib/sharedTrip";

const stopSync = startSharedSync();
if (import.meta.hot) import.meta.hot.dispose(stopSync);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
