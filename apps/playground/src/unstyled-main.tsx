import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import UnstyledApp from "./UnstyledApp";
import "./custom.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UnstyledApp />
  </StrictMode>,
);
