import { Route, Routes, Navigate } from "react-router-dom";
import WorkSpace from "./views/WorkSpace";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WorkSpace />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
