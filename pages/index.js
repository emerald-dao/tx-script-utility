import Head from "next/head";
import Transaction from "../components/Transaction";
import "../flow/config.js";

export default function Home() {
  return (
    <div>
      <Head>
        <title>FCL Quickstart with NextJS</title>
        <meta name="description" content="My first web3 app on Flow!" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main>
        <Transaction />
        <h1>Hello!</h1>
        <textarea>I love MaxStarka</textarea>
      </main>
    </div>
  );
}
