import React, { createContext, useContext, useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import { configureForNetwork } from "../flow/config";
import { prepareEnvironments } from "../utils";
import { extendEnvironment, setEnvironment } from "@onflow/flow-cadut";
import axios from "axios";

export const FlowContext = createContext({});
export const useFlow = () => useContext(FlowContext);

const FlowProvider = ({ children }) => {
    const [network, setNetwork] = useState("testnet");
    const [user, setUser] = useState();
    const [registry, setRegistry] = useState(null);
    const [templates, setTemplates] = useState([]);

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
            try {
                const data = await axios.get("/api/registry");
                const registry = prepareEnvironments(data.data);
                extendEnvironment(registry);
                setRegistry(registry);
            } catch (error) {
                console.error(error);
            }
        };

        const getTemplates = async () => {
            try {
                const data = await axios.get("/api/templates");
                setTemplates(data.data);
            } catch (error) {
                console.error(error);
            }
        };
        getRegistry();
        getTemplates();
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

    const value = {
        network,
        switchNetwork,
        getTransactionLink,
        user,
        templates,
    };

    return (
        <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
    );
};

export default FlowProvider;
