import { useEffect } from "react";
import Canvas from "../components/Canvas";
import Ui from "../components/Ui";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../provider/AppStates";
import { socket } from "../api/socket";

export default function WorkSpace() {
  const { setSession, elements, setElements } = useAppContext();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      socket.emit("leave");
    });
  }, [])

  
  useEffect(() => {
    const room = searchParams.get("room");

    if (room) {
      setSession(room);
      socket.emit("join", {room, elements});

      socket.on("initElements", (data) => {
        setElements(data, true, false);
      });
    }
  }, [searchParams]);

  return (
    <>
      <Ui />
      <Canvas />
    </>
  );
}