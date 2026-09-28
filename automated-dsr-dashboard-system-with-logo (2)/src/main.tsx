import React from "react";
import ReactDOM from "react-dom/client";
import DsrDashboard from "./components/DsrDashboard";
import "./app/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DsrDashboard />
  </React.StrictMode>
);
