import { useState } from "react";
import { Delete, Download, Folder, MenuIcon, Xmark } from "../assets/icons";
import { useAppContext } from "../provider/AppStates";
import { saveElements, uploadElements } from "../helper/element";

export default function Menu() {
  const [show, setShow] = useState(false);

  return (
    <div className="menu">
      <button
        className="menuBtn sectionStyle"
        type="button"
        onClick={() => setShow((prev) => !prev)}
      >
        {show ? <Xmark /> : <MenuIcon />}
      </button>

      {show && <MenuBox close={() => setShow(false)} />}
    </div>
  );
}

function MenuBox({ close }) {
  const { elements, setElements, setToDefault, session } = useAppContext();
  const uploadJson = () => {
    uploadElements(setElements);
    close();
  };
  const downloadJson = () => {
    saveElements(elements);
    close();
  };
  const reset = () => {
    if (window.confirm("The entire canvas will be erased. Are you sure?")) {
      setToDefault();
      close();
    }
  };

  return (
    <>
      <div className="menuBlur" onClick={close}></div>
      <section className="menuItems">
        <button className="menuItem" type="button" onClick={uploadJson}>
          <Folder /> <span>Open</span>
        </button>
        <button className="menuItem" type="button" onClick={downloadJson}>
          <Download /> <span>Save</span>
        </button>
        {!session && (
          <button className="menuItem" type="button" onClick={reset}>
            <Delete /> <span>Reset the canvas</span>
          </button>
        )}
      </section>
    </>
  );
}
