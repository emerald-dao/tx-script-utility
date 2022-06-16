import { createContext, useContext } from "react";
import { useRegistry } from "./hooks";

export const RegistryContext = createContext({});
export const useRegistryContext = () => useContext(RegistryContext);

export default function RegistryProvider(props) {
  const registry = useRegistry();
  const { children } = props;
  return (
    <RegistryContext.Provider value={registry}>
      {children}
    </RegistryContext.Provider>
  );
}
