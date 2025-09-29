import { updateElement } from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import { writing } from "../helper/canvas";

export default function useTextArea() {
  const { elements, setElements, scale, translate, scaleOffset } = useAppContext();

  const canvasToWindow = (clientX, clientY) => {
    const x = clientX * scale + translate.x * scale - scaleOffset.x;
    const y = clientY * scale + translate.y * scale - scaleOffset.y;
    return { x, y };
  };

  function createTextArea(element, update = false) {
    const { id, x1, y1, x2, y2, text, strokeColor } = element;
    writing(id)

    const xy = { x2, y2 };
    const textarea = document.createElement("textarea");
    textarea.id = id;
    textarea.className = "textBox";
    textarea.style.top = canvasToWindow(x1,y1).y + "px";
    textarea.style.left = canvasToWindow(x1,y1).x + "px";
    textarea.style.fontSize = 30 * scale + "px";
    textarea.style.color = strokeColor;
    textarea.textContent = text;
    document.body.appendChild(textarea);
    textarea.focus();
    // textarea.selectionStart = text.length
    if (update) textarea.setSelectionRange(0, text.length)

    textarea.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    function getTextWidth(text) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = '30px Arial';
      return ctx.measureText(text).width;
    }

      const { right, bottom } = textarea.getBoundingClientRect();

      const lines = textarea.value.split("\n");

      const longest = Math.max(
        ...lines.map((line) => getTextWidth(line))
      );

      const width = longest;
      const height = lines.length * 30;

      if (bottom >= window.innerHeight) {
        textarea.style.top = "auto";
        textarea.style.bottom = 0;
      } else {
        textarea.style.height = height * scale + "px";
      }
      if (right >= window.innerWidth) {
        textarea.style.left = "auto";
        textarea.style.right = 0;
      } else {
        textarea.style.width = width * scale + "px";
      }

      xy.x2 = x1 + width
      xy.y2 = y1 + height

    textarea.addEventListener("input", (e) => {
      const { right, bottom } = textarea.getBoundingClientRect();

      const lines = textarea.value.split("\n");

      const longest = Math.max(
        ...lines.map((line) => getTextWidth(line))
      );

      const width = longest;
      const height = lines.length * 30;

      if (bottom >= window.innerHeight) {
        textarea.style.top = "auto";
        textarea.style.bottom = 0;
      } else {
        textarea.style.height = height * scale + "px";
      }
      if (right >= window.innerWidth) {
        textarea.style.left = "auto";
        textarea.style.right = 0;
      } else {
        textarea.style.width = width * scale + "px";
      }

      xy.x2 = x1 + width
      xy.y2 = y1 + height
      updateElement(id, { text: e.target.value, ...xy }, setElements, elements, true);
    });
    
    textarea.addEventListener("focusout", (e) => {
      writing(null)
      updateElement(id, { text: e.target.value, ...xy }, setElements, elements, true);
      document.body.removeChild(textarea);
    });
  }

  return createTextArea;
}
