import { motion } from "framer-motion";
import { Xmark } from "../assets/icons";
import { useState } from "react";

export default function Collaboration() {
  const [openCollabBox, setOpenCollabBox] = useState(false);
  const [session, setSession] = useState(false)

  return (
    <div className="collaboration">
      <button
        type="button"
        className="collaborateButton"
        onClick={() => setOpenCollabBox(true)}
      >
        Share
      </button>

      {openCollabBox && (
        <CollaborationBoxx setOpenCollabBox={setOpenCollabBox} />
      )}
    </div>
  );
}

function CollaborationBoxx({ setOpenCollabBox }) {
  const exit = () => setOpenCollabBox(false);
  return (
    <div className="collaborationContainer">
      <motion.div
        className="collaborationBoxBack"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={exit}
      ></motion.div>
      <motion.section
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.15 }}
        className="collaborationBox"
      >
        <button onClick={exit} type="button" className="closeCollbBox">
          <Xmark />
        </button>
        <div className="collaborationGroup">
          <h1>Live collaboration</h1>
        </div>

        <div className="collaborationGroup">
          <label htmlFor="collabName">Your name</label>
          <input type="text" placeholder="Your name" id="collabName" />
        </div>

        <div className="collaborationGroup">
          <div className="collabLink">
            <label htmlFor="collabUrl">Link</label>
            <input
              id="collabUrl"
              type="url"
              value="http://localhost:5173/"
              disabled
            />
          </div>
          <div className="copyCollabLink">
            <button type="submit">Copy link</button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function CollaborationBox({ setOpenCollabBox, children }) {
  const exit = () => setOpenCollabBox(false);
  return (
    <div className="collaborationContainer">
      <motion.div
        className="collaborationBoxBack"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={exit}
      ></motion.div>
      <motion.section
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.15 }}
        className="collaborationBox"
      >
        <button onClick={exit} type="button" className="closeCollbBox">
          <Xmark />
        </button>

      </motion.section>
    </div>)
}
