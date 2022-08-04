import React from "react";

const Toolbar = ({ switchNetwork }) => {
    return (
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
    );
};

export default Toolbar;
