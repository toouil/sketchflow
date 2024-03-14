import React from "react";
import { useAppContext } from "../provider/AppStates";

export default function Zoom() {
  const { scale, onZoom } = useAppContext();
  
  return (
    <section className="zoomOptions">
      <button className="zoom out" onClick={() => onZoom(-0.1)}>
        -
      </button>
      <span
        className="zoom text"
        onClick={() => onZoom("default")}
        title="Reset zoom"
      >
        {new Intl.NumberFormat("fr-CA", { style: "percent" }).format(scale)}
      </span>
      <button className="zoom in" onMouseDown={() => onZoom(0.1)}>
        +
      </button>
    </section>
  );
}
