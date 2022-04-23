import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { setEnvironment, executeScript, sendTransaction } from "flow-cadut";

import Transaction from "../components/Transaction";
import CadenceEditor from "../components/CadenceEditor";

import * as fcl from "@onflow/fcl";

import "../flow/config.js";
import { configureForNetwork } from "../flow/config";

const CadenceChecker = dynamic(
  () => import("../components/LSP/CadenceChecker"),
  { ssr: false }
);

const baseScript = `
// This is the most basic script you can execute on Flow Network
pub fun main():Int {
  return 42
}
`.slice(1); // remove new line at the bof

export default function Home() {
  const [monacoReady, setMonacoReady] = useState(false);
  const [code, updateCode] = useState(baseScript);
  const [network, setNetwork] = useState('testnet');
  const [result, setResult] = useState();

  const txn = async () => {
    if (!fcl.currentUser()) {
      configureForNetwork(network)
      await fcl.authenticate()
    }
    const res = await fcl.send([
      fcl.transaction`${code}`,
      fcl.args([]),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.payer(fcl.authz),
      fcl.limit(9999),
    ])

    console.log(res.transactionId)
    await fcl.tx(res).onceSealed()
    console.log('sealed!')
  }

  useEffect(() => {
    const handleAuth = async () => {
      if(fcl.currentUser()) {
        await fcl.unauthenticate()
      }
    }
    handleAuth().then(res => {
      console.log('authenticated!')
    })
  }, [network])

  useEffect(() => {
    // This is the way to setup current environment
    setEnvironment("testnet");
  }, []);

  return (
    <div>
      <Head>
        <title>FCL Quickstart with NextJS</title>
        <meta name="description" content="My first web3 app on Flow!" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main>
        <Transaction />
        <h1>Cadence Editor</h1>
        {!monacoReady && <p>Please wait, instantiating Monaco Editor!</p>}

        <CadenceChecker>
          <CadenceEditor
            onReady={() => setMonacoReady(true)}
            code={code}
            updateCode={updateCode}
          />
        </CadenceChecker>
        <button
          onClick={async () => {
            const [result, executionError] = await executeScript({ code });
            if (!executionError) {
              setResult(result);
            } else {
              setResult(executionError);
              console.log(executionError)
            }
          }}
        >
          Execute Script
        </button>
        <button
          onClick={async () => {
            /*
              const { addressMap, args = [], signers = [] } = props;
              const code = await logTemplate(addressMap);

              reportMissing("arguments", args.length, 0, `log =>`);
              reportMissing("signers", signers.length, 1, `log =>`);

              return sendTransaction({code, ...props})
             */
            console.log(await txn())
          }}
        >
          Send Transaction
        </button>
        <button onClick={() => {
          if (network === 'testnet') {
            setEnvironment('mainnet');
            setNetwork('mainnet');
          } else if (network === 'mainnet') {
            setEnvironment('testnet');
            setNetwork('testnet');
          }
        }}>{network}</button>
        <h1>{result !== undefined && result !== null ? JSON.stringify(result) : null}</h1>
      </main>
    </div>
  );
}
