import { useAppContext } from "../provider/AppStates";

export default function ToolBar() {
  const { tools: toolCols, selectedTool, lockTool } = useAppContext();

  return (
    <section className="toolbar">
      {toolCols.map((tools, index) => (
        <div key={index}>
          {tools.map((tool, index_) => (
            <button
              key={index_}
              className={
                "toolbutton" +
                ` ${tool.slug}` +
                (selectedTool == tool.slug ? " selected" : "")
              }
              data-lock={lockTool}
              onClick={() => tool.toolAction(tool.slug)}
              title={tool.title}
            >
              <tool.icon />
            </button>
          ))}
        </div>
      ))}
    </section>
  );
}
