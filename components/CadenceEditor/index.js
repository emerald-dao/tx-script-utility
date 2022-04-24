import React from "react";
import configureCadence from "./cadence";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("react-monaco-editor"), {
  ssr: false,
});

export default function CadenceEditor(props) {
  const {
    onReady = () => console.log("Monaco Editor is ready!"),
    code,
    updateCode,
  } = props;

  return (
    <MonacoEditor
      editorDidMount={(editor, monaco) => {
        configureCadence(monaco);
        onReady(monaco);

        // Register event listener to resize Monaco to container
        window.addEventListener("resize", () => {
          editor.layout();
        });
      }}
      value={code}
      onChange={updateCode}
      height={300}
      language="cadence"
      options={{
        minimap: {
          enabled: false,
        },
      }}
    />
  );
}
