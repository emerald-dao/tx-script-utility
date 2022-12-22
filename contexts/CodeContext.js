import * as fcl from "@onflow/fcl";
import {
    executeScript,
    getEnvironment,
    getTemplateInfo,
    replaceImportAddresses,
    sendTransaction,
} from "@onflow/flow-cadut";
import React, { createContext, useContext, useEffect, useState } from "react";
import { baseScript } from "../templates/code";
import { getOrderedArgValues } from "../utils/types";
import { useFlow } from "./FlowContext";

export const CodeContext = createContext({});
export const useCode = () => useContext(CodeContext);

const CodeProvider = ({ children }) => {
    const { network } = useFlow();
    const [code, setCode] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const [editorReady, setEditorReady] = useState(false);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState();
    const [error, setError] = useState();
    const templateInfo = getTemplateInfo(code);
    const { type, args } = templateInfo;

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
        autoSaveCodeToSession();
        clearResults();
        setRunning(true);
        const fclArgs = getOrderedArgValues(args, finalArgs);
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

    const autoSaveCodeToSession = () => {
        try {
            window.sessionStorage.setItem(
                "autoSavedCode",
                Buffer.from(code).toString("base64")
            );
        } catch (e) {}
    };

    const getDefaultCode = () => {
        const savedCode = window.sessionStorage.getItem("autoSavedCode");
        if (savedCode) {
            return Buffer.from(savedCode, "base64").toString();
        } else {
            return baseScript;
        }
    };

    useEffect(() => {
        setCode(getDefaultCode());
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const savedCode =
                window.sessionStorage.getItem("autoSavedCode") || "";
            if (savedCode === Buffer.from(code).toString("base64")) {
                return;
            } else {
                try {
                    window.sessionStorage.setItem(
                        "autoSavedCode",
                        Buffer.from(code).toString("base64")
                    );
                } catch (e) {}
            }
        }, 10000);

        return () => {
            clearInterval(intervalId);
        };
    });

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
