import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import { AppContextProvider } from "./provider/AppStates.jsx";
import { BrowserRouter } from "react-router-dom"

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </BrowserRouter>
);
