import { useEffect } from "react";
import Canvas from "../components/Canvas";
import Ui from "../components/Ui";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../provider/AppStates";
import { socket } from "../api/socket";

export default function WorkSpace() {
  const { setSession } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const room = searchParams.get("room");

    if (room) {
      setSession(room);
      socket.emit("join", room);
    }
  }, [searchParams]);

  return (
    <>
      <Ui />
      <Canvas />
    </>
  );
}