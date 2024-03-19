import { useState } from "react";
import { socket } from "../api/socket";

export default function useHistory(initialState, session) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const setState = (action, overwrite = false, emit = true) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;

    if (session) {
      if (action == "prevState") return;
      setHistory([newState]);
      setIndex(0);

      if (emit) {
        socket.emit("getElements", { elements: newState, room: session });
      }
      return;
    }

    if (action == "prevState") {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, history[index - 1]]);
      setIndex((prevState) => prevState - 1);
      return;
    }

    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prevState) => prevState + 1);
    }
  };

  const undo = () =>
    setIndex((prevState) => (prevState > 0 ? prevState - 1 : prevState));

  const redo = () =>
    setIndex((prevState) =>
      prevState < history.length - 1 ? prevState + 1 : prevState
    );

  return [history[index], setState, undo, redo];
}
