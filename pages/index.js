import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
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

import Transaction from "../components/Transaction";
import CadenceEditor from "../components/CadenceEditor";

import { useNetworkContext } from "../contexts/NetworkContext";
import { buttonLabels } from "../templates/labels";
import { baseTransaction, flovatarTotalSupply } from "../templates/code";

import * as fcl from "@onflow/fcl";

import "../flow/config.js";
import { configureForNetwork } from "../flow/config";
import { debounce, fetchRegistry, prepareEnvironments } from "../utils";

const CadenceChecker = dynamic(
  () => import("../components/LSP/CadenceChecker"),
  { ssr: false }
);

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

const getImports = debounce(async (code, setList) => {
  const list = extractImports(code);
  setList(list);
}, 300);

const prepareFinalImports = async (list, setFinal) => {
  const env = await getEnvironment();
  const replacedList = {};
  for (const key in list) {
    replacedList[key] = env[key];
  }
  const finalList = Object.keys(replacedList).map((key) => {
    return {
      name: key,
      address: replacedList[key],
    };
  });

  setFinal(finalList);
};

export default function Home() {
  const [monacoReady, setMonacoReady] = useState(false);
  const [code, updateScriptCode] = useState(flovatarTotalSupply);
  const [result, setResult] = useState();
  const [user, setUser] = useState();
  const [registry, setRegistry] = useState(null);
  const [importList, setImportList] = useState({});
  const [finalImports, setFinalImports] = useState([]);

  const network = useNetworkContext() || "testnet";

  const templateInfo = getTemplateInfo(code);
  const { type, signers, args } = templateInfo;

  // METHDOS
  const updateImports = async () => {
    const env = await getEnvironment(network);
    const newCode = replaceImportAddresses(code, env);
    updateScriptCode(newCode);
  };
  const send = async () => {
    await setEnvironment(network);
    extendEnvironment(registry);

    switch (true) {
      // Script Handling
      case type === "script": {
        const [result, scriptError] = await executeScript({ code });
        if (!scriptError) {
          setResult(result);
        } else {
          setResult(scriptError);
          console.error(scriptError);
        }
        break;
      }

      // Transaction Handling
      case type === "transaction": {
        if (!fcl.currentUser()) {
          configureForNetwork(network);
          await fcl.authenticate();
        }

        const [txResult, txError] = await sendTransaction({
          code,
          limit: 9999,
          payer: fcl.authz,
        });
        if (!txError) {
          setResult(txResult);
        } else {
          setResult(txError);
          console.error(txError);
        }
        break;
      }

      default:
        break;
    }
  };
  const getRegistry = async () => {
    const data = await fetchRegistry();
    const registry = prepareEnvironments(data);
    extendEnvironment(registry);
    setRegistry(registry);
  };

  // EFFECTS
  useEffect(() => {
    fcl.unauthenticate();
    fcl.currentUser().subscribe(setUser);

    getRegistry().then();
  }, []);
  useEffect(() => {
    setEnvironment(network);
    if (registry !== null) {
      extendEnvironment(registry);
    }
  }, [network]);
  useEffect(() => getImports(code, setImportList), [code]);
  useEffect(
    () => prepareFinalImports(importList, setFinalImports),
    [importList, network]
  );

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

        {monacoReady && (
          <>
            <div className="mb-1">
              <h4>Replaced Addresses</h4>
              <p>
                These are the addresses, which will be used, before sending
                Cadence template to network:
              </p>
              <ul>
                {finalImports.map((item) => {
                  const { name, address } = item;
                  return (
                    <li key={name}>
                      <b>{name}</b> : {address}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="two-items-grid">
              <button onClick={updateImports}>Update Imports</button>
              <button onClick={send} disabled={disabled}>
                {getButtonLabel(type, signers)}
              </button>
            </div>

            {fclAble ? (
              <p className="note">✅ Transaction could be signed with FCL</p>
            ) : null}
          </>
        )}

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
