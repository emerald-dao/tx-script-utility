import React from "react";
import { useCode } from "../contexts/CodeContext";
import { useFlow } from "../contexts/FlowContext";
import { baseScript, baseTransaction, getTxScript } from "../templates/code";

const CadenceTemplates = ({ modal, setModal, setArgData }) => {
    const { clearResults, setCode } = useCode();
    const { templates } = useFlow();
    return (
        <dialog id="cadence-templates" open={modal}>
            <article>
                <header>
                    <a
                        aria-label="Close"
                        className="close"
                        onClick={() => setModal(!modal)}
                    ></a>
                    <h1>Cadence Templates</h1>
                    <p>Select from a Cadence template below to get started.</p>
                </header>
                <div>
                    <button
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
                    </button>
                    <button
                        onClick={() => {
                            clearResults();
                            setCode(baseScript);
                            setModal(!modal);
                        }}
                    >
                        Simple script
                    </button>
                    <button
                        onClick={() => {
                            clearResults();
                            setCode(baseTransaction);
                            setModal(!modal);
                        }}
                    >
                        Simple transaction
                    </button>
                    {templates &&
                        templates.length > 0 &&
                        templates.map((template) => (
                            <button
                                key={template}
                                onClick={() => {
                                    clearResults();
                                    setCode(getTxScript);
                                    setArgData({ tx: template });
                                    setModal(!modal);
                                }}
                            >
                                {template}
                            </button>
                        ))}
                </div>
                <footer>
                    <button
                        className="secondary"
                        onClick={() => setModal(!modal)}
                    >
                        Cancel
                    </button>
                    <button onClick={() => setModal(!modal)}>Confirm</button>
                </footer>
            </article>
        </dialog>
    );
};

export default CadenceTemplates;
