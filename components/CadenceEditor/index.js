import React from "react";
import configureCadence from "./cadence";
import dynamic from "next/dynamic";
import { useCode } from "../../contexts/CodeContext";

const MonacoEditor = dynamic(() => import("react-monaco-editor"), {
    ssr: false,
});

const CadenceEditor = () => {
    const { code, setCode, readOnly, setEditorReady } = useCode();
    return (
        <MonacoEditor
            editorDidMount={(editor, monaco) => {
                configureCadence(monaco);
                setEditorReady(true);

                // Register event listener to resize Monaco to container
                window.addEventListener("resize", () => {
                    editor.layout();
                });
            }}
            value={code}
            onChange={setCode}
            height={600}
            language="cadence"
            options={{
                minimap: {
                    enabled: false,
                },
                readOnly: readOnly,
            }}
        />
    );
};

export default CadenceEditor;
