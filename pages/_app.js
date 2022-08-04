import "@picocss/pico";
import "../styles/globals.css";
import TransactionProvider from "../contexts/TransactionContext";
import * as fcl from "@onflow/fcl";
import { NetworkProvider } from "../contexts/NetworkContext";
import { configureForNetwork } from "../flow/config";
import React, { useState } from "react";

function MyApp({ Component, pageProps }) {
    const [network, setNetwork] = useState();

    const switchNetwork = async (e) => {
        fcl.unauthenticate();
        if (e.target.checked) {
            configureForNetwork("mainnet");
            setNetwork("mainnet");
        } else {
            configureForNetwork("testnet");
            setNetwork("testnet");
        }
    };

    return (
        <div>
            <nav className="container header">
                <ul>
                    <li>
                        <h1>Cadence Executor</h1>
                    </li>
                </ul>
                <ul>
                    <li>
                        <label htmlFor="switch" onChange={switchNetwork}>
                            <span className="inputChange">Testnet</span>
                            <input
                                type="checkbox"
                                id="switch"
                                name="switch"
                                role="switch"
                            />
                            <span className="inputChange">Mainnet</span>
                        </label>
                    </li>
                </ul>
            </nav>
            <main className="container">
                <TransactionProvider>
                    <NetworkProvider value={network}>
                        <Component {...pageProps} />
                    </NetworkProvider>
                </TransactionProvider>
            </main>
            <footer className="container">
                <p>
                    Visit <a href="https://docs.onflow.org">docs.onflow.org</a>{" "}
                    to learn more.
                </p>
            </footer>
        </div>
    );
}

export default MyApp;
