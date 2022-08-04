import "@picocss/pico";
import "../styles/globals.css";
import TransactionProvider from "../contexts/TransactionContext";
import * as fcl from "@onflow/fcl";
import { NetworkProvider } from "../contexts/NetworkContext";
import { configureForNetwork } from "../flow/config";
import React, { useState } from "react";
import Toolbar from "../components/Toolbar";

const MyApp = ({ Component, pageProps }) => {
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
            <Toolbar switchNetwork={switchNetwork} />
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
                    to learn more. <br />
                    Forked from the{" "}
                    <a href="https://github.com/emerald-dao/tx-script-utility/">
                        Emerald DAO TX Script Utility
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default MyApp;
