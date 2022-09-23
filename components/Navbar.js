import React, { useState } from "react";
import { buttonLabels } from "../templates/labels";
import { useCode } from "../contexts/CodeContext";
import { useFlow } from "../contexts/FlowContext";
import * as fcl from "@onflow/fcl";
import { capitalize, copyToClipboard } from "../utils";
import {
    FaGlobe,
    FaBars,
    FaInfo,
    FaPen,
    FaCopy,
    FaTrash,
    FaUser,
    FaUserSlash,
    FaCode,
} from "react-icons/fa";
import { isMobile } from "react-device-detect";
import CadenceTemplates from "./CadenceTemplates";

const Navbar = ({ argData, setArgData }) => {
    const {
        code,
        clearResults,
        editorReady,
        updateImports,
        templateInfo,
        run,
        running,
    } = useCode();
    const { network, switchNetwork, user } = useFlow();
    const [modal, setModal] = useState(false);
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
                    data-tooltip="Cadence Templates"
                    data-target="templates"
                    onClick={() => setModal(!modal)}
                >
                    <FaCode />
                    {isMobile && " Templates"}
                </a>
            </li>
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
                                Buffer.from(JSON.stringify(argData)).toString(
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
        <>
            <CadenceTemplates
                modal={modal}
                setModal={setModal}
                setArgData={setArgData}
            />
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
                                await run(argData);
                            }}
                            disabled={disabled}
                            aria-busy={running}
                        >
                            {getButtonLabel()}
                        </button>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default Navbar;
