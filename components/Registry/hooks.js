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
        fetchContract(name, address);
      }
    }
  };

  const fetchContract = async (name, exactAddress) => {
    let address = exactAddress;
    if (!exactAddress && registry[network]) {
      address = registry[network][name]
    }
    if(!address){
      return false
    }
    try {
      console.log("--------> ADDRESS:", {name, exactAddress, address})
      const { contracts } = await fcl
        .send([fcl.getAccount(address)])
        .then(fcl.decode);
      const code = contracts[name] || "";
      const dependencies = extractImports(code);
      fetchDependencies(dependencies);

      // Update state
      dispatch({
        contracts,
        network,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getContractCode = (name, address) => {
    const contract = contracts[network][name];
    if(!contract){
      fetchContract(name, address).then();
    }
    return contract || "";
  };

  return { registry, contracts, fetchContract, getContractCode };
};
