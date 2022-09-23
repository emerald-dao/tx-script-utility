import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import CadenceEditor from "./CadenceEditor";
import { useCode } from "../contexts/CodeContext";
import { useFlow } from "../contexts/FlowContext";
import * as fcl from "@onflow/fcl";
import { capitalize } from "../utils";
import { FaCheck, FaExclamationTriangle, FaLink } from "react-icons/fa";
import { vanillaCells, vanillaRenderers } from "@jsonforms/vanilla-renderers";
import { JsonForms } from "@jsonforms/react";
import { generateDefaultUISchema } from "@jsonforms/core";
import {
    generateSchema,
    validateArgTypes,
    validateByType,
} from "../utils/types";
import { splitArgs } from "@onflow/flow-cadut";
import Navbar from "./Navbar";

const CadenceChecker = dynamic(() => import("./LSP/CadenceChecker"), {
    ssr: false,
});
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

const Runner = () => {
    const [argSchema, setArgSchema] = useState();
    const [argData, setArgData] = useState({});
    const [argErrors, setArgErrors] = useState([]);
    const { query } = useRouter();
    const { setCode, editorReady, templateInfo, running, result, error } =
        useCode();
    const { switchNetwork, getTransactionLink, user } = useFlow();
    const { type, signers, args } = templateInfo;

    const showResults =
        result || error || running || (user?.addr && type === "transaction");
    const fclAble =
        user?.addr && signers && signers === 1 && type === "transaction";

    useEffect(() => {
        if (args?.length > 0 && validateArgTypes(args)) {
            setArgSchema(generateSchema(args));
        } else {
            setArgSchema();
            setArgData({});
        }
    }, [args]);

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

        if (query && query.args) {
            setArgData(
                JSON.parse(
                    Buffer.from(
                        decodeURIComponent(query.args),
                        "base64"
                    ).toString()
                )
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    useEffect(() => {
        const getArg = (arg) => {
            return args.find((a) => splitArgs(a)[0] === arg);
        };

        if (
            args &&
            args.length > 0 &&
            argData &&
            Object.keys(argData).length > 0
        ) {
            setArgErrors(
                Object.keys(argData).map((d) => {
                    return {
                        instancePath: `/${d}`,
                        message: validateByType(
                            argData[d],
                            splitArgs(getArg(d))[1]
                        ),
                        schemaPath: `#/properties/${d}`,
                        keyword: "",
                        params: {},
                    };
                })
            );
        } else {
            setArgErrors([]);
        }
    }, [args, argData]);

    return (
        <>
            <Navbar argData={argData} setArgData={setArgData} />
            {args?.length > 0 && (
                <article className={argSchema ? "" : "error"}>
                    <header>{capitalize(type)} Arguments</header>
                    {argSchema ? (
                        <JsonForms
                            schema={argSchema}
                            uischema={generateDefaultUISchema(argSchema)}
                            data={argData}
                            renderers={vanillaRenderers}
                            cells={vanillaCells}
                            additionalErrors={argErrors}
                            onChange={({ data }) => setArgData(data)}
                        />
                    ) : (
                        <p>
                            Invalid Arguments: Ensure the arugments in your code
                            are of valid{" "}
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://developers.flow.com/cadence/language/values-and-types"
                            >
                                Cadence types
                            </a>
                            .
                        </p>
                    )}
                </article>
            )}
            <CadenceChecker>
                <div className="cadence-container">
                    <CadenceEditor className={"mb-2"} />
                </div>
            </CadenceChecker>
            {!editorReady ? (
                <dialog open>
                    <article>
                        <progress indeterminate="true"></progress>
                        Please wait while we setup the Cadence Editor...
                    </article>
                </dialog>
            ) : (
                <>
                    {showResults && (
                        <article
                            className={
                                result ? "success" : error ? "error" : ""
                            }
                        >
                            <header aria-busy={running}>
                                {capitalize(type)} Result
                                {result &&
                                type === "transaction" &&
                                getTransactionLink(result.txId) ? (
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={getTransactionLink(result.txId)}
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
                                            <a
                                                onClick={() =>
                                                    fcl.authenticate()
                                                }
                                            >
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
                                    <p className="display-linebreak wrap-text">
                                        {result}
                                    </p>
                                )
                            ) : (
                                <p className="display-linebreak wrap-text">
                                    {error}
                                </p>
                            )}
                        </article>
                    )}
                </>
            )}
        </>
    );
};

export default Runner;
