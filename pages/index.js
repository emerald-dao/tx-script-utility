import React from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Runner from "../components/Runner";

const Home = () => {
    return (
        <div>
            <Head>
                <title>Flow Runner</title>
                <meta
                    name="description"
                    content="The ability to run Cadence scripts and transactions directly from your browser!"
                />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main>
                <Navbar />
                <Runner />
            </main>
        </div>
    );
};

export default Home;
