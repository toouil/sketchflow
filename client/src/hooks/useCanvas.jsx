import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppContext } from "../provider/AppStates";
import useDimension from "./useDimension";
import { lockUI } from "../helper/ui";
import {
  draw,
  drawFocuse,
  cornerCursor,
  inSelectedCorner,
} from "../helper/canvas";
import {
  adjustCoordinates,
  arrowMove,
  createElement,
  deleteElement,
  duplicateElement,
  getElementById,
  getElementPosition,
  minmax,
  resizeValue,
  saveElements,
  updateElement,
  uploadElements,
} from "../helper/element";
import useKeys from "./useKeys";

export default function useCanvas() {
  const {
    selectedTool,
    setSelectedTool,
    action,
    setAction,
    elements,
    setElements,
    scale,
    onZoom,
    translate,
    setTranslate,
    scaleOffset,
    setScaleOffset,
    lockTool,
    style,
    selectedElement,
    setSelectedElement,
    undo,
    redo,
  } = useAppContext();

  const canvasRef = useRef(null);
  const keys = useKeys();
  const dimension = useDimension();
  const [isInElement, setIsInElement] = useState(false);
  const [inCorner, setInCorner] = useState(false);
  const [padding, setPadding] = useState(minmax(10 / scale, [0.5, 50]));
  const [cursor, setCursor] = useState("default");
  const [mouseAction, setMouseAction] = useState({ x: 0, y: 0 });
  const [resizeOldDementions, setResizeOldDementions] = useState(null)

  const mousePosition = ({ clientX, clientY }) => {
    clientX = (clientX - translate.x * scale + scaleOffset.x) / scale;
    clientY = (clientY - translate.y * scale + scaleOffset.y) / scale;
    return { clientX, clientY };
  };

  const handleMouseDown = (event) => {
    const { clientX, clientY } = mousePosition(event);
    lockUI(true);

    if (inCorner) {
      setResizeOldDementions(getElementById(selectedElement.id, elements))
      setElements((prevState) => prevState);
      setMouseAction({ x: event.clientX, y: event.clientY });
      setCursor(cornerCursor(inCorner.slug));
      setAction(
        "resize-" + inCorner.slug + (event.shiftKey ? "-shiftkey" : "")
      );
      return;
    }

    if (keys.has(" ") || selectedTool == "hand" || event.button == 1) {
      setTranslate((prevState) => ({
        ...prevState,
        sx: clientX,
        sy: clientY,
      }));
      setAction("translate");
      return;
    }

    if (selectedTool == "selection") {
      const element = getElementPosition(clientX, clientY, elements);

      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;

        if (event.altKey) {
          duplicateElement(element, setElements, setSelectedElement, 0, {
            offsetX,
            offsetY,
          });
        } else {
          setElements((prevState) => prevState);
          setMouseAction({ x: event.clientX, y: event.clientY });
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setAction("move");
      } else {
        setSelectedElement(null);
      }

      return;
    }

    setAction("draw");

    const element = createElement(
      clientX,
      clientY,
      clientX,
      clientY,
      style,
      selectedTool
    );
    setElements((prevState) => [...prevState, element]);
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = mousePosition(event);

    if (selectedElement) {
      setInCorner(
        inSelectedCorner(
          getElementById(selectedElement.id, elements),
          clientX,
          clientY,
          padding,
          scale
        )
      );
    }

    if (getElementPosition(clientX, clientY, elements)) {
      setIsInElement(true);
    } else {
      setIsInElement(false);
    }

    if (action == "draw") {
      const { id } = elements.at(-1);
      updateElement(
        id,
        { x2: clientX, y2: clientY },
        setElements,
        elements,
        true
      );
    } else if (action == "move") {
      const { id, x1, y1, x2, y2, offsetX, offsetY } = selectedElement;

      const width = x2 - x1;
      const height = y2 - y1;

      const nx = clientX - offsetX;
      const ny = clientY - offsetY;

      updateElement(
        id,
        { x1: nx, y1: ny, x2: nx + width, y2: ny + height },
        setElements,
        elements,
        true
      );
    } else if (action == "translate") {
      const x = clientX - translate.sx;
      const y = clientY - translate.sy;

      setTranslate((prevState) => ({
        ...prevState,
        x: prevState.x + x,
        y: prevState.y + y,
      }));
    } else if (action.startsWith("resize")) {
      const resizeCorner = action.slice(7, 9);
      const resizeType = action.slice(10) || "default";
      const s_element = getElementById(selectedElement.id, elements);

      updateElement(
        s_element.id,
        resizeValue(resizeCorner, resizeType, clientX, clientY, padding, s_element, mouseAction, resizeOldDementions),
        setElements,
        elements,
        true
      );
    }
  };

  const handleMouseUp = (event) => {
    setAction("none");
    lockUI(false);

    if (event.clientX == mouseAction.x && event.clientY == mouseAction.y) {
      setElements("prevState");
      return;
    }

    if (action == "draw") {
      const lastElement = elements.at(-1);
      const { id, x1, y1, x2, y2 } = adjustCoordinates(lastElement);
      updateElement(id, { x1, x2, y1, y2 }, setElements, elements, true);
      if (!lockTool) {
        setSelectedTool("selection");
        setSelectedElement(lastElement);
      }
    }

    if (action.startsWith("resize")) {
      const { id, x1, y1, x2, y2 } = adjustCoordinates(
        getElementById(selectedElement.id, elements)
      );
      updateElement(id, { x1, x2, y1, y2 }, setElements, elements, true);
    }
  };

  const handleWheel = (event) => {
    if (event.ctrlKey) {
      onZoom(event.deltaY * -0.01);
      return;
    }

    setTranslate((prevState) => ({
      ...prevState,
      x: prevState.x - event.deltaX,
      y: prevState.y - event.deltaY,
    }));
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const zoomPositionX = 2;
    const zoomPositionY = 2;
    // const zoomPositionX = scaleMouse ? canvas.width / scaleMouse.x : 2;
    // const zoomPositionY = scaleMouse ? canvas.height / scaleMouse.y : 2;

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    const scaleOffsetX = (scaledWidth - canvas.width) / zoomPositionX;
    const scaleOffsetY = (scaledHeight - canvas.height) / zoomPositionY;

    setScaleOffset({ x: scaleOffsetX, y: scaleOffsetY });

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();

    context.translate(
      translate.x * scale - scaleOffsetX,
      translate.y * scale - scaleOffsetY
    );
    context.scale(scale, scale);

    let focusedElement = null;
    elements.forEach((element) => {
      draw(element, context);
      if (element.id == selectedElement?.id) focusedElement = element;
    });

    const pd = minmax(10 / scale, [0.5, 50]);
    if (focusedElement != null) {
      drawFocuse(focusedElement, context, pd, scale);
    }
    setPadding(pd);

    context.restore();
  }, [elements, selectedElement, scale, translate, dimension]);

  useEffect(() => {
    const keyDownFunction = (event) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const prevent = () => event.preventDefault();
      if (selectedElement) {
        if (key == "Backspace" || key == "Delete") {
          prevent();
          deleteElement(selectedElement, setElements, setSelectedElement);
        }

        if (ctrlKey && key.toLowerCase() == "d") {
          prevent();
          duplicateElement(
            selectedElement,
            setElements,
            setSelectedElement,
            10
          );
        }

        if (key == "ArrowLeft") {
          prevent();
          arrowMove(selectedElement, -1, 0, setElements);
        }
        if (key == "ArrowUp") {
          prevent();
          arrowMove(selectedElement, 0, -1, setElements);
        }
        if (key == "ArrowRight") {
          prevent();
          arrowMove(selectedElement, 1, 0, setElements);
        }
        if (key == "ArrowDown") {
          prevent();
          arrowMove(selectedElement, 0, 1, setElements);
        }
      }

      if (ctrlKey || metaKey) {
        if (
          key.toLowerCase() == "y" ||
          (key.toLowerCase() == "z" && shiftKey)
        ) {
          prevent();
          redo();
        } else if (key.toLowerCase() == "z") {
          prevent();
          undo();
        } else if (key.toLowerCase() == "s") {
          prevent();
          saveElements(elements);
        } else if (key.toLowerCase() == "o") {
          prevent();
          uploadElements(setElements);
        }
      }
    };

    window.addEventListener("keydown", keyDownFunction, { passive: false });
    return () => {
      window.removeEventListener("keydown", keyDownFunction);
    };
  }, [undo, redo, selectedElement]);

  useEffect(() => {
    if (selectedTool != "selection") {
      setSelectedElement(null);
    }
  }, [selectedTool]);

  useEffect(() => {
    if (action == "translate") {
      document.documentElement.style.setProperty("--canvas-cursor", "grabbing");
    } else if (action.startsWith("resize")) {
      document.documentElement.style.setProperty("--canvas-cursor", cursor);
    } else if (
      (keys.has(" ") || selectedTool == "hand") &&
      action != "move" &&
      action != "resize"
    ) {
      document.documentElement.style.setProperty("--canvas-cursor", "grab");
    } else if (selectedTool !== "selection") {
      document.documentElement.style.setProperty(
        "--canvas-cursor",
        "crosshair"
      );
    } else if (inCorner) {
      document.documentElement.style.setProperty(
        "--canvas-cursor",
        cornerCursor(inCorner.slug)
      );
    } else if (isInElement) {
      document.documentElement.style.setProperty("--canvas-cursor", "move");
    } else {
      document.documentElement.style.setProperty("--canvas-cursor", "default");
    }
  }, [keys, selectedTool, action, isInElement, inCorner]);

  useEffect(() => {
    const fakeWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };
    window.addEventListener("wheel", fakeWheel, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", fakeWheel);
    };
  }, []);

  return {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    dimension,
  };
}
