import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import { AppContextProvider } from "./provider/AppStates.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppContextProvider>
    <App />
  </AppContextProvider>
);
