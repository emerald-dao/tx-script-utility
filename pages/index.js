import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { executeScript, sendTransaction, getTemplateInfo } from "flow-cadut";

import Transaction from "../components/Transaction";
import CadenceEditor from "../components/CadenceEditor";

import { useNetworkContext } from "../contexts/NetworkContext";
import { buttonLabels } from "../templates/labels";
import { baseTransaction } from "../templates/code";

import * as fcl from "@onflow/fcl";

import "../flow/config.js";
import { configureForNetwork } from "../flow/config";

const CadenceChecker = dynamic(
  () => import("../components/LSP/CadenceChecker"),
  { ssr: false }
);

const getButtonLabel = (type, signers = 0) => {
  if (type === "contract") {
  }

  if (signers > 1) {
    // TODO: Implement multisig
    return "Multisig is not Supported";
  }
  return buttonLabels[type];
};

export default function Home() {
  const [monacoReady, setMonacoReady] = useState(false);
  const [code, updateScriptCode] = useState(baseTransaction);
  const [result, setResult] = useState();
  const [user, setUser] = useState();

  const network = useNetworkContext();

  const templateInfo = getTemplateInfo(code);
  const { type, signers, args } = templateInfo;

  const send = async () => {
    switch (true) {
      // Script Handling
      case type === "script": {
        const [result, executionError] = await executeScript({
          code: code,
        });
        if (!executionError) {
          setResult(result);
        } else {
          setResult(executionError);
          console.log(executionError);
        }
        break;
      }

      // Transaction Handling
      case type === "tx": {
        const [txResult, executionError] = await sendTransaction({
          code: code,
        });
        if (!executionError) {
          setResult(txResult);
        } else {
          setResult(executionError);
          console.log(executionError);
        }
        break;
      }

      default:
        break;
    }
  };

  const sendTxFunc = async () => {
    if (!fcl.currentUser()) {
      configureForNetwork(network);
      await fcl.authenticate();
    }
    const res = await fcl.send([
      fcl.transaction`${txCode}`,
      fcl.args([]),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.payer(fcl.authz),
      fcl.limit(9999),
    ]);

    console.log(res.transactionId);
    await fcl.tx(res).onceSealed();
    console.log("sealed!");
  };

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, []);

  const fclAble = signers && signers === 1 && type === "transaction";
  const disabled =
    type === "unknown" || type === "contract" || !monacoReady || signers > 1;

  return (
    <div>
      <Head>
        <title>Cadence Transaction Editor</title>
        <meta name="description" content="My first web3 app on Flow!" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main>
        <Transaction />

        {!monacoReady && <p>Please wait, instantiating Monaco Editor...</p>}

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

        <button onClick={send} disabled={disabled}>
          {getButtonLabel(type, signers)}
        </button>

        {fclAble ? (
          <p className="note">✅ Transaction could be signed with FCL</p>
        ) : null}

        <h1>
          {result !== undefined && result !== null
            ? JSON.stringify(result)
            : null}
        </h1>
        <h1>{user?.addr}</h1>
      </main>
    </div>
  );
}
