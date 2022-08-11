import { fetchCatalogContractAndAddresses } from "../../utils";

const internalRegistry = {
    testnet: {
        NonFungibleToken: "0x631e88ae7f1d7c20",
        MetadataViews: "0x631e88ae7f1d7c20",
        FungibleToken: "0x9a0766d93b6608b7",
        FlowToken: "0x7e60df042a9c0868",
        NFTCatalog: "0x324c34e1c517e4db",
        NFTRetrieval: "0x324c34e1c517e4db",
    },
    mainnet: {
        NonFungibleToken: "0x1d7e57aa55817448",
        MetadataViews: "0x1d7e57aa55817448",
        FungibleToken: "0xf233dcee88fe0abe",
        FlowToken: "0x7e60df042a9c0868",
        NFTCatalog: "0x49a7cda3a1eecc29",
        NFTRetrieval: "0x49a7cda3a1eecc29",
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
