import Canvas from "./components/Canvas";
import Ui from "./components/Ui";
import { io } from "socket.io-client";

function App() {
  return (
    <>
      <Ui />
      <Canvas />
    </>
  );
}

export const socket = io(import.meta.env.VITE_APP_SERVER_URL);
export default App;