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
} from "../assets/icons";
import { BACKGROUND_COLORS, STROKE_COLORS, STROKE_STYLES } from "../global/var";
import { getElementById, minmax } from "../helper/element";
import useHistory from "../hooks/useHistory";
import { socket } from "../api/socket";

const AppContext = createContext();

const isElementsInLocal = () => {
  try {
    JSON.parse(localStorage.getItem("elements")).forEach(() => {});
    return JSON.parse(localStorage.getItem("elements"));
  } catch (err) {
    return [];
  }
};

const initialElements = isElementsInLocal();

export function AppContextProvider({ children }) {
  const [session, setSession] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements, undo, redo] = useHistory(
    initialElements,
    session
  );
  const [action, setAction] = useState("none");
  const [selectedTool, setSelectedTool] = useState("selection");
  const [translate, setTranslate] = useState({
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
  });
  const [scale, setScale] = useState(1);
  const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 });
  const [lockTool, setLockTool] = useState(false);
  const [style, setStyle] = useState({
    strokeWidth: 3,
    strokeColor: STROKE_COLORS[0],
    strokeStyle: STROKE_STYLES[0].slug,
    fill: BACKGROUND_COLORS[0],
    opacity: 100,
  });

  useEffect(() => {
    localStorage.setItem("elements", JSON.stringify(elements));

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
