import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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

import { baseScript, baseTransaction } from "../templates/code";

import * as fcl from "@onflow/fcl";
import "../flow/config.js";
import { configureForNetwork } from "../flow/config";
import { debounce, fetchRegistry, prepareEnvironments } from "../utils";

const CadenceChecker = dynamic(() => import("./LSP/CadenceChecker"), {
    ssr: false,
});
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

// String helper function
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

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

const Runner = () => {
    const [network, setNetwork] = useState("testnet");
    const [monacoReady, setMonacoReady] = useState(false);
    const [code, updateScriptCode] = useState(baseScript);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState();
    const [error, setError] = useState();
    const [user, setUser] = useState();
    const [registry, setRegistry] = useState(null);
    const [importList, setImportList] = useState({});
    const [finalImports, setFinalImports] = useState([]);
    const templateInfo = getTemplateInfo(code);
    const { type, signers, args } = templateInfo;

    const clear = () => {
        setResult();
        setError();
        setRunning(false);
    };

    const switchNetwork = async (e) => {
        clear();
        fcl.unauthenticate();
        if (e.target.checked) {
            configureForNetwork("mainnet");
            setNetwork("mainnet");
        } else {
            configureForNetwork("testnet");
            setNetwork("testnet");
        }
    };

    const getTransactionLink = (txId) => {
        let baseUrl = `https://flowscan.org`;
        if (network === "testnet") {
            baseUrl = `https://testnet.flowscan.org`;
        }
        return `${baseUrl}/transaction/${txId}`;
    };

    // METHDOS
    const updateImports = async () => {
        const env = await getEnvironment(network);
        const newCode = replaceImportAddresses(code, env);
        updateScriptCode(newCode);
    };

    const send = async () => {
        await setEnvironment(network);
        extendEnvironment(registry);
        setRunning(true);

        switch (type) {
            // Script Handling
            case "script": {
                const [result, scriptError] = await executeScript({ code });
                setRunning(false);
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

                const [result, txError] = await sendTransaction({
                    code,
                    limit: 9999,
                    payer: fcl.authz,
                    wait: false,
                });
                setRunning(false);
                if (!txError) {
                    setResult(getTransactionLink(result));
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

    // EFFECTS
    useEffect(() => {
        fcl.unauthenticate();
        fcl.currentUser().subscribe(setUser);
        const getRegistry = async () => {
            const data = await fetchRegistry();
            const registry = prepareEnvironments(data);
            extendEnvironment(registry);
            setRegistry(registry);
        };
        getRegistry();
    }, []);

    useEffect(() => {
        setEnvironment(network);
        if (registry !== null) {
            extendEnvironment(registry);
        }
    }, [network, registry]);

    useEffect(() => {
        const getImports = debounce(async () => {
            const list = extractImports(code);
            setImportList(list);
        }, 300);
        getImports(code, setImportList);
    }, [code]);

    useEffect(() => {
        const prepareFinalImports = async () => {
            const env = await getEnvironment();
            const replacedList = {};
            for (const key in importList) {
                replacedList[key] = env[key];
            }
            const finalList = Object.keys(replacedList).map((key) => {
                return {
                    name: key,
                    address: replacedList[key],
                };
            });
            setFinalImports(finalList);
        };
        prepareFinalImports(importList);
    }, [importList, network]);

    const fclAble =
        user?.addr && signers && signers === 1 && type === "transaction";
    const disabled =
        type === "unknown" ||
        type === "contract" ||
        !monacoReady ||
        signers > 1;

    return (
        <>
            <nav className="container header">
                <ul>
                    <li>
                        <h1>Cadence Runner</h1>
                    </li>
                </ul>
                <ul>
                    <li>
                        <label htmlFor="switch" onChange={switchNetwork}>
                            <span className="inputChange">Testnet</span>
                            <input
                                type="checkbox"
                                id="switch"
                                name="switch"
                                role="switch"
                            />
                            <span className="inputChange">Mainnet</span>
                        </label>
                    </li>
                    <li>
                        <details role="list" dir="rtl">
                            <summary aria-haspopup="listbox" role="link">
                                Templates
                            </summary>
                            <ul role="listbox">
                                <li>
                                    <a
                                        onClick={() => {
                                            clear();
                                            updateScriptCode(baseScript);
                                        }}
                                    >
                                        Script
                                    </a>
                                </li>
                                <li>
                                    <a
                                        onClick={() => {
                                            clear();
                                            updateScriptCode(baseTransaction);
                                        }}
                                    >
                                        Transaction
                                    </a>
                                </li>
                            </ul>
                        </details>
                    </li>
                    <li>
                        <details role="list" dir="rtl">
                            <summary aria-haspopup="listbox" role="link">
                                Options
                            </summary>
                            <ul role="listbox">
                                <li>
                                    <a
                                        onClick={() =>
                                            user?.addr
                                                ? fcl.unauthenticate()
                                                : fcl.authenticate()
                                        }
                                    >
                                        {user?.addr ? "Logout" : "Login"}
                                    </a>
                                </li>
                                <li>
                                    <a onClick={updateImports}>
                                        Update Imports
                                    </a>
                                </li>
                                <li>
                                    <a onClick={() => clear()}>Clear Results</a>
                                </li>
                            </ul>
                        </details>
                    </li>
                    <li>
                        <a
                            href="#"
                            role="button"
                            onClick={send}
                            disabled={disabled}
                            aria-busy={running}
                        >
                            {getButtonLabel(type, signers)}
                        </a>
                    </li>
                </ul>
            </nav>
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
                <dialog open>
                    <article>
                        <progress indeterminate="true"></progress>
                        Please wait while we setup the Cadence Editor...
                    </article>
                </dialog>
            )}
            {monacoReady && (
                <article aria-busy={running}>
                    <header>
                        {capitalize(type)} Result
                        {type === "transaction" &&
                            (user?.addr ? (
                                <>
                                    <br />
                                    <p className="note">
                                        Running as {user?.addr}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <br />
                                    <a onClick={() => fcl.authenticate()}>
                                        Login
                                    </a>
                                </>
                            ))}
                        {fclAble ? (
                            <p className="note">
                                ✅ Transaction could be signed with FCL
                            </p>
                        ) : null}
                    </header>
                    {result ? (
                        typeof result === "object" ? (
                            <DynamicReactJson src={result} theme="monokai" />
                        ) : (
                            <p>{result}</p>
                        )
                    ) : (
                        <p>{error}</p>
                    )}
                </article>
            )}
        </>
    );
};

export default Runner;
