import "@picocss/pico";
import "../styles/globals.css";
import React from "react";
import { IconContext } from "react-icons";

const MyApp = ({ Component, pageProps }) => {
    return (
        <div>
            <main className="container">
                <IconContext.Provider value={{ className: "react-icons" }}>
                    <Component {...pageProps} />
                </IconContext.Provider>
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
