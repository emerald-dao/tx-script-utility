import {
    getEnvironment,
    getTemplateInfo,
    replaceImportAddresses,
} from "@onflow/flow-cadut";
import React, { createContext, useContext, useState } from "react";
import { baseScript } from "../templates/code";
import { useFlow } from "./FlowContext";

export const CodeContext = createContext({});
export const useCode = () => useContext(CodeContext);

const CodeProvider = ({ children }) => {
    const { network } = useFlow();
    const [code, setCode] = useState(baseScript);
    const [editorReady, setEditorReady] = useState(false);
    const templateInfo = getTemplateInfo(code);

    const updateImports = async () => {
        const env = await getEnvironment(network);
        const newCode = replaceImportAddresses(code, env);
        setCode(newCode);
    };

    const value = {
        code,
        setCode,
        editorReady,
        setEditorReady,
        updateImports,
        templateInfo,
    };

    return (
        <CodeContext.Provider value={value}>{children}</CodeContext.Provider>
    );
};

export default CodeProvider;
