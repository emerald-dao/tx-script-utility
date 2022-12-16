import { fetchCatalogContractAndAddresses } from "../../utils";

const internalRegistry = {
    testnet: {
        NonFungibleToken: "0x631e88ae7f1d7c20",
        MetadataViews: "0x631e88ae7f1d7c20",
        FungibleToken: "0x9a0766d93b6608b7",
        FlowToken: "0x7e60df042a9c0868",
        NFTCatalog: "0x324c34e1c517e4db",
        NFTCatalogAdmin: "0x324c34e1c517e4db",
        NFTRetrieval: "0x324c34e1c517e4db",
        ArrayUtils: "0x44051d81c4720882",
        StringUtils: "0x44051d81c4720882",
        TransactionGenerationUtils: "0x44051d81c4720882",
        TransactionTemplates: "0x44051d81c4720882",
        TransactionGeneration: "0x44051d81c4720882",
    },
    mainnet: {
        NonFungibleToken: "0x1d7e57aa55817448",
        MetadataViews: "0x1d7e57aa55817448",
        FungibleToken: "0xf233dcee88fe0abe",
        FlowToken: "0x1654653399040a61",
        NFTCatalog: "0x49a7cda3a1eecc29",
        NFTCatalogAdmin: "0x49a7cda3a1eecc29",
        NFTRetrieval: "0x49a7cda3a1eecc29",
        ArrayUtils: "0xe52522745adf5c34",
        StringUtils: "0xe52522745adf5c34",
        TransactionGenerationUtils: "0xe52522745adf5c34",
        TransactionTemplates: "0xe52522745adf5c34",
        TransactionGeneration: "0xe52522745adf5c34",
    },
};

const handler = async (req, res) => {
    const catalog = await fetchCatalogContractAndAddresses();
    res.setHeader("Cache-Control", "s-maxage=14400");
    res.status(200).json({
        testnet: { ...internalRegistry.testnet, ...catalog.testnet },
        mainnet: { ...internalRegistry.mainnet, ...catalog.mainnet },
    });
};

export default handler;
