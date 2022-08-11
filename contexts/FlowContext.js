import React, { createContext, useContext, useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import { configureForNetwork } from "../flow/config";
import {
    fetchCatalogContractAndAddresses,
    prepareEnvironments,
} from "../utils";
import { extendEnvironment, setEnvironment } from "@onflow/flow-cadut";

export const FlowContext = createContext({});
export const useFlow = () => useContext(FlowContext);

const FlowProvider = ({ children }) => {
    const [network, setNetwork] = useState("testnet");
    const [user, setUser] = useState();
    const [registry, setRegistry] = useState(null);

    const switchNetwork = (network) => {
        fcl.unauthenticate();
        configureForNetwork(network);
        setNetwork(network);
    };

    const getTransactionLink = (txId) => {
        if (network === "emulator") {
            return undefined;
        }
        let baseUrl = `https://flowscan.org`;
        if (network === "testnet") {
            baseUrl = `https://testnet.flowscan.org`;
        }
        return `${baseUrl}/transaction/${txId}`;
    };

    useEffect(() => {
        fcl.unauthenticate();
        fcl.currentUser().subscribe(setUser);
        const getRegistry = async () => {
            const data = await fetchCatalogContractAndAddresses();
            const registry = prepareEnvironments(data);
            extendEnvironment(registry);
            setRegistry(registry);
        };
        getRegistry();
    }, []);

    useEffect(() => {
        const setRegistry = async () => {
            await setEnvironment(network);
            if (registry !== null) {
                extendEnvironment(registry);
            }
        };
        setRegistry();
    }, [network, registry]);

    const value = { network, switchNetwork, getTransactionLink, user };

    return (
        <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
    );
};

export default FlowProvider;
