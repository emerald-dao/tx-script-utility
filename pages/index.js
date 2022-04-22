import React, { useEffect, useState } from "react";
import Head from "next/head";
import Transaction from "../components/Transaction";
import "../flow/config.js";
import CadenceEditor from "../components/CadenceEditor";
import { setEnvironment, executeScript } from "flow-cadut";

const baseScript = `
// This is the most basic script you can execute on Flow Network
pub fun main():Int {
  return 42
}
`.slice(1); // remove new line at the bof

export default function Home() {
  const [monacoReady, setMonacoReady] = useState(false);
  const [code, updateCode] = useState(baseScript);

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
        <CadenceEditor
          onReady={() => setMonacoReady(true)}
          code={code}
          updateCode={updateCode}
        />
        <button
          onClick={async () => {
            const [result, executionError] = await executeScript({ code });
            if (!executionError) {
              console.log(result);
            } else {
              console.error(executionError);
            }
          }}
        >
          Execute Script
        </button>
      </main>
    </div>
  );
}
