import "./global.css";
import { createRoot } from "react-dom/client";
import App from "./App";

// Get the root element
const container = document.getElementById("root")!;

// Create root only once, even during HMR
let root: ReturnType<typeof createRoot>;

// Check if we're in development with HMR
if (import.meta.hot) {
  // In development, handle HMR properly
  if (!container._reactRoot) {
    root = createRoot(container);
    container._reactRoot = root;
  } else {
    root = container._reactRoot;
  }
} else {
  // In production, create root normally
  root = createRoot(container);
}

// Render the app
root.render(<App />);

// Accept HMR updates for the App component
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    // Re-render the app when App.tsx is updated
    root.render(<App />);
  });
}

// Add type declaration for the custom property
declare global {
  interface Element {
    _reactRoot?: ReturnType<typeof createRoot>;
  }
}
