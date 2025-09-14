import React, { useEffect, useState } from "react";
import {
  deleteElement,
  duplicateElement,
  minmax,
  moveElementLayer,
  updateElement,
} from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import { BACKGROUND_COLORS, STROKE_COLORS, STROKE_STYLES } from "../global/var";
import {
  Backward,
  Delete,
  Duplicate,
  Forward,
  ToBack,
  ToFront,
} from "../assets/icons";

export default function Style({ selectedElement }) {
  const { elements, setElements, setSelectedElement, setStyle } =
    useAppContext();
    
  const [elementStyle, setElementStyle] = useState({
    fill: selectedElement?.fill,
    strokeWidth: selectedElement?.strokeWidth,
    strokeStyle: selectedElement?.strokeStyle,
    strokeColor: selectedElement?.strokeColor,
    opacity: selectedElement?.opacity,
  });

  useEffect(() => {
    setElementStyle({
      fill: selectedElement?.fill,
      strokeWidth: selectedElement?.strokeWidth,
      strokeStyle: selectedElement?.strokeStyle,
      strokeColor: selectedElement?.strokeColor,
      opacity: selectedElement?.opacity,
    });
  }, [selectedElement]);

  const setStylesStates = (styleObject) => {
    setElementStyle((prevState) => ({ ...prevState, ...styleObject }));
    setStyle((prevState) => ({ ...prevState, ...styleObject }));
  };

  if (!selectedElement) return;
  return (
    <section className="styleOptions">
      <div className="group strokeColor">
        <p>Stroke</p>
        <div className="innerGroup">
          {STROKE_COLORS.map((color, index) => (
            <button
              type="button"
              title={color}
              style={{ "--color": color }}
              key={index}
              className={
                "itemButton color" +
                (color == elementStyle.strokeColor ? " selected" : "")
              }
              onClick={() => {
                setStylesStates({ strokeColor: color });
                updateElement(
                  selectedElement.id,
                  {
                    strokeColor: color,
                  },
                  setElements,
                  elements
                );
              }}
            ></button>
          ))}
        </div>
      </div>
      <div className="group backgroundColor">
        <p>Background</p>
        <div className="innerGroup">
          {BACKGROUND_COLORS.map((fill, index) => (
            <button
              type="button"
              title={fill}
              className={
                "itemButton color" +
                (fill == elementStyle.fill ? " selected" : "")
              }
              style={{ "--color": fill }}
              key={index}
              onClick={() => {
                setStylesStates({ fill });
                updateElement(
                  selectedElement.id,
                  {
                    fill,
                  },
                  setElements,
                  elements
                );
              }}
            ></button>
          ))}
        </div>
      </div>
      <div className="group strokeWidth">
        <p>Stroke width</p>
        <div className="innerGroup">
          <input
            type="range"
            className="itemRange"
            min={0}
            max={20}
            value={elementStyle.strokeWidth}
            step="1"
            onChange={({ target }) => {
              setStylesStates({ strokeWidth: minmax(+target.value, [0, 20]) });
              updateElement(
                selectedElement.id,
                {
                  strokeWidth: minmax(+target.value, [0, 20]),
                },
                setElements,
                elements
              );
            }}
          />
        </div>
      </div>
      <div className="group strokeStyle">
        <p>Stroke style</p>
        <div className="innerGroup">
          {STROKE_STYLES.map((style, index) => (
            <button
              type="button"
              title={style.slug}
              className={
                "itemButton option" +
                (style.slug == elementStyle.strokeStyle ? " selected" : "")
              }
              key={index}
              onClick={() => {
                setStylesStates({ strokeStyle: style.slug });
                updateElement(
                  selectedElement.id,
                  {
                    strokeStyle: style.slug,
                  },
                  setElements,
                  elements
                );
              }}
            >
              <style.icon />
            </button>
          ))}
        </div>
      </div>
      <div className="group opacity">
        <p>Opacity</p>
        <div className="innerGroup">
          <input
            type="range"
            min={0}
            max={100}
            className="itemRange"
            value={elementStyle.opacity}
            step="10"
            onChange={({ target }) => {
              setStylesStates({
                opacity: minmax(+target.value, [0, 100]),
              });
              updateElement(
                selectedElement.id,
                {
                  opacity: minmax(+target.value, [0, 100]),
                },
                setElements,
                elements
              );
            }}
          />
        </div>
      </div>
      {selectedElement?.id && (
        <React.Fragment>
          <div className="group layers">
            <p>Layers</p>
            <div className="innerGroup">
              <button
                type="button"
                className="itemButton option"
                title="Send to back"
                onClick={() =>
                  moveElementLayer(selectedElement.id, 0, setElements, elements)
                }
              >
                <ToBack />
              </button>
              <button
                type="button"
                className="itemButton option"
                title="Send backward"
                onClick={() =>
                  moveElementLayer(
                    selectedElement.id,
                    -1,
                    setElements,
                    elements
                  )
                }
              >
                <Backward />
              </button>
              <button
                type="button"
                className="itemButton option"
                title="Bring forward"
                onClick={() =>
                  moveElementLayer(selectedElement.id, 1, setElements, elements)
                }
              >
                <Forward />
              </button>
              <button
                type="button"
                className="itemButton option"
                title="Bring to front"
                onClick={() =>
                  moveElementLayer(selectedElement.id, 2, setElements, elements)
                }
              >
                <ToFront />
              </button>
            </div>
          </div>

          <div className="group actions">
            <p>Actions</p>
            <div className="innerGroup">
              <button
                type="button"
                onClick={() =>
                  deleteElement(
                    selectedElement,
                    setElements,
                    setSelectedElement
                  )
                }
                title="Delete"
                className="itemButton option"
              >
                <Delete />
              </button>
              <button
                type="button"
                className="itemButton option"
                title="Duplicate ~ Ctrl + d"
                onClick={() =>
                  duplicateElement(
                    selectedElement,
                    setElements,
                    setSelectedElement,
                    10
                  )
                }
              >
                <Duplicate />
              </button>
            </div>
          </div>
        </React.Fragment>
      )}
    </section>
  );
}
