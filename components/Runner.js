import React, { useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import CadenceEditor from "./CadenceEditor";
import { useCode } from "../contexts/CodeContext";
import { useFlow } from "../contexts/FlowContext";
import * as fcl from "@onflow/fcl";
import { capitalize } from "../utils";
import { FaCheck, FaExclamationTriangle, FaLink } from "react-icons/fa";

const CadenceChecker = dynamic(() => import("./LSP/CadenceChecker"), {
    ssr: false,
});
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

const Runner = () => {
    const { query } = useRouter();
    const { setCode, editorReady, templateInfo, running, result, error } =
        useCode();
    const { switchNetwork, getTransactionLink, user } = useFlow();
    const { type, signers } = templateInfo;

    useEffect(() => {
        if (query && query.code) {
            setCode(
                Buffer.from(decodeURIComponent(query.code), "base64").toString()
            );
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const fclAble =
        user?.addr && signers && signers === 1 && type === "transaction";

    return (
        <>
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
