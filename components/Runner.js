import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CadenceEditor from "./CadenceEditor";
import { buttonLabels } from "../templates/labels";
import { executeScript, sendTransaction } from "@onflow/flow-cadut";
import { baseScript, baseTransaction } from "../templates/code";
import { useCode } from "../contexts/CodeContext";
import { useFlow } from "../contexts/FlowContext";
import * as fcl from "@onflow/fcl";
import { capitalize } from "../utils";
import { useRouter } from "next/router";
import {
    FaGlobe,
    FaBook,
    FaBars,
    FaCheck,
    FaExclamationTriangle,
    FaLink,
    FaInfo,
} from "react-icons/fa";
import { isMobile } from "react-device-detect";

const CadenceChecker = dynamic(() => import("./LSP/CadenceChecker"), {
    ssr: false,
});
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

const Runner = () => {
    const { query } = useRouter();
    const { code, setCode, editorReady, updateImports, templateInfo } =
        useCode();
    const { network, switchNetwork, getTransactionLink, user } = useFlow();
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState();
    const [error, setError] = useState();
    const { type, signers } = templateInfo;

    const clear = () => {
        setResult();
        setError();
        setRunning(false);
    };

    useEffect(() => {
        if (query && query.code) {
            setCode(Buffer.from(query.code, "base64").toString());
        }
        if (
            query &&
            query.network &&
            (query.network === "testnet" ||
                query.network === "mainnet" ||
                query.network === "emulator")
        ) {
            switchNetwork(query.network);
        }
    }, [query, setCode, switchNetwork]);

    const getButtonLabel = () => {
        if (type === "contract") {
            return "Not Supported";
        }
        if (signers > 1) {
            // TODO: Implement multisig
            return "Multisig is not Supported";
        }
        return buttonLabels[type];
    };

    const send = async () => {
        clear();
        setRunning(true);
        if (type === "script") {
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
        } else if (type === "transaction") {
            if (!fcl.currentUser()) {
                await fcl.authenticate();
            }

            const [result, txError] = await sendTransaction({
                code,
                limit: 9999,
                payer: fcl.authz,
            });
            setRunning(false);
            if (!txError) {
                setResult(result);
                setError();
            } else {
                setResult();
                setError(txError.toString());
                console.error(txError);
            }
        } else {
            setError("Not Supported");
        }
    };

    const fclAble =
        user?.addr && signers && signers === 1 && type === "transaction";
    const disabled =
        type === "unknown" ||
        type === "contract" ||
        !editorReady ||
        signers > 1;

    return (
        <>
            <nav className="container header">
                <ul>
                    {!isMobile && (
                        <li>
                            <h1>Flow Runner</h1>
                        </li>
                    )}
                    <li>
                        <details role="list">
                            <summary
                                aria-haspopup="listbox"
                                role="button"
                                className="contrast outline"
                            >
                                <div className="centered-label">
                                    <FaGlobe />
                                    &nbsp;
                                    {capitalize(network)}
                                    {network === "emulator" && (
                                        <p data-tooltip="You must be running a local emulator (on :8888) and/or dev wallet (on :8701/fcl/authn)">
                                            <FaInfo />
                                        </p>
                                    )}
                                </div>
                            </summary>
                            <ul role="listbox">
                                <li>
                                    <a onClick={() => switchNetwork("testnet")}>
                                        Testnet
                                    </a>
                                </li>
                                <li>
                                    <a onClick={() => switchNetwork("mainnet")}>
                                        Mainnet
                                    </a>
                                </li>
                                <li>
                                    <a
                                        onClick={() =>
                                            switchNetwork("emulator")
                                        }
                                    >
                                        Emulator
                                    </a>
                                </li>
                            </ul>
                        </details>
                    </li>
                </ul>
                <ul>
                    <li>
                        <details role="list" dir="rtl">
                            <summary role="link">
                                <div className="centered-label">
                                    <FaBook />
                                </div>
                            </summary>
                            <ul role="listbox">
                                <li>
                                    <a
                                        onClick={() => {
                                            clear();
                                            setCode(baseScript);
                                        }}
                                    >
                                        Script
                                    </a>
                                </li>
                                <li>
                                    <a
                                        onClick={() => {
                                            clear();
                                            setCode(baseTransaction);
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
                            <summary role="link">
                                <div className="centered-label">
                                    <FaBars />
                                </div>
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
                                    <a
                                        onClick={() => {
                                            copyToClipboard(
                                                `${
                                                    window.location.host
                                                }?code=${Buffer.from(
                                                    code
                                                ).toString(
                                                    "base64"
                                                )}&network=${network}`
                                            );
                                        }}
                                    >
                                        Copy Link To Code
                                    </a>
                                </li>
                                <li>
                                    <a onClick={() => clear()}>Clear Results</a>
                                </li>
                            </ul>
                        </details>
                    </li>
                    <li>
                        <button
                            role="button"
                            onClick={send}
                            disabled={disabled}
                            aria-busy={running}
                        >
                            {getButtonLabel()}
                        </button>
                    </li>
                </ul>
            </nav>
            <CadenceChecker>
                <div className="cadence-container">
                    <CadenceEditor className={"mb-2"} />
                </div>
            </CadenceChecker>
            {!editorReady && (
                <dialog open>
                    <article>
                        <progress indeterminate="true"></progress>
                        Please wait while we setup the Cadence Editor...
                    </article>
                </dialog>
            )}
            {editorReady && (
                <article className={result ? "success" : error ? "error" : ""}>
                    <header aria-busy={running}>
                        {capitalize(type)} Result
                        {result &&
                        type === "transaction" &&
                        getTransactionLink(result.txId.transactionId) ? (
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={getTransactionLink(
                                    result.txId.transactionId
                                )}
                            >
                                &nbsp;
                                <FaLink />
                            </a>
                        ) : (
                            ""
                        )}
                        {type === "transaction" && (
                            <span className="note right">
                                {user?.addr ? (
                                    <>
                                        Running as {user?.addr}&nbsp;
                                        {fclAble ? (
                                            <span data-tooltip="Transaction can be signed with FCL">
                                                <FaCheck />
                                            </span>
                                        ) : (
                                            <span data-tooltip="Transaction might not be signed with FCL.  Transaction may fail.">
                                                <FaExclamationTriangle />
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <a onClick={() => fcl.authenticate()}>
                                        Login
                                    </a>
                                )}
                            </span>
                        )}
                    </header>
                    {result ? (
                        typeof result === "object" ? (
                            <DynamicReactJson
                                src={result}
                                theme="shapeshifter:inverted"
                            />
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
