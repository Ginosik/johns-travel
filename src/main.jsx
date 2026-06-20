import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import RouteScrollManager from "./components/RouteScrollManager.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import "@xyflow/react/dist/style.css";
import "../styles.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LanguageProvider>
      <RouteScrollManager />
      <App />
    </LanguageProvider>
  </BrowserRouter>
);
