import React from "react";
import { buttonLabels } from "../templates/labels";
import { baseScript, baseTransaction } from "../templates/code";
import { useCode } from "../contexts/CodeContext";
import { useFlow } from "../contexts/FlowContext";
import * as fcl from "@onflow/fcl";
import { capitalize } from "../utils";
import {
    FaGlobe,
    FaBook,
    FaBars,
    FaInfo,
    FaPen,
    FaCopy,
    FaTrash,
    FaUser,
    FaUserSlash,
} from "react-icons/fa";
import { isMobile } from "react-device-detect";

function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

const Navbar = ({ finalArgs }) => {
    const {
        code,
        setCode,
        clearResults,
        editorReady,
        updateImports,
        templateInfo,
        run,
        running,
    } = useCode();
    const { network, switchNetwork, user } = useFlow();
    const { type, signers } = templateInfo;

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

    const disabled =
        type === "unknown" ||
        type === "contract" ||
        !editorReady ||
        signers > 1;

    const options = (
        <>
            <li>
                <a
                    data-tooltip={user?.addr ? "Sign out" : "Sign in"}
                    onClick={() =>
                        user?.addr ? fcl.unauthenticate() : fcl.authenticate()
                    }
                >
                    {user?.addr ? <FaUserSlash /> : <FaUser />}
                    {isMobile && (user?.addr ? " Sign Out" : " Sign In")}
                </a>
            </li>
            <li>
                <a
                    data-tooltip="Update contract address imports in code"
                    onClick={async () => {
                        await updateImports();
                    }}
                >
                    <FaPen />
                    {isMobile && " Update Imports"}
                </a>
            </li>
            <li>
                <a
                    data-tooltip="Copy a link to this code"
                    onClick={() => {
                        copyToClipboard(
                            `${
                                window.location.origin
                            }?code=${encodeURIComponent(
                                Buffer.from(code).toString("base64")
                            )}&network=${network}&args=${encodeURIComponent(
                                Buffer.from(JSON.stringify(finalArgs)).toString(
                                    "base64"
                                )
                            )}`
                        );
                    }}
                >
                    <FaCopy />
                    {isMobile && " Copy Link"}
                </a>
            </li>
            <li>
                <a
                    data-tooltip="Clear results/errors"
                    onClick={() => clearResults()}
                >
                    <FaTrash />
                    {isMobile && " Clear"}
                </a>
            </li>
        </>
    );

    return (
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
                                <a onClick={() => switchNetwork("emulator")}>
                                    Emulator
                                </a>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>
            <ul>
                <li>
                    <details role="list">
                        <summary role="link">
                            <div className="centered-label">
                                <FaBook />
                            </div>
                        </summary>
                        <ul role="listbox">
                            <li>
                                <a
                                    onClick={() => {
                                        clearResults();
                                        const savedCode = Buffer.from(
                                            window.sessionStorage.getItem(
                                                "autoSavedCode"
                                            ) || "",
                                            "base64"
                                        ).toString();
                                        setCode(savedCode);
                                    }}
                                >
                                    Last Code
                                </a>
                            </li>
                            <li>
                                <a
                                    onClick={() => {
                                        clearResults();
                                        setCode(baseScript);
                                    }}
                                >
                                    Script
                                </a>
                            </li>
                            <li>
                                <a
                                    onClick={() => {
                                        clearResults();
                                        setCode(baseTransaction);
                                    }}
                                >
                                    Transaction
                                </a>
                            </li>
                        </ul>
                    </details>
                </li>
                {isMobile ? (
                    <li>
                        <details role="list">
                            <summary role="link">
                                <div className="centered-label">
                                    <FaBars />
                                </div>
                            </summary>
                            <ul role="listbox">{options}</ul>
                        </details>
                    </li>
                ) : (
                    options
                )}
                <li>
                    <button
                        role="button"
                        onClick={async () => {
                            await run(finalArgs);
                        }}
                        disabled={disabled}
                        aria-busy={running}
                    >
                        {getButtonLabel()}
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
