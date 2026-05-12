import { getComplaints } from "./lib/api";

async function testAPI() {
  const data = await getComplaints();
  console.log("TEST API DATA:", data);
}

testAPI();
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);