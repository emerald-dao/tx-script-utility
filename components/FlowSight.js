import React, { useState } from "react";
import { useCode } from "../contexts/CodeContext";
import * as fcl from "@onflow/fcl";
import { dryRunTx } from "flow-sight";
import { resolveArguments } from "@onflow/flow-cadut";
import { getOrderedArgValues } from "../utils/types";
import { useFlow } from "../contexts/FlowContext";

const FlowSight = ({ modal, setModal, argData }) => {
    const [diff, setDiff] = useState([]);
    const [loading, setLoading] = useState(false);
    const { code, templateInfo } = useCode();
    const { user } = useFlow();
    const { type, args } = templateInfo;

    const simulateTransaction = async () => {
        setLoading(true);
        if (type !== "transaction") {
            return;
        }
        if (!user?.addr) {
            await fcl.authenticate();
        }

        const fclArgs = await resolveArguments(
            getOrderedArgValues(args, argData),
            code
        );
        try {
            const { diff } = await dryRunTx(fcl, code, fclArgs, [user.addr]);
            setDiff(diff);
        } catch (err) {
            setDiff([]);
        }
        setLoading(false);
    };

    return (
        <dialog id="flow-sight-templates" open={modal}>
            <article>
                <header>
                    <a
                        aria-label="Close"
                        className="close"
                        onClick={() => setModal(!modal)}
                    ></a>
                    <h1>Flow Sight</h1>
                    <p>
                        <a
                            href="https://github.com/Zay-Codes-Lab/flow-sight"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Flow Sight
                        </a>{" "}
                        will simulate your transaction and return a
                        human-readable explanation of what occured without
                        actually running the transaction.
                    </p>
                </header>
                <div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        diff.map((d, i) => (
                            <details key={i} open>
                                <summary>{`${d.checkReadable}`}</summary>
                                <p>{d.humanReadable}</p>
                            </details>
                        ))
                    )}
                </div>
                <footer>
                    <button
                        disabled={loading}
                        aria-busy={loading}
                        onClick={async () => await simulateTransaction()}
                    >
                        Simulate
                    </button>
                </footer>
            </article>
        </dialog>
    );
};

export default FlowSight;
