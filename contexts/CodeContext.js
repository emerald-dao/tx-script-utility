import * as fcl from "@onflow/fcl";
import {
    executeScript,
    getEnvironment,
    getTemplateInfo,
    replaceImportAddresses,
    sendTransaction,
    splitArgs,
} from "@onflow/flow-cadut";
import React, { createContext, useContext, useState } from "react";
import { baseScript } from "../templates/code";
import { isJSON } from "../utils/types";
import { useFlow } from "./FlowContext";

export const CodeContext = createContext({});
export const useCode = () => useContext(CodeContext);

const CodeProvider = ({ children }) => {
    const { network } = useFlow();
    const [code, setCode] = useState(baseScript);
    const [readOnly, setReadOnly] = useState(false);
    const [editorReady, setEditorReady] = useState(false);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState();
    const [error, setError] = useState();
    const templateInfo = getTemplateInfo(code);
    const { type, args } = templateInfo;

    const getOrderedArgValues = (finalArgs) => {
        const argValues = [];
        for (let arg of args.map((a) => splitArgs(a)[0])) {
            let value = finalArgs[arg];
            if (isJSON(value)) {
                argValues.push(JSON.parse(value));
            } else {
                argValues.push(value);
            }
        }
        return argValues;
    };

    const updateImports = async () => {
        const env = await getEnvironment(network);
        const newCode = replaceImportAddresses(code, env);
        setCode(newCode);
    };

    const clearResults = () => {
        setResult();
        setError();
        setRunning(false);
    };

    const run = async (finalArgs) => {
        clearResults();
        setRunning(true);
        const fclArgs = getOrderedArgValues(finalArgs);
        if (type === "script") {
            const [scriptResult, scriptError] = await executeScript({
                code,
                args: fclArgs,
            });
            setRunning(false);
            if (!scriptError) {
                setResult(scriptResult);
                setError();
            } else {
                setResult();
                setError(scriptError.toString());
                console.error(scriptError);
            }
        } else if (type === "transaction") {
            if (!fcl.currentUser()) {
                await fcl.authenticate();
            }
            const [txId, txError] = await sendTransaction({
                code,
                args: fclArgs,
                limit: 9999,
                payer: fcl.authz,
                // Cadut is weird and doesn't poll right.
                wait: false,
            });
            if (txError) {
                setResult();
                setError(txError.toString());
                console.error(txError);
            } else {
                try {
                    const rawResult = await fcl.tx(txId).onceSealed();
                    const txResult = {
                        txId,
                        ...rawResult,
                    };
                    setResult(txResult);
                    setError();
                } catch (err) {
                    setResult();
                    setError(err.toString());
                    console.error(err);
                }
            }
            setRunning(false);
        } else {
            setError("Not Supported.");
        }
    };

    const value = {
        code,
        setCode,
        readOnly,
        setReadOnly,
        editorReady,
        clearResults,
        setEditorReady,
        updateImports,
        templateInfo,
        run,
        running,
        result,
        setResult,
        error,
        setError,
    };

    return (
        <CodeContext.Provider value={value}>{children}</CodeContext.Provider>
    );
};

export default CodeProvider;
