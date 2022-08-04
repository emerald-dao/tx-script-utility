import React from "react";
import Head from "next/head";
import { Executor } from "../components/Executor";

const Home = () => {
    return (
        <div>
            <Head>
                <title>Cadence Executor</title>
                <meta
                    name="description"
                    content="The ability to run Cadence scripts and transactions directly from your browser!"
                />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main>
                <Executor />
            </main>
        </div>
    );
};

export default Home;
