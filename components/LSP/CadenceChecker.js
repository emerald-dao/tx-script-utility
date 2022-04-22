import React, { createContext } from "react";
import useLanguageServer from "./useLanguageServer";

export const CadenceCheckerContext = createContext(null);

export default function CadenceChecker(props) {
  // Connect project to cadence checker hook
  const cadenceChecker = useLanguageServer();

  // render
  const { children } = props;
  return (
    <CadenceCheckerContext.Provider value={cadenceChecker}>
      {children}
    </CadenceCheckerContext.Provider>
  );
}
