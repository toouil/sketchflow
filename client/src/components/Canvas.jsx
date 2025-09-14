import useCanvas from "../hooks/useCanvas";

export default function Canvas() {
  const {
    canvasRef,
    dimension,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  } = useCanvas();

  return (
      <canvas
        id="canvas"
        ref={canvasRef}
        width={dimension.width}
        height={dimension.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
  );
}
