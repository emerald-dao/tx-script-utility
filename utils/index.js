import { executeScript, setEnvironment } from "@onflow/flow-cadut";

const catalogMainnet = "0x49a7cda3a1eecc29";
const catalogTestnet = "0x324c34e1c517e4db";
const catalogScript = `import NFTCatalog from CATALOG_ADDRESS

pub fun main(): {String : Address} {
    let catalog = NFTCatalog.getCatalog()
    let map: {String : Address} = {}
    for catalogData in catalog.values {
      map.insert(key: catalogData.contractName, catalogData.contractAddress)
    }
    return map
}`;

export const fetchCatalogContractAndAddresses = async () => {
    let results = { testnet: {}, mainnet: {} };
    try {
        // Testnet
        await setEnvironment("testnet");
        const [testnet] = await executeScript({
            code: catalogScript.replace("CATALOG_ADDRESS", catalogTestnet),
        });
        results = { ...results, testnet: { ...testnet } };
    } catch (err) {
        console.error(err);
    }
    try {
        // Mainnet
        await setEnvironment("mainnet");
        const [mainnet] = await executeScript({
            code: catalogScript.replace("CATALOG_ADDRESS", catalogMainnet),
        });
        results = { ...results, mainnet: { ...mainnet } };
    } catch (err) {
        console.error(err);
    }
    return results;
};

export const prepareEnvironments = (json) => {
    const { testnet, mainnet } = json;
    const test = Object.keys(testnet).map((contract) => [
        contract,
        testnet[contract],
    ]);
    const main = Object.keys(mainnet).map((contract) => [
        contract,
        mainnet[contract],
    ]);
    const gather = (acc, contract) => {
        const [name, address] = contract;
        acc[name] = address;
        return acc;
    };

    return {
        testnet: test.reduce(gather, {}),
        mainnet: main.reduce(gather, {}),
    };
};

export const debounce = (func, wait = 500) => {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
};
