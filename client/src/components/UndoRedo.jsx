import React from "react";
import { Redo, Undo } from "../assets/icons";
import { useAppContext } from "../provider/AppStates";

export default function UndoRedo() {
  const { undo, redo } = useAppContext();
  return (
    <section className="undoRedo">
      <button type="button" onClick={undo}>
        <Undo />
      </button>
      <button type="button" onClick={redo}>
        <Redo />
      </button>
    </section>
  );
}
