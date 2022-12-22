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
            <footer className="container" />
        </div>
    );
};

export default MyApp;
