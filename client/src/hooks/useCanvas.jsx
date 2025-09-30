import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppContext } from "../provider/AppStates";
import useDimension from "./useDimension";
import { lockUI } from "../helper/ui";
import {
  draw,
  drawFocuse,
  cornerCursor,
  inSelectedCorner,
  imageCache,
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
import useTextArea from "./useTextArea";
import { v4 } from "uuid";

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
    redo,rerender, setRerender
  } = useAppContext();

  const canvasRef = useRef(null);
  const keys = useKeys();
  const dimension = useDimension();
  const [isInElement, setIsInElement] = useState(false);
  const [inCorner, setInCorner] = useState(false);
  const [padding, setPadding] = useState(minmax(10 / scale, [0.5, 50]));
  const [cursor, setCursor] = useState("default");
  const [mouseAction, setMouseAction] = useState({ x: 0, y: 0 });
  const [resizeOldDementions, setResizeOldDementions] = useState(null);

  const createTextArea = useTextArea()

  const mousePosition = ({ clientX, clientY }) => {
    clientX = (clientX - translate.x * scale + scaleOffset.x) / scale;
    clientY = (clientY - translate.y * scale + scaleOffset.y) / scale;
    return { clientX, clientY };
  };

  const handleDoubleClick = (event) => {
    const { clientX, clientY } = mousePosition(event);
    const element = getElementPosition(clientX, clientY, elements);

    if (element?.tool == "text") {
      createTextArea(element, true)
      setSelectedElement(null)
      setRerender(state => !state)
    }
  }

  const handleMouseDown = (event) => {
    const { clientX, clientY } = mousePosition(event);
    lockUI(true);

    if (inCorner) {
      setResizeOldDementions(getElementById(selectedElement.id, elements));
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
      // console.log(element)

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
          setSelectedElement({ ...element, offsetX, offsetY, lastPosX: clientX, lastPosY: clientY });
        }
        setAction("move");
      } else {
        setSelectedElement(null);
      }

      return;
    }
    setAction("draw");

    const element = createElement({
      x1 : clientX,
      y1 : clientY,
      x2 : clientX,
      y2 : clientY,
      style,
      tool : selectedTool,
      text : ""
    }
    );
    setElements((prevState) => [...prevState, element]);
  };

  function getBoundingBox(points) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      x1: Math.min(...xs),
      y1: Math.min(...ys),
      x2: Math.max(...xs),
      y2: Math.max(...ys)
    };
  }

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
      const currentDrawingElement = elements.at(-1);
      let newStateOptions = { x2: clientX, y2: clientY }
      
      if (currentDrawingElement.tool == "pencil") {
        const points = [...currentDrawingElement.points, { x: clientX, y: clientY }]
        newStateOptions = {
          points,
          ...getBoundingBox(points)
        }
      }
      
      updateElement(
        currentDrawingElement.id,
        newStateOptions,
        setElements,
        elements,
        true
      );
    } else if (action == "move") {
      const { id, x1, y1, x2, y2, offsetX, offsetY, tool, lastPosX, lastPosY, points } = selectedElement;
      
      const width = x2 - x1;
      const height = y2 - y1;
      
      const nx = clientX - offsetX;
      const ny = clientY - offsetY;

      let newStateOptions = { x1: nx, y1: ny, x2: nx + width, y2: ny + height }
      
      if (tool == "pencil") {
        const nx = clientX - lastPosX;
        const ny = clientY - lastPosY;

        newStateOptions.points = points.map(p => ({ x: p.x + nx, y: p.y + ny }))
      }

      updateElement(
        id,
        newStateOptions,
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
        resizeValue(
          resizeCorner,
          resizeType,
          clientX,
          clientY,
          padding,
          s_element,
          mouseAction,
          resizeOldDementions
        ),
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
      
      if (lastElement.tool == "text") {
        createTextArea(lastElement)
      }

      if (!lockTool && lastElement.tool !== "pencil") {
        setSelectedTool("selection");
        if (lastElement.tool !== "text") setSelectedElement(lastElement);
      }
      return
    }

    if (action.startsWith("resize")) {
      const { id, x1, y1, x2, y2 } = adjustCoordinates(
        getElementById(selectedElement.id, elements)
      );
      updateElement(id, { x1, x2, y1, y2 }, setElements, elements, true);
      return
    }
  };

  const handleWheel = (event) => {
    if (event.ctrlKey) {
      const factor = Math.abs(10 - scale);
      const step = event.deltaY < 0 ? scale / factor : -(scale / factor);
      onZoom(step);
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

    const pd = minmax(10 / scale, [0.5, 50]);
    
    elements.forEach((element) => {
      if (element.id == selectedElement?.id) {
        drawFocuse(element, context, pd, scale)
      }
      draw(element, context);
    });
    
    setPadding(pd);

    context.restore();
  }, [elements, selectedElement, scale, translate, dimension, rerender]);

  

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

    if (selectedTool == "image") {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.id = "fileInput";
      fileInput.click();

      const fullWidth = canvasRef.current.width
      const fullHeight = canvasRef.current.height

      const { clientX, clientY } = mousePosition({
        clientX: fullWidth / 2,
        clientY: fullHeight / 2,
      });

      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const maxSize = 3 * 1024 * 1024; // 3MB
        if (file.size > maxSize) {
          alert("File is too big! Please select an image under 3MB.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result;

          const img = new Image();
          img.src = base64;

          img.onload = () => {
            const maxW = fullWidth / scale / 1.5;
            const maxH = fullHeight / scale / 1.5;
            let w = img.width;
            let h = img.height;

            const img_scale = Math.min(maxW / w, maxH / h);
            const width = w * img_scale / 2;
            const height = h * img_scale / 2;

            const x1 = clientX - width;
            const y1 = clientY - height;
            const x2 = clientX + width;
            const y2 = clientY + height;

            const element = createElement({
              x1,
              y1,
              x2,
              y2,
              style : { ...style, strokeWidth: 0 },
              tool : selectedTool,
              image : base64
            }
            );

            imageCache.set(element.id, img);
            setElements((prevState) => [...prevState, element]);
          };
        };
        reader.readAsDataURL(file);
      });

      setSelectedTool("selection");
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
    handleDoubleClick,
    dimension,
  };
}
