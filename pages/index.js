import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { executeScript } from "flow-cadut";

import Transaction from "../components/Transaction";
import CadenceEditor from "../components/CadenceEditor";

import { useNetworkContext } from '../contexts/NetworkContext';

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
  
  const baseTx = `
  // This is the most basic transaction you can execute on Flow Network
  transaction() {
    prepare(signer: AuthAccount) {
      
    }
    execute {
      
    }
  }
  `.slice(1); // remove new line at the bof
  
  export default function Home() {
    const [monacoReady, setMonacoReady] = useState(false);
    const [scriptCode, updateScriptCode] = useState(baseScript);
    const [txCode, updateTxCode] = useState(baseTx);
    const [result, setResult] = useState();
    const [user, setUser] = useState();

    const network = useNetworkContext()
    
    const executeScriptFunc = async () => {
      const [result, executionError] = await executeScript({ code: scriptCode });
      if (!executionError) {
        setResult(result);
      } else {
        setResult(executionError);
        console.log(executionError);
      }
    }
    
    const sendTxFunc = async () => {
      if (!fcl.currentUser()) {
        configureForNetwork(network)
        await fcl.authenticate()
      }
      const res = await fcl.send([
        fcl.transaction`${txCode}`,
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
      fcl.currentUser().subscribe(setUser);
    }, [])
    
    return (
      <div>
      <Head>
      <title>Cadence Transaction Editor</title>
      <meta name="description" content="My first web3 app on Flow!" />
      <link rel="icon" href="/favicon.png" />
      </Head>
      
      <main>
      <Transaction />

      {!monacoReady && <p>Please wait, instantiating Monaco Editor!</p>}
      
      
      
      <div className="grid">
      <CadenceChecker className="grid">
      <CadenceEditor
      onReady={() => setMonacoReady(true)}
      code={scriptCode}
      updateCode={updateScriptCode}
      />
      <CadenceEditor
      onReady={() => setMonacoReady(true)}
      code={txCode}
      updateCode={updateTxCode}
      />
      </CadenceChecker>
      </div>
      <div className="grid">
      <button onClick={executeScriptFunc}>
      Execute Script
      </button>
      <button onClick={sendTxFunc}>
      Send Transaction
      </button>
      </div>
      
      <h1>{result !== undefined && result !== null ? JSON.stringify(result) : null}</h1>
      <h1>{user?.addr}</h1>
      </main>
      </div>
      );
    }
    