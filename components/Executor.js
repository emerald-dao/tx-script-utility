import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Transaction from "./Transaction";
import CadenceEditor from "./CadenceEditor";
import { buttonLabels } from "../templates/labels";
import {
    executeScript,
    sendTransaction,
    getTemplateInfo,
    setEnvironment,
    extendEnvironment,
    getEnvironment,
    extractImports,
    replaceImportAddresses,
} from "flow-cadut";

import { useNetworkContext } from "../contexts/NetworkContext";
import { flovatarTotalSupply } from "../templates/code";

import * as fcl from "@onflow/fcl";
import "../flow/config.js";
import { configureForNetwork } from "../flow/config";
import { debounce, fetchRegistry, prepareEnvironments } from "../utils";

const CadenceChecker = dynamic(() => import("./LSP/CadenceChecker"), {
    ssr: false,
});
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

const getButtonLabel = (type, signers = 0) => {
    if (type === "contract") {
        return "Not Supported";
    }
    if (signers > 1) {
        // TODO: Implement multisig
        return "Multisig is not Supported";
    }
    return buttonLabels[type];
};

const getImports = debounce(async (code, setList) => {
    const list = extractImports(code);
    setList(list);
}, 300);

const prepareFinalImports = async (list, setFinal) => {
    const env = await getEnvironment();
    const replacedList = {};
    for (const key in list) {
        replacedList[key] = env[key];
    }
    const finalList = Object.keys(replacedList).map((key) => {
        return {
            name: key,
            address: replacedList[key],
        };
    });
    setFinal(finalList);
};

export const Executor = () => {
    const [monacoReady, setMonacoReady] = useState(false);
    const [code, updateScriptCode] = useState(flovatarTotalSupply);
    const [result, setResult] = useState();
    const [error, setError] = useState();
    const [user, setUser] = useState();
    const [registry, setRegistry] = useState(null);
    const [importList, setImportList] = useState({});
    const [finalImports, setFinalImports] = useState([]);
    const network = useNetworkContext() || "testnet";
    const templateInfo = getTemplateInfo(code);
    const { type, signers, args } = templateInfo;

    // METHDOS
    const updateImports = async () => {
        const env = await getEnvironment(network);
        const newCode = replaceImportAddresses(code, env);
        updateScriptCode(newCode);
    };

    const send = async () => {
        await setEnvironment(network);
        extendEnvironment(registry);

        switch (type) {
            // Script Handling
            case "script": {
                const [result, scriptError] = await executeScript({ code });
                if (!scriptError) {
                    setResult(result);
                    setError();
                } else {
                    setResult();
                    setError(scriptError.toString());
                    console.error(scriptError);
                }
                break;
            }

            // Transaction Handling
            case "transaction": {
                if (!fcl.currentUser()) {
                    configureForNetwork(network);
                    await fcl.authenticate();
                }

                const [txResult, txError] = await sendTransaction({
                    code,
                    limit: 9999,
                    payer: fcl.authz,
                });
                if (!txError) {
                    setResult(txResult);
                    setError();
                } else {
                    setResult();
                    setError(txError.toString());
                    console.error(txError);
                }
                break;
            }

            default:
                break;
        }
    };

    const getRegistry = async () => {
        const data = await fetchRegistry();
        const registry = prepareEnvironments(data);
        extendEnvironment(registry);
        setRegistry(registry);
    };

    // EFFECTS
    useEffect(() => {
        fcl.unauthenticate();
        fcl.currentUser().subscribe(setUser);
        getRegistry().then();
    }, []);

    useEffect(() => {
        setEnvironment(network);
        if (registry !== null) {
            extendEnvironment(registry);
        }
    }, [network, registry]);

    useEffect(() => getImports(code, setImportList), [code]);

    useEffect(
        () => prepareFinalImports(importList, setFinalImports),
        [importList, network]
    );

    const fclAble = signers && signers === 1 && type === "transaction";
    const disabled =
        type === "unknown" ||
        type === "contract" ||
        !monacoReady ||
        signers > 1;

    return (
        <>
            <Transaction />
            <CadenceChecker>
                <div className="cadence-container">
                    <CadenceEditor
                        className={"mb-2"}
                        onReady={() => {
                            setMonacoReady(true);
                        }}
                        code={code}
                        updateCode={updateScriptCode}
                    />
                </div>
            </CadenceChecker>
            {!monacoReady && (
                <span aria-busy="true">
                    Please wait while we setup the Cadence Editor...
                </span>
            )}
            {monacoReady && (
                <>
                    <div className="mb-1">
                        <h4>Replaced Addresses</h4>
                        <p>
                            These are the addresses, which will be used, before
                            sending Cadence template to network:
                        </p>
                        <ul>
                            {finalImports.map((item) => {
                                const { name, address } = item;
                                return (
                                    <li key={name}>
                                        <b>{name}</b> : {address}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="two-items-grid">
                        <button onClick={updateImports}>Update Imports</button>
                        <button onClick={send} disabled={disabled}>
                            {getButtonLabel(type, signers)}
                        </button>
                    </div>
                    <h4>Result</h4>
                    {result ? (
                        typeof result === "object" ? (
                            <DynamicReactJson src={result} theme="monokai" />
                        ) : (
                            <p>{result}</p>
                        )
                    ) : (
                        <p>{error}</p>
                    )}
                    <h1>{user?.addr}</h1>
                    {fclAble ? (
                        <p className="note">
                            ✅ Transaction could be signed with FCL
                        </p>
                    ) : null}
                </>
            )}
        </>
    );
};
