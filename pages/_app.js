import "@picocss/pico";
import "../styles/globals.css";
import React from "react";
export { reportWebVitals } from "next-axiom";
import { IconContext } from "react-icons";
import CodeProvider from "../contexts/CodeContext";
import FlowProvider from "../contexts/FlowContext";

const MyApp = ({ Component, pageProps }) => {
    return (
        <div>
            <main className="container">
                <FlowProvider>
                    <CodeProvider>
                        <IconContext.Provider
                            value={{ className: "react-icons" }}
                        >
                            <Component {...pageProps} />
                        </IconContext.Provider>
                    </CodeProvider>
                </FlowProvider>
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
