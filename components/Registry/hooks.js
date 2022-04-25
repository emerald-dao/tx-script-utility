import { useEffect, useReducer, useState } from "react";
import { extendEnvironment, extractImports } from "flow-cadut";
import * as fcl from "@onflow/fcl";

import { fetchRegistry, prepareEnvironments } from "../../utils";
import { useNetworkContext } from "../../contexts/NetworkContext";

const contractReducer = (state, action) => {
  const { contracts, network } = action;

  return {
    ...state,
    [network]: {
      ...state[network],
      ...contracts,
    },
  };
};

export const useRegistry = () => {
  const network = useNetworkContext() || "testnet";
  const [registry, setRegistry] = useState({});
  const [contracts, dispatch] = useReducer(contractReducer, {
    testnet: {},
    mainnet: {},
  });

  const getRegistry = async () => {
    const data = await fetchRegistry();
    const registry = prepareEnvironments(data);
    extendEnvironment(registry);
    setRegistry(registry);
  };

  useEffect(() => {
    getRegistry().then();
  }, []);

  const fetchDependencies = (list) => {
    const keys = Object.keys(list);
    for (let i = 0; i < keys.length; i++) {
      // TODO: check if it's cached
      const name = keys[i];
      const address = list[name];
      const contract = contracts[network][name];
      if (!contract) {
        console.log("FETCH DEPENDENCY", network, name, address);
        fetchContract(name, address);
      }
    }
  };

  const fetchContract = async (name, exactAddress) => {
    let address = exactAddress;
    if (!exactAddress && registry[network]) {
      address = exactAddress || registry[network][name];
    } else {
      address = "";
    }
    console.log(name, address);
    try {
      const { contracts } = await fcl
        .send([fcl.getAccount(address)])
        .then(fcl.decode);
      const code = contracts[name] || "";

      console.log("get dependencies for", name);
      const dependencies = extractImports(code);
      console.log({ dependencies });
      fetchDependencies(dependencies);

      console.log("DISPATCH", name, network);
      // Update state
      dispatch({
        contracts,
        network,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    console.log({ contracts });
  }, [contracts]);

  const getContractCode = (name) => {
    console.log("REQUESTED ", name);
    const contract = contracts[network][name];
    if (!contract) {
      console.log({contracts});
      console.log(`%cNOT FOUND ${name}`, "color: red");
    }
    return contracts[network][name] || "";
  };

  return { registry, contracts, fetchContract, getContractCode };
};
