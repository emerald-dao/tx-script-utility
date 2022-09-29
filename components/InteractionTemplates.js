import { extractImports } from "@onflow/flow-cadut";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useCode } from "../contexts/CodeContext";
import { copyToClipboard } from "../utils";
import { generateTemplate } from "../utils/ixt";

const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

const InteractionTemplates = ({ modal, setModal }) => {
    const [ixt, setIxt] = useState({});
    const { templateInfo, code } = useCode();
    const { type, args } = templateInfo;

    useEffect(() => {
        const generateIxt = async () => {
            setIxt(
                await generateTemplate(type, code, extractImports(code), args)
            );
        };
        if (modal) {
            generateIxt();
        }
    }, [modal, type, args, code]);

    return (
        <dialog id="ix-templates" open={modal}>
            <article>
                <header>
                    <a
                        aria-label="Close"
                        className="close"
                        onClick={() => setModal(!modal)}
                    ></a>
                    <h1>Interaction Template</h1>
                    <p>
                        The following is a simple{" "}
                        <a
                            href="https://developers.flow.com/tools/fcl-js/reference/interaction-templates"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Interaction Template
                        </a>{" "}
                        stub to get started. Please fill in the additional
                        information as needed.
                    </p>
                </header>
                <div>
                    <DynamicReactJson
                        src={ixt}
                        theme="shapeshifter:inverted"
                        onEdit={() => true}
                        onAdd={() => true}
                        onDelete={() => true}
                    />
                </div>
                <footer>
                    <button
                        onClick={() => copyToClipboard(JSON.stringify(ixt))}
                    >
                        Copy
                    </button>
                </footer>
            </article>
        </dialog>
    );
};

export default InteractionTemplates;
