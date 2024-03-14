import { useState } from "react";
import { socket } from "../api/socket";

export default function useHistory(initialState, setSelectedElement) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const setState = (action, ee, from = true) => {
    const newState =
      typeof action == "function" ? action(history[index]) : action;
    setHistory([newState]);

    if (from) {
      socket.emit("send-elements", newState);
    }
  };

  const undo = () => {};
  const redo = () => {};
  const undoRedo = () => {};

  // const setState = (action, overwrite = false) => {
  //   const newState =
  //     typeof action === "function" ? action(history[index]) : action;
  //   if (overwrite) {
  //     const historyCopy = [...history];
  //     historyCopy[index] = newState;
  //     setHistory(historyCopy);
  //   } else {
  //     const updatedState = [...history].slice(0, index + 1);
  //     setHistory([...updatedState, newState]);
  //     setIndex((prevState) => prevState + 1);
  //   }
  // };

  // const undoRedo = () => {
  //   const historyCopy = [...history];
  //   historyCopy.pop();
  //   setHistory(historyCopy);
  //   setIndex((prevState) => prevState - 1);
  // };

  // const undo = () => {
  //   if (index > 0) {
  //     setIndex((prevState) => prevState - 1);
  //     setSelectedElement(null);
  //   }
  // };
  // const redo = () => {
  //   if (index < history.length - 1) {
  //     setIndex((prevState) => prevState + 1);
  //     setSelectedElement(null);
  //   }
  // };

  return [history[index], setState, undo, redo, undoRedo];
}
