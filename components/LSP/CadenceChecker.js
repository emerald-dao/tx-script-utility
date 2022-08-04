import React, { createContext } from "react";
import useLanguageServer from "./useLanguageServer";

export const CadenceCheckerContext = createContext(null);

const CadenceChecker = ({ children }) => {
    // Connect project to cadence checker hook
    const cadenceChecker = useLanguageServer();

    // render
    return (
        <CadenceCheckerContext.Provider value={cadenceChecker}>
            {children}
        </CadenceCheckerContext.Provider>
    );
};

export default CadenceChecker;
