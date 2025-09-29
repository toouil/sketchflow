import { createContext, useContext, useEffect, useState } from "react";
import {
  Circle,
  Line,
  Rectangle,
  Selection,
  Diamond,
  Hand,
  Lock,
  Arrow,
  Image,
  Pencil,
  Text,
} from "../assets/icons";
import { BACKGROUND_COLORS, STROKE_COLORS, STROKE_STYLES } from "../global/var";
import { getElementById, minmax } from "../helper/element";
import useHistory from "../hooks/useHistory";
import { socket } from "../api/socket";

const AppContext = createContext();

const defaultElements = []
const defaultTranslate = {
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
  }
const defaultSelectedTool = "selection"
const defaultScale = 1
const defaultSelectedElement = null
const defaultAction = "none"
const defaultScaleOffset = { x: 0, y: 0 }
const defaultSession = null
const defaultLockTool = false
const defaultStyle = {
    strokeWidth: 3,
    strokeColor: STROKE_COLORS[0],
    strokeStyle: STROKE_STYLES[0].slug,
    fill: BACKGROUND_COLORS[0],
    opacity: 100,
    borderRadius: 0
  }

const isElementsInLocal = () => {
  try {
    JSON.parse(localStorage.getItem("elements")).forEach(() => {});
    return JSON.parse(localStorage.getItem("elements"));
  } catch (err) {
    return defaultElements;
  }
};

const initialElements = isElementsInLocal();

export function AppContextProvider({ children }) {
  const [session, setSession] = useState(defaultSession);
  const [selectedElement, setSelectedElement] = useState(defaultSelectedElement);
  const [action, setAction] = useState(defaultAction);
  const [selectedTool, setSelectedTool] = useState(defaultSelectedTool);
  const [translate, setTranslate] = useState(defaultTranslate);
  const [scale, setScale] = useState(defaultScale);
  const [scaleOffset, setScaleOffset] = useState(defaultScaleOffset);
  const [lockTool, setLockTool] = useState(defaultLockTool);
  const [style, setStyle] = useState(defaultStyle);
  const [elements, setElements, undo, redo] = useHistory(
    initialElements,
    session
  );


  useEffect(() => {
    try {
      localStorage.setItem("elements", JSON.stringify(elements));
    } catch (err) {
      alert("We couldn’t save your last action. Try again.");
      return;
    }

    if (!getElementById(selectedElement?.id, elements)) {
      setSelectedElement(null);
    }
  }, [elements, session, selectedElement]);

  const onZoom = (delta) => {
    if (delta == "default") {
      setScale(1);
      return;
    }

    setScale((prevState) => minmax(prevState + delta, [0.1, 20]));
  };

  const toolAction = (slug) => {
    if (slug == "lock") {
      setLockTool((prevState) => !prevState);
      return;
    }
    setSelectedTool(slug);
  };

  const tools = [
    [
      {
        slug: "lock",
        icon: Lock,
        title: "Keep selected tool active after drawing",
        toolAction,
      },
    ],
    [
      {
        slug: "hand",
        icon: Hand,
        title: "Hand",
        toolAction,
      },
      {
        slug: "selection",
        icon: Selection,
        title: "Selection",
        toolAction,
      },
      {
        slug: "rectangle",
        icon: Rectangle,
        title: "Rectangle",
        toolAction,
      },
      {
        slug: "diamond",
        icon: Diamond,
        title: "Diamond",
        toolAction,
      },
      {
        slug: "circle",
        icon: Circle,
        title: "Circle",
        toolAction,
      },
      {
        slug: "arrow",
        icon: Arrow,
        title: "Arrow",
        toolAction,
      },
      {
        slug: "line",
        icon: Line,
        title: "Line",
        toolAction,
      },
      {
        slug: "pencil",
        icon: Pencil,
        title: "Pencil",
        toolAction,
      },
      {
        slug: "text",
        icon: Text,
        title: "Text",
        toolAction,
      },
      {
        slug: "image",
        icon: Image,
        title: "Image",
        toolAction,
      }
    ]
  ];

  useEffect(() => {
    if (session) {
      socket.on("setElements", (data) => {
        setElements(data, true, false);
      });
    }
  }, [session]);

  function setToDefault () {
    setSelectedTool(defaultSelectedTool)
    setAction(defaultAction)
    setElements(defaultElements)
    setTranslate(defaultTranslate)
    setLockTool(defaultLockTool)
    setScale(defaultScale)
    setScaleOffset(defaultScaleOffset)
    setStyle(defaultStyle)
    setSession(defaultSession)
  }

  return (
    <AppContext.Provider
      value={{
        action,
        setAction,
        tools,
        selectedTool,
        setSelectedTool,
        elements,
        setElements,
        translate,
        setTranslate,
        scale,
        setScale,
        onZoom,
        scaleOffset,
        setScaleOffset,
        lockTool,
        setLockTool,
        style,
        setStyle,
        selectedElement,
        setSelectedElement,
        undo,
        redo,
        session,
        setSession,
        setToDefault
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
