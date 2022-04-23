import { createContext, useContext } from "react";

// Create Context object.
const NetworkContext = createContext();

// Export Provider.
export function NetworkProvider(props) {
  const { value, children } = props;

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

// Export useContext Hook.
export function useNetworkContext() {
  return useContext(NetworkContext);
}
