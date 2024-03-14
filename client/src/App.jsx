import { useEffect } from "react";
import Canvas from "./components/Canvas";
import Ui from "./components/Ui";
import { io } from "socket.io-client";

console.log(import.meta.env.VITE_APP_SERVER_URL);

function App() {
  useEffect(() => {
    console.log(import.meta.env.VITE_APP_SERVER_URL);
  }, [])
  return (
    <>
      <Ui />
      <Canvas />
    </>
  );
}

export const socket = io("https://sketchflow.onrender.com");
export default App;