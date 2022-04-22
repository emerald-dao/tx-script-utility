import React from "react";
import configureCadence from "./cadence";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("react-monaco-editor"), {
  ssr: false,
});

export default function CadenceEditor(props) {
  const { onReady = () => console.log("Monaco Editor is ready!"), code, updateCode } = props;
  return (
    <div>
      <MonacoEditor
        editorWillMount={(monaco) => {
          configureCadence(monaco);
          onReady();
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
    </div>
  );
}
