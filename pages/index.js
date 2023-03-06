import React from "react";
import Head from "next/head";
import Runner from "../components/Runner";

const Home = () => {
    return (
        <div>
            <Head>
                <title>Run</title>
                <meta
                    name="description"
                    content="The ability to run Cadence scripts and transactions directly from your browser!"
                />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main>
                <Runner />
            </main>
        </div>
    );
};

export default Home;
